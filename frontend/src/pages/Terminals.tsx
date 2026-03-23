import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Terminal as TerminalIcon, Plus, X, Maximize2 } from 'lucide-react';

interface TerminalTab {
  id: string;
  name: string;
  status: 'running' | 'stopped';
}

export default function Terminals() {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: '1', name: 'Terminal 1', status: 'running' },
  ]);
  const [activeTab, setActiveTab] = useState('1');

  const addTerminal = () => {
    const id = String(tabs.length + 1);
    setTabs([...tabs, { id, name: `Terminal ${id}`, status: 'running' }]);
    setActiveTab(id);
  };

  const closeTerminal = (id: string) => {
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTab === id && remaining.length > 0) {
      setActiveTab(remaining[0].id);
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Terminals</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage terminal sessions</p>
        </div>
        <Button onClick={addTerminal} size="sm" style={{ background: 'var(--brand-500)', borderRadius: 'var(--radius-md)' }}>
          <Plus className="h-4 w-4 mr-2" />New Terminal
        </Button>
      </div>

      {/* Terminal Tabs */}
      <div className="flex gap-1 overflow-x-auto" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '4px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md whitespace-nowrap transition-colors"
            style={{
              background: activeTab === tab.id ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <TerminalIcon className="h-3 w-3" style={{ color: 'var(--icon-terminal)' }} />
            {tab.name}
            <Badge variant="outline" className="text-[10px] px-1 py-0" style={{ borderColor: tab.status === 'running' ? 'var(--success-500)' : 'var(--error-500)' }}>
              {tab.status}
            </Badge>
            <X className="h-3 w-3 cursor-pointer opacity-50 hover:opacity-100" onClick={(e) => { e.stopPropagation(); closeTerminal(tab.id); }} />
          </button>
        ))}
      </div>

      {/* Terminal Area */}
      <Card className="flex-1 min-h-[400px]" style={{ background: 'var(--shade-1)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
          <CardTitle className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
            /bin/zsh - {tabs.find(t => t.id === activeTab)?.name || 'Terminal'}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Maximize2 className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div
            className="h-full min-h-[350px] p-4 font-mono text-sm"
            style={{
              background: '#1e1e2e',
              color: '#cdd6f4',
              borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
            }}
          >
            <div className="space-y-1">
              <p><span style={{ color: '#a6e3a1' }}>~</span> <span style={{ color: '#89b4fa' }}>$</span> claude --version</p>
              <p style={{ color: '#cdd6f4' }}>Claude Code v1.0.0</p>
              <p><span style={{ color: '#a6e3a1' }}>~</span> <span style={{ color: '#89b4fa' }}>$</span> <span className="animate-pulse">_</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
