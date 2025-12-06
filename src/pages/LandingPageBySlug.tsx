import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getLPBySlug, getAllContent, getSettings, getSectionOrder, LandingPage, LPContent, LPSettings, DEFAULT_SECTION_ORDER } from '@/lib/lpContentApi';
import { initGA4, initMetaPixel } from '@/lib/analytics';
import { captureUTMParams } from '@/lib/utm';
import { Loader2 } from 'lucide-react';
import { SectionLoader } from '@/components/sections/SectionLoader';
import { SectionKey } from '@/lib/sectionModels';
import { LeadForm } from '@/components/sections/LeadForm';
import { SEOHead } from '@/components/SEOHead';

const LandingPageBySlug = () => {
  const { slug } = useParams<{ slug: string }>();
  const [lp, setLp] = useState<LandingPage | null>(null);
  const [content, setContent] = useState<Record<string, LPContent>>({});
  const [settings, setSettings] = useState<LPSettings>({});
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
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

  // Filter sections that should render (exclude lead_form as it's handled separately)
  const sectionsToRender = sectionOrder.filter(s => s !== 'lead_form');

  return (
    <div className="min-h-screen bg-background">
      <SEOHead settings={settings} />
      
      {sectionsToRender.map((section) => {
        // Special handling for lead form - render after planos
        if (section === 'planos') {
          return (
            <div key={section}>
              <SectionLoader
                sectionKey={section as SectionKey}
                content={content[section] || {}}
                settings={settings}
                disableAnimations={false}
              />
              <LeadForm lpId={lp.id} />
            </div>
          );
        }

        return (
          <SectionLoader
            key={section}
            sectionKey={section as SectionKey}
            content={content[section] || {}}
            settings={settings}
            disableAnimations={false}
          />
        );
      })}
    </div>
  );
};

export default LandingPageBySlug;
