/**
 * AnalyticsDashboard - Dashboard de Analytics MVP
 * Sprint 4.3: Visitas, CTR, Dwell time, gráficos com Recharts
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, MousePointerClick, Clock, TrendingUp, Loader2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  totalLeads: number;
  ctr: number;
  avgDwellTime: number;
  sessionsByDay: { date: string; sessions: number }[];
  sectionViews: { section: string; views: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsDashboard() {
  const { lpId } = useParams<{ lpId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lpName, setLpName] = useState('');

  // QA Log
  useEffect(() => {
    console.log('[S4.3 QA] Analytics Charts: mounted', { lpId });
  }, [lpId]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!lpId) return;

      setLoading(true);
      try {
        // Get LP name
        const { data: lp } = await supabase
          .from('landing_pages')
          .select('nome')
          .eq('id', lpId)
          .single();
        
        if (lp) setLpName(lp.nome);

        const thirtyDaysAgo = subDays(new Date(), 30);

        // Get events
        const { data: events, error } = await supabase
          .from('lp_events')
          .select('*')
          .eq('lp_id', lpId)
          .gte('created_at', thirtyDaysAgo.toISOString());

        if (error) throw error;

        // Get leads count
        const { count: leadsCount } = await supabase
          .from('lp_leads')
          .select('*', { count: 'exact', head: true })
          .eq('lp_id', lpId)
          .gte('created_at', thirtyDaysAgo.toISOString());

        // Process data
        const views = events?.filter(e => e.event_type === 'view' || e.event_type === 'section_view') || [];
        const clicks = events?.filter(e => e.event_type === 'cta_click') || [];
        const scrollEvents = events?.filter(e => e.event_type === 'scroll') || [];

        // Sessions by day
        const sessionsByDayMap = new Map<string, Set<string>>();
        for (let i = 29; i >= 0; i--) {
          const date = format(subDays(new Date(), i), 'dd/MM');
          sessionsByDayMap.set(date, new Set());
        }

        events?.forEach(event => {
          if (event.created_at && event.session_id) {
            const date = format(new Date(event.created_at), 'dd/MM');
            if (sessionsByDayMap.has(date)) {
              sessionsByDayMap.get(date)!.add(event.session_id);
            }
          }
        });

        const sessionsByDay = Array.from(sessionsByDayMap.entries()).map(([date, sessions]) => ({
          date,
          sessions: sessions.size,
        }));

        // Section views
        const sectionViewsMap = new Map<string, number>();
        events?.forEach(event => {
          if (event.event_type === 'section_view' && event.section) {
            const current = sectionViewsMap.get(event.section) || 0;
            sectionViewsMap.set(event.section, current + 1);
          }
        });

        const sectionViews = Array.from(sectionViewsMap.entries())
          .map(([section, views]) => ({ section, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 6);

        // Calculate metrics
        const totalViews = views.length;
        const totalClicks = clicks.length;
        const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

        // Estimate dwell time from scroll depth
        const avgScrollDepth = scrollEvents.length > 0
          ? scrollEvents.reduce((sum, e) => sum + ((e.metadata as any)?.scroll_percentage || 0), 0) / scrollEvents.length
          : 0;
        const avgDwellTime = Math.round(avgScrollDepth * 0.6); // Rough estimate: 60% depth = ~60 seconds

        setData({
          totalViews,
          totalClicks,
          totalLeads: leadsCount || 0,
          ctr,
          avgDwellTime,
          sessionsByDay,
          sectionViews,
        });

        console.log('[S4.3 QA] Analytics Charts: OK', { totalViews, totalClicks, ctr });
      } catch (err) {
        console.error('Error fetching analytics:', err);
        toast({ title: 'Erro ao carregar analytics', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [lpId]);

  const MetricCard = ({ icon: Icon, label, value, suffix = '' }: { icon: any; label: string; value: string | number; suffix?: string }) => (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}{suffix}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/painel')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">Analytics</h1>
              <p className="text-sm text-muted-foreground">{lpName || 'Carregando...'} • Últimos 30 dias</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data ? (
          <div className="text-center py-24">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum dado disponível</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard icon={Eye} label="Visualizações" value={data.totalViews} />
              <MetricCard icon={MousePointerClick} label="Cliques CTA" value={data.totalClicks} />
              <MetricCard icon={TrendingUp} label="CTR" value={data.ctr.toFixed(1)} suffix="%" />
              <MetricCard icon={Clock} label="Tempo médio" value={data.avgDwellTime} suffix="s" />
            </div>

            {/* Sessions Chart */}
            <Card className="p-6">
              <h3 className="font-semibold mb-6">Sessões por dia</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.sessionsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sessions" 
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Section Views */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-6">Seções mais visualizadas</h3>
                {data.sectionViews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhuma visualização registrada</p>
                ) : (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.sectionViews} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis 
                          type="category" 
                          dataKey="section" 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={12}
                          width={100}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-6">Distribuição de seções</h3>
                {data.sectionViews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhuma visualização registrada</p>
                ) : (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.sectionViews}
                          dataKey="views"
                          nameKey="section"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ section }) => section}
                          labelLine={false}
                        >
                          {data.sectionViews.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
