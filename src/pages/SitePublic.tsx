import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
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
import { SEOHead } from '@/components/SEOHead';
import { getSiteByDomain, getSitePageBySlug, Site, SitePage } from '@/lib/siteApi';
import {
  getAllContent,
  getSettings,
  LPContent,
  LPSettings,
  getLPBySlug,
} from '@/lib/lpContentApi';
import {
  initGA4,
  initMetaPixel,
  trackPageView,
  trackCTAClick,
} from '@/lib/tracking';
import { captureUTMParams } from '@/lib/utm';
import { Skeleton } from '@/components/ui/skeleton';

// -----------------------------------------------------
// Hero secundário (página interna simples)
// -----------------------------------------------------
const HeroSecundario = ({ content }: { content?: LPContent }) => {
  const titulo = content?.titulo || 'Título da Página';
  const subtitulo = content?.subtitulo || '';

  return (
    <section className="section-padding bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="section-container text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{titulo}</h1>
        {subtitulo && (
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {subtitulo}
          </p>
        )}
      </div>
    </section>
  );
};

// -----------------------------------------------------
// Form de contato
// -----------------------------------------------------
const FormContato = ({ content, lpId }: { content?: LPContent; lpId: string }) => {
  const titulo = content?.titulo || 'Entre em contato';
  const subtitulo = content?.subtitulo || '';

  return (
    <section className="section-padding">
      <div className="section-container max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{titulo}</h2>
          {subtitulo && <p className="text-muted-foreground">{subtitulo}</p>}
        </div>
        <LeadForm lpId={lpId} />
      </div>
    </section>
  );
};

// -----------------------------------------------------
// CTA WhatsApp
// -----------------------------------------------------
const CTAWhatsApp = ({ content }: { content?: LPContent }) => {
  const titulo = content?.titulo || 'Fale conosco pelo WhatsApp';
  const numero = content?.numero || '';
  const mensagem = content?.mensagem || '';

  const whatsappUrl = numero
    ? `https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(
        mensagem
      )}`
    : '#';

  return (
    <section className="section-padding bg-success/5">
      <div className="section-container text-center">
        <h2 className="text-2xl font-bold mb-6">{titulo}</h2>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 bg-success text-white rounded-full text-lg font-semibold hover:bg-success/90 transition-colors"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Chamar no WhatsApp
        </a>
      </div>
    </section>
  );
};

// -----------------------------------------------------
// Garantia
// -----------------------------------------------------
const Garantia = ({ content }: { content?: LPContent }) => {
  const titulo = content?.titulo || 'Garantia de satisfação';
  const descricao = content?.descricao || '';

  return (
    <section className="section-padding bg-muted/30">
      <div className="section-container text-center max-w-2xl">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-success"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-4">{titulo}</h2>
        {descricao && (
          <p className="text-lg text-muted-foreground">{descricao}</p>
        )}
      </div>
    </section>
  );
};

const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  hero: Hero,
  hero_secundario: HeroSecundario,
  como_funciona: ComoFunciona,
  para_quem_e: ParaQuemE,
  beneficios: Beneficios,
  provas_sociais: ProvasSociais,
  planos: Planos,
  faq: FAQ,
  chamada_final: ChamadaFinal,
  form_contato: FormContato,
  cta_whatsapp: CTAWhatsApp,
  garantia: Garantia,
  rodape: Rodape,
};

const VIEW_TRACKED_KEY = 'site_view_tracked_';

const SitePublic = () => {
  const { siteSlug, pageSlug } = useParams<{
    siteSlug?: string;
    pageSlug?: string;
  }>();
  const [site, setSite] = useState<Site | null>(null);
  const [page, setPage] = useState<SitePage | null>(null);
  const [content, setContent] = useState<Record<string, LPContent>>({});
  const [settings, setSettings] = useState<LPSettings>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Track CTA clicks usando o tracking novo (lp_events)
  const handleCTAClick = useCallback(
    (section: string, ctaType: 'primary' | 'secondary') => {
      if (!site) return;
      // Usa site.id como lp_id na tabela lp_events
      trackCTAClick(site.id, section, ctaType);
    },
    [site]
  );

  useEffect(() => {
    captureUTMParams();

    const loadSite = async () => {
      try {
        let loadedSite: Site | null = null;

        // 1) tenta por domínio
        const hostname = window.location.hostname;
        loadedSite = await getSiteByDomain(hostname);

        // 2) se não achou por domínio e tiver slug, tenta pelo slug
        if (!loadedSite && siteSlug) {
          const lpData = await getLPBySlug(siteSlug);
          if (lpData && (lpData as any).is_site) {
            loadedSite = lpData as Site;
          }
        }

        if (!loadedSite) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setSite(loadedSite);

        // Carrega página (home = slug vazio)
        const targetPageSlug = pageSlug || '';
        const pageData = await getSitePageBySlug(loadedSite.id, targetPageSlug);

        if (!pageData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setPage(pageData);

        // Conteúdo + settings
        const [contentData, settingsData] = await Promise.all([
          getAllContent(loadedSite.id),
          getSettings(loadedSite.id),
        ]);

        setContent(contentData);
        setSettings(settingsData);

        // Inicializa GA4 / Pixel usando settings
        if (settingsData.ga4_id) {
          initGA4(settingsData.ga4_id);
        }
        if (settingsData.meta_pixel_id) {
          initMetaPixel(settingsData.meta_pixel_id);
        }

        // 🔹 Tracking first-party: page view na tabela lp_events
        // usamos o id do site como lp_id e o slug da página como "section"
        trackPageView(loadedSite.id, pageSlug || 'home');

        // (Opcional) se quiser manter o controle "view por sessão por página",
        // dá pra usar VIEW_TRACKED_KEY só pra saber que já registrou essa view
        const viewKey =
          VIEW_TRACKED_KEY + loadedSite.id + '_' + (pageSlug || 'home');
        if (!sessionStorage.getItem(viewKey)) {
          sessionStorage.setItem(viewKey, 'true');
        }
      } catch (error) {
        console.error('Error loading site:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadSite();
  }, [siteSlug, pageSlug]);

  // Inject custom CSS
  useEffect(() => {
    if (settings.custom_css) {
      const styleId = 'site-custom-css';
      let styleEl = document.getElementById(styleId) as
        | HTMLStyleElement
        | null;

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
      <div className="min-h-screen bg-background">
        <div className="section-padding">
          <div className="section-container">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-16 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !site || !page) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-muted-foreground mb-8">Página não encontrada</p>
          <a href="/" className="btn-primary">
            Voltar ao início
          </a>
        </div>
      </div>
    );
  }

  const getVariante = (
    section: string
  ): 'modelo_a' | 'modelo_b' | 'modelo_c' => {
    return (
      (settings[`${section}_variante`] as
        | 'modelo_a'
        | 'modelo_b'
        | 'modelo_c') || 'modelo_a'
    );
  };

  return (
    <div className="min-h-screen bg-background site-container">
      <SEOHead settings={settings} />

      {page.section_order.map((section) => {
        const Component = SECTION_COMPONENTS[section];
        if (!Component) return null;

        const props: any = {
          content: content[section],
          key: section,
        };

        // Variante para seções que suportam
        if (
          ![
            'rodape',
            'hero_secundario',
            'form_contato',
            'cta_whatsapp',
            'garantia',
          ].includes(section)
        ) {
          props.variante = getVariante(section);
        }

        // lpId para formulários
        if (section === 'form_contato') {
          props.lpId = site.id;
        }

        // CTAs com tracking novo
        if (section === 'hero') {
          props.onPrimaryCTAClick = () => handleCTAClick('hero', 'primary');
          props.onSecondaryCTAClick = () => handleCTAClick('hero', 'secondary');
        }
        if (section === 'chamada_final') {
          props.lpId = site.id;
          props.onPrimaryCTAClick = () =>
            handleCTAClick('chamada_final', 'primary');
        }

        return <Component {...props} />;
      })}
    </div>
  );
};

export default SitePublic;
