import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getLPById, getSectionContent, saveSectionContent, getSettings, getUserRoleForLP, SECTION_NAMES, LandingPage, LPContent, LPSettings, LPRole } from '@/lib/lpContentApi';
import { Loader2, ArrowLeft, Save, Eye, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/admin/ImageUpload';

// Import section components for preview
import { Hero } from '@/components/sections/Hero';
import { ComoFunciona } from '@/components/sections/ComoFunciona';
import { ParaQuemE } from '@/components/sections/ParaQuemE';
import { Beneficios } from '@/components/sections/Beneficios';
import { ProvasSociais } from '@/components/sections/ProvasSociais';
import { Planos } from '@/components/sections/Planos';
import { FAQ } from '@/components/sections/FAQ';
import { ChamadaFinal } from '@/components/sections/ChamadaFinal';
import { Rodape } from '@/components/sections/Rodape';

// Section field definitions
const SECTION_FIELDS: Record<string, { key: string; label: string; type: 'text' | 'textarea' | 'json' | 'url' | 'image' }[]> = {
  hero: [
    { key: 'badge', label: 'Badge', type: 'text' },
    { key: 'titulo', label: 'Título', type: 'text' },
    { key: 'destaque', label: 'Destaque (colorido)', type: 'text' },
    { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    { key: 'texto_botao_primario', label: 'Texto botão primário', type: 'text' },
    { key: 'url_botao_primario', label: 'URL botão primário', type: 'url' },
    { key: 'texto_botao_secundario', label: 'Texto botão secundário', type: 'text' },
    { key: 'url_botao_secundario', label: 'URL botão secundário', type: 'url' },
    { key: 'imagem_principal', label: 'Imagem principal', type: 'image' },
  ],
  como_funciona: [
    { key: 'titulo', label: 'Título', type: 'text' },
    { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    { key: 'passos_json', label: 'Passos (JSON: [{titulo, descricao, icone}])', type: 'json' },
  ],
  para_quem_e: [
    { key: 'titulo', label: 'Título', type: 'text' },
    { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    { key: 'perfis_json', label: 'Perfis (JSON: [{titulo, descricao, icone}])', type: 'json' },
  ],
  beneficios: [
    { key: 'titulo', label: 'Título', type: 'text' },
    { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    { key: 'beneficios_json', label: 'Benefícios (JSON: [{titulo, descricao, icone}])', type: 'json' },
  ],
  provas_sociais: [
    { key: 'titulo', label: 'Título', type: 'text' },
    { key: 'depoimentos_json', label: 'Depoimentos (JSON: [{nome, cargo, texto, foto?}])', type: 'json' },
  ],
  planos: [
    { key: 'titulo', label: 'Título', type: 'text' },
    { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    { key: 'planos_json', label: 'Planos (JSON: [{nome, preco, descricao, destaque, itens_json}])', type: 'json' },
  ],
  faq: [
    { key: 'titulo', label: 'Título', type: 'text' },
    { key: 'perguntas_json', label: 'Perguntas (JSON: [{pergunta, resposta}])', type: 'json' },
  ],
  chamada_final: [
    { key: 'titulo', label: 'Título', type: 'text' },
    { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    { key: 'texto_botao', label: 'Texto do botão', type: 'text' },
    { key: 'url_botao', label: 'URL do botão', type: 'url' },
  ],
  rodape: [
    { key: 'copyright', label: 'Copyright', type: 'text' },
    { key: 'links_json', label: 'Links (JSON: [{label, url}])', type: 'json' },
  ],
};

const SECTION_COMPONENTS: Record<string, React.ComponentType<{ content?: LPContent; previewOverride?: LPContent; variante?: 'modelo_a' | 'modelo_b' }>> = {
  hero: Hero,
  como_funciona: ComoFunciona,
  para_quem_e: ParaQuemE,
  beneficios: Beneficios,
  provas_sociais: ProvasSociais,
  planos: Planos,
  faq: FAQ,
  chamada_final: ChamadaFinal,
  rodape: Rodape as React.ComponentType<{ content?: LPContent; previewOverride?: LPContent; variante?: 'modelo_a' | 'modelo_b' }>,
};

const AdminSectionEditor = () => {
  const { id, section } = useParams<{ id: string; section: string }>();
  const navigate = useNavigate();
  const [lp, setLp] = useState<LandingPage | null>(null);
  const [content, setContent] = useState<LPContent>({});
  const [formData, setFormData] = useState<LPContent>({});
  const [settings, setSettings] = useState<LPSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [userRole, setUserRole] = useState<LPRole | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }

      if (!id || !section) return;

      const [lpData, contentData, settingsData, role] = await Promise.all([
        getLPById(id),
        getSectionContent(id, section),
        getSettings(id),
        getUserRoleForLP(id),
      ]);

      if (!role) {
        navigate('/admin');
        return;
      }

      setLp(lpData);
      setContent(contentData);
      setFormData(contentData);
      setSettings(settingsData);
      setUserRole(role);
      setLoading(false);
    };

    checkAuth();
  }, [id, section, navigate]);

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSave = async () => {
    if (!id || !section || userRole === 'viewer') return;
    
    setSaving(true);
    const success = await saveSectionContent(id, section, formData);
    
    if (success) {
      setContent(formData);
      toast({ title: 'Conteúdo salvo com sucesso!' });
    } else {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
    
    setSaving(false);
  };

  const canEdit = userRole === 'owner' || userRole === 'editor';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lp || !section) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Seção não encontrada.</p>
      </div>
    );
  }

  const fields = SECTION_FIELDS[section] || [];
  const SectionComponent = SECTION_COMPONENTS[section];
  const variante = (settings[`${section}_variante`] as 'modelo_a' | 'modelo_b') || 'modelo_a';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/admin/lp/${id}/sections`} className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-semibold">{SECTION_NAMES[section]}</h1>
              <p className="text-sm text-muted-foreground">
                {lp.nome} • {userRole === 'owner' ? 'Dono' : userRole === 'editor' ? 'Editor' : 'Visualizador'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                showPreview ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            {canEdit ? (
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground">
                <Lock className="w-4 h-4" />
                Somente leitura
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Editor */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} p-6 overflow-y-auto max-h-[calc(100vh-73px)]`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-w-2xl"
          >
            {!canEdit && (
              <div className="p-4 rounded-xl bg-warning/10 text-warning text-sm flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Você está no modo de visualização. Apenas donos e editores podem fazer alterações.
              </div>
            )}

            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-2">{field.label}</label>
                {field.type === 'image' ? (
                  id && (
                    <ImageUpload
                      lpId={id}
                      value={formData[field.key]}
                      onChange={(url) => handleChange(field.key, url)}
                      disabled={!canEdit}
                    />
                  )
                ) : field.type === 'textarea' || field.type === 'json' ? (
                  <textarea
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    disabled={!canEdit}
                    rows={field.type === 'json' ? 8 : 3}
                    className="input-field resize-y font-mono text-sm"
                    placeholder={field.type === 'json' ? '[]' : ''}
                  />
                ) : (
                  <input
                    type={field.type === 'url' ? 'url' : 'text'}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    disabled={!canEdit}
                    className="input-field"
                  />
                )}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Preview */}
        {showPreview && SectionComponent && (
          <div className="w-1/2 border-l border-border bg-muted/30 overflow-y-auto max-h-[calc(100vh-73px)]">
            <div className="p-4 border-b border-border bg-card/50">
              <p className="text-sm text-muted-foreground">Preview ao vivo (Variante: {variante})</p>
            </div>
            <div className="bg-background">
              <SectionComponent
                content={content}
                previewOverride={formData}
                variante={variante}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSectionEditor;
