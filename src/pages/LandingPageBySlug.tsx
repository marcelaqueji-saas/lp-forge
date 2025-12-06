import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getLPBySlug, getAllContent, getSettings, LandingPage, LPContent, LPSettings } from '@/lib/lpContentApi';
import { initGA4, initMetaPixel } from '@/lib/analytics';
import { captureUTMParams } from '@/lib/utm';
import { Loader2 } from 'lucide-react';

// Section components
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

const LandingPageBySlug = () => {
  const { slug } = useParams<{ slug: string }>();
  const [lp, setLp] = useState<LandingPage | null>(null);
  const [content, setContent] = useState<Record<string, LPContent>>({});
  const [settings, setSettings] = useState<LPSettings>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadLP = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const lpData = await getLPBySlug(slug);
      
      if (!lpData || !lpData.publicado) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const [contentData, settingsData] = await Promise.all([
        getAllContent(lpData.id),
        getSettings(lpData.id),
      ]);

      setLp(lpData);
      setContent(contentData);
      setSettings(settingsData);
      setLoading(false);

      // Initialize tracking
      captureUTMParams();
      if (settingsData.ga4_id) {
        initGA4(settingsData.ga4_id);
      }
      if (settingsData.meta_pixel_id) {
        initMetaPixel(settingsData.meta_pixel_id);
      }
    };

    loadLP();
  }, [slug]);

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

  if (notFound || !lp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-muted-foreground">Landing page não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
      <LeadForm lpId={lp.id} />
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
    </div>
  );
};

export default LandingPageBySlug;