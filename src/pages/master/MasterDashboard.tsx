// src/pages/master/MasterDashboard.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  LayoutGrid,
  Settings,
  Activity,
  Shield,
  TrendingUp,
  Package,
  Image,
  LogOut,
  Globe,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const MasterDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLPs: 0,
    totalLeads: 0,
    activeToday: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [usersRes, lpsRes, leadsRes] = await Promise.all([
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('landing_pages').select('*', { count: 'exact', head: true }),
      supabase.from('lp_leads').select('*', { count: 'exact', head: true }),
    ]);

    setStats({
      totalUsers: usersRes.count || 0,
      totalLPs: lpsRes.count || 0,
      totalLeads: leadsRes.count || 0,
      activeToday: 0,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Logout realizado' });
    navigate('/auth/login');
  };

  const menuItems = [
    {
      icon: Users,
      label: 'Gestão de Usuários',
      href: '/master/users',
      description: 'Gerenciar usuários, roles e planos',
    },
    {
      icon: Package,
      label: 'Catálogo de Modelos',
      href: '/master/templates',
      description: 'Gerenciar templates de seções',
    },
    {
      icon: Image,
      label: 'Separadores',
      href: '/master/separators',
      description: 'Gerenciar separadores de seções',
    },
    {
      icon: Settings,
      label: 'Limites de Planos',
      href: '/master/plans',
      description: 'Configurar limites por plano',
    },
    {
      icon: LayoutGrid,
      label: 'Todas as LPs',
      href: '/master/lps',
      description: 'Ver todas as landing pages',
    },
    {
      icon: Globe,
      label: 'Sites (beta)',
      href: '/admin/sites',
      description: 'Gerenciar sites multi-página',
    },
    {
      icon: Activity,
      label: 'Logs de Auditoria',
      href: '/master/audit',
      description: 'Ver ações administrativas',
    },
    {
      icon: Shield,
      label: 'Homepage SaaS',
      href: '/master/homepage',
      description: 'Editar página inicial do SaaS',
    },
  ];

  return (
    <div className="app-shell">
      {/* Header em “dock” de vidro */}
      <header className="sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
          <div className="rounded-3xl bg-white/90 border border-slate-100/80 shadow-[0_14px_40px_rgba(15,23,42,0.12)] backdrop-blur-2xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.45),_transparent_60%)] blur-sm opacity-80" />
                <div className="relative w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-[0_10px_30px_rgba(15,23,42,0.55)]">
                  <Shield className="w-5 h-5 text-slate-50" />
                </div>
              </div>
              <div>
                <h1 className="font-semibold text-sm sm:text-base tracking-tight text-slate-900">
                  Painel Master
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Administração do saas-lp
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex text-slate-600 hover:text-slate-900"
                onClick={() => navigate('/painel')}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Meu painel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200 bg-white/80 backdrop-blur-xl hover:bg-white"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-8">
        {/* Faixa de boas-vindas / resumo em glass-card */}
        <section>
          <div className="glass-card p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
            
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">
                  Acesso completo
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                  Veja rapidamente quantos usuários, landing pages e leads o seu SaaS está gerando.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <div className="px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700">
                  {stats.totalLPs} LPs • {stats.totalUsers} usuários
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats em “vidro” padronizado */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.14em]">
                  Usuários
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-slate-700" />
                </div>
              </div>
              <div className="text-xl font-semibold text-slate-900">
                {stats.totalUsers}
              </div>
              <p className="text-[11px] text-slate-500">
                Contas cadastradas
              </p>
            </div>

            <div className="glass-card p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.14em]">
                  Landing Pages
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4 text-slate-700" />
                </div>
              </div>
              <div className="text-xl font-semibold text-slate-900">
                {stats.totalLPs}
              </div>
              <p className="text-[11px] text-slate-500">
                LPs ativas no sistema
              </p>
            </div>

            <div className="glass-card p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.14em]">
                  Leads
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-slate-700" />
                </div>
              </div>
              <div className="text-xl font-semibold text-slate-900">
                {stats.totalLeads}
              </div>
              <p className="text-[11px] text-slate-500">
                Leads gerados pelas LPs
              </p>
            </div>

            <div className="glass-card p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.14em]">
                  Hoje
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-slate-700" />
                </div>
              </div>
              <div className="text-xl font-semibold text-slate-900">
                {stats.activeToday}
              </div>
              <p className="text-[11px] text-slate-500">
                Acessos / eventos hoje
              </p>
            </div>
          </div>
        </section>

        {/* Menu de apps – tiles glass alinhados */}
        <section className="pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {menuItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <div className="glass-tile group flex flex-col justify-between min-h-[112px]">
                  {/* faixa de luz no topo */}
                  <div className="glass-tile-bar group-hover:scale-[1.03] transition-transform origin-center" />

                  <div className="relative flex items-center gap-3 md:gap-4 flex-1">
                    <div className="glass-tile-icon">
                      {/* Ícones em cinza escuro */}
                      <item.icon className="w-4 h-4 md:w-5 md:h-5 text-slate-700" />
                    </div>

                    <div className="flex-1">
                      <h3 className="glass-tile-title">
                        {item.label}
                      </h3>
                      <p className="glass-tile-subtitle">
                        {item.description}
                      </p>
                    </div>

                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default MasterDashboard;
