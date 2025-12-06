import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getSiteById, Site } from '@/lib/siteApi';
import { getUserRoleForLP, LPRole, getSettings, saveSettings, LPSettings } from '@/lib/lpContentApi';
import { Loader2, ArrowLeft, Save, Settings, Shield, Palette, Search, Code } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminSiteSettings = () => {
  const { lpId } = useParams<{ lpId: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [settings, setSettings] = useState<LPSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<LPRole | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }

      if (!lpId) return;

      const [siteData, settingsData, role] = await Promise.all([
        getSiteById(lpId),
        getSettings(lpId),
        getUserRoleForLP(lpId),
      ]);

      if (!siteData) {
        navigate('/admin/sites');
        toast({ title: 'Site não encontrado', variant: 'destructive' });
        return;
      }

      setSite(siteData);
      setSettings(settingsData);
      setUserRole(role);
      setLoading(false);
    };

    checkAuth();
  }, [lpId, navigate]);

  const canEdit = userRole === 'owner' || userRole === 'editor';
  const isOwner = userRole === 'owner';

  const handleSave = async () => {
    if (!lpId) return;
    setSaving(true);
    const success = await saveSettings(lpId, settings);
    setSaving(false);

    if (success) {
      toast({ title: 'Configurações salvas!' });
    } else {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">{site.nome}</h1>
              <p className="text-sm text-muted-foreground">Configurações</p>
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
                onClick={handleSave}
                disabled={saving}
                className="btn-primary gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
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
        >
          <Tabs defaultValue="colors" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="colors" className="gap-2">
                <Palette className="w-4 h-4" />
                Cores
              </TabsTrigger>
              <TabsTrigger value="seo" className="gap-2">
                <Search className="w-4 h-4" />
                SEO
              </TabsTrigger>
              <TabsTrigger value="tracking" className="gap-2">
                <Code className="w-4 h-4" />
                Tracking
              </TabsTrigger>
              <TabsTrigger value="css" className="gap-2">
                <Code className="w-4 h-4" />
                CSS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-4">
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-semibold">Paleta de cores</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cor primária</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.cor_primaria || '#6366f1'}
                        onChange={(e) => handleChange('cor_primaria', e.target.value)}
                        disabled={!canEdit}
                        className="w-12 h-10 rounded-lg cursor-pointer"
                      />
                      <Input
                        value={settings.cor_primaria || '#6366f1'}
                        onChange={(e) => handleChange('cor_primaria', e.target.value)}
                        disabled={!canEdit}
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor secundária</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.cor_secundaria || '#8b5cf6'}
                        onChange={(e) => handleChange('cor_secundaria', e.target.value)}
                        disabled={!canEdit}
                        className="w-12 h-10 rounded-lg cursor-pointer"
                      />
                      <Input
                        value={settings.cor_secundaria || '#8b5cf6'}
                        onChange={(e) => handleChange('cor_secundaria', e.target.value)}
                        disabled={!canEdit}
                        placeholder="#8b5cf6"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor de fundo</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.cor_fundo || '#f5f5f7'}
                        onChange={(e) => handleChange('cor_fundo', e.target.value)}
                        disabled={!canEdit}
                        className="w-12 h-10 rounded-lg cursor-pointer"
                      />
                      <Input
                        value={settings.cor_fundo || '#f5f5f7'}
                        onChange={(e) => handleChange('cor_fundo', e.target.value)}
                        disabled={!canEdit}
                        placeholder="#f5f5f7"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor do texto</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.cor_texto || '#1f2937'}
                        onChange={(e) => handleChange('cor_texto', e.target.value)}
                        disabled={!canEdit}
                        className="w-12 h-10 rounded-lg cursor-pointer"
                      />
                      <Input
                        value={settings.cor_texto || '#1f2937'}
                        onChange={(e) => handleChange('cor_texto', e.target.value)}
                        disabled={!canEdit}
                        placeholder="#1f2937"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-semibold">Meta tags SEO</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título (meta title)</Label>
                    <Input
                      value={settings.meta_title || ''}
                      onChange={(e) => handleChange('meta_title', e.target.value)}
                      disabled={!canEdit}
                      placeholder="Título do site para SEO"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground">
                      {(settings.meta_title || '').length}/60 caracteres
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição (meta description)</Label>
                    <textarea
                      value={settings.meta_description || ''}
                      onChange={(e) => handleChange('meta_description', e.target.value)}
                      disabled={!canEdit}
                      placeholder="Descrição do site para mecanismos de busca"
                      maxLength={160}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
                    />
                    <p className="text-xs text-muted-foreground">
                      {(settings.meta_description || '').length}/160 caracteres
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Imagem OG (URL)</Label>
                    <Input
                      value={settings.meta_image_url || ''}
                      onChange={(e) => handleChange('meta_image_url', e.target.value)}
                      disabled={!canEdit}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="space-y-4">
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-semibold">Códigos de rastreamento</h3>
                {!isOwner && (
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    Apenas o proprietário pode editar códigos de rastreamento.
                  </p>
                )}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Google Analytics 4 (Measurement ID)</Label>
                    <Input
                      value={settings.ga4_id || ''}
                      onChange={(e) => handleChange('ga4_id', e.target.value)}
                      disabled={!isOwner}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Meta Pixel ID</Label>
                    <Input
                      value={settings.meta_pixel_id || ''}
                      onChange={(e) => handleChange('meta_pixel_id', e.target.value)}
                      disabled={!isOwner}
                      placeholder="1234567890123456"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="css" className="space-y-4">
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-semibold">CSS personalizado</h3>
                {!isOwner && (
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    Apenas o proprietário pode editar CSS personalizado.
                  </p>
                )}
                <div className="space-y-2">
                  <Label>CSS avançado</Label>
                  <textarea
                    value={settings.custom_css || ''}
                    onChange={(e) => handleChange('custom_css', e.target.value)}
                    disabled={!isOwner}
                    placeholder=".my-class { color: red; }"
                    rows={10}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50 font-mono text-sm"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminSiteSettings;
