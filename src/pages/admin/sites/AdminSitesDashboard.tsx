import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getAllSitesWithRoles, updateSiteStatus, deleteSite, Site, isSaaSOwner } from '@/lib/siteApi';
import { LPRole } from '@/lib/lpContentApi';
import { 
  Loader2, Globe, GlobeLock, Plus, Trash2, LayoutDashboard, 
  ArrowLeft, FileText, Settings, BarChart3, Crown, Edit, EyeIcon, ExternalLink
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

const AdminSitesDashboard = () => {
  const [sites, setSites] = useState<(Site & { userRole: LPRole })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaasOwner, setIsSaasOwner] = useState(false);
  const [deleteDialogSite, setDeleteDialogSite] = useState<Site | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      const isOwner = await isSaaSOwner();
      setIsSaasOwner(isOwner);

      if (!isOwner) {
        navigate('/admin');
        toast({ title: 'Acesso negado', description: 'Você não tem permissão para acessar Sites.', variant: 'destructive' });
        return;
      }
      
      const data = await getAllSitesWithRoles();
      setSites(data);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleTogglePublish = async (site: Site & { userRole: LPRole }) => {
    if (site.userRole !== 'owner') {
      toast({ title: 'Apenas o dono pode publicar/despublicar', variant: 'destructive' });
      return;
    }

    const success = await updateSiteStatus(site.id, !site.publicado);
    if (success) {
      setSites(sites.map(s => s.id === site.id ? { ...s, publicado: !s.publicado } : s));
      toast({ title: site.publicado ? 'Site despublicado' : 'Site publicado!' });
    } else {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialogSite) return;
    
    const success = await deleteSite(deleteDialogSite.id);
    if (success) {
      setSites(sites.filter(s => s.id !== deleteDialogSite.id));
      toast({ title: 'Site excluído com sucesso' });
    } else {
      toast({ title: 'Erro ao excluir site', variant: 'destructive' });
    }
    setDeleteDialogSite(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">Sites</h1>
              <p className="text-sm text-muted-foreground">Gerencie seus sites multi-páginas</p>
            </div>
          </div>
          <Link to="/admin/sites/new" className="btn-primary gap-2">
            <Plus className="w-4 h-4" />
            Novo Site
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {sites.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Nenhum site encontrado.</p>
              <Link to="/admin/sites/new" className="btn-primary gap-2 inline-flex">
                <Plus className="w-4 h-4" />
                Criar primeiro Site
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sites.map((site) => {
                const RoleIcon = ROLE_ICONS[site.userRole];
                const canPublish = site.userRole === 'owner';
                const canDelete = site.userRole === 'owner';

                return (
                  <motion.div
                    key={site.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="glass-card-hover p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{site.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          {site.dominio || `/${site.slug}`}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          site.publicado 
                            ? 'bg-success/10 text-success' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {site.publicado ? <Globe className="w-3 h-3" /> : <GlobeLock className="w-3 h-3" />}
                          {site.publicado ? 'Publicado' : 'Rascunho'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary flex items-center gap-1">
                          <RoleIcon className="w-3 h-3" />
                          {ROLE_LABELS[site.userRole]}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <Link
                        to={`/admin/sites/${site.id}/pages`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                      >
                        <FileText className="w-5 h-5 text-primary" />
                        <span>Páginas</span>
                      </Link>
                      <Link
                        to={`/admin/sites/${site.id}/settings`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                      >
                        <Settings className="w-5 h-5 text-secondary-foreground" />
                        <span>Configurações</span>
                      </Link>
                      <Link
                        to={`/admin/sites/${site.id}/analytics`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                      >
                        <BarChart3 className="w-5 h-5 text-success" />
                        <span>Analytics</span>
                      </Link>
                      <Link
                        to={`/admin/sites/${site.id}/domain`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                      >
                        <Globe className="w-5 h-5 text-accent" />
                        <span>Domínio</span>
                      </Link>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-border">
                      {canPublish && (
                        <button
                          onClick={() => handleTogglePublish(site)}
                          className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-xl transition-colors text-sm ${
                            site.publicado 
                              ? 'hover:bg-warning/10 text-warning' 
                              : 'hover:bg-success/10 text-success'
                          }`}
                        >
                          {site.publicado ? <GlobeLock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                          {site.publicado ? 'Despublicar' : 'Publicar'}
                        </button>
                      )}
                      {site.publicado && site.dominio && (
                        <a
                          href={`https://${site.dominio}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 p-2 rounded-xl hover:bg-muted transition-colors text-sm"
                          title="Abrir site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeleteDialogSite(site)}
                          className="flex items-center justify-center gap-2 p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-sm"
                          title="Excluir site"
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

      <AlertDialog open={!!deleteDialogSite} onOpenChange={() => setDeleteDialogSite(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir site?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as páginas, conteúdos, leads e configurações serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSitesDashboard;
