import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { getLPById, getAllContent, getSettings, updateLPStatus, LandingPage, LPContent, LPSettings } from '@/lib/lpContentApi';
import { Loader2, ArrowLeft, Eye, Globe, GlobeLock, Monitor, Smartphone, Tablet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Import all section components
import { Hero } from '@/components/sections/Hero';
import { ComoFunciona } from '@/components/sections/ComoFunciona';
import { ParaQuemE } from '@/components/sections/ParaQuemE';
import { Beneficios } from '@/components/sections/Beneficios';
import { ProvasSociais } from '@/components/sections/ProvasSociais';
import { Planos } from '@/components/sections/Planos';
import { FAQ } from '@/components/sections/FAQ';
import { ChamadaFinal } from '@/components/sections/ChamadaFinal';
import { Rodape } from '@/components/sections/Rodape';
import { LeadForm } from '@/components/sections/LeadForm';

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_WIDTHS: Record<ViewportSize, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

const AdminLPPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lp, setLp] = useState<LandingPage | null>(null);
  const [content, setContent] = useState<Record<string, LPContent>>({});
  const [settings, setSettings] = useState<LPSettings>({});
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }

      if (!id) return;

      const [lpData, contentData, settingsData] = await Promise.all([
        getLPById(id),
        getAllContent(id),
        getSettings(id),
      ]);

      setLp(lpData);
      setContent(contentData);
      setSettings(settingsData);
      setLoading(false);
    };

    loadData();
  }, [id, navigate]);

  const handleTogglePublish = async () => {
    if (!lp || !id) return;
    
    setPublishing(true);
    const newStatus = !lp.publicado;
    const success = await updateLPStatus(id, newStatus);
    
    if (success) {
      setLp({ ...lp, publicado: newStatus });
      toast({ 
        title: newStatus ? 'LP publicada!' : 'LP despublicada',
        description: newStatus ? 'Sua landing page está agora visível ao público.' : 'Sua landing page não está mais visível ao público.'
      });
    } else {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    }
    
    setPublishing(false);
  };

  const getVariante = (section: string): 'modelo_a' | 'modelo_b' => {
    return (settings[`${section}_variante`] as 'modelo_a' | 'modelo_b') || 'modelo_a';
  };

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/admin/lp/${id}/sections`} className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-primary" />
              <div>
                <h1 className="font-semibold">Preview: {lp.nome}</h1>
                <p className="text-sm text-muted-foreground">/{lp.slug}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Viewport Selector */}
            <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
              <button
                onClick={() => setViewport('desktop')}
                className={`p-2 rounded-lg transition-colors ${viewport === 'desktop' ? 'bg-card shadow-sm' : 'hover:bg-card/50'}`}
                title="Desktop"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-2 rounded-lg transition-colors ${viewport === 'tablet' ? 'bg-card shadow-sm' : 'hover:bg-card/50'}`}
                title="Tablet"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-2 rounded-lg transition-colors ${viewport === 'mobile' ? 'bg-card shadow-sm' : 'hover:bg-card/50'}`}
                title="Mobile"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Status Badge */}
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 ${
              lp.publicado 
                ? 'bg-success/10 text-success' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {lp.publicado ? <Globe className="w-3 h-3" /> : <GlobeLock className="w-3 h-3" />}
              {lp.publicado ? 'Publicado' : 'Rascunho'}
            </span>

            {/* Publish Button */}
            <button
              onClick={handleTogglePublish}
              disabled={publishing}
              className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                lp.publicado 
                  ? 'bg-muted hover:bg-muted/80 text-foreground' 
                  : 'btn-primary'
              }`}
            >
              {publishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : lp.publicado ? (
                <>
                  <GlobeLock className="w-4 h-4" />
                  Despublicar
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Publicar
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Preview Content */}
      <div className="flex-1 bg-muted/50 overflow-auto">
        <div 
          className="mx-auto transition-all duration-300 bg-background shadow-xl"
          style={{ 
            width: VIEWPORT_WIDTHS[viewport],
            minHeight: 'calc(100vh - 73px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Hero 
              content={content.hero} 
              variante={getVariante('hero')} 
            />
            <ComoFunciona 
              content={content.como_funciona} 
              variante={getVariante('como_funciona')} 
            />
            <ParaQuemE 
              content={content.para_quem_e} 
              variante={getVariante('para_quem_e')} 
            />
            <Beneficios 
              content={content.beneficios} 
              variante={getVariante('beneficios')} 
            />
            <ProvasSociais 
              content={content.provas_sociais} 
              variante={getVariante('provas_sociais')} 
            />
            <Planos 
              content={content.planos} 
              variante={getVariante('planos')} 
            />
            <LeadForm lpId={id || ''} />
            <FAQ 
              content={content.faq} 
              variante={getVariante('faq')} 
            />
            <ChamadaFinal 
              content={content.chamada_final} 
              variante={getVariante('chamada_final')} 
            />
            <Rodape 
              content={content.rodape} 
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminLPPreview;