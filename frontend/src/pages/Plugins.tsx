import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Puzzle, Download, Ban } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const installed = [
  { name: 'frontend-design', version: 'v61c0597779bd', enabled: true, description: 'Create distinctive frontend interfaces' },
  { name: 'csharp-lsp', version: 'v1.0.0', enabled: true, description: 'C# Language Server Protocol support' },
  { name: 'typescript-lsp', version: 'v1.0.0', enabled: true, description: 'TypeScript Language Server Protocol' },
];

const marketplace = [
  { name: 'discord', description: 'Discord bot integration' },
  { name: 'gitlab', description: 'GitLab integration' },
  { name: 'playwright', description: 'Browser automation testing' },
  { name: 'supabase', description: 'Supabase database integration' },
  { name: 'firebase', description: 'Firebase services integration' },
  { name: 'slack', description: 'Slack messaging integration' },
  { name: 'linear', description: 'Linear issue tracking' },
  { name: 'github', description: 'Enhanced GitHub integration' },
];

const blocked = ['code-review', 'fizz'];

export default function Plugins() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Plugins</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage Claude Code plugins and extensions</p>
      </div>

      <Tabs defaultValue="installed" className="space-y-4">
        <TabsList style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <TabsTrigger value="installed"><Puzzle className="h-4 w-4 mr-2" />Installed ({installed.length})</TabsTrigger>
          <TabsTrigger value="marketplace"><Download className="h-4 w-4 mr-2" />Marketplace</TabsTrigger>
          <TabsTrigger value="blocked"><Ban className="h-4 w-4 mr-2" />Blocked</TabsTrigger>
        </TabsList>

        <TabsContent value="installed" className="space-y-3">
          {installed.map((plugin) => (
            <Card key={plugin.name} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--accent-100)' }}>
                      <Puzzle className="h-5 w-5" style={{ color: 'var(--icon-plugin)' }} />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{plugin.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{plugin.description}</p>
                      <Badge variant="outline" className="mt-1 text-[10px]" style={{ borderRadius: 'var(--radius-xs)' }}>{plugin.version}</Badge>
                    </div>
                  </div>
                  <Switch defaultChecked={plugin.enabled} />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="marketplace">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {marketplace.map((plugin) => (
              <Card key={plugin.name} className="cursor-pointer hover:scale-[1.02] transition-transform" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
                <CardContent className="p-4 text-center">
                  <Puzzle className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--icon-plugin)' }} />
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{plugin.name}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{plugin.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="blocked" className="space-y-3">
          {blocked.map((name) => (
            <Card key={name} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ban className="h-4 w-4" style={{ color: 'var(--error-500)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{name}</span>
                </div>
                <Badge style={{ background: 'var(--error-100)', color: 'var(--error-800)', borderRadius: 'var(--radius-sm)' }}>blocked</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
