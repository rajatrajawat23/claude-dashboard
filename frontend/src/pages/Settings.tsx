import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shield, Server, Plug, Zap } from 'lucide-react';

const permissions = [
  { type: 'bash', items: ['node', 'npm', 'npx', 'git', 'ls', 'mkdir', 'cp', 'mv', 'dotnet', 'cd', 'pwd', 'echo', 'which', 'curl'] },
  { type: 'database', items: ['sequelize', 'mysql', 'psql', 'mongo', 'mongosh', 'sqlite3', 'knex', 'prisma', 'typeorm', 'drizzle'] },
  { type: 'tools', items: ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'NotebookEdit'] },
];

const mcpServers = [
  { name: 'memory', command: 'npx', args: '@modelcontextprotocol/server-memory', status: 'active' },
  { name: 'sequential-thinking', command: 'npx', args: '@modelcontextprotocol/server-sequential-thinking', status: 'active' },
  { name: 'context7', command: 'npx', args: '@upstash/context7-mcp@latest', status: 'active' },
];

export default function Settings() {
  const [effort, setEffort] = useState('max');

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
        </TabsList>

        <TabsContent value="permissions" className="space-y-4">
          {permissions.map((group) => (
            <Card key={group.type} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
              <CardHeader>
                <CardTitle className="text-base capitalize" style={{ color: 'var(--text-primary)' }}>{group.type} Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <Badge key={item} variant="secondary" style={{ borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mcp" className="space-y-4">
          {mcpServers.map((server) => (
            <Card key={server.name} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5" style={{ color: 'var(--brand-500)' }} />
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{server.name}</p>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{server.command} {server.args}</p>
                    </div>
                  </div>
                  <Badge style={{ background: 'var(--success-100)', color: 'var(--success-800)', borderRadius: 'var(--radius-sm)' }}>
                    {server.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="plugins" className="space-y-4">
          {[
            { name: 'frontend-design', version: 'v61c0597779bd', enabled: true },
            { name: 'csharp-lsp', version: 'v1.0.0', enabled: true },
            { name: 'typescript-lsp', version: 'v1.0.0', enabled: true },
          ].map((plugin) => (
            <Card key={plugin.name} style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Plug className="h-5 w-5" style={{ color: 'var(--icon-plugin)' }} />
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{plugin.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{plugin.version}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={plugin.enabled} />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="general">
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
                      onClick={() => setEffort(level)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
