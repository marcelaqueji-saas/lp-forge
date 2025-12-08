import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getLPBySlug, 
  getAllContent, 
  getSettings, 
  getSectionOrder, 
  resolveSectionOrder,
  LandingPage, 
  LPContent, 
  LPSettings, 
} from '@/lib/lpContentApi';
import { initGA4, initMetaPixel } from '@/lib/analytics';
import { captureUTMParams } from '@/lib/utm';
import { Loader2 } from 'lucide-react';
import { SectionLoader } from '@/components/sections/SectionLoader';
import { SectionKey } from '@/lib/sectionModels';
import { LeadForm } from '@/components/sections/LeadForm';
import { SEOHead } from '@/components/SEOHead';
import { applyThemeToLP, removeThemeFromLP } from '@/lib/themeUtils';
import { trackPageView } from '@/lib/tracking';

const LandingPageBySlug = () => {
  const { slug } = useParams<{ slug: string }>();
  const [lp, setLp] = useState<LandingPage | null>(null);
  const [content, setContent] = useState<Record<string, LPContent>>({});
  const [settings, setSettings] = useState<LPSettings>({});
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
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

      const [contentData, settingsData, orderData] = await Promise.all([
        getAllContent(lpData.id),
        getSettings(lpData.id),
        getSectionOrder(lpData.id),
      ]);

      setLp(lpData);
      setContent(contentData);
      setSettings(settingsData);
      setSectionOrder(orderData);
      setLoading(false);

      // First-party tracking (page view)
      console.log('→ Tracking page view', lpData.id);
      trackPageView(lpData.id);

      // UTM + GA4 + Meta Pixel
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

  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      applyThemeToLP(settings);
    }
    
    return () => {
      removeThemeFromLP();
    };
  }, [settings]);

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

  // Ordem final de seções (sempre alinhada ao DEFAULT_SECTION_ORDER via resolver)
  const baseOrder = resolveSectionOrder(sectionOrder).filter(
    (s) => s !== 'lead_form'
  );

  // Ler seções ativas salvas pelo builder (enabled_sections em lp_settings)
  let enabledSections: string[] | null = null;
  const rawEnabled = settings.enabled_sections as string | undefined;

  if (rawEnabled) {
    try {
      enabledSections = JSON.parse(rawEnabled) as string[];
    } catch (e) {
      console.warn(
        '[LandingPageBySlug] enabled_sections inválido em settings:',
        rawEnabled
      );
      enabledSections = null;
    }
  }

  // Se tiver enabled_sections, filtra; se não tiver (LP antiga), renderiza tudo
  const sectionsToRender = baseOrder.filter((section) => {
    if (!enabledSections || enabledSections.length === 0) {
      return true;
    }
    return enabledSections.includes(section);
  });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead settings={settings} />

      {sectionsToRender.map((section) => {
        if (section === 'planos') {
          return (
            <div key={section}>
              <SectionLoader
                sectionKey={section as SectionKey}
                lpId={lp.id}
                content={content[section] || {}}
                settings={settings}
                disableAnimations={false}
                userPlan="free"
                context="public"
              />
              <LeadForm lpId={lp.id} />
            </div>
          );
        }

        return (
          <SectionLoader
            key={section}
            sectionKey={section as SectionKey}
            lpId={lp.id}
            content={content[section] || {}}
            settings={settings}
            disableAnimations={false}
            userPlan="free"
            context="public"
          />
        );
      })}
    </div>
  );
};

export default LandingPageBySlug;
