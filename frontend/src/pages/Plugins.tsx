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
  Sparkles,
  Shield,
  Package,
  Zap,
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
// Gradient text style
// ---------------------------------------------------------------------------

const gradientTextStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, var(--brand-500), var(--accent-500))',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

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
    <Card className="card-premium" style={{ borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" style={{ background: 'var(--bg-elevated)' }} />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" style={{ background: 'var(--bg-elevated)' }} />
              <Skeleton className="h-3 w-48" style={{ background: 'var(--bg-elevated)' }} />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 animate-shimmer" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xs)' }} />
                <Skeleton className="h-5 w-24 animate-shimmer" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xs)' }} />
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
        <Card key={i} className="card-premium" style={{ borderRadius: 'var(--radius-xl)' }}>
          <CardContent className="p-4 text-center">
            <Skeleton className="h-8 w-8 mx-auto mb-2 rounded animate-shimmer" style={{ background: 'var(--bg-elevated)' }} />
            <Skeleton className="h-4 w-20 mx-auto mb-1 animate-shimmer" style={{ background: 'var(--bg-elevated)' }} />
            <Skeleton className="h-3 w-28 mx-auto animate-shimmer" style={{ background: 'var(--bg-elevated)' }} />
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
    <Card className="card-premium" style={{ borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-8 flex flex-col items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: 'color-mix(in srgb, var(--error-500) 12%, transparent)' }}
        >
          <AlertCircle className="h-7 w-7" style={{ color: 'var(--error-500)' }} />
        </div>
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
    <Card className="card-premium" style={{ borderRadius: 'var(--radius-xl)' }}>
      <CardContent className="p-8 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl mx-auto mb-3 animate-float"
          style={{ background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)', borderRadius: 'var(--radius-lg)' }}
        >
          <Puzzle className="h-7 w-7" style={{ color: 'var(--brand-500)' }} />
        </div>
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
            className="card-premium transition-all hover:scale-[1.01]"
            style={{
              borderRadius: 'var(--radius-xl)',
              borderLeft: isEnabled ? '3px solid var(--brand-500)' : '3px solid transparent',
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl transition-all"
                    style={{
                      background: isEnabled
                        ? 'color-mix(in srgb, var(--brand-500) 12%, transparent)'
                        : 'color-mix(in srgb, var(--text-muted) 8%, transparent)',
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    <Puzzle
                      className="h-5 w-5"
                      style={{ color: isEnabled ? 'var(--brand-500)' : 'var(--text-muted)' }}
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
                        style={{ borderRadius: 'var(--radius-md)' }}
                      >
                        <Package className="h-2.5 w-2.5 mr-1" />
                        {plugin.version}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-[10px] flex items-center gap-1"
                        style={{
                          borderRadius: 'var(--radius-md)',
                          background: 'color-mix(in srgb, var(--accent-500) 10%, transparent)',
                          color: 'var(--accent-600)',
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
                      background: isEnabled ? 'color-mix(in srgb, var(--success-500) 12%, transparent)' : 'var(--bg-elevated)',
                      color: isEnabled ? 'var(--success-700)' : 'var(--text-muted)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full mr-1.5"
                      style={{
                        background: isEnabled ? 'var(--success-500)' : 'var(--text-muted)',
                        boxShadow: isEnabled ? '0 0 6px var(--success-500)' : 'none',
                      }}
                    />
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
              className="text-xs flex items-center gap-1 transition-all hover:scale-[1.05]"
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'color-mix(in srgb, var(--brand-500) 8%, transparent)',
                color: 'var(--text-secondary)',
                border: '1px solid color-mix(in srgb, var(--brand-500) 20%, transparent)',
              }}
            >
              <Store className="h-3 w-3" style={{ color: 'var(--brand-500)' }} />
              {mp}
              <span
                className="ml-1 font-semibold"
                style={{ color: 'var(--brand-500)' }}
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
              className="card-premium relative cursor-pointer transition-all hover:scale-[1.03]"
              style={{
                borderRadius: 'var(--radius-xl)',
                borderColor: isInstalled ? 'var(--brand-500)' : undefined,
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
                <div
                  className="flex h-12 w-12 items-center justify-center mx-auto mb-3"
                  style={{
                    background: isInstalled
                      ? 'color-mix(in srgb, var(--brand-500) 12%, transparent)'
                      : 'color-mix(in srgb, var(--text-muted) 8%, transparent)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <Puzzle
                    className="h-6 w-6"
                    style={{ color: isInstalled ? 'var(--brand-500)' : 'var(--text-muted)' }}
                  />
                </div>
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                  {plugin.name}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {plugin.version}
                </p>
                <Badge
                  className="mt-2 text-[10px]"
                  style={{
                    background: isInstalled
                      ? 'color-mix(in srgb, var(--success-500) 12%, transparent)'
                      : 'var(--bg-elevated)',
                    color: isInstalled ? 'var(--success-700)' : 'var(--text-muted)',
                    borderRadius: 'var(--radius-md)',
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
          className="card-premium transition-all hover:scale-[1.01]"
          style={{
            borderRadius: 'var(--radius-xl)',
            borderLeft: '3px solid var(--error-500)',
          }}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center"
                style={{
                  background: 'color-mix(in srgb, var(--error-500) 12%, transparent)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <Shield className="h-4 w-4" style={{ color: 'var(--error-500)' }} />
              </div>
              <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{name}</span>
            </div>
            <Badge
              style={{
                background: 'color-mix(in srgb, var(--error-500) 12%, transparent)',
                color: 'var(--error-700)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Ban className="h-2.5 w-2.5 mr-1" />
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
      <div
        className="flex items-center justify-between p-4 rounded-2xl"
        style={{
          background: 'color-mix(in srgb, var(--bg-card) 80%, transparent)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center animate-float"
            style={{
              background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <Sparkles className="h-5 w-5" style={{ color: 'var(--brand-500)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={gradientTextStyle}>
              Plugins
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Manage Claude Code plugins and extensions
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          className="transition-all hover:scale-[1.05]"
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="card-premium transition-all hover:scale-[1.02]" style={{ borderRadius: 'var(--radius-xl)' }}>
          <CardContent className="p-3 flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)', borderRadius: 'var(--radius-lg)' }}
            >
              <Package className="h-4 w-4" style={{ color: 'var(--brand-500)' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Installed</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{plugins.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium transition-all hover:scale-[1.02]" style={{ borderRadius: 'var(--radius-xl)' }}>
          <CardContent className="p-3 flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--success-500) 12%, transparent)', borderRadius: 'var(--radius-lg)' }}
            >
              <Zap className="h-4 w-4" style={{ color: 'var(--success-500)' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Enabled</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{enabledPlugins.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium transition-all hover:scale-[1.02]" style={{ borderRadius: 'var(--radius-xl)' }}>
          <CardContent className="p-3 flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--error-500) 12%, transparent)', borderRadius: 'var(--radius-lg)' }}
            >
              <Shield className="h-4 w-4" style={{ color: 'var(--error-500)' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Blocked</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{blockedPlugins.length}</p>
            </div>
          </CardContent>
        </Card>
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
        <TabsList
          style={{
            background: 'color-mix(in srgb, var(--bg-card) 80%, transparent)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <TabsTrigger value="installed">
            <Puzzle className="h-4 w-4 mr-2" />
            Installed
            <Badge
              variant="secondary"
              className="ml-2 text-[10px] px-1.5 py-0"
              style={{
                borderRadius: 'var(--radius-md)',
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
                borderRadius: 'var(--radius-md)',
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
                  borderRadius: 'var(--radius-md)',
                  background: 'color-mix(in srgb, var(--error-500) 12%, transparent)',
                  color: 'var(--error-700)',
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
