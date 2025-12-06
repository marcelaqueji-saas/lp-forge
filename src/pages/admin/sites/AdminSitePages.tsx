import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getSiteById, getSitePages, createSitePage, deleteSitePage, updateSitePage, Site, SitePage, SITE_SECTIONS } from '@/lib/siteApi';
import { getUserRoleForLP, LPRole } from '@/lib/lpContentApi';
import { 
  Loader2, ArrowLeft, Plus, FileText, Edit3, Trash2, 
  Globe, GlobeLock, ChevronRight, Shield
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

const AdminSitePages = () => {
  const { lpId } = useParams<{ lpId: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [pages, setPages] = useState<SitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<LPRole | null>(null);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteDialogPage, setDeleteDialogPage] = useState<SitePage | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }

      if (!lpId) return;

      const [siteData, pagesData, role] = await Promise.all([
        getSiteById(lpId),
        getSitePages(lpId),
        getUserRoleForLP(lpId),
      ]);

      if (!siteData) {
        navigate('/admin/sites');
        toast({ title: 'Site não encontrado', variant: 'destructive' });
        return;
      }

      setSite(siteData);
      setPages(pagesData);
      setUserRole(role);
      setLoading(false);
    };

    checkAuth();
  }, [lpId, navigate]);

  const canEdit = userRole === 'owner' || userRole === 'editor';

  const handleCreatePage = async () => {
    if (!lpId || !newPageName.trim() || !newPageSlug.trim()) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    const slugFormatted = newPageSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    setCreateLoading(true);
    const newPage = await createSitePage(lpId, newPageName, slugFormatted, ['hero_secundario', 'chamada_final', 'rodape']);
    setCreateLoading(false);

    if (newPage) {
      setPages([...pages, newPage]);
      setShowCreateDialog(false);
      setNewPageName('');
      setNewPageSlug('');
      toast({ title: 'Página criada com sucesso!' });
    } else {
      toast({ title: 'Erro ao criar página', variant: 'destructive' });
    }
  };

  const handleDeletePage = async () => {
    if (!deleteDialogPage) return;

    // Don't allow deleting Home page
    if (deleteDialogPage.slug === '') {
      toast({ title: 'Não é possível excluir a página Home', variant: 'destructive' });
      setDeleteDialogPage(null);
      return;
    }

    const success = await deleteSitePage(deleteDialogPage.id);
    if (success) {
      setPages(pages.filter(p => p.id !== deleteDialogPage.id));
      toast({ title: 'Página excluída' });
    } else {
      toast({ title: 'Erro ao excluir página', variant: 'destructive' });
    }
    setDeleteDialogPage(null);
  };

  const handleTogglePublish = async (page: SitePage) => {
    const success = await updateSitePage(page.id, { publicado: !page.publicado });
    if (success) {
      setPages(pages.map(p => p.id === page.id ? { ...p, publicado: !p.publicado } : p));
      toast({ title: page.publicado ? 'Página despublicada' : 'Página publicada!' });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Site não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/sites" className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-semibold">{site.nome}</h1>
              <p className="text-sm text-muted-foreground">Páginas do site</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {userRole && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm">
                <Shield className="w-4 h-4" />
                {userRole === 'owner' ? 'Proprietário' : userRole === 'editor' ? 'Editor' : 'Visualizador'}
              </div>
            )}
            {canEdit && (
              <button
                onClick={() => setShowCreateDialog(true)}
                className="btn-primary gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Página
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {pages.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Nenhuma página encontrada.</p>
              {canEdit && (
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="btn-primary gap-2 inline-flex"
                >
                  <Plus className="w-4 h-4" />
                  Criar primeira página
                </button>
              )}
            </div>
          ) : (
            pages.map((page, index) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{page.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        /{page.slug || '(home)'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      page.publicado 
                        ? 'bg-success/10 text-success' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {page.publicado ? <Globe className="w-3 h-3" /> : <GlobeLock className="w-3 h-3" />}
                      {page.publicado ? 'Publicada' : 'Rascunho'}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {page.section_order.length} seções
                    </span>

                    {canEdit && (
                      <>
                        <button
                          onClick={() => handleTogglePublish(page)}
                          className={`p-2 rounded-xl transition-colors ${
                            page.publicado 
                              ? 'hover:bg-warning/10 text-warning' 
                              : 'hover:bg-success/10 text-success'
                          }`}
                          title={page.publicado ? 'Despublicar' : 'Publicar'}
                        >
                          {page.publicado ? <GlobeLock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                        </button>
                        {page.slug !== '' && (
                          <button
                            onClick={() => setDeleteDialogPage(page)}
                            className="p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                            title="Excluir página"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}

                    <Link
                      to={`/admin/sites/${lpId}/pages/${page.id}`}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      {canEdit ? 'Editar' : 'Ver'}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </main>

      {/* Create page dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova página</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pageName">Nome da página</Label>
              <Input
                id="pageName"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="Sobre nós"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageSlug">Slug (URL)</Label>
              <Input
                id="pageSlug"
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
                placeholder="sobre-nos"
              />
              <p className="text-xs text-muted-foreground">
                A página será acessível em: /{newPageSlug || 'sobre-nos'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowCreateDialog(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreatePage}
              disabled={createLoading}
              className="btn-primary gap-2"
            >
              {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Criar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete page dialog */}
      <AlertDialog open={!!deleteDialogPage} onOpenChange={() => setDeleteDialogPage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir página?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O conteúdo da página será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePage} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSitePages;
