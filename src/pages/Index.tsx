import { useEffect, useState, useCallback } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import {
  getDefaultLP,
  getAllContent,
  getSettings,
  getSectionOrder,
  getLPByDomain,
  getLPById,
  trackLPEvent,
  LPContent,
  LPSettings,
  DEFAULT_SECTION_ORDER,
} from '@/lib/lpContentApi';
import { initGA4, initMetaPixel, trackPageView } from '@/lib/analytics';
import { captureUTMParams } from '@/lib/utm';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { SectionLoader } from '@/components/sections/SectionLoader';
import { SectionKey } from '@/lib/sectionModels';
import { applyThemeToLP, removeThemeFromLP } from '@/lib/themeUtils';

const VIEW_TRACKED_KEY = 'lp_view_tracked_';

const Index = () => {
  const navigate = useNavigate();
  const [lpId, setLpId] = useState<string | null>(null);
  const [content, setContent] = useState<Record<string, LPContent>>({});
  const [settings, setSettings] = useState<LPSettings>({});
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const [loading, setLoading] = useState(true);
  const [noHomepage, setNoHomepage] = useState(false);

  const handleHeroPrimaryCTAClick = useCallback(() => {
    if (lpId) {
      trackLPEvent(lpId, 'cta_click', { section: 'hero', cta_type: 'primary' });
    }
  }, [lpId]);

  const handleHeroSecondaryCTAClick = useCallback(() => {
    if (lpId) {
      trackLPEvent(lpId, 'cta_click', { section: 'hero', cta_type: 'secondary' });
    }
  }, [lpId]);

  const handleChamadaFinalCTAClick = useCallback(() => {
    if (lpId) {
      trackLPEvent(lpId, 'cta_click', { section: 'chamada_final', cta_type: 'primary' });
    }
  }, [lpId]);

  useEffect(() => {
    captureUTMParams();

    const loadLP = async () => {
      try {
        let lp = null;

        const hostname = window.location.hostname;
        if (!hostname.includes('localhost') && !hostname.includes('lovable.app')) {
          lp = await getLPByDomain(hostname);
        }

        if (!lp) {
          try {
            const { data: settingData, error: settingError } = await supabase
              .from('app_settings')
              .select('value')
              .eq('key', 'saas_home_lp_id')
              .maybeSingle();

            if (!settingError && settingData?.value) {
              lp = await getLPById(settingData.value);
            }
          } catch (e) {
            console.warn('Could not fetch app_settings:', e);
          }
        }

        if (!lp) {
          lp = await getDefaultLP();
        }

        if (lp) {
          setLpId(lp.id);

          let contentData: Record<string, LPContent> = {};
          let settingsData: LPSettings = {};
          let order: string[] = DEFAULT_SECTION_ORDER;

          try {
            const results = await Promise.all([
              getAllContent(lp.id).catch(() => ({} as Record<string, LPContent>)),
              getSettings(lp.id).catch(() => ({} as LPSettings)),
              getSectionOrder(lp.id).catch(() => DEFAULT_SECTION_ORDER),
            ]);
            contentData = results[0];
            settingsData = results[1];
            order = results[2];
          } catch (e) {
            console.warn('Error loading LP content:', e);
          }

          setContent(contentData);
          setSettings(settingsData);
          setSectionOrder(order.length > 0 ? order : DEFAULT_SECTION_ORDER);

          if (settingsData.ga4_id) {
            initGA4(settingsData.ga4_id);
          }
          if (settingsData.meta_pixel_id) {
            initMetaPixel(settingsData.meta_pixel_id);
          }

          trackPageView('/');

          try {
            const viewKey = VIEW_TRACKED_KEY + lp.id;
            if (!sessionStorage.getItem(viewKey)) {
              await trackLPEvent(lp.id, 'view');
              sessionStorage.setItem(viewKey, 'true');
            }
          } catch (e) {
            // ignore
          }
        } else {
          setNoHomepage(true);
        }
      } catch (error) {
        console.error('Error loading LP:', error);
        setNoHomepage(true);
      } finally {
        setLoading(false);
      }
    };

    loadLP();
  }, []);

  // Apply theme tokens when settings change
  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      applyThemeToLP(settings);
    }
    
    return () => {
      removeThemeFromLP();
    };
  }, [settings]);

  useEffect(() => {
    if (settings.custom_css) {
      const styleId = 'lp-custom-css';
      let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;

      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }

      styleEl.textContent = settings.custom_css;

      return () => {
        styleEl?.remove();
      };
    }
  }, [settings.custom_css]);

  if (loading) {
    return (
      <div className="app-shell min-h-screen flex items-center justify-center px-4">
        <div className="glass-card w-full max-w-md p-8 md:p-10">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 glass-pill text-[11px] font-medium tracking-[0.18em] uppercase">
              Carregando
            </div>
            <p className="text-xs text-slate-100/75">
              Preparando sua experiência SaaS-LP…
            </p>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-40 mx-auto rounded-lg" />
            <Skeleton className="h-4 w-56 mx-auto rounded-lg" />
            <div className="flex gap-3 mt-4">
              <Skeleton className="h-10 flex-1 rounded-xl" />
              <Skeleton className="h-10 flex-1 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (noHomepage) {
    return (
      <div className="app-shell min-h-screen flex items-center justify-center px-4">
        <div className="glass-card w-full max-w-md px-8 py-9 md:px-10 md:py-10 text-center">
          <div className="mx-auto mb-6 glass-circle h-16 w-16">
            <div className="glass-circle h-9 w-9 text-xs font-semibold">
              SL
            </div>
          </div>

          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-100/70 mb-2">
            SaaS-LP
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3 text-slate-50">
            Crie landing pages com visual de produto grande
          </h1>
          <p className="text-sm text-slate-100/75 mb-7">
            Construa e publique páginas modernas, conecte seu domínio e acompanhe
            os resultados em um painel visual simples de usar.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="w-full sm:w-auto glass-pill justify-center text-sm font-semibold shadow-[0_18px_45px_rgba(15,23,42,0.9)]"
              onClick={() => navigate('/auth/register')}
            >
              Começar agora
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto rounded-full border border-white/60 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-slate-50"
              onClick={() => navigate('/auth/login')}
            >
              Já tenho conta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="min-h-screen lp-container">
        <SEOHead settings={settings} />

        {sectionOrder.map((section) => (
          <SectionLoader
            key={section}
            sectionKey={section as SectionKey}
            content={content[section] || {}}
            settings={settings}
            disableAnimations={false}
          />
        ))}
      </div>
    </div>
  );
};

export default Index;
