import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Puzzle,
  Download,
  Ban,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Store,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PluginInfo {
  name: string;
  version: string;
  marketplace: string;
  installedAt: string;
}

interface PluginsResponse {
  data: PluginInfo[];
  source: string;
}

interface SettingsData {
  permissions?: Record<string, string[]>;
  mcpServers?: Record<string, unknown>;
  enabledPlugins?: string[];
  blockedPlugins?: string[];
  [key: string]: unknown;
}

interface SettingsResponse {
  data: SettingsData;
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchPlugins(): Promise<PluginsResponse> {
  const res = await api.get<PluginsResponse>('/plugins');
  return res.data;
}

async function fetchSettings(): Promise<SettingsData> {
  const res = await api.get<SettingsResponse>('/claude/settings/global');
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function PluginCardSkeleton() {
  return (
    <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" style={{ background: 'var(--bg-elevated)' }} />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" style={{ background: 'var(--bg-elevated)' }} />
              <Skeleton className="h-3 w-48" style={{ background: 'var(--bg-elevated)' }} />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xs)' }} />
                <Skeleton className="h-5 w-24" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xs)' }} />
              </div>
            </div>
          </div>
          <Skeleton className="h-5 w-8 rounded-full" style={{ background: 'var(--bg-elevated)' }} />
        </div>
      </CardContent>
    </Card>
  );
}

function InstalledSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <PluginCardSkeleton key={i} />
      ))}
    </div>
  );
}

function MarketplaceSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <CardContent className="p-4 text-center">
            <Skeleton className="h-8 w-8 mx-auto mb-2 rounded" style={{ background: 'var(--bg-elevated)' }} />
            <Skeleton className="h-4 w-20 mx-auto mb-1" style={{ background: 'var(--bg-elevated)' }} />
            <Skeleton className="h-3 w-28 mx-auto" style={{ background: 'var(--bg-elevated)' }} />
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
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ message }: { message: string }) {
  return (
    <Card style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-8 text-center">
        <Puzzle className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Utility: format date
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  if (!dateStr) return 'Unknown';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Installed tab
// ---------------------------------------------------------------------------

function InstalledTab({
  plugins,
  enabledPlugins,
  search,
  onToggle,
  isToggling,
}: {
  plugins: PluginInfo[];
  enabledPlugins: string[];
  search: string;
  onToggle: (name: string, enabled: boolean) => void;
  isToggling: boolean;
}) {
  const filtered = useMemo(() => {
    if (!search.trim()) return plugins;
    const q = search.toLowerCase();
    return plugins.filter((p) => p.name.toLowerCase().includes(q));
  }, [plugins, search]);

  if (filtered.length === 0 && search.trim()) {
    return <EmptyState message={`No installed plugins matching "${search}"`} />;
  }

  if (filtered.length === 0) {
    return <EmptyState message="No plugins installed yet." />;
  }

  return (
    <div className="space-y-3">
      {filtered.map((plugin) => {
        const isEnabled = enabledPlugins.includes(plugin.name);
        return (
          <Card
            key={plugin.name}
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: isEnabled ? 'var(--accent-100)' : 'var(--bg-elevated)' }}
                  >
                    <Puzzle
                      className="h-5 w-5"
                      style={{ color: isEnabled ? 'var(--icon-plugin, var(--brand-500))' : 'var(--text-muted)' }}
                    />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {plugin.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        style={{ borderRadius: 'var(--radius-xs)' }}
                      >
                        {plugin.version}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-[10px] flex items-center gap-1"
                        style={{
                          borderRadius: 'var(--radius-xs)',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Store className="h-2.5 w-2.5" />
                        {plugin.marketplace}
                      </Badge>
                      {plugin.installedAt && (
                        <span
                          className="text-[10px] flex items-center gap-1"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Calendar className="h-2.5 w-2.5" />
                          {formatDate(plugin.installedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    style={{
                      background: isEnabled ? 'var(--success-100)' : 'var(--bg-elevated)',
                      color: isEnabled ? 'var(--success-800)' : 'var(--text-muted)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {isEnabled ? 'enabled' : 'disabled'}
                  </Badge>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => onToggle(plugin.name, checked)}
                    disabled={isToggling}
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
// Marketplace tab
// ---------------------------------------------------------------------------

function MarketplaceTab({
  plugins,
  installedNames,
  search,
}: {
  plugins: PluginInfo[];
  installedNames: Set<string>;
  search: string;
}) {
  // Show installed plugins grouped by marketplace, plus show marketplace names
  const marketplaces = useMemo(() => {
    const mpMap = new Map<string, PluginInfo[]>();
    for (const p of plugins) {
      const mp = p.marketplace || 'unknown';
      const existing = mpMap.get(mp) ?? [];
      existing.push(p);
      mpMap.set(mp, existing);
    }
    return mpMap;
  }, [plugins]);

  const allPlugins = useMemo(() => {
    const filtered = [...plugins];
    if (!search.trim()) return filtered;
    const q = search.toLowerCase();
    return filtered.filter((p) => p.name.toLowerCase().includes(q));
  }, [plugins, search]);

  if (allPlugins.length === 0 && search.trim()) {
    return <EmptyState message={`No marketplace plugins matching "${search}"`} />;
  }

  if (allPlugins.length === 0) {
    return <EmptyState message="No marketplace data available." />;
  }

  const mpNames = [...marketplaces.keys()];

  return (
    <div className="space-y-4">
      {mpNames.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mpNames.map((mp) => (
            <Badge
              key={mp}
              variant="secondary"
              className="text-xs flex items-center gap-1"
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
              }}
            >
              <Store className="h-3 w-3" />
              {mp}
              <span
                className="ml-1 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                ({marketplaces.get(mp)?.length ?? 0})
              </span>
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {allPlugins.map((plugin) => {
          const isInstalled = installedNames.has(plugin.name);
          return (
            <Card
              key={plugin.name}
              className="relative cursor-pointer hover:scale-[1.02] transition-transform"
              style={{
                background: 'var(--bg-card)',
                borderColor: isInstalled ? 'var(--brand-500)' : 'var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
              }}
            >
              <CardContent className="p-4 text-center">
                {isInstalled && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2
                      className="h-4 w-4"
                      style={{ color: 'var(--success-500, var(--brand-500))' }}
                    />
                  </div>
                )}
                <Puzzle
                  className="h-8 w-8 mx-auto mb-2"
                  style={{ color: isInstalled ? 'var(--icon-plugin, var(--brand-500))' : 'var(--text-muted)' }}
                />
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                  {plugin.name}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {plugin.version}
                </p>
                <Badge
                  className="mt-2 text-[10px]"
                  style={{
                    background: isInstalled ? 'var(--success-100)' : 'var(--bg-elevated)',
                    color: isInstalled ? 'var(--success-800)' : 'var(--text-muted)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {isInstalled ? 'installed' : 'available'}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Blocked tab
// ---------------------------------------------------------------------------

function BlockedTab({
  blockedPlugins,
  search,
}: {
  blockedPlugins: string[];
  search: string;
}) {
  const filtered = useMemo(() => {
    if (!search.trim()) return blockedPlugins;
    const q = search.toLowerCase();
    return blockedPlugins.filter((name) => name.toLowerCase().includes(q));
  }, [blockedPlugins, search]);

  if (filtered.length === 0 && search.trim()) {
    return <EmptyState message={`No blocked plugins matching "${search}"`} />;
  }

  if (filtered.length === 0) {
    return <EmptyState message="No plugins are currently blocked." />;
  }

  return (
    <div className="space-y-3">
      {filtered.map((name) => (
        <Card
          key={name}
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ban className="h-4 w-4" style={{ color: 'var(--error-500)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>{name}</span>
            </div>
            <Badge
              style={{
                background: 'var(--error-100)',
                color: 'var(--error-800)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              blocked
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Plugins() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  // Fetch installed plugins
  const pluginsQuery = useQuery({
    queryKey: ['plugins'],
    queryFn: fetchPlugins,
  });

  // Fetch global settings (for enabledPlugins + blockedPlugins)
  const settingsQuery = useQuery({
    queryKey: ['settings', 'global'],
    queryFn: fetchSettings,
  });

  const plugins: PluginInfo[] = pluginsQuery.data?.data ?? [];
  const enabledPlugins: string[] = settingsQuery.data?.enabledPlugins ?? [];
  const blockedPlugins: string[] = settingsQuery.data?.blockedPlugins ?? [];
  const installedNames = useMemo(() => new Set(plugins.map((p) => p.name)), [plugins]);

  // Toggle mutation: update enabledPlugins in settings
  const toggleMutation = useMutation({
    mutationFn: async ({ name, enabled }: { name: string; enabled: boolean }) => {
      const currentSettings = settingsQuery.data;
      if (!currentSettings) throw new Error('Settings not loaded');

      const currentEnabled = currentSettings.enabledPlugins ?? [];
      let updatedEnabled: string[];

      if (enabled) {
        updatedEnabled = currentEnabled.includes(name)
          ? currentEnabled
          : [...currentEnabled, name];
      } else {
        updatedEnabled = currentEnabled.filter((p) => p !== name);
      }

      await api.put('/claude/settings/global', {
        ...currentSettings,
        enabledPlugins: updatedEnabled,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'global'] });
      toast.success(`Plugin "${variables.name}" ${variables.enabled ? 'enabled' : 'disabled'}`);
    },
    onError: (_err, variables) => {
      toast.error(`Failed to ${variables.enabled ? 'enable' : 'disable'} "${variables.name}"`);
    },
  });

  function handleToggle(name: string, enabled: boolean) {
    toggleMutation.mutate({ name, enabled });
  }

  function handleRefresh() {
    pluginsQuery.refetch();
    settingsQuery.refetch();
    toast.success('Refreshing plugin data...');
  }

  const isLoading = pluginsQuery.isLoading || settingsQuery.isLoading;
  const isError = pluginsQuery.isError && settingsQuery.isError;
  const isFetching = pluginsQuery.isFetching || settingsQuery.isFetching;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Plugins
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Manage Claude Code plugins and extensions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
          style={{ color: 'var(--text-muted)' }}
        />
        <Input
          placeholder="Search plugins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 text-sm"
          style={{
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-subtle)',
          }}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="installed" className="space-y-4">
        <TabsList style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <TabsTrigger value="installed">
            <Puzzle className="h-4 w-4 mr-2" />
            Installed
            <Badge
              variant="secondary"
              className="ml-2 text-[10px] px-1.5 py-0"
              style={{
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-muted)',
              }}
            >
              {plugins.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="marketplace">
            <Download className="h-4 w-4 mr-2" />
            Marketplace
            <Badge
              variant="secondary"
              className="ml-2 text-[10px] px-1.5 py-0"
              style={{
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-muted)',
              }}
            >
              {plugins.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="blocked">
            <Ban className="h-4 w-4 mr-2" />
            Blocked
            {blockedPlugins.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 text-[10px] px-1.5 py-0"
                style={{
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--error-100)',
                  color: 'var(--error-800)',
                }}
              >
                {blockedPlugins.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Installed */}
        <TabsContent value="installed" className="space-y-3">
          {isLoading ? (
            <InstalledSkeleton />
          ) : isError ? (
            <ErrorState
              message="Failed to load plugins."
              onRetry={() => {
                pluginsQuery.refetch();
                settingsQuery.refetch();
              }}
            />
          ) : (
            <InstalledTab
              plugins={plugins}
              enabledPlugins={enabledPlugins}
              search={search}
              onToggle={handleToggle}
              isToggling={toggleMutation.isPending}
            />
          )}
        </TabsContent>

        {/* Marketplace */}
        <TabsContent value="marketplace">
          {isLoading ? (
            <MarketplaceSkeleton />
          ) : pluginsQuery.isError ? (
            <ErrorState
              message="Failed to load marketplace data."
              onRetry={() => pluginsQuery.refetch()}
            />
          ) : (
            <MarketplaceTab
              plugins={plugins}
              installedNames={installedNames}
              search={search}
            />
          )}
        </TabsContent>

        {/* Blocked */}
        <TabsContent value="blocked" className="space-y-3">
          {settingsQuery.isLoading ? (
            <InstalledSkeleton />
          ) : settingsQuery.isError ? (
            <ErrorState
              message="Failed to load blocked plugins."
              onRetry={() => settingsQuery.refetch()}
            />
          ) : (
            <BlockedTab blockedPlugins={blockedPlugins} search={search} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
