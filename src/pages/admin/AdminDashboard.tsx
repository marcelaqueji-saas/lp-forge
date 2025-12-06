import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getAllLPsWithRoles, LandingPage, LPRole, updateLPStatus } from '@/lib/lpContentApi';
import { isSaaSOwner } from '@/lib/siteApi';
import { Loader2, LayoutDashboard, Palette, BarChart3, LogOut, ExternalLink, Layers, Plus, Copy, Trash2, Eye, Globe, GlobeLock, Users, Crown, Edit, EyeIcon, PanelLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DuplicateLPDialog } from '@/components/admin/DuplicateLPDialog';
import { CreateLPDialog } from '@/components/admin/CreateLPDialog';
import { DeleteLPDialog } from '@/components/admin/DeleteLPDialog';

const ROLE_LABELS: Record<LPRole, string> = {
  owner: 'Dono',
  editor: 'Editor',
  viewer: 'Visualizador',
};

const ROLE_ICONS: Record<LPRole, typeof Crown> = {
  owner: Crown,
  editor: Edit,
  viewer: EyeIcon,
};

const AdminDashboard = () => {
  const [lps, setLps] = useState<(LandingPage & { userRole: LPRole })[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [showSitesMenu, setShowSitesMenu] = useState(false);
  const navigate = useNavigate();

  // Dialog states
  const [duplicateDialogLP, setDuplicateDialogLP] = useState<LandingPage | null>(null);
  const [deleteDialogLP, setDeleteDialogLP] = useState<LandingPage | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      setUser(session.user);
      
      const [data, isOwner] = await Promise.all([
        getAllLPsWithRoles(),
        isSaaSOwner(),
      ]);
      setLps(data.filter(lp => !(lp as any).is_site));
      setShowSitesMenu(isOwner);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Logout realizado' });
    navigate('/admin/login');
  };

  const handleLPCreated = (newLP: LandingPage) => {
    setLps([{ ...newLP, userRole: 'owner' }, ...lps]);
  };

  const handleLPDuplicated = (newLP: LandingPage) => {
    setLps([{ ...newLP, userRole: 'owner' }, ...lps]);
  };

  const handleLPDeleted = (deletedId: string) => {
    setLps(lps.filter(lp => lp.id !== deletedId));
  };

  const handleTogglePublish = async (lp: LandingPage & { userRole: LPRole }) => {
    if (lp.userRole !== 'owner') {
      toast({ title: 'Apenas o dono pode publicar/despublicar', variant: 'destructive' });
      return;
    }

    const success = await updateLPStatus(lp.id, !lp.publicado);
    if (success) {
      setLps(lps.map(l => l.id === lp.id ? { ...l, publicado: !l.publicado } : l));
      toast({ title: lp.publicado ? 'LP despublicada' : 'LP publicada!' });
    } else {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    }
  };

  // Check if user can create new LPs (must be owner of at least one or have none)
  const canCreate = lps.length === 0 || lps.some(lp => lp.userRole === 'owner');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">Painel Admin</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {showSitesMenu && (
              <Link to="/admin/sites" className="btn-secondary gap-2 text-sm">
                <PanelLeft className="w-4 h-4" />
                Sites
              </Link>
            )}
            <a href="/" target="_blank" className="btn-secondary gap-2 text-sm">
              <ExternalLink className="w-4 h-4" />
              Ver site
            </a>
            <button onClick={handleLogout} className="btn-secondary gap-2 text-sm">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Suas Landing Pages</h2>
            {canCreate && (
              <button
                onClick={() => setShowCreateDialog(true)}
                className="btn-primary gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova LP
              </button>
            )}
          </div>

          {lps.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground mb-4">Nenhuma landing page encontrada.</p>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="btn-primary gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar primeira LP
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lps.map((lp) => {
                const RoleIcon = ROLE_ICONS[lp.userRole];
                const canPublish = lp.userRole === 'owner';
                const canDelete = lp.userRole === 'owner' && lp.slug !== 'default';
                const canDuplicate = lp.userRole === 'owner';

                return (
                  <motion.div
                    key={lp.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="glass-card-hover p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{lp.nome}</h3>
                        <p className="text-sm text-muted-foreground">/{lp.slug}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          lp.publicado 
                            ? 'bg-success/10 text-success' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {lp.publicado ? <Globe className="w-3 h-3" /> : <GlobeLock className="w-3 h-3" />}
                          {lp.publicado ? 'Publicado' : 'Rascunho'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary flex items-center gap-1">
                          <RoleIcon className="w-3 h-3" />
                          {ROLE_LABELS[lp.userRole]}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <Link
                        to={`/admin/lp/${lp.id}/sections`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                      >
                        <Layers className="w-5 h-5 text-primary" />
                        <span>{lp.userRole === 'viewer' ? 'Ver seções' : 'Editar seções'}</span>
                      </Link>
                      <Link
                        to={`/admin/lp/${lp.id}/preview`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                      >
                        <Eye className="w-5 h-5 text-secondary-foreground" />
                        <span>Preview {canPublish && '/ Publicar'}</span>
                      </Link>
                      <Link
                        to={`/admin/lp/${lp.id}/estilos`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                      >
                        <Palette className="w-5 h-5 text-accent" />
                        <span>{lp.userRole === 'viewer' ? 'Ver estilos' : 'Estilos e config'}</span>
                      </Link>
                      <Link
                        to={`/admin/lp/${lp.id}/analytics`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                      >
                        <BarChart3 className="w-5 h-5 text-success" />
                        <span>Analytics / Leads</span>
                      </Link>
                      {lp.userRole === 'owner' && (
                        <Link
                          to={`/admin/lp/${lp.id}/usuarios`}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                        >
                          <Users className="w-5 h-5 text-warning" />
                          <span>Gerenciar usuários</span>
                        </Link>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-4 border-t border-border">
                      {canPublish && (
                        <button
                          onClick={() => handleTogglePublish(lp)}
                          className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-xl transition-colors text-sm ${
                            lp.publicado 
                              ? 'hover:bg-warning/10 text-warning' 
                              : 'hover:bg-success/10 text-success'
                          }`}
                        >
                          {lp.publicado ? <GlobeLock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                          {lp.publicado ? 'Despublicar' : 'Publicar'}
                        </button>
                      )}
                      {canDuplicate && (
                        <button
                          onClick={() => setDuplicateDialogLP(lp)}
                          className="flex items-center justify-center gap-2 p-2 rounded-xl hover:bg-muted transition-colors text-sm"
                          title="Duplicar LP"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeleteDialogLP(lp)}
                          className="flex items-center justify-center gap-2 p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-sm"
                          title="Excluir LP"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>

      {/* Dialogs */}
      <CreateLPDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreated={handleLPCreated}
      />

      {duplicateDialogLP && (
        <DuplicateLPDialog
          sourceLP={duplicateDialogLP}
          isOpen={!!duplicateDialogLP}
          onClose={() => setDuplicateDialogLP(null)}
          onDuplicated={handleLPDuplicated}
        />
      )}

      {deleteDialogLP && (
        <DeleteLPDialog
          lp={deleteDialogLP}
          isOpen={!!deleteDialogLP}
          onClose={() => setDeleteDialogLP(null)}
          onDeleted={() => handleLPDeleted(deleteDialogLP.id)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
