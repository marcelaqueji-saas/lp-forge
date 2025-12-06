import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getLPById, getSettings, saveSettings, updateLPDomain, getUserRoleForLP, LandingPage, LPSettings, LPRole, SECTIONS_WITH_VARIANTS, SECTION_NAMES } from '@/lib/lpContentApi';
import { 
  GLOBAL_STYLE_TOKENS, 
  SECTION_STYLE_LABELS, 
  TOKEN_LABELS, 
  FONT_FAMILIES, 
  FONT_WEIGHTS 
} from '@/lib/styleTokens';
import { Loader2, ArrowLeft, Save, Palette, BarChart, Code, Globe, Search, FileCode, Layers, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { StyleColorPicker } from '@/components/admin/StyleColorPicker';
import { SectionStyleEditor } from '@/components/admin/SectionStyleEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminStyles = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [lp, setLp] = useState<LandingPage | null>(null);
  const [settings, setSettings] = useState<LPSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<LPRole | null>(null);
  const [domain, setDomain] = useState('');
  const [activeTab, setActiveTab] = useState<'global' | 'sections' | 'variantes' | 'tracking' | 'seo' | 'dominio' | 'css'>('global');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }

      if (!id) return;

      const [lpData, settingsData, role] = await Promise.all([
        getLPById(id),
        getSettings(id),
        getUserRoleForLP(id),
      ]);

      if (!role) {
        navigate('/admin');
        return;
      }

      setLp(lpData);
      setSettings(settingsData);
      setUserRole(role);
      setDomain(lpData?.dominio || '');
      setLoading(false);
    };

    checkAuth();
  }, [id, navigate]);

  const handleChange = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    if (!id || userRole === 'viewer') return;
    
    setSaving(true);
    const success = await saveSettings(id, settings);
    
    if (success) {
      toast({ title: 'Configurações salvas!' });
    } else {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
    
    setSaving(false);
  };

  const handleDomainSave = async () => {
    if (!id || userRole !== 'owner') return;
    
    setSaving(true);
    const success = await updateLPDomain(id, domain || null);
    
    if (success) {
      toast({ title: 'Domínio atualizado!' });
    } else {
      toast({ title: 'Erro ao atualizar domínio', variant: 'destructive' });
    }
    
    setSaving(false);
  };

  const canEdit = userRole === 'owner' || userRole === 'editor';
  const canEditTracking = userRole === 'owner';
  const canEditDomain = userRole === 'owner';
  const canEditCSS = userRole === 'owner';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Landing page não encontrada.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'global', label: 'Estilo Geral', icon: Palette },
    { id: 'sections', label: 'Por Seção', icon: Layers },
    { id: 'variantes', label: 'Variantes', icon: BarChart },
    { id: 'tracking', label: 'Tracking', icon: Code },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'dominio', label: 'Domínio', icon: Globe },
    { id: 'css', label: 'CSS', icon: FileCode },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <Link to="/painel" className="p-2 rounded-xl hover:bg-muted transition-colors shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm md:text-base truncate">Estilos e Configurações</h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {lp.nome} • {userRole === 'owner' ? 'Dono' : userRole === 'editor' ? 'Editor' : 'Visualizador'}
              </p>
            </div>
          </div>
          {canEdit && (
            <Button
              onClick={handleSave}
              disabled={saving}
              size={isMobile ? "sm" : "default"}
              className="shrink-0"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin md:mr-2" />
                  <span className="hidden md:inline">Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Salvar</span>
                </>
              )}
            </Button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card/30 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 md:px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 md:space-y-8"
        >
          {/* Global Styles */}
          {activeTab === 'global' && (
            <>
              {/* Colors */}
              <section className="glass-card p-4 md:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Cores Globais</h2>
                    <p className="text-sm text-muted-foreground">Cores base aplicadas em toda a página</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <StyleColorPicker
                    label="Cor primária"
                    value={settings.style_global_primary || ''}
                    defaultValue={GLOBAL_STYLE_TOKENS.style_global_primary}
                    onChange={(v) => handleChange('style_global_primary', v)}
                    disabled={!canEdit}
                  />
                  <StyleColorPicker
                    label="Cor secundária"
                    value={settings.style_global_secondary || ''}
                    defaultValue={GLOBAL_STYLE_TOKENS.style_global_secondary}
                    onChange={(v) => handleChange('style_global_secondary', v)}
                    disabled={!canEdit}
                  />
                  <StyleColorPicker
                    label="Cor de destaque"
                    value={settings.style_global_accent || ''}
                    defaultValue={GLOBAL_STYLE_TOKENS.style_global_accent}
                    onChange={(v) => handleChange('style_global_accent', v)}
                    disabled={!canEdit}
                  />
                  <StyleColorPicker
                    label="Fundo da página"
                    value={settings.style_global_background || ''}
                    defaultValue={GLOBAL_STYLE_TOKENS.style_global_background}
                    onChange={(v) => handleChange('style_global_background', v)}
                    disabled={!canEdit}
                  />
                  <StyleColorPicker
                    label="Fundo dos cards"
                    value={settings.style_global_surface || ''}
                    defaultValue={GLOBAL_STYLE_TOKENS.style_global_surface}
                    onChange={(v) => handleChange('style_global_surface', v)}
                    disabled={!canEdit}
                  />
                  <StyleColorPicker
                    label="Texto principal"
                    value={settings.style_global_text_primary || ''}
                    defaultValue={GLOBAL_STYLE_TOKENS.style_global_text_primary}
                    onChange={(v) => handleChange('style_global_text_primary', v)}
                    disabled={!canEdit}
                  />
                  <StyleColorPicker
                    label="Texto secundário"
                    value={settings.style_global_text_secondary || ''}
                    defaultValue={GLOBAL_STYLE_TOKENS.style_global_text_secondary}
                    onChange={(v) => handleChange('style_global_text_secondary', v)}
                    disabled={!canEdit}
                  />
                </div>
              </section>

              {/* Typography */}
              <section className="glass-card p-4 md:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <FileCode className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Tipografia</h2>
                    <p className="text-sm text-muted-foreground">Fontes e pesos do texto</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label>Família da fonte</Label>
                    <Select
                      value={settings.style_global_font_family || GLOBAL_STYLE_TOKENS.style_global_font_family}
                      onValueChange={(v) => handleChange('style_global_font_family', v)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_FAMILIES.map(font => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Peso dos títulos</Label>
                    <Select
                      value={settings.style_global_heading_weight || GLOBAL_STYLE_TOKENS.style_global_heading_weight}
                      onValueChange={(v) => handleChange('style_global_heading_weight', v)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_WEIGHTS.map(weight => (
                          <SelectItem key={weight.value} value={weight.value}>
                            {weight.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Peso do texto</Label>
                    <Select
                      value={settings.style_global_body_weight || GLOBAL_STYLE_TOKENS.style_global_body_weight}
                      onValueChange={(v) => handleChange('style_global_body_weight', v)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_WEIGHTS.map(weight => (
                          <SelectItem key={weight.value} value={weight.value}>
                            {weight.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              {/* Legacy colors for backwards compatibility */}
              <section className="glass-card p-4 md:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Palette className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Cores Legado</h2>
                    <p className="text-sm text-muted-foreground">Compatibilidade com configurações anteriores</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {[
                    { key: 'cor_primaria', label: 'Cor primária', default: '#3B82F6' },
                    { key: 'cor_secundaria', label: 'Cor secundária', default: '#8B5CF6' },
                    { key: 'cor_fundo', label: 'Cor de fundo', default: '#F5F5F7' },
                    { key: 'cor_texto', label: 'Cor do texto', default: '#1F2937' },
                  ].map(color => (
                    <div key={color.key} className="space-y-2">
                      <Label>{color.label}</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={(settings[color.key] as string) || color.default}
                          onChange={(e) => handleChange(color.key, e.target.value)}
                          disabled={!canEdit}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-lg cursor-pointer border-0"
                        />
                        <Input
                          type="text"
                          value={(settings[color.key] as string) || color.default}
                          onChange={(e) => handleChange(color.key, e.target.value)}
                          disabled={!canEdit}
                          placeholder={color.default}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Section Styles */}
          {activeTab === 'sections' && (
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Estilos por Seção</h2>
                  <p className="text-sm text-muted-foreground">Personalize cada seção individualmente</p>
                </div>
              </div>

              <div className="space-y-3">
                {Object.keys(SECTION_STYLE_LABELS).map(sectionKey => (
                  <SectionStyleEditor
                    key={sectionKey}
                    sectionKey={sectionKey}
                    settings={settings}
                    onChange={handleChange}
                    disabled={!canEdit}
                    lpId={id}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Variantes */}
          {activeTab === 'variantes' && (
            <section className="glass-card p-4 md:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <BarChart className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold">Variantes de Seções</h2>
                  <p className="text-sm text-muted-foreground">Escolha o layout de cada seção</p>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                {SECTIONS_WITH_VARIANTS.map(section => (
                  <div key={section} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 md:p-4 rounded-xl bg-muted/50">
                    <span className="font-medium text-sm md:text-base">{SECTION_NAMES[section]}</span>
                    <Select
                      value={(settings[`${section}_variante`] as string) || 'modelo_a'}
                      onValueChange={(v) => handleChange(`${section}_variante`, v)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modelo_a">Modelo A</SelectItem>
                        <SelectItem value="modelo_b">Modelo B</SelectItem>
                        <SelectItem value="modelo_c">Modelo C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tracking */}
          {activeTab === 'tracking' && (
            <section className="glass-card p-4 md:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Code className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="font-semibold">Rastreamento</h2>
                  <p className="text-sm text-muted-foreground">Configure Google Analytics e Meta Pixel</p>
                </div>
              </div>

              {!canEditTracking && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 text-yellow-700 text-sm">
                  Apenas o dono da LP pode editar as configurações de rastreamento.
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Google Analytics 4 (Measurement ID)</Label>
                  <Input
                    type="text"
                    value={(settings.ga4_id as string) || ''}
                    onChange={(e) => handleChange('ga4_id', e.target.value)}
                    disabled={!canEditTracking}
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-muted-foreground">
                    Encontre em: Google Analytics → Admin → Property Settings → Data Streams
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Meta Pixel ID</Label>
                  <Input
                    type="text"
                    value={(settings.meta_pixel_id as string) || ''}
                    onChange={(e) => handleChange('meta_pixel_id', e.target.value)}
                    disabled={!canEditTracking}
                    placeholder="1234567890"
                  />
                  <p className="text-xs text-muted-foreground">
                    Encontre em: Meta Events Manager → Data Sources → Seu Pixel
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* SEO */}
          {activeTab === 'seo' && (
            <section className="glass-card p-4 md:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">SEO</h2>
                  <p className="text-sm text-muted-foreground">Otimize sua página para mecanismos de busca</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Título da página</Label>
                  <Input
                    type="text"
                    value={(settings.meta_title as string) || ''}
                    onChange={(e) => handleChange('meta_title', e.target.value)}
                    disabled={!canEdit}
                    placeholder="Título da sua landing page"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {((settings.meta_title as string) || '').length}/60 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={(settings.meta_description as string) || ''}
                    onChange={(e) => handleChange('meta_description', e.target.value)}
                    disabled={!canEdit}
                    placeholder="Descrição da sua landing page para os resultados de busca"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {((settings.meta_description as string) || '').length}/160 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Imagem de compartilhamento (OG Image)</Label>
                  {id && (
                    <ImageUpload
                      lpId={id}
                      value={(settings.meta_image_url as string) || ''}
                      onChange={(url) => handleChange('meta_image_url', url)}
                      disabled={!canEdit}
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    Tamanho recomendado: 1200x630 pixels
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Domínio */}
          {activeTab === 'dominio' && (
            <section className="glass-card p-4 md:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="font-semibold">Domínio Personalizado</h2>
                  <p className="text-sm text-muted-foreground">Configure um domínio próprio para sua LP</p>
                </div>
              </div>

              {!canEditDomain && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 text-yellow-700 text-sm">
                  Apenas o dono da LP pode editar o domínio.
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Domínio</Label>
                  <Input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    disabled={!canEditDomain}
                    placeholder="seudominio.com.br"
                  />
                </div>

                <div className="p-4 rounded-xl bg-muted">
                  <h3 className="font-medium mb-2">Instruções de configuração</h3>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Acesse o painel DNS do seu provedor de domínio</li>
                    <li>Crie um registro CNAME apontando para: <code className="bg-card px-1 rounded">app.seusite.lovable.app</code></li>
                    <li>Aguarde a propagação DNS (pode levar até 48h)</li>
                    <li>Salve o domínio acima e aguarde a verificação</li>
                  </ol>
                </div>

                {canEditDomain && (
                  <Button onClick={handleDomainSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar domínio'
                    )}
                  </Button>
                )}
              </div>
            </section>
          )}

          {/* CSS */}
          {activeTab === 'css' && (
            <section className="glass-card p-4 md:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <FileCode className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold">CSS Personalizado</h2>
                  <p className="text-sm text-muted-foreground">Adicione estilos CSS customizados</p>
                </div>
              </div>

              {!canEditCSS && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 text-yellow-700 text-sm">
                  Apenas o dono da LP pode editar o CSS personalizado.
                </div>
              )}

              <div className="space-y-4">
                <Textarea
                  value={(settings.custom_css as string) || ''}
                  onChange={(e) => handleChange('custom_css', e.target.value)}
                  disabled={!canEditCSS}
                  placeholder={`/* Adicione seu CSS aqui */\n.minha-classe {\n  color: red;\n}`}
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  ⚠️ Use com cuidado. CSS incorreto pode quebrar o layout da página.
                </p>
              </div>
            </section>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminStyles;
