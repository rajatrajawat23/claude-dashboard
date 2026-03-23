import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield,
  Server,
  Plug,
  Zap,
  GitCompare,
  Plus,
  X,
  AlertCircle,
  RefreshCw,
  Terminal,
  Wrench,
  Database,
  Eye,
  Lock,
  Unlock,
  Settings2,
  Gauge,
  Package,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
  Activity,
} from 'lucide-react';

/* ---- Inject pulse animation ---- */
const SETTINGS_STYLE_ID = 'settings-pulse-style';
function ensureSettingsStyle() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SETTINGS_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = SETTINGS_STYLE_ID;
  style.textContent = `
    @keyframes settings-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.4); }
    }
    @keyframes settings-tab-in {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SettingsPermissions {
  [key: string]: string[];
}

interface McpServerConfig {
  command: string;
  args?: string[];
  disabled?: boolean;
  [key: string]: unknown;
}

interface McpServers {
  [name: string]: McpServerConfig;
}

interface SettingsData {
  permissions: SettingsPermissions;
  mcpServers: McpServers;
  enabledPlugins: string[];
  effortLevel?: string;
}

interface SettingsResponse {
  data: SettingsData;
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchSettings(scope: 'global' | 'local'): Promise<SettingsData> {
  const res = await api.get<SettingsResponse>(`/claude/settings/${scope}`);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Permission color helper
// ---------------------------------------------------------------------------

function getPermGroupStyle(group: string): { color: string; bgColor: string; icon: typeof Shield } {
  const g = group.toLowerCase();
  if (g.includes('bash') || g.includes('shell') || g.includes('command'))
    return { color: 'var(--success-700)', bgColor: 'var(--success-100)', icon: Terminal };
  if (g.includes('tool') || g.includes('mcp') || g.includes('function'))
    return { color: 'var(--info-700)', bgColor: 'var(--info-100)', icon: Wrench };
  if (g.includes('data') || g.includes('db') || g.includes('database'))
    return { color: '#d9480f', bgColor: '#ffe8cc', icon: Database };
  if (g.includes('read') || g.includes('view') || g.includes('access'))
    return { color: '#5f3dc4', bgColor: '#e5dbff', icon: Eye };
  if (g.includes('write') || g.includes('edit') || g.includes('modify'))
    return { color: 'var(--accent-700)', bgColor: 'var(--accent-100)', icon: Lock };
  if (g.includes('allow'))
    return { color: 'var(--success-700)', bgColor: 'var(--success-100)', icon: Unlock };
  if (g.includes('deny') || g.includes('block'))
    return { color: 'var(--error-700)', bgColor: 'var(--error-100)', icon: Shield };
  return { color: 'var(--brand-700)', bgColor: 'var(--brand-100)', icon: Shield };
}

/** Get badge color per permission item based on content heuristic */
function getPermBadgeColor(item: string): { bg: string; text: string } {
  const i = item.toLowerCase();
  if (i.includes('bash') || i.includes('shell') || i.includes('exec') || i.includes('command'))
    return { bg: 'var(--success-100)', text: 'var(--success-800)' };
  if (i.includes('tool') || i.includes('mcp') || i.includes('function') || i.includes('read'))
    return { bg: 'var(--info-100)', text: 'var(--info-800)' };
  if (i.includes('data') || i.includes('db') || i.includes('sql') || i.includes('database'))
    return { bg: '#ffe8cc', text: '#d9480f' };
  if (i.includes('write') || i.includes('edit') || i.includes('delete'))
    return { bg: 'var(--warning-100)', text: 'var(--warning-800)' };
  if (i.includes('net') || i.includes('http') || i.includes('fetch') || i.includes('web'))
    return { bg: '#e5dbff', text: '#5f3dc4' };
  return { bg: 'var(--bg-elevated)', text: 'var(--text-secondary)' };
}

// ---------------------------------------------------------------------------
// Skeletons
// ---------------------------------------------------------------------------

function PermissionsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card
          key={i}
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <CardHeader>
            <Skeleton
              className="h-5 w-40"
              style={{ background: 'var(--bg-elevated)' }}
            />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((j) => (
                <Skeleton
                  key={j}
                  className="h-7 w-16"
                  style={{
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function McpSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card
          key={i}
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton
                  className="h-9 w-9 rounded-lg"
                  style={{ background: 'var(--bg-elevated)' }}
                />
                <div className="space-y-2">
                  <Skeleton
                    className="h-4 w-32"
                    style={{ background: 'var(--bg-elevated)' }}
                  />
                  <Skeleton
                    className="h-3 w-56"
                    style={{ background: 'var(--bg-elevated)' }}
                  />
                </div>
              </div>
              <Skeleton
                className="h-5 w-8 rounded-full"
                style={{ background: 'var(--bg-elevated)' }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PluginsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <Card
          key={i}
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton
                  className="h-9 w-9 rounded-lg"
                  style={{ background: 'var(--bg-elevated)' }}
                />
                <Skeleton
                  className="h-4 w-40"
                  style={{ background: 'var(--bg-elevated)' }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
      }}
    >
      <CardContent className="p-8 flex flex-col items-center gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center"
          style={{
            background: 'color-mix(in srgb, var(--error-500) 12%, transparent)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <AlertCircle className="h-6 w-6" style={{ color: 'var(--error-500)' }} />
        </div>
        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
          {message}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Permissions tab
// ---------------------------------------------------------------------------

function PermissionsTab({ data }: { data: SettingsData }) {
  const queryClient = useQueryClient();
  const [newPermInputs, setNewPermInputs] = useState<Record<string, string>>({});

  const updateMutation = useMutation({
    mutationFn: async (updated: SettingsData) => {
      await api.put('/claude/settings/global', updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'global'] });
      toast.success('Permissions updated');
    },
    onError: () => {
      toast.error('Failed to update permissions');
    },
  });

  const permissions = data.permissions ?? {};
  const groups = Object.entries(permissions);

  function addPermission(group: string) {
    const value = (newPermInputs[group] ?? '').trim();
    if (!value) return;
    const current = permissions[group] ?? [];
    if (current.includes(value)) {
      toast.warning(`"${value}" already exists in ${group}`);
      return;
    }
    const updated: SettingsData = {
      ...data,
      permissions: {
        ...permissions,
        [group]: [...current, value],
      },
    };
    updateMutation.mutate(updated);
    setNewPermInputs((prev) => ({ ...prev, [group]: '' }));
  }

  function removePermission(group: string, item: string) {
    const current = permissions[group] ?? [];
    const updated: SettingsData = {
      ...data,
      permissions: {
        ...permissions,
        [group]: current.filter((p) => p !== item),
      },
    };
    updateMutation.mutate(updated);
  }

  if (groups.length === 0) {
    return (
      <Card
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <CardContent className="p-8 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center mx-auto mb-3"
            style={{
              background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <Shield className="h-6 w-6" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No permissions configured.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map(([group, items]) => {
        const groupStyle = getPermGroupStyle(group);
        const GroupIcon = groupStyle.icon;
        return (
          <Card
            key={group}
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'var(--transition-smooth)',
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle
                className="text-base flex items-center gap-2.5"
                style={{ color: 'var(--text-primary)' }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center"
                  style={{
                    background: groupStyle.bgColor,
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <GroupIcon className="h-4 w-4" style={{ color: groupStyle.color }} />
                </div>
                <span className="capitalize">{group} Permissions</span>
                <Badge
                  style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-muted)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: 600,
                    marginLeft: 4,
                  }}
                >
                  {(items ?? []).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(items ?? []).map((item) => {
                  const badgeColor = getPermBadgeColor(item);
                  return (
                    <Badge
                      key={item}
                      variant="secondary"
                      className="flex items-center gap-1.5 group cursor-default py-1 px-2.5"
                      style={{
                        borderRadius: 'var(--radius-md)',
                        background: badgeColor.bg,
                        color: badgeColor.text,
                        fontWeight: 500,
                        fontSize: '12px',
                        transition: 'var(--transition-fast)',
                        border: '1px solid transparent',
                      }}
                    >
                      {item}
                      <button
                        onClick={() => removePermission(group, item)}
                        className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                        aria-label={`Remove ${item}`}
                        style={{ transition: 'var(--transition-fast)' }}
                      >
                        <X className="h-3 w-3" style={{ color: badgeColor.text }} />
                      </button>
                    </Badge>
                  );
                })}
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder={`Add ${group} permission...`}
                  value={newPermInputs[group] ?? ''}
                  onChange={(e) =>
                    setNewPermInputs((prev) => ({ ...prev, [group]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addPermission(group);
                  }}
                  className="max-w-xs text-sm"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-subtle)',
                  }}
                />
                <Button
                  size="sm"
                  disabled={updateMutation.isPending}
                  onClick={() => addPermission(group)}
                  style={{
                    background: 'var(--brand-500)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--brand-600)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--brand-500)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MCP Servers tab
// ---------------------------------------------------------------------------

function McpServersTab({ data }: { data: SettingsData }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updated: SettingsData) => {
      await api.put('/claude/settings/global', updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'global'] });
      toast.success('MCP servers updated');
    },
    onError: () => {
      toast.error('Failed to update MCP servers');
    },
  });

  const servers = data.mcpServers ?? {};
  const entries = Object.entries(servers);

  function toggleServer(name: string, enabled: boolean) {
    const server = servers[name];
    if (!server) return;
    const updated: SettingsData = {
      ...data,
      mcpServers: {
        ...servers,
        [name]: { ...server, disabled: !enabled },
      },
    };
    updateMutation.mutate(updated);
  }

  if (entries.length === 0) {
    return (
      <Card
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <CardContent className="p-8 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center mx-auto mb-3"
            style={{
              background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <Server className="h-6 w-6" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No MCP servers configured.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map(([name, server]) => {
        const isEnabled = !server.disabled;
        const argsStr = (server.args ?? []).join(' ');
        return (
          <Card
            key={name}
            className="group/mcp"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'var(--transition-smooth)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center relative"
                    style={{
                      background: isEnabled
                        ? 'color-mix(in srgb, var(--brand-500) 12%, transparent)'
                        : 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    <Server
                      className="h-5 w-5"
                      style={{
                        color: isEnabled ? 'var(--brand-500)' : 'var(--text-muted)',
                      }}
                    />
                    {/* Animated pulse dot for active servers */}
                    {isEnabled && (
                      <div
                        style={{
                          position: 'absolute',
                          top: -2,
                          right: -2,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'var(--success-500)',
                          animation: 'settings-pulse 2s ease-in-out infinite',
                          boxShadow: '0 0 6px var(--success-400)',
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {name}
                    </p>
                    <p
                      className="text-xs font-mono mt-0.5"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {server.command}
                      {argsStr ? ` ${argsStr}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className="flex items-center gap-1"
                    style={{
                      background: isEnabled ? 'var(--success-100)' : 'var(--bg-elevated)',
                      color: isEnabled ? 'var(--success-800)' : 'var(--text-muted)',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      fontSize: '11px',
                    }}
                  >
                    {isEnabled ? (
                      <Activity className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {isEnabled ? 'active' : 'disabled'}
                  </Badge>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => toggleServer(name, checked)}
                    disabled={updateMutation.isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Plugins tab
// ---------------------------------------------------------------------------

function PluginsTab({ data }: { data: SettingsData }) {
  const plugins = data.enabledPlugins ?? [];

  if (plugins.length === 0) {
    return (
      <Card
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <CardContent className="p-8 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center mx-auto mb-3"
            style={{
              background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <Plug className="h-6 w-6" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No plugins enabled.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {plugins.map((plugin) => (
        <Card
          key={plugin}
          className="group/plugin"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            transition: 'var(--transition-smooth)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center"
                  style={{
                    background: 'color-mix(in srgb, #be4bdb 12%, transparent)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <Plug className="h-5 w-5" style={{ color: '#be4bdb' }} />
                </div>
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {plugin}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Installed plugin
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Marketplace badge */}
                <Badge
                  className="flex items-center gap-1"
                  style={{
                    background: '#e5dbff',
                    color: '#5f3dc4',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <Package className="h-3 w-3" />
                  marketplace
                </Badge>
                <Badge
                  className="flex items-center gap-1"
                  style={{
                    background: 'var(--success-100)',
                    color: 'var(--success-800)',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                    fontSize: '11px',
                  }}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  enabled
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// General / Effort tab
// ---------------------------------------------------------------------------

function GeneralTab({ data }: { data: SettingsData }) {
  const queryClient = useQueryClient();
  const [effort, setEffort] = useState(data.effortLevel ?? 'max');

  const updateMutation = useMutation({
    mutationFn: async (level: string) => {
      await api.put('/claude/settings/global', { ...data, effortLevel: level });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'global'] });
      toast.success('Effort level updated');
    },
    onError: () => {
      toast.error('Failed to update effort level');
    },
  });

  function handleEffort(level: string) {
    setEffort(level);
    updateMutation.mutate(level);
  }

  const effortLevels = [
    { level: 'low', color: 'var(--text-muted)', icon: Gauge },
    { level: 'medium', color: 'var(--warning-600)', icon: Gauge },
    { level: 'high', color: 'var(--info-600)', icon: Zap },
    { level: 'max', color: 'var(--success-600)', icon: Sparkles },
  ];

  return (
    <Card
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <CardContent className="p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center"
              style={{
                background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Settings2 className="h-5 w-5" style={{ color: 'var(--brand-500)' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Effort Level
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Controls how thoroughly Claude processes requests
              </p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {effortLevels.map(({ level, color, icon: LevelIcon }) => (
              <button
                key={level}
                onClick={() => handleEffort(level)}
                disabled={updateMutation.isPending}
                className="px-3.5 py-1.5 text-sm capitalize flex items-center gap-1.5"
                style={{
                  background:
                    effort === level
                      ? 'var(--brand-500)'
                      : 'var(--bg-elevated)',
                  color: effort === level ? 'white' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: effort === level ? 600 : 500,
                  transition: 'var(--transition-fast)',
                  border:
                    effort === level
                      ? '1px solid var(--brand-500)'
                      : '1px solid var(--border-subtle)',
                  boxShadow:
                    effort === level
                      ? '0 2px 8px color-mix(in srgb, var(--brand-500) 30%, transparent)'
                      : 'none',
                }}
                onMouseEnter={(e) => {
                  if (effort !== level) {
                    e.currentTarget.style.background = 'var(--bg-active)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (effort !== level) {
                    e.currentTarget.style.background = 'var(--bg-elevated)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <LevelIcon
                  className="h-3.5 w-3.5"
                  style={{
                    color: effort === level ? 'white' : color,
                  }}
                />
                {level}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Compare tab
// ---------------------------------------------------------------------------

function CompareTab() {
  const globalQuery = useQuery({
    queryKey: ['settings', 'global'],
    queryFn: () => fetchSettings('global'),
  });

  const localQuery = useQuery({
    queryKey: ['settings', 'local'],
    queryFn: () => fetchSettings('local'),
  });

  const isLoading = globalQuery.isLoading || localQuery.isLoading;
  const isError = globalQuery.isError || localQuery.isError;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card
            key={i}
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <CardHeader>
              <Skeleton
                className="h-5 w-24"
                style={{ background: 'var(--bg-elevated)' }}
              />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => (
                <Skeleton
                  key={j}
                  className="h-4 w-full"
                  style={{ background: 'var(--bg-elevated)' }}
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="Failed to load settings for comparison."
        onRetry={() => {
          globalQuery.refetch();
          localQuery.refetch();
        }}
      />
    );
  }

  const globalData = globalQuery.data;
  const localData = localQuery.data;

  /** Check if a value exists in the other scope for diff highlighting */
  function isDiffItem(
    item: string,
    group: string,
    scope: 'global' | 'local'
  ): 'added' | 'removed' | 'same' {
    const otherData = scope === 'global' ? localData : globalData;
    const otherItems = otherData?.permissions?.[group] ?? [];
    const thisData = scope === 'global' ? globalData : localData;
    const thisItems = thisData?.permissions?.[group] ?? [];

    if (thisItems.includes(item) && !otherItems.includes(item)) return 'added';
    if (!thisItems.includes(item) && otherItems.includes(item)) return 'removed';
    return 'same';
  }

  function isDiffServer(
    name: string,
    scope: 'global' | 'local'
  ): 'added' | 'removed' | 'same' {
    const otherData = scope === 'global' ? localData : globalData;
    const otherServers = Object.keys(otherData?.mcpServers ?? {});
    const thisData = scope === 'global' ? globalData : localData;
    const thisServers = Object.keys(thisData?.mcpServers ?? {});

    if (thisServers.includes(name) && !otherServers.includes(name)) return 'added';
    if (!thisServers.includes(name) && otherServers.includes(name)) return 'removed';
    return 'same';
  }

  function renderSettingsColumn(
    label: string,
    settings: SettingsData | undefined,
    scope: 'global' | 'local'
  ) {
    const isGlobal = scope === 'global';

    if (!settings) {
      return (
        <Card
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <CardHeader>
            <CardTitle className="text-base" style={{ color: 'var(--text-primary)' }}>
              {label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No data available.
            </p>
          </CardContent>
        </Card>
      );
    }

    const permGroups = Object.entries(settings.permissions ?? {});
    const mcpEntries = Object.entries(settings.mcpServers ?? {});
    const plugins = settings.enabledPlugins ?? [];

    return (
      <Card
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <CardHeader className="pb-3">
          <CardTitle
            className="text-base flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <div
              className="flex h-7 w-7 items-center justify-center"
              style={{
                background: isGlobal
                  ? 'color-mix(in srgb, var(--brand-500) 12%, transparent)'
                  : 'color-mix(in srgb, var(--accent-500) 12%, transparent)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {isGlobal ? (
                <Shield className="h-3.5 w-3.5" style={{ color: 'var(--brand-500)' }} />
              ) : (
                <Settings2 className="h-3.5 w-3.5" style={{ color: 'var(--accent-500)' }} />
              )}
            </div>
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Permissions */}
          <div>
            <p
              className="text-[11px] font-semibold uppercase mb-2 tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Permissions
            </p>
            {permGroups.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                None
              </p>
            ) : (
              permGroups.map(([group, items]) => (
                <div key={group} className="mb-3">
                  <p
                    className="text-xs font-semibold capitalize mb-1.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {group}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(items ?? []).map((item) => {
                      const diff = isDiffItem(item, group, scope);
                      const diffBg =
                        diff === 'added'
                          ? 'var(--success-100)'
                          : diff === 'removed'
                            ? 'var(--error-100)'
                            : 'var(--bg-elevated)';
                      const diffColor =
                        diff === 'added'
                          ? 'var(--success-800)'
                          : diff === 'removed'
                            ? 'var(--error-800)'
                            : 'var(--text-secondary)';
                      const diffBorder =
                        diff === 'added'
                          ? '1px solid var(--success-300)'
                          : diff === 'removed'
                            ? '1px solid var(--error-300)'
                            : '1px solid transparent';
                      return (
                        <Badge
                          key={item}
                          variant="secondary"
                          className="text-[10px] flex items-center gap-1"
                          style={{
                            borderRadius: 'var(--radius-sm)',
                            background: diffBg,
                            color: diffColor,
                            border: diffBorder,
                            fontWeight: diff !== 'same' ? 600 : 500,
                          }}
                        >
                          {diff === 'added' && <Plus className="h-2.5 w-2.5" />}
                          {diff === 'removed' && <X className="h-2.5 w-2.5" />}
                          {item}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* MCP Servers */}
          <div>
            <p
              className="text-[11px] font-semibold uppercase mb-2 tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              MCP Servers
            </p>
            {mcpEntries.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                None
              </p>
            ) : (
              mcpEntries.map(([name, server]) => {
                const diff = isDiffServer(name, scope);
                const diffBorderColor =
                  diff === 'added'
                    ? 'var(--success-300)'
                    : diff === 'removed'
                      ? 'var(--error-300)'
                      : 'transparent';
                return (
                  <div
                    key={name}
                    className="flex items-center gap-2 mb-1.5 py-1 px-2"
                    style={{
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: `3px solid ${diffBorderColor}`,
                      background:
                        diff === 'added'
                          ? 'color-mix(in srgb, var(--success-100) 50%, transparent)'
                          : diff === 'removed'
                            ? 'color-mix(in srgb, var(--error-100) 50%, transparent)'
                            : 'transparent',
                    }}
                  >
                    <span
                      className="text-xs font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {name}
                    </span>
                    <Badge
                      className="text-[10px]"
                      style={{
                        background: server.disabled
                          ? 'var(--bg-elevated)'
                          : 'var(--success-100)',
                        color: server.disabled
                          ? 'var(--text-muted)'
                          : 'var(--success-800)',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 600,
                      }}
                    >
                      {server.disabled ? 'disabled' : 'active'}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>

          {/* Plugins */}
          <div>
            <p
              className="text-[11px] font-semibold uppercase mb-2 tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Plugins
            </p>
            {plugins.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                None
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {plugins.map((p) => {
                  const otherPlugins =
                    (scope === 'global'
                      ? localData?.enabledPlugins
                      : globalData?.enabledPlugins) ?? [];
                  const isUnique = !otherPlugins.includes(p);
                  return (
                    <Badge
                      key={p}
                      variant="secondary"
                      className="text-[10px] flex items-center gap-1"
                      style={{
                        borderRadius: 'var(--radius-sm)',
                        background: isUnique ? 'var(--success-100)' : 'var(--bg-elevated)',
                        color: isUnique ? 'var(--success-800)' : 'var(--text-secondary)',
                        border: isUnique
                          ? '1px solid var(--success-300)'
                          : '1px solid transparent',
                        fontWeight: isUnique ? 600 : 500,
                      }}
                    >
                      {isUnique && <Plus className="h-2.5 w-2.5" />}
                      {p}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Diff legend */}
      <div
        className="flex items-center gap-4 px-4 py-2.5"
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <ArrowLeftRight className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Diff legend:
        </span>
        <div className="flex items-center gap-1.5">
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--success-500)',
            }}
          />
          <span className="text-[11px]" style={{ color: 'var(--success-700)' }}>
            Only in this scope
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--error-500)',
            }}
          />
          <span className="text-[11px]" style={{ color: 'var(--error-700)' }}>
            Missing from other
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderSettingsColumn('Global Settings', globalData, 'global')}
        {renderSettingsColumn('Local Settings', localData, 'local')}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Settings page
// ---------------------------------------------------------------------------

export default function Settings() {
  useEffect(() => {
    ensureSettingsStyle();
  }, []);

  const globalQuery = useQuery({
    queryKey: ['settings', 'global'],
    queryFn: () => fetchSettings('global'),
  });

  const { data, isLoading, isError, refetch } = globalQuery;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--brand-500), var(--accent-500))',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 2px 8px color-mix(in srgb, var(--brand-500) 25%, transparent)',
            }}
          >
            <Settings2 className="h-5 w-5" style={{ color: 'white' }} />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Settings
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Manage Claude Code configuration
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void refetch()}
          style={{
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
          }}
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="permissions" className="space-y-4">
        <TabsList
          className="p-1 gap-0.5"
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {[
            { value: 'permissions', label: 'Permissions', icon: Shield, color: 'var(--success-500)' },
            { value: 'mcp', label: 'MCP Servers', icon: Server, color: 'var(--brand-500)' },
            { value: 'plugins', label: 'Plugins', icon: Plug, color: '#be4bdb' },
            { value: 'general', label: 'General', icon: Zap, color: 'var(--warning-500)' },
            { value: 'compare', label: 'Compare', icon: GitCompare, color: 'var(--info-500)' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium data-[state=active]:shadow-sm"
              style={{
                borderRadius: 'var(--radius-lg)',
                transition: 'var(--transition-fast)',
              }}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Permissions */}
        <TabsContent
          value="permissions"
          className="space-y-4"
          style={{ animation: 'settings-tab-in 0.2s ease-out' }}
        >
          {isLoading ? (
            <PermissionsSkeleton />
          ) : isError ? (
            <ErrorState message="Failed to load permissions." onRetry={() => refetch()} />
          ) : data ? (
            <PermissionsTab data={data} />
          ) : null}
        </TabsContent>

        {/* MCP Servers */}
        <TabsContent
          value="mcp"
          className="space-y-4"
          style={{ animation: 'settings-tab-in 0.2s ease-out' }}
        >
          {isLoading ? (
            <McpSkeleton />
          ) : isError ? (
            <ErrorState message="Failed to load MCP servers." onRetry={() => refetch()} />
          ) : data ? (
            <McpServersTab data={data} />
          ) : null}
        </TabsContent>

        {/* Plugins */}
        <TabsContent
          value="plugins"
          className="space-y-4"
          style={{ animation: 'settings-tab-in 0.2s ease-out' }}
        >
          {isLoading ? (
            <PluginsSkeleton />
          ) : isError ? (
            <ErrorState message="Failed to load plugins." onRetry={() => refetch()} />
          ) : data ? (
            <PluginsTab data={data} />
          ) : null}
        </TabsContent>

        {/* General */}
        <TabsContent
          value="general"
          style={{ animation: 'settings-tab-in 0.2s ease-out' }}
        >
          {isLoading ? (
            <Card
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
              }}
            >
              <CardContent className="p-5">
                <Skeleton
                  className="h-10 w-full"
                  style={{ background: 'var(--bg-elevated)' }}
                />
              </CardContent>
            </Card>
          ) : isError ? (
            <ErrorState
              message="Failed to load general settings."
              onRetry={() => refetch()}
            />
          ) : data ? (
            <GeneralTab data={data} />
          ) : null}
        </TabsContent>

        {/* Compare global vs local */}
        <TabsContent
          value="compare"
          className="space-y-4"
          style={{ animation: 'settings-tab-in 0.2s ease-out' }}
        >
          <CompareTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
