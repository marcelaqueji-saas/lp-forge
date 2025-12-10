// src/pages/client/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import {
  LayoutDashboard,
  Edit3,
  Settings,
  BarChart3,
  Users,
  Globe,
  LogOut,
  Loader2,
  ExternalLink,
  Eye,
  Zap,
  UserCircle,
  TrendingUp,
  Target,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { getUserFirstLP, hasCompletedOnboarding } from '@/lib/userApi';
import { LandingPage, getAllContent, getSettings } from '@/lib/lpContentApi';
import { useAuth } from '@/hooks/useAuth';
import { PlanLimitsBanner } from '@/components/client/PlanLimitsBanner';
import { DashboardChecklist } from '@/components/client/DashboardChecklist';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userLP, setUserLP] = useState<LandingPage | null>(null);
  const [userName, setUserName] = useState('');
  const [analytics, setAnalytics] = useState({ views: 0, leads: 0, conversion: 0 });
  const navigate = useNavigate();
  const { isAdminMaster, profile } = useAuth();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate('/auth/login');
      return;
    }

    if (!hasCompletedOnboarding()) {
      const lp = await getUserFirstLP();
      if (lp) {
        navigate(`/meu-site/${lp.id}`);
      } else {
        navigate('/onboarding');
      }
      return;
    }

    setUserName(session.user.user_metadata?.nome || session.user.email || '');

    const lp = await getUserFirstLP();
    setUserLP(lp);
    
    // Load basic analytics
    if (lp) {
      loadAnalytics(lp.id);
    }
    
    setLoading(false);
  };

  const loadAnalytics = async (lpId: string) => {
    try {
      const { data: events } = await supabase
        .from('lp_events')
        .select('event_type')
        .eq('lp_id', lpId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: leads } = await supabase
        .from('lp_leads')
        .select('id')
        .eq('lp_id', lpId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const views = events?.filter(e => e.event_type === 'view').length || 0;
      const leadsCount = leads?.length || 0;
      const conversion = views > 0 ? (leadsCount / views) * 100 : 0;

      setAnalytics({ views, leads: leadsCount, conversion });
    } catch (error) {
      console.error('[Dashboard] Error loading analytics:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Logout realizado' });
    navigate('/auth/login');
  };

  const handleEditSite = () => {
    if (userLP) {
      navigate(`/meu-site/${userLP.id}`);
    }
  };

  const handleViewPublic = () => {
    if (userLP) {
      window.open(`/lp/${userLP.slug}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Determine plan display
  const planLabel = isAdminMaster ? 'Master' : (profile?.plan === 'premium' ? 'Premium' : profile?.plan === 'pro' ? 'Pro' : 'Gratuito');

  const menuItems = [
    {
      icon: Edit3,
      title: 'Editar minha página',
      description: 'Personalize textos, imagens e layout',
      action: handleEditSite,
      primary: true,
    },
    {
      icon: Eye,
      title: 'Ver como visitante',
      description: 'Veja como sua página aparece para outros',
      action: handleViewPublic,
    },
    {
      icon: Settings,
      title: 'Configurações',
      description: 'Domínio, SEO e tracking',
      action: () => userLP && navigate(`/admin/lp/${userLP.id}/estilos`),
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Visualizações e métricas',
      action: () => userLP && navigate(`/admin/lp/${userLP.id}/analytics`),
    },
    {
      icon: Users,
      title: 'Leads',
      description: 'Contatos capturados',
      action: () => userLP && navigate(`/admin/lp/${userLP.id}/analytics`),
    },
    {
      icon: Globe,
      title: 'Domínio',
      description: 'Configure seu domínio próprio',
      action: () => userLP && navigate(`/admin/lp/${userLP.id}/dominio`),
    },
    {
      icon: UserCircle,
      title: 'Meu Perfil',
      description: 'Dados da conta e plano',
      action: () => navigate('/painel/perfil'),
    },
  ];

  if (isAdminMaster) {
    menuItems.push(
      {
        icon: Zap,
        title: 'Painel master do SaaS',
        description: 'Gerencie usuários, planos, templates e sites',
        action: () => navigate('/master'),
      },
      {
        icon: LayoutDashboard,
        title: 'Todas as Landing Pages',
        description: 'Acesse o painel completo de LPs do sistema',
        action: () => navigate('/master/lps'),
      }
    );
  }

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="border-b border-white/60 bg-white/70 backdrop-blur-2xl shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 shadow-[0_10px_30px_rgba(15,23,42,0.45)]">
              <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5 text-sky-50" />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm md:text-base tracking-tight">
                Meu Painel
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-xs md:text-sm text-slate-500 truncate">
                  Olá, {userName}!
                </p>
                {isAdminMaster && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary">
                    Master
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="shrink-0"
          >
            <LogOut className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Sair</span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        <PlanLimitsBanner />

        {/* Analytics Preview - últimos 7 dias */}
        {userLP && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Últimos 7 dias
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/admin/lp/${userLP.id}/analytics`)}
              >
                Ver detalhes
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{analytics.views}</div>
                <div className="text-xs text-muted-foreground">Visualizações</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.leads}</div>
                <div className="text-xs text-muted-foreground">Leads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{analytics.conversion.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Conversão</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Status card + Checklist */}
        {userLP && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Status card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 md:p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg md:text-xl font-semibold mb-1 truncate">
                    {userLP.nome}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          userLP.publicado ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                      />
                      {userLP.publicado ? 'Publicado' : 'Rascunho'}
                    </span>
                    {userLP.dominio && (
                      <span className="flex items-center gap-1 truncate">
                        <Globe className="w-3 h-3 shrink-0" />
                        <span className="truncate">{userLP.dominio}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewPublic}
                    className="flex-1 md:flex-none"
                  >
                    <ExternalLink className="w-4 h-4 md:mr-2" />
                    <span className="md:inline">Visualizar</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEditSite}
                    className="flex-1 md:flex-none"
                  >
                    <Edit3 className="w-4 h-4 md:mr-2" />
                    <span className="md:inline">Editar</span>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Checklist de publicação */}
            <DashboardChecklist lpId={userLP.id} />
          </div>
        )}

        {/* Menu grid – tiles alinhados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                type="button"
                onClick={item.action}
                className={`group glass-tile flex flex-col justify-between min-h-[112px] ${
                  item.primary ? 'glass-tile--primary' : ''
                }`}
              >
                {/* faixa de luz no topo */}
                <div className="glass-tile-bar group-hover:scale-[1.03] transition-transform origin-center" />

                <div className="relative flex items-center gap-3 md:gap-4 flex-1">
                  <div className="glass-tile-icon">
                    {/* Ícones em cinza escuro */}
                    <item.icon className="w-4 h-4 md:w-5 md:h-5 text-slate-700" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="glass-tile-title">
                      {item.title}
                    </h3>
                    <p className="glass-tile-subtitle">
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
