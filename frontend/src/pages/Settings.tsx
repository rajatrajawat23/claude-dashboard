import { useState } from 'react';
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
import { Shield, Server, Plug, Zap, GitCompare, Plus, X, AlertCircle, RefreshCw } from 'lucide-react';

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
// Skeletons
// ---------------------------------------------------------------------------

function PermissionsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <CardHeader>
            <Skeleton className="h-5 w-40" style={{ background: 'var(--bg-elevated)' }} />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((j) => (
                <Skeleton key={j} className="h-6 w-16" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }} />
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
        <Card key={i} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" style={{ background: 'var(--bg-elevated)' }} />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" style={{ background: 'var(--bg-elevated)' }} />
                  <Skeleton className="h-3 w-56" style={{ background: 'var(--bg-elevated)' }} />
                </div>
              </div>
              <Skeleton className="h-5 w-8 rounded-full" style={{ background: 'var(--bg-elevated)' }} />
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
        <Card key={i} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" style={{ background: 'var(--bg-elevated)' }} />
                <Skeleton className="h-4 w-40" style={{ background: 'var(--bg-elevated)' }} />
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

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-8 flex flex-col items-center gap-4">
        <AlertCircle className="h-10 w-10" style={{ color: 'var(--error-500)' }} />
        <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>{message}</p>
        <Button variant="outline" size="sm" onClick={onRetry} style={{ borderRadius: 'var(--radius-md)' }}>
          <RefreshCw className="h-4 w-4 mr-2" />Retry
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
      <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <CardContent className="p-8 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No permissions configured.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map(([group, items]) => (
        <Card key={group} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <CardHeader>
            <CardTitle className="text-base capitalize" style={{ color: 'var(--text-primary)' }}>
              {group} Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(items ?? []).map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="flex items-center gap-1 group cursor-default"
                  style={{ borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                >
                  {item}
                  <button
                    onClick={() => removePermission(group, item)}
                    className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove ${item}`}
                  >
                    <X className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <Input
                placeholder={`Add ${group} permission...`}
                value={newPermInputs[group] ?? ''}
                onChange={(e) => setNewPermInputs((prev) => ({ ...prev, [group]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addPermission(group);
                }}
                className="max-w-xs text-sm"
                style={{ borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }}
              />
              <Button
                size="sm"
                disabled={updateMutation.isPending}
                onClick={() => addPermission(group)}
                style={{ background: 'var(--brand-500)', borderRadius: 'var(--radius-md)' }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
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
      <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <CardContent className="p-8 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No MCP servers configured.</p>
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
          <Card key={name} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5" style={{ color: isEnabled ? 'var(--brand-500)' : 'var(--text-muted)' }} />
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{name}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {server.command}{argsStr ? ` ${argsStr}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge style={{
                    background: isEnabled ? 'var(--success-100)' : 'var(--bg-elevated)',
                    color: isEnabled ? 'var(--success-800)' : 'var(--text-muted)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
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
      <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <CardContent className="p-8 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No plugins enabled.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {plugins.map((plugin) => (
        <Card key={plugin} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Plug className="h-5 w-5" style={{ color: 'var(--icon-plugin, var(--brand-500))' }} />
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{plugin}</p>
                </div>
              </div>
              <Badge style={{ background: 'var(--success-100)', color: 'var(--success-800)', borderRadius: 'var(--radius-sm)' }}>
                enabled
              </Badge>
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

  return (
    <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Effort Level</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Controls how thoroughly Claude processes requests</p>
          </div>
          <div className="flex gap-2">
            {['low', 'medium', 'high', 'max'].map((level) => (
              <button
                key={level}
                onClick={() => handleEffort(level)}
                disabled={updateMutation.isPending}
                className="px-3 py-1 text-sm rounded-md capitalize transition-colors"
                style={{
                  background: effort === level ? 'var(--brand-500)' : 'var(--bg-elevated)',
                  color: effort === level ? 'white' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
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
          <Card key={i} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
            <CardHeader><Skeleton className="h-5 w-24" style={{ background: 'var(--bg-elevated)' }} /></CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-4 w-full" style={{ background: 'var(--bg-elevated)' }} />
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
        onRetry={() => { globalQuery.refetch(); localQuery.refetch(); }}
      />
    );
  }

  const globalData = globalQuery.data;
  const localData = localQuery.data;

  function renderSettingsColumn(label: string, settings: SettingsData | undefined) {
    if (!settings) {
      return (
        <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: 'var(--text-primary)' }}>{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No data available.</p>
          </CardContent>
        </Card>
      );
    }

    const permGroups = Object.entries(settings.permissions ?? {});
    const mcpEntries = Object.entries(settings.mcpServers ?? {});
    const plugins = settings.enabledPlugins ?? [];

    return (
      <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
        <CardHeader>
          <CardTitle className="text-base" style={{ color: 'var(--text-primary)' }}>{label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Permissions */}
          <div>
            <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Permissions</p>
            {permGroups.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>None</p>
            ) : (
              permGroups.map(([group, items]) => (
                <div key={group} className="mb-2">
                  <p className="text-xs font-medium capitalize mb-1" style={{ color: 'var(--text-secondary)' }}>{group}</p>
                  <div className="flex flex-wrap gap-1">
                    {(items ?? []).map((item) => (
                      <Badge key={item} variant="secondary" className="text-[10px]" style={{ borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* MCP Servers */}
          <div>
            <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>MCP Servers</p>
            {mcpEntries.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>None</p>
            ) : (
              mcpEntries.map(([name, server]) => (
                <div key={name} className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{name}</span>
                  <Badge className="text-[10px]" style={{
                    background: server.disabled ? 'var(--bg-elevated)' : 'var(--success-100)',
                    color: server.disabled ? 'var(--text-muted)' : 'var(--success-800)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    {server.disabled ? 'disabled' : 'active'}
                  </Badge>
                </div>
              ))
            )}
          </div>

          {/* Plugins */}
          <div>
            <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Plugins</p>
            {plugins.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>None</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {plugins.map((p) => (
                  <Badge key={p} variant="secondary" className="text-[10px]" style={{ borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                    {p}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {renderSettingsColumn('Global Settings', globalData)}
      {renderSettingsColumn('Local Settings', localData)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Settings page
// ---------------------------------------------------------------------------

export default function Settings() {
  const globalQuery = useQuery({
    queryKey: ['settings', 'global'],
    queryFn: () => fetchSettings('global'),
  });

  const { data, isLoading, isError, refetch } = globalQuery;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage Claude Code configuration</p>
      </div>

      <Tabs defaultValue="permissions" className="space-y-4">
        <TabsList style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <TabsTrigger value="permissions"><Shield className="h-4 w-4 mr-2" />Permissions</TabsTrigger>
          <TabsTrigger value="mcp"><Server className="h-4 w-4 mr-2" />MCP Servers</TabsTrigger>
          <TabsTrigger value="plugins"><Plug className="h-4 w-4 mr-2" />Plugins</TabsTrigger>
          <TabsTrigger value="general"><Zap className="h-4 w-4 mr-2" />General</TabsTrigger>
          <TabsTrigger value="compare"><GitCompare className="h-4 w-4 mr-2" />Compare</TabsTrigger>
        </TabsList>

        {/* Permissions */}
        <TabsContent value="permissions" className="space-y-4">
          {isLoading ? <PermissionsSkeleton /> : isError ? (
            <ErrorState message="Failed to load permissions." onRetry={() => refetch()} />
          ) : data ? (
            <PermissionsTab data={data} />
          ) : null}
        </TabsContent>

        {/* MCP Servers */}
        <TabsContent value="mcp" className="space-y-4">
          {isLoading ? <McpSkeleton /> : isError ? (
            <ErrorState message="Failed to load MCP servers." onRetry={() => refetch()} />
          ) : data ? (
            <McpServersTab data={data} />
          ) : null}
        </TabsContent>

        {/* Plugins */}
        <TabsContent value="plugins" className="space-y-4">
          {isLoading ? <PluginsSkeleton /> : isError ? (
            <ErrorState message="Failed to load plugins." onRetry={() => refetch()} />
          ) : data ? (
            <PluginsTab data={data} />
          ) : null}
        </TabsContent>

        {/* General */}
        <TabsContent value="general">
          {isLoading ? (
            <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
              <CardContent className="p-4">
                <Skeleton className="h-10 w-full" style={{ background: 'var(--bg-elevated)' }} />
              </CardContent>
            </Card>
          ) : isError ? (
            <ErrorState message="Failed to load general settings." onRetry={() => refetch()} />
          ) : data ? (
            <GeneralTab data={data} />
          ) : null}
        </TabsContent>

        {/* Compare global vs local */}
        <TabsContent value="compare" className="space-y-4">
          <CompareTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
