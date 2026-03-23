import { useEffect, useRef, useCallback, useState } from 'react';

interface UseTerminalWSOptions {
  terminalId: string | null;
  onData: (data: string) => void;
  onInfo?: (info: Record<string, unknown>) => void;
  onDisconnect?: () => void;
  onConnect?: () => void;
}

export function useTerminalWS({
  terminalId,
  onData,
  onInfo,
  onDisconnect,
  onConnect,
}: UseTerminalWSOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Store callbacks in refs to avoid re-triggering connect/disconnect cycles
  const onDataRef = useRef(onData);
  const onInfoRef = useRef(onInfo);
  const onDisconnectRef = useRef(onDisconnect);
  const onConnectRef = useRef(onConnect);

  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  useEffect(() => {
    onInfoRef.current = onInfo;
  }, [onInfo]);

  useEffect(() => {
    onDisconnectRef.current = onDisconnect;
  }, [onDisconnect]);

  useEffect(() => {
    onConnectRef.current = onConnect;
  }, [onConnect]);

  const connect = useCallback(() => {
    if (!terminalId) return;

    setConnecting(true);
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/terminals/${terminalId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      setConnected(true);
      setConnecting(false);
      onConnectRef.current?.();
    };

    ws.onmessage = (event: MessageEvent) => {
      if (event.data instanceof ArrayBuffer) {
        // Binary PTY output
        const text = new TextDecoder().decode(event.data);
        onDataRef.current(text);
      } else if (typeof event.data === 'string') {
        // JSON control message
        try {
          const msg = JSON.parse(event.data) as {
            type: string;
            data: Record<string, unknown>;
          };
          if (msg.type === 'info' && onInfoRef.current) {
            onInfoRef.current(msg.data);
          } else if (msg.type === 'error') {
            console.error('Terminal WS error:', msg.data);
          }
        } catch {
          // Plain text output
          onDataRef.current(event.data as string);
        }
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setConnecting(false);
      onDisconnectRef.current?.();
      wsRef.current = null;
    };

    ws.onerror = () => {
      setConnected(false);
      setConnecting(false);
    };
  }, [terminalId]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendInput = useCallback((data: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'input', data }));
    }
  }, []);

  const sendResize = useCallback((cols: number, rows: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'resize', cols, rows }));
    }
  }, []);

  // Auto-connect when terminalId changes
  useEffect(() => {
    if (terminalId) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [terminalId, connect, disconnect]);

  return { connected, connecting, sendInput, sendResize, connect, disconnect };
}
