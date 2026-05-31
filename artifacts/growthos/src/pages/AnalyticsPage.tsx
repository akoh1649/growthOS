import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

function AgentPerformanceChart() {
  const { data, isLoading } = useQuery<Array<{ name: string; generated: number; errors: number }>>({
    queryKey: ['agent-performance'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/agent-performance');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-6 w-6 text-emerald-400" /></div>;
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-400" />
          Agent Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="generated" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="errors" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ContentTrendChart() {
  const { data, isLoading } = useQuery<Array<{ date: string; count: number }>>({
    queryKey: ['content-trend'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/content-trend');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-6 w-6 text-emerald-400" /></div>;
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          Content Trend (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ContentDistribution() {
  const { data, isLoading } = useQuery<Array<{ name: string; value: number }>>({
    queryKey: ['content-distribution'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/content-distribution');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-6 w-6 text-emerald-400" /></div>;
  if (!data) return null;

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-400" />
          Content Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-1.5 text-sm">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-muted-foreground">{d.name} ({d.value})</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryStats() {
  const { data, isLoading } = useQuery<{
    totalContent: number;
    published: number;
    avgSeoScore: number;
    tasksCompleted: number;
    successRate: number;
    avgResponseTime: string;
  }>({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/summary');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  if (isLoading || !data) return null;

  const stats = [
    { label: 'Total Content', value: data.totalContent, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Published', value: data.published, icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Avg SEO Score', value: `${data.avgSeoScore}/100`, icon: BarChart3, color: 'text-amber-400' },
    { label: 'Tasks Done', value: data.tasksCompleted, icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Success Rate', value: `${data.successRate}%`, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Avg Response', value: data.avgResponseTime, icon: Clock, color: 'text-cyan-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.label} className="border-muted/50 bg-gradient-to-br from-card to-muted/10">
            <CardContent className="pt-4 text-center">
              <Icon className={`h-4 w-4 ${s.color} mx-auto mb-1`} />
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function AnalyticsPage() {
  return (
    <div className="space-y-4 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Performance metrics and usage statistics</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <SummaryStats />
      </motion.div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <AgentPerformanceChart />
        </TabsContent>

        <TabsContent value="trends">
          <ContentTrendChart />
        </TabsContent>

        <TabsContent value="distribution">
          <ContentDistribution />
        </TabsContent>
      </Tabs>
    </div>
  );
}
