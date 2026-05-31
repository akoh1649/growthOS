import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Agent, AgentTask } from '@/types/agent';
import { Loader2, Play, Square, RefreshCw, MessageSquare, FileText, MessageCircle, Twitter, Globe } from 'lucide-react';

const typeIcons: Record<string, typeof FileText> = {
  seo: FileText,
  writer: FileText,
  support: MessageSquare,
  reddit: MessageCircle,
  twitter: Twitter,
  hn: Globe,
};

function AgentDetail() {
  const { type } = useParams();
  const queryClient = useQueryClient();

  const { data: agent } = useQuery<Agent>({
    queryKey: ['agent', type],
    queryFn: async () => {
      const res = await fetch(`/api/agents?type=${type}`);
      if (!res.ok) throw new Error('Failed to fetch agent');
      const agents = await res.json();
      return agents[0];
    },
  });

  const { data: tasks } = useQuery<AgentTask[]>({
    queryKey: ['agent-tasks', type],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?agent_type=${type}&limit=10`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
    refetchInterval: 5000,
  });

  const runMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/agents/${agent?.id}/run`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to run');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', type] });
      queryClient.invalidateQueries({ queryKey: ['agent-tasks', type] });
    },
  });

  const stopMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/agents/${agent?.id}/stop`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to stop');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', type] });
    },
  });

  const Icon = typeIcons[type!] || FileText;

  const statusColors: Record<string, string> = {
    running: 'bg-emerald-500',
    idle: 'bg-slate-500',
    error: 'bg-red-500',
    stopped: 'bg-amber-500',
  };

  return (
    <div className="space-y-4 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10"><Icon className="h-6 w-6 text-emerald-400" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground capitalize">{type}</h1>
            <p className="text-muted-foreground">Agent: {agent?.name || type}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {agent?.status === 'running' ? (
            <Button variant="destructive" size="sm" disabled={stopMutation.isPending} onClick={() => stopMutation.mutate()}>
              {stopMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
              Stop
            </Button>
          ) : (
            <Button size="sm" disabled={runMutation.isPending} onClick={() => runMutation.mutate()}>
              {runMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-sm">
          <div className={`w-2 h-2 rounded-full ${statusColors[agent?.status || 'idle']} mr-1`} />
          {agent?.status || 'idle'}
        </Badge>
        {agent?.lastRunAt && (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Last run: {new Date(agent.lastRunAt).toLocaleString()}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks?.length === 0 && <p className="text-sm text-muted-foreground">No tasks yet</p>}
          <div className="space-y-2">
            {tasks?.map((task) => (
              <div key={task.id} className="flex items-center justify-between py-2 px-3 rounded bg-muted/30">
                <div>
                  <p className="text-sm font-medium">{task.type}</p>
                  <p className="text-xs text-muted-foreground">{new Date(task.createdAt).toLocaleString()}</p>
                </div>
                <Badge variant={task.status === 'completed' ? 'default' : task.status === 'running' ? 'secondary' : 'destructive'} className="text-xs">
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AgentsPage() {
  return <AgentDetail />;
}
