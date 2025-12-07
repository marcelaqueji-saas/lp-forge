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
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { SectionLoader } from '@/components/sections/SectionLoader';
import { SectionKey } from '@/lib/sectionModels';
import { applyThemeToLP, removeThemeFromLP } from '@/lib/themeUtils';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Zap, Shield, Layout, ArrowRight } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </motion.div>
      </div>
    );
  }

  if (noHomepage) {
    return (
      <div className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50/50 to-violet-50/30 relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/20 to-violet-100/20 rounded-full blur-3xl" />
        </div>

        <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold tracking-tight">SaaS-LP</span>
            </div>
          </motion.div>

          {/* Main card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-lg"
          >
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl shadow-slate-200/50 p-8 md:p-10">
              <div className="text-center mb-8">
                <span className="inline-block px-3 py-1 text-xs font-medium tracking-wide uppercase bg-primary/5 text-primary rounded-full mb-4">
                  Plataforma de Landing Pages
                </span>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
                  Crie landing pages com visual de produto grande
                </h1>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  Construa e publique páginas modernas, conecte seu domínio e acompanhe os resultados em um painel visual.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button
                  size="lg"
                  className="flex-1 h-12 rounded-xl font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                  onClick={() => navigate('/auth/register')}
                >
                  Começar agora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 h-12 rounded-xl font-medium bg-white/50 border-slate-200/80 hover:bg-white/80"
                  onClick={() => navigate('/auth/login')}
                >
                  Já tenho conta
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-3">
                <FeatureCard
                  icon={<Zap className="w-4 h-4" />}
                  label="Rápido"
                />
                <FeatureCard
                  icon={<Shield className="w-4 h-4" />}
                  label="Seguro"
                />
                <FeatureCard
                  icon={<Layout className="w-4 h-4" />}
                  label="Responsivo"
                />
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-xs text-muted-foreground"
          >
            © 2024 SaaS-LP. Todos os direitos reservados.
          </motion.p>
        </div>
      </div>
    );
  }

  return (
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
  );
};

const FeatureCard = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary">
      {icon}
    </div>
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
  </div>
);

export default Index;
