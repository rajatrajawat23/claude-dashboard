import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Terminal as TerminalIcon, Plus, Trash2, RotateCcw, MoreVertical,
  ChevronRight, ChevronDown, Pencil, XCircle, GitBranch,
  Loader2, FolderOpen,
} from 'lucide-react';
import api from '@/lib/api';
import { colors } from '@/theme';
import { useTerminalStore, type TerminalInfo } from '@/stores/terminalStore';
import { useTerminalWS } from '@/hooks/useTerminalWS';

// ---------------------------------------------------------------------------
// ANSI Parser
// ---------------------------------------------------------------------------
const ANSI_FG: Record<number, string> = {
  30: colors.terminal.black, 31: colors.terminal.red, 32: colors.terminal.green,
  33: colors.terminal.yellow, 34: colors.terminal.blue, 35: colors.terminal.magenta,
  36: colors.terminal.cyan, 37: colors.terminal.white,
  90: colors.terminal.brightBlack, 91: colors.terminal.brightRed,
  92: colors.terminal.brightGreen, 93: colors.terminal.brightYellow,
  94: colors.terminal.brightBlue, 95: colors.terminal.brightMagenta,
  96: colors.terminal.brightCyan, 97: colors.terminal.brightWhite,
};
const ANSI_BG: Record<number, string> = {
  40: colors.terminal.black, 41: colors.terminal.red, 42: colors.terminal.green,
  43: colors.terminal.yellow, 44: colors.terminal.blue, 45: colors.terminal.magenta,
  46: colors.terminal.cyan, 47: colors.terminal.white,
};

interface Span { text: string; fg?: string; bg?: string; bold?: boolean }

function parseAnsi(raw: string): Span[] {
  const spans: Span[] = [];
  let fg: string | undefined, bg: string | undefined, bold = false;
  const re = /\x1b\[([0-9;]*)m/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) spans.push({ text: raw.slice(last, m.index), fg, bg, bold });
    for (const c of m[1].split(';').map(Number)) {
      if (c === 0) { fg = undefined; bg = undefined; bold = false; }
      else if (c === 1) bold = true;
      else if (ANSI_FG[c]) fg = ANSI_FG[c];
      else if (ANSI_BG[c]) bg = ANSI_BG[c];
    }
    last = re.lastIndex;
  }
  if (last < raw.length) spans.push({ text: raw.slice(last), fg, bg, bold });
  return spans.map((s) => ({ ...s, text: s.text.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '') }));
}

function AnsiLine({ line }: { line: string }) {
  const spans = parseAnsi(line);
  return (
    <div className="leading-5 whitespace-pre-wrap break-all">
      {spans.map((s, i) => (
        <span key={i} style={{ color: s.fg ?? colors.terminal.white, backgroundColor: s.bg, fontWeight: s.bold ? 700 : undefined }}>
          {s.text || '\u00A0'}
        </span>
      ))}
      {spans.length === 0 && '\u00A0'}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tree Node
// ---------------------------------------------------------------------------
const statusDot = (s: string) =>
  s === 'running' ? colors.success[500] : s === 'error' ? colors.warning[500] : colors.error[500];

function TreeNode({ terminal: t, all, activeId, depth, onSelect, onAction }: {
  terminal: TerminalInfo; all: TerminalInfo[]; activeId: string | null;
  depth: number; onSelect: (id: string) => void; onAction: (a: string, t: TerminalInfo) => void;
}) {
  const [open, setOpen] = useState(true);
  const kids = all.filter((c) => c.parentId === t.id);
  const active = t.id === activeId;
  const clr = active ? '#fff' : 'var(--text-muted)';

  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer group text-sm"
        style={{ paddingLeft: `${depth * 16 + 8}px`, background: active ? 'var(--brand-500)' : 'transparent', color: active ? '#fff' : 'var(--text-primary)' }}
        onClick={() => onSelect(t.id)}
      >
        {kids.length > 0 ? (
          <button className="shrink-0 p-0 bg-transparent border-none cursor-pointer" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
            {open ? <ChevronDown className="h-3.5 w-3.5" style={{ color: clr }} /> : <ChevronRight className="h-3.5 w-3.5" style={{ color: clr }} />}
          </button>
        ) : <span className="w-3.5 shrink-0" />}
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: statusDot(t.status) }} />
        <span className="truncate flex-1 font-medium">{t.name}</span>
        {t.pid > 0 && <span className="text-[10px] opacity-60 font-mono">{t.pid}</span>}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-3.5 w-3.5" style={{ color: clr }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onAction('rename', t)}><Pencil className="h-3.5 w-3.5 mr-2" />Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('child', t)}><GitBranch className="h-3.5 w-3.5 mr-2" />New Child</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAction('restart', t)}><RotateCcw className="h-3.5 w-3.5 mr-2" />Restart</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('kill', t)}><XCircle className="h-3.5 w-3.5 mr-2" />Kill</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAction('remove', t)} className="text-destructive focus:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" />Remove</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {kids.length > 0 && open && (
        <div className="relative" style={{ marginLeft: `${depth * 16 + 18}px` }}>
          <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: 'var(--border-subtle)' }} />
          {kids.map((c) => <TreeNode key={c.id} terminal={c} all={all} activeId={activeId} depth={depth + 1} onSelect={onSelect} onAction={onAction} />)}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Terminal Panel (WS + output + keyboard input)
// ---------------------------------------------------------------------------
function TerminalPanel({ terminal }: { terminal: TerminalInfo }) {
  const outRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[]>([]);
  const update = useTerminalStore((s) => s.updateTerminal);

  const onData = useCallback((d: string) => {
    setLines((p) => {
      const nl = d.split('\n');
      if (p.length === 0) return nl;
      const u = [...p];
      u[u.length - 1] += nl[0];
      for (let i = 1; i < nl.length; i++) u.push(nl[i]);
      return u.length > 5000 ? u.slice(-5000) : u;
    });
  }, []);

  const { connected, connecting, sendInput, sendResize } = useTerminalWS({
    terminalId: terminal.id,
    onData,
    onInfo: useCallback((info: Record<string, unknown>) => { if (info.pid) update(terminal.id, { pid: info.pid as number }); }, [terminal.id, update]),
    onDisconnect: useCallback(() => update(terminal.id, { status: 'stopped' }), [terminal.id, update]),
    onConnect: useCallback(() => update(terminal.id, { status: 'running' }), [terminal.id, update]),
  });

  useEffect(() => { outRef.current && (outRef.current.scrollTop = outRef.current.scrollHeight); }, [lines]);

  const onKey = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!connected) return;
    e.preventDefault();
    e.stopPropagation();
    const { key, ctrlKey } = e;
    if (ctrlKey) {
      const cm: Record<string, string> = { c: '\x03', d: '\x04', l: '\x0c', z: '\x1a', a: '\x01', e: '\x05', u: '\x15', k: '\x0b', w: '\x17' };
      if (cm[key.toLowerCase()]) { sendInput(cm[key.toLowerCase()]); return; }
    }
    const km: Record<string, string> = {
      Enter: '\r', Backspace: '\x7f', Tab: '\t', Escape: '\x1b',
      ArrowUp: '\x1b[A', ArrowDown: '\x1b[B', ArrowRight: '\x1b[C', ArrowLeft: '\x1b[D',
      Home: '\x1b[H', End: '\x1b[F', Delete: '\x1b[3~',
    };
    if (km[key]) sendInput(km[key]);
    else if (key.length === 1) sendInput(key);
  }, [connected, sendInput]);

  const connColor = connecting ? colors.warning[500] : connected ? colors.success[500] : colors.error[500];
  const connLabel = connecting ? 'connecting' : connected ? 'connected' : 'disconnected';

  // Suppress unused var lint -- sendResize kept for resize button
  void sendResize;

  return (
    <div className="flex flex-col h-full">
      {/* Info bar */}
      <div className="flex items-center gap-3 px-4 py-2 shrink-0 text-sm overflow-x-auto" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)' }}>
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full" style={{ background: connColor }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{connLabel}</span>
        </span>
        <Separator orientation="vertical" className="h-4" />
        <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{terminal.name}</span>
        {terminal.pid > 0 && <><Separator orientation="vertical" className="h-4" /><span className="text-xs font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>PID {terminal.pid}</span></>}
        <Separator orientation="vertical" className="h-4" />
        <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{terminal.shell}</span>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{terminal.cwd}</span>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-xs font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>{terminal.cols}x{terminal.rows}</span>
      </div>
      {/* Output */}
      <div ref={boxRef} className="flex-1 overflow-hidden outline-none" tabIndex={0} onKeyDown={onKey} onClick={() => boxRef.current?.focus()} style={{ background: colors.terminal.black }}>
        <div ref={outRef} className="h-full overflow-y-auto p-3 font-mono text-xs select-text" style={{ fontFamily: '"SF Mono","Fira Code","JetBrains Mono",Menlo,Consolas,monospace', color: colors.terminal.white }}>
          {lines.map((l, i) => <AnsiLine key={i} line={l} />)}
          {connected && <div className="h-3 w-1.5 inline-block animate-pulse" style={{ background: colors.terminal.green }} />}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// New Terminal Dialog
// ---------------------------------------------------------------------------
function NewTerminalDialog({ open, onOpenChange, terminals, defaultParentId, onCreated }: {
  open: boolean; onOpenChange: (o: boolean) => void; terminals: TerminalInfo[];
  defaultParentId?: string | null; onCreated: (t: TerminalInfo) => void;
}) {
  const [name, setName] = useState('');
  const [shell, setShell] = useState('/bin/zsh');
  const [cwd, setCwd] = useState('~');
  const [pid, setPid] = useState<string>('none');
  const [cols, setCols] = useState('120');
  const [rows, setRows] = useState('30');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (open) { setName(''); setShell('/bin/zsh'); setCwd('~'); setPid(defaultParentId ?? 'none'); setCols('120'); setRows('30'); } }, [open, defaultParentId]);

  const create = async () => {
    setBusy(true);
    try {
      const body: Record<string, unknown> = { name: name || undefined, shell, cwd: cwd || '~', cols: parseInt(cols, 10) || 120, rows: parseInt(rows, 10) || 30 };
      if (pid !== 'none') body.parentId = pid;
      const res = await api.post('/terminals', body);
      const t = res.data.data as TerminalInfo;
      onCreated(t);
      onOpenChange(false);
      toast.success(`Terminal "${t.name}" created`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create terminal');
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" style={{ background: 'var(--bg-card)' }}>
        <DialogHeader><DialogTitle>New Terminal</DialogTitle><DialogDescription>Create a new PTY terminal session.</DialogDescription></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5"><Label htmlFor="tn">Name</Label><Input id="tn" placeholder="My Terminal" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Shell</Label><Select value={shell} onValueChange={setShell}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="/bin/zsh">/bin/zsh</SelectItem><SelectItem value="/bin/bash">/bin/bash</SelectItem><SelectItem value="/bin/sh">/bin/sh</SelectItem></SelectContent></Select></div>
            <div className="grid gap-1.5"><Label>Parent</Label><Select value={pid} onValueChange={setPid}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">None (root)</SelectItem>{terminals.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="grid gap-1.5"><Label htmlFor="tcwd">Working Directory</Label><Input id="tcwd" placeholder="~" value={cwd} onChange={(e) => setCwd(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label htmlFor="tcol">Columns</Label><Input id="tcol" type="number" value={cols} onChange={(e) => setCols(e.target.value)} /></div>
            <div className="grid gap-1.5"><Label htmlFor="trow">Rows</Label><Input id="trow" type="number" value={rows} onChange={(e) => setRows(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={create} disabled={busy} style={{ background: 'var(--brand-500)' }}>{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Rename Dialog
// ---------------------------------------------------------------------------
function RenameDialog({ open, onOpenChange, terminal, onRenamed }: {
  open: boolean; onOpenChange: (v: boolean) => void; terminal: TerminalInfo | null; onRenamed: (id: string, n: string) => void;
}) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open && terminal) setName(terminal.name); }, [open, terminal]);
  const save = async () => {
    if (!terminal || !name.trim()) return;
    setBusy(true);
    try { await api.put(`/terminals/${terminal.id}/rename`, { name: name.trim() }); onRenamed(terminal.id, name.trim()); onOpenChange(false); toast.success('Renamed'); }
    catch { toast.error('Failed to rename'); }
    finally { setBusy(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" style={{ background: 'var(--bg-card)' }}>
        <DialogHeader><DialogTitle>Rename Terminal</DialogTitle><DialogDescription>Enter a new name.</DialogDescription></DialogHeader>
        <div className="py-2"><Input value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={busy || !name.trim()} style={{ background: 'var(--brand-500)' }}>{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function Terminals() {
  const qc = useQueryClient();
  const { terminals, activeTerminalId, setTerminals, setActiveTerminal, addTerminal, removeTerminal, updateTerminal } = useTerminalStore();
  const [dlgOpen, setDlgOpen] = useState(false);
  const [dlgParent, setDlgParent] = useState<string | null>(null);
  const [renOpen, setRenOpen] = useState(false);
  const [renTarget, setRenTarget] = useState<TerminalInfo | null>(null);

  const { isLoading } = useQuery({
    queryKey: ['terminals'],
    queryFn: async () => { const r = await api.get('/terminals'); return (r.data.data ?? r.data) as TerminalInfo[]; },
    refetchOnWindowFocus: false,
  });

  const qd = qc.getQueryData<TerminalInfo[]>(['terminals']);
  useEffect(() => {
    if (qd && qd.length > 0) { setTerminals(qd); if (!activeTerminalId) setActiveTerminal(qd[0].id); }
  }, [qd, setTerminals, setActiveTerminal, activeTerminalId]);

  const killM = useMutation({ mutationFn: (id: string) => api.post(`/terminals/${id}/kill`), onSuccess: (_d, id) => { updateTerminal(id, { status: 'stopped' }); toast.success('Killed'); }, onError: () => toast.error('Kill failed') });
  const removeM = useMutation({
    mutationFn: (id: string) => api.delete(`/terminals/${id}`),
    onSuccess: (_d, id) => { removeTerminal(id); if (activeTerminalId === id) { const r = terminals.filter((t) => t.id !== id); setActiveTerminal(r.length > 0 ? r[0].id : null); } toast.success('Removed'); },
    onError: () => toast.error('Remove failed'),
  });
  const restartM = useMutation({
    mutationFn: (id: string) => api.post(`/terminals/${id}/restart`),
    onSuccess: (res, id) => { const t = (res.data.data ?? res.data) as TerminalInfo; updateTerminal(id, { ...t, status: 'running' }); toast.success('Restarted'); },
    onError: () => toast.error('Restart failed'),
  });

  const active = useMemo(() => terminals.find((t) => t.id === activeTerminalId) ?? null, [terminals, activeTerminalId]);
  const roots = useMemo(() => terminals.filter((t) => !t.parentId), [terminals]);

  const onSelect = useCallback((id: string) => setActiveTerminal(id), [setActiveTerminal]);
  const onCreated = useCallback((t: TerminalInfo) => { addTerminal(t); setActiveTerminal(t.id); }, [addTerminal, setActiveTerminal]);
  const onTreeAction = useCallback((a: string, t: TerminalInfo) => {
    if (a === 'rename') { setRenTarget(t); setRenOpen(true); }
    else if (a === 'child') { setDlgParent(t.id); setDlgOpen(true); }
    else if (a === 'kill') killM.mutate(t.id);
    else if (a === 'remove') removeM.mutate(t.id);
    else if (a === 'restart') restartM.mutate(t.id);
  }, [killM, removeM, restartM]);
  const onRenamed = useCallback((id: string, n: string) => updateTerminal(id, { name: n }), [updateTerminal]);
  const openNew = useCallback(() => { setDlgParent(null); setDlgOpen(true); }, []);

  const statusBadge = (s: string) => ({
    background: s === 'running' ? colors.badge.greenBg : s === 'error' ? colors.badge.yellowBg : colors.badge.redBg,
    color: s === 'running' ? colors.badge.greenText : s === 'error' ? colors.badge.yellowText : colors.badge.redText,
  });

  if (isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--brand-500)' }} /></div>;

  if (terminals.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
          <TerminalIcon className="h-8 w-8" style={{ color: 'var(--text-muted)' }} />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>No terminals</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create your first terminal to get started.</p>
        </div>
        <Button onClick={openNew} style={{ background: 'var(--brand-500)' }}><Plus className="h-4 w-4 mr-2" />Create your first terminal</Button>
        <NewTerminalDialog open={dlgOpen} onOpenChange={setDlgOpen} terminals={terminals} defaultParentId={null} onCreated={onCreated} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <TerminalIcon className="h-5 w-5" style={{ color: colors.icon.terminal }} />
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Terminals</h1>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{terminals.length}</Badge>
        </div>
        {active && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{active.name}</span>
            <Badge className="text-[10px] px-1.5 py-0" style={statusBadge(active.status)}>{active.status}</Badge>
            <Separator orientation="vertical" className="h-5" />
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Kill" onClick={() => killM.mutate(active.id)}><XCircle className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Restart" onClick={() => restartM.mutate(active.id)}><RotateCcw className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" title="New Child" onClick={() => { setDlgParent(active.id); setDlgOpen(true); }}><GitBranch className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Close" onClick={() => removeM.mutate(active.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Tree */}
        <div className="shrink-0 flex flex-col" style={{ width: 280, borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
          <div className="flex items-center justify-between px-3 py-2 shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Sessions</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={openNew}><Plus className="h-3.5 w-3.5" /></Button>
          </div>
          <Separator />
          <ScrollArea className="flex-1">
            <div className="py-1">
              {roots.map((t) => <TreeNode key={t.id} terminal={t} all={terminals} activeId={activeTerminalId} depth={0} onSelect={onSelect} onAction={onTreeAction} />)}
            </div>
          </ScrollArea>
          <Separator />
          <div className="px-3 py-2 shrink-0">
            <Button className="w-full justify-start text-xs h-8" variant="ghost" onClick={openNew}><Plus className="h-3.5 w-3.5 mr-2" />New Terminal</Button>
          </div>
        </div>

        {/* Right: Terminal */}
        <div className="flex-1 flex flex-col min-w-0" style={{ background: colors.terminal.black }}>
          {active ? <TerminalPanel key={active.id} terminal={active} /> : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center"><FolderOpen className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} /><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a terminal from the sidebar</p></div>
            </div>
          )}
        </div>
      </div>

      <NewTerminalDialog open={dlgOpen} onOpenChange={setDlgOpen} terminals={terminals} defaultParentId={dlgParent} onCreated={onCreated} />
      <RenameDialog open={renOpen} onOpenChange={setRenOpen} terminal={renTarget} onRenamed={onRenamed} />
    </div>
  );
}
