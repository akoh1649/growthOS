import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Activity, Users, FileText, BarChart3, Play, RotateCcw } from 'lucide-react';
import { useApi } from '@/lib/api-client-react';
import { Agent, AgentTask } from '@/types/agent';

function AgentGrid() {
  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await fetch('/api/agents');
      if (!res.ok) throw new Error('Failed to fetch agents');
      return res.json();
    },
    refetchInterval: 5000,
  });

  if (isLoading) return <AgentGridSkeleton />;

  const statusColors: Record<string, string> = {
    running: 'bg-emerald-500',
    idle: 'bg-slate-500',
    error: 'bg-red-500',
    stopped: 'bg-amber-500',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            Agent Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {agents?.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${statusColors[agent.status] || 'bg-slate-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{agent.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{agent.type}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {agent.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AgentGridSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-emerald-400" /> Agent Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-2 w-16 bg-muted rounded" />
                </div>
              </div>
              <div className="h-5 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricsRow() {
  const { data: metrics } = useQuery<Record<string, number>>({
    queryKey: ['metrics-summary'],
    queryFn: async () => {
      const res = await fetch('/api/metrics/summary');
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return res.json();
    },
  });

  const widgets = [
    { icon: FileText, label: 'Content Created', value: metrics?.articles ?? '—', color: 'text-emerald-400' },
    { icon: Users, label: 'Active Agents', value: metrics?.activeAgents ?? '—', color: 'text-blue-400' },
    { icon: BarChart3, label: 'Avg SEO Score', value: `${metrics?.seoScore ?? '—'}`, color: 'text-amber-400' },
    { icon: Zap, label: 'Tasks Completed', value: metrics?.tasksCompleted ?? '—', color: 'text-purple-400' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {widgets.map((w) => {
          const Icon = w.icon;
          return (
            <Card key={w.label} className="border-muted/50 bg-gradient-to-br from-card to-muted/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <Icon className={`h-5 w-5 ${w.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{w.value}</p>
                    <p className="text-xs text-muted-foreground">{w.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}

function QuickActions() {
  const api = useApi();
  const { refetch: refetchAgents } = useQuery<Agent[]>({ queryKey: ['agents'], enabled: false });

  const handleRunTask = async (agentId: string, type: string) => {
    try {
      await api.post(`/api/agents/${agentId}/run`, { type });
      refetchAgents();
    } catch (err) {
      console.error('Failed to run task:', err);
    }
  };

  const { data: tasks } = useQuery<AgentTask[]>({
    queryKey: ['recent-tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks?limit=5&sort=created_at:desc');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
    refetchInterval: 10000,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Play className="h-3 w-3 mr-1" /> Run All Agents
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <RotateCcw className="h-3 w-3 mr-1" /> Sync Content
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <FileText className="h-3 w-3 mr-1" /> Generate SEO Report
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Users className="h-3 w-3 mr-1" /> Support Audit
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks?.map((task) => (
            <div key={task.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm text-foreground">{task.type}</p>
                <p className="text-xs text-muted-foreground">{new Date(task.createdAt).toLocaleString()}</p>
              </div>
              <Badge variant={task.status === 'completed' ? 'default' : task.status === 'running' ? 'secondary' : 'destructive'}>
                {task.status}
              </Badge>
            </div>
          ))}
          {tasks?.length === 0 && <p className="text-sm text-muted-foreground">No recent activity</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardPage() {
  return (
    <div className="space-y-4 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your GrowthOS agents and metrics</p>
      </div>

      <MetricsRow />
      <AgentGrid />
      <QuickActions />
    </div>
  );
}
