import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, Reorder } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getSiteById, getSitePage, updateSitePage, Site, SitePage, SITE_SECTIONS } from '@/lib/siteApi';
import { getUserRoleForLP, LPRole, getSectionContent, saveSectionContent, getSettings, saveSettings, LPContent, LPSettings } from '@/lib/lpContentApi';
import { 
  Loader2, ArrowLeft, Save, GripVertical, LayoutTemplate, 
  Plus, Trash2, Shield, Eye, EyeOff, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { trackEvent } from '@/lib/tracking';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

const usePremiumGate = (plan?: string) => {
  const requirePro = (feature: string) => {
    if (plan && plan !== 'free') return true;

    try {
      trackEvent({ event_type: 'premium_gate', metadata: { feature, plan: plan || 'free' } as any });
    } catch (err) {
      console.warn('[premium_gate] tracking failed', err);
    }

    toast({
      title: 'Quer sua página vendendo mais?',
      description: 'Desbloqueie ordenação livre para performar como um profissional.',
    });

    return false;
  };

  return { requirePro };
};

const AdminSitePageEditor = () => {
  const { lpId, pageId } = useParams<{ lpId: string; pageId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { requirePro } = usePremiumGate(profile?.plan);
  const [site, setSite] = useState<Site | null>(null);
  const [page, setPage] = useState<SitePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<LPRole | null>(null);
  const [settings, setSettings] = useState<LPSettings>({});

  // Section management
  const [activeSections, setActiveSections] = useState<string[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [sectionContents, setSectionContents] = useState<Record<string, LPContent>>({});
  const [editingContent, setEditingContent] = useState<Record<string, LPContent>>({});
  const [gatedButton, setGatedButton] = useState<{ index: number; dir: 'up' | 'down' } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }

      if (!lpId || !pageId) return;

      const [siteData, pageData, role, settingsData] = await Promise.all([
        getSiteById(lpId),
        getSitePage(pageId),
        getUserRoleForLP(lpId),
        getSettings(lpId),
      ]);

      if (!siteData || !pageData) {
        navigate(`/admin/sites/${lpId}/pages`);
        toast({ title: 'Página não encontrada', variant: 'destructive' });
        return;
      }

      setSite(siteData);
      setPage(pageData);
      setUserRole(role);
      setSettings(settingsData);
      setActiveSections(pageData.section_order || []);

      // Load content for each section
      const contents: Record<string, LPContent> = {};
      for (const section of pageData.section_order || []) {
        contents[section] = await getSectionContent(lpId, section);
      }
      setSectionContents(contents);
      setEditingContent(contents);

      setLoading(false);
    };

    checkAuth();
  }, [lpId, pageId, navigate]);

  const canEdit = userRole === 'owner' || userRole === 'editor';

  const handleReorder = (newOrder: string[]) => {
    if (!requirePro('ordenar_secao')) {
      setGatedButton({ index: -1, dir: 'up' });
      return;
    }
    setActiveSections(newOrder);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!requirePro('ordenar_secao')) {
      setGatedButton({ index, dir: direction });
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeSections.length) return;

    const newOrder = [...activeSections];
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setActiveSections(newOrder);
  };

  const handleAddSection = (sectionKey: string) => {
    if (!activeSections.includes(sectionKey)) {
      setActiveSections([...activeSections, sectionKey]);
    }
  };

  const handleRemoveSection = (sectionKey: string) => {
    setActiveSections(activeSections.filter(s => s !== sectionKey));
  };

  const handleContentChange = (section: string, key: string, value: string) => {
    setEditingContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      }
    }));
  };

  const handleSave = async () => {
    if (!pageId || !lpId) return;

    setSaving(true);

    // Save section order
    const orderSuccess = await updateSitePage(pageId, { section_order: activeSections });

    // Save content for each section
    for (const section of activeSections) {
      if (editingContent[section]) {
        await saveSectionContent(lpId, section, editingContent[section]);
      }
    }

    setSaving(false);

    if (orderSuccess) {
      toast({ title: 'Página salva com sucesso!' });
    } else {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const handleVariantChange = async (section: string, variante: string) => {
    if (!lpId) return;
    const key = `${section}_variante`;
    const newSettings = { ...settings, [key]: variante };
    setSettings(newSettings);
    await saveSettings(lpId, { [key]: variante });
    toast({ title: 'Variante atualizada!' });
  };

  const availableSections = Object.keys(SITE_SECTIONS).filter(s => !activeSections.includes(s));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!site || !page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Página não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/admin/sites/${lpId}/pages`} className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-semibold">{page.nome}</h1>
              <p className="text-sm text-muted-foreground">/{page.slug || '(home)'}</p>
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
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main editor */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-semibold text-lg mb-4">Seções da página</h2>
              
              {activeSections.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-muted-foreground">Nenhuma seção adicionada.</p>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={activeSections}
                  onReorder={handleReorder}
                  className="space-y-3"
                >
                  {activeSections.map((sectionKey, index) => {
                    const sectionName = SITE_SECTIONS[sectionKey] || sectionKey;
                    const isExpanded = expandedSection === sectionKey;
                    const currentVariant = settings[`${sectionKey}_variante`] || 'modelo_a';
                    const hasVariants = ['hero', 'hero_secundario', 'beneficios', 'provas_sociais', 'planos', 'chamada_final'].includes(sectionKey);

                    return (
                      <Reorder.Item
                        key={sectionKey}
                        value={sectionKey}
                        className="glass-card overflow-hidden"
                        whileDrag={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                      >
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {canEdit && (
                              <div className="flex items-center gap-2">
                                <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded transition-colors">
                                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col gap-1">
                                  {(['up', 'down'] as const).map((dir) => {
                                    const disabled =
                                      dir === 'up'
                                        ? index === 0
                                        : index === activeSections.length - 1;
                                    const isGated =
                                      gatedButton &&
                                      gatedButton.index === index &&
                                      gatedButton.dir === dir;

                                    return (
                                      <motion.button
                                        key={`${dir}-${sectionKey}`}
                                        type="button"
                                        className={cn(
                                          'h-6 w-6 inline-flex items-center justify-center rounded-md border bg-card relative',
                                          disabled && 'opacity-50 cursor-not-allowed'
                                        )}
                                        disabled={disabled}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          moveSection(index, dir);
                                        }}
                                        animate={
                                          isGated
                                            ? { x: [-6, 6, -4, 4, 0], opacity: [1, 0.6, 1] }
                                            : { x: 0, opacity: 1 }
                                        }
                                        transition={{ duration: 0.2 }}
                                        onAnimationComplete={() => setGatedButton(null)}
                                      >
                                        {dir === 'up' ? (
                                          <ChevronUp className="w-4 h-4" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4" />
                                        )}
                                        {isGated && (
                                          <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute inset-0 flex items-center justify-center"
                                          >
                                            <Lock className="w-3 h-3 text-primary" />
                                          </motion.span>
                                        )}
                                      </motion.button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-medium">{sectionName}</h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {hasVariants && canEdit && (
                              <select
                                value={currentVariant}
                                onChange={(e) => handleVariantChange(sectionKey, e.target.value)}
                                className="px-2 py-1 rounded-lg bg-muted border border-border text-xs"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="modelo_a">A</option>
                                <option value="modelo_b">B</option>
                                <option value="modelo_c">C</option>
                              </select>
                            )}
                            <button
                              onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
                              className="p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            {canEdit && (
                              <button
                                onClick={() => handleRemoveSection(sectionKey)}
                                className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expanded content editor */}
                        {isExpanded && (
                          <div className="border-t border-border p-4 bg-muted/30">
                            <SectionContentEditor
                              section={sectionKey}
                              content={editingContent[sectionKey] || {}}
                              onChange={(key, value) => handleContentChange(sectionKey, key, value)}
                              canEdit={canEdit}
                            />
                          </div>
                        )}
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              )}
            </motion.div>
          </div>

          {/* Sidebar - Available sections */}
          <div className="space-y-4">
            <div className="glass-card p-4 sticky top-24">
              <h3 className="font-semibold mb-4">Adicionar seção</h3>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {availableSections.map(sectionKey => (
                  <button
                    key={sectionKey}
                    onClick={() => handleAddSection(sectionKey)}
                    disabled={!canEdit}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4 text-primary" />
                    <span className="text-sm">{SITE_SECTIONS[sectionKey]}</span>
                  </button>
                ))}
                {availableSections.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Todas as seções já foram adicionadas
                  </p>
                )}
              </div>
            </div>

            {/* Preview link */}
            <div className="glass-card p-4">
              <h3 className="font-semibold mb-2">Preview</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Visualize como a página ficará
              </p>
              <a
                href={site.dominio ? `https://${site.dominio}/${page.slug}` : `/lp/${site.slug}/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Abrir preview
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Section content editor component
const SectionContentEditor = ({ 
  section, 
  content, 
  onChange, 
  canEdit 
}: { 
  section: string; 
  content: LPContent; 
  onChange: (key: string, value: string) => void;
  canEdit: boolean;
}) => {
  const SECTION_FIELDS: Record<string, { key: string; label: string; type: 'text' | 'textarea' | 'json' }[]> = {
    hero: [
      { key: 'badge', label: 'Badge', type: 'text' },
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'destaque', label: 'Destaque', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
      { key: 'texto_botao_primario', label: 'Texto botão primário', type: 'text' },
      { key: 'url_botao_primario', label: 'URL botão primário', type: 'text' },
      { key: 'texto_botao_secundario', label: 'Texto botão secundário', type: 'text' },
      { key: 'url_botao_secundario', label: 'URL botão secundário', type: 'text' },
    ],
    hero_secundario: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    ],
    como_funciona: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'text' },
      { key: 'passos_json', label: 'Passos (JSON)', type: 'json' },
    ],
    para_quem_e: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'text' },
      { key: 'perfis_json', label: 'Perfis (JSON)', type: 'json' },
    ],
    beneficios: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'text' },
      { key: 'beneficios_json', label: 'Benefícios (JSON)', type: 'json' },
    ],
    provas_sociais: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'depoimentos_json', label: 'Depoimentos (JSON)', type: 'json' },
    ],
    planos: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'text' },
      { key: 'planos_json', label: 'Planos (JSON)', type: 'json' },
    ],
    faq: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'perguntas_json', label: 'Perguntas (JSON)', type: 'json' },
    ],
    chamada_final: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
      { key: 'texto_botao', label: 'Texto do botão', type: 'text' },
      { key: 'url_botao', label: 'URL do botão', type: 'text' },
    ],
    form_contato: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    ],
    cta_whatsapp: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'numero', label: 'Número do WhatsApp', type: 'text' },
      { key: 'mensagem', label: 'Mensagem padrão', type: 'textarea' },
    ],
    garantia: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'descricao', label: 'Descrição', type: 'textarea' },
    ],
    rodape: [
      { key: 'copyright', label: 'Copyright', type: 'text' },
      { key: 'links_json', label: 'Links (JSON)', type: 'json' },
    ],
  };

  const fields = SECTION_FIELDS[section] || [];

  return (
    <div className="space-y-4">
      {fields.map(field => (
        <div key={field.key} className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">
            {field.label}
          </label>
          {field.type === 'textarea' || field.type === 'json' ? (
            <textarea
              value={content[field.key] || ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              disabled={!canEdit}
              rows={field.type === 'json' ? 6 : 3}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50 text-sm font-mono"
              placeholder={field.type === 'json' ? '[{"key": "value"}]' : ''}
            />
          ) : (
            <input
              type="text"
              value={content[field.key] || ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50 text-sm"
            />
          )}
        </div>
      ))}
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Esta seção não possui campos editáveis configurados
        </p>
      )}
    </div>
  );
};

export default AdminSitePageEditor;
