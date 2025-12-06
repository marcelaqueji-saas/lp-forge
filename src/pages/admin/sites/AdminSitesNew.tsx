import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Loader2, Layout, FileText } from 'lucide-react';
import { createSite, createSiteFromTemplate } from '@/lib/siteApi';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminSitesNew = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [template, setTemplate] = useState<'vazio' | 'institucional_moderno'>('institucional_moderno');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim() || !slug.trim()) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    const slugFormatted = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    setLoading(true);
    
    let site;
    if (template === 'institucional_moderno') {
      site = await createSiteFromTemplate(nome, slugFormatted, 'institucional_moderno');
    } else {
      site = await createSite(nome, slugFormatted);
    }

    setLoading(false);

    if (site) {
      toast({ title: 'Site criado com sucesso!' });
      navigate(`/admin/sites/${site.id}/pages`);
    } else {
      toast({ title: 'Erro ao criar site', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/admin/sites" className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold">Criar novo Site</h1>
            <p className="text-sm text-muted-foreground">Configure seu site multi-páginas</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Informações básicas</h2>
              
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do site</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Meu Site Institucional"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="meu-site"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  O site será acessível em: /lp/{slug || 'meu-site'}
                </p>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold text-lg">Escolha um template</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTemplate('institucional_moderno')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    template === 'institucional_moderno'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Layout className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Site Institucional Moderno</h3>
                      <p className="text-xs text-muted-foreground">Recomendado</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Inclui: Home, Recursos, Planos e Contato. Todas as seções pré-configuradas e editáveis.
                  </p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {['Home', 'Recursos', 'Planos', 'Contato'].map(page => (
                      <span key={page} className="px-2 py-0.5 rounded-full bg-muted text-xs">
                        {page}
                      </span>
                    ))}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplate('vazio')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    template === 'vazio'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Site em branco</h3>
                      <p className="text-xs text-muted-foreground">Avançado</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Começa apenas com página Home. Adicione páginas e seções manualmente.
                  </p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
                      Home
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Criar Site
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminSitesNew;
