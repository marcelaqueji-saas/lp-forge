import React, { Suspense, lazy, ComponentType, memo } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { getSectionModel, SectionKey, SECTION_MODELS_BY_SECTION } from '@/lib/sectionModels';
import { LPContent } from '@/lib/lpContentApi';
import {
  parseVisualConfig,
  getVisualClasses,
  getCardClasses,
  prefersReducedMotion,
  PremiumVisualConfig,
} from '@/lib/premiumPresets';

import type { PlanTier } from '@/lib/authApi';

// Wrappers de efeitos premium (animação / cursor / etc)
import {
  AnimateOnScroll,
  CursorEffectWrapper,
} from '@/components/premium/PremiumEffects';

// ============================================================
// BASE SECTION COMPONENTS (always loaded)
// ============================================================
import { Hero } from './Hero';
import { ComoFunciona } from './ComoFunciona';
import { ParaQuemE } from './ParaQuemE';
import { Beneficios } from './Beneficios';
import { ProvasSociais } from './ProvasSociais';
import { Planos } from './Planos';
import { FAQ } from './FAQ';
import { ChamadaFinal } from './ChamadaFinal';
import { Rodape } from './Rodape';
import { MenuSection } from './MenuSection';

// Premium components (lazy loaded)
const HeroParallax = lazy(() => import('./premium/HeroParallax'));
const HeroSplit = lazy(() => import('./premium/HeroSplit'));
const Cards3DShowcase = lazy(() => import('./premium/Cards3DShowcase'));
const FeaturesFloat = lazy(() => import('./premium/FeaturesFloat'));
const TestimonialCinematic = lazy(() => import('./premium/TestimonialCinematic'));
const CTAFinal = lazy(() => import('./premium/CTAFinal'));



export const SECTION_COMPONENTS: Record<string, ComponentType<any>> = {
  // Fallbacks por seção
  Hero,
  Beneficios,
  ProvasSociais,
  ComoFunciona,
  ChamadaFinal,
  FAQ,
  Rodape,
  MenuSection,

  // Base templates mapeados
  'hero-basic': Hero,
  'benefits-basic': Beneficios,
  'testimonials-basic': ProvasSociais,
  'steps-basic': ComoFunciona,
  'cta-basic': ChamadaFinal,
  'faq-basic': FAQ,
  'footer-basic': Rodape,
  'menu-basic': MenuSection,

      // =====================================
  // HERO – novos templates do banco
  // (usando exatamente os variant_id do section_templates)
  // =====================================
  'hero_center': Hero,
  'hero_benefits_intro': Hero,
  'hero_split_basic': Hero,
  'hero_headline_rotator': Hero,
  'hero_parallax_vision': HeroParallax,
  'hero_cinematic_video': Hero,
  'hero_social_proof': Hero,
  'hero_gallery_slider': Hero,
  'hero_metrics_highlights': Hero,


  // =====================================
  // BENEFÍCIOS – novos templates
  // =====================================
  'features_minimal': Beneficios,
  FeaturesMinimal: Beneficios,

  'benefits_detailed': Beneficios,
  BenefitsDetailed: Beneficios,

  'benefits_icons_motion': Beneficios,
  BenefitsIconsMotion: Beneficios,

  'feature_cards_3x3': Beneficios,
  FeatureCards3x3: Beneficios,

  'cards_3d_premium': Cards3DShowcase,
  Cards3DPremium: Cards3DShowcase,

  // =====================================
  // PROVAS SOCIAIS
  // =====================================
  'testimonial_static': ProvasSociais,
  TestimonialStatic: ProvasSociais,

  'testimonials_slider': ProvasSociais,
  TestimonialsSlider: ProvasSociais,

  'avatars_flow_review': ProvasSociais,
  AvatarsFlowReview: ProvasSociais,

  // já existia, só garante:
  'testimonial_cinematic': TestimonialCinematic,
  'testimonial-cinematic': TestimonialCinematic,
  TestimonialCinematic: TestimonialCinematic,

  // =====================================
  // COMO FUNCIONA
  // =====================================
  'steps_simple': ComoFunciona,
  StepsSimple: ComoFunciona,

  'timeline_horizontal': ComoFunciona,
  TimelineHorizontal: ComoFunciona,

  'icons_steps_motion': ComoFunciona,
  IconsStepsMotion: ComoFunciona,

  'steps_3d_premium': ComoFunciona,
  Steps3DPremium: ComoFunciona,

  // =====================================
  // CHAMADA FINAL / CTA
  // =====================================
  'cta_minimal': ChamadaFinal,
  CTAMinimal: ChamadaFinal,

  'cta_social': ChamadaFinal,
  CTASocial: ChamadaFinal,

  'cta_cinematic': CTAFinal,
  CTACinematic: CTAFinal,

  // =====================================
  // FAQ
  // =====================================
  'faq_basic': FAQ,
  FAQBasic: FAQ,

  'faq_animated': FAQ,
  FAQAnimated: FAQ,

  'faq_search': FAQ,
  FAQSearch: FAQ,

};

const SECTION_FALLBACK: Record<SectionKey, ComponentType<any>> = {
  menu: MenuSection,
  hero: Hero,
  como_funciona: ComoFunciona,
  para_quem_e: ParaQuemE,
  beneficios: Beneficios,
  provas_sociais: ProvasSociais,
  planos: Planos,
  faq: FAQ,
  chamada_final: ChamadaFinal,
  rodape: Rodape,
};

// ============================================================
// LOADING AND ERROR COMPONENTS
// ============================================================

const SectionFallback = ({ sectionName }: { sectionName: string }) => (
  <div className="py-20 text-center bg-muted/30">
    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
    <p className="text-muted-foreground text-sm">Carregando {sectionName}...</p>
  </div>
);

const SectionError = ({
  sectionName,
  error,
}: {
  sectionName: string;
  error?: string;
}) => (
  <div className="py-12 text-center bg-destructive/5 border border-destructive/20 rounded-lg mx-4 my-4">
    <AlertCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
    <p className="text-destructive font-medium text-sm">Erro ao carregar {sectionName}</p>
    {error && <p className="text-muted-foreground text-xs mt-1">{error}</p>}
  </div>
);

// ============================================================
// ERROR BOUNDARY
// ============================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class SectionErrorBoundary extends React.Component<
  { children: React.ReactNode; sectionName: string },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; sectionName: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[SectionLoader] Error in ${this.props.sectionName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SectionError
          sectionName={this.props.sectionName}
          error={this.state.error?.message}
        />
      );
    }
    return this.props.children;
  }
}

// ============================================================
// VARIANT RESOLUTION UTILITIES
// ============================================================

export function resolveVariant(
  sectionKey: SectionKey,
  content?: LPContent,
  settings?: Record<string, string | undefined>
): string {
  const variantFromContent = content?.variant as string | undefined;
  if (variantFromContent) return variantFromContent;

  const variantFromSettings = settings?.[`${sectionKey}_variante`];
  if (variantFromSettings) return variantFromSettings;

  const models = SECTION_MODELS_BY_SECTION[sectionKey];
  if (models && models.length > 0) {
    return models[0].id;
  }

  return 'modelo_a';
}

export function mapVariantToLegacy(variant: string): string {
  if (variant.startsWith('modelo_')) {
    return variant;
  }

  const match = variant.match(/modelo_[a-z]$/);
  if (match) {
    return match[0];
  }

  const legacyMap: Record<string, string> = {
        // Hero
    'hero-basic': 'modelo_a',
    'hero-side-image': 'modelo_a',
    'hero-dashboard': 'modelo_b',
    'hero-cards': 'modelo_b',
    'hero-cinematic-video': 'modelo_c',
    'hero-parallax-glass': 'modelo_c',

    // ✅ IDs que estão na TABELA section_templates
    'hero_center': 'modelo_b',
    'hero_split_basic': 'modelo_a',
    'hero_benefits_intro': 'modelo_b',
    'hero_gallery_slider': 'modelo_b',
    'hero_metrics': 'modelo_b',
    'hero_social': 'modelo_b',
    'hero_video_cinematic': 'modelo_c',
    'hero_rotating_headline': 'modelo_b',
    'hero_parallax': 'modelo_c',

    // Como Funciona
    'steps-basic': 'modelo_a',
    'steps-icons': 'modelo_a',
    'steps-image-left': 'modelo_b',
    'steps-vertical-timeline': 'modelo_b',
    'como_funciona-modelo_a': 'modelo_a',
    'como_funciona-modelo_b': 'modelo_b',
    // Para Quem É
    'target-basic': 'modelo_a',
    'target-grid': 'modelo_a',
    'target-cards': 'modelo_b',
    'target-avatars': 'modelo_b',
    'target-lit-line': 'modelo_b',
    'para_quem_e-modelo_a': 'modelo_a',
    'para_quem_e-modelo_b': 'modelo_b',
    // Benefícios
    'benefits-basic': 'modelo_a',
    'benefits-carousel': 'modelo_a',
    'benefits-bento-grid': 'modelo_b',
    'benefits-pictures': 'modelo_c',
    'benefits-motion-icons': 'modelo_c',
    'beneficios-modelo_a': 'modelo_a',
    'beneficios-modelo_b': 'modelo_b',
    'beneficios-modelo_c': 'modelo_c',
    // Provas Sociais
    'testimonials-basic': 'modelo_a',
    'testimonials-slider': 'modelo_a',
    'testimonials-cards': 'modelo_b',
    'testimonials-profile-feed': 'modelo_c',
    'testimonials-video-grid': 'modelo_c',
    'provas_sociais-modelo_a': 'modelo_a',
    'provas_sociais-modelo_b': 'modelo_b',
    'provas_sociais-modelo_c': 'modelo_c',
    // Planos
    'pricing-basic': 'modelo_a',
    'pricing-feature-grid': 'modelo_a',
    'pricing-tabs': 'modelo_b',
    'planos-modelo_a': 'modelo_a',
    'planos-modelo_b': 'modelo_b',
    // FAQ
    'faq-accordion': 'modelo_a',
    'faq-cards': 'modelo_a',
    'faq-sections': 'modelo_b',
    'faq-modelo_a': 'modelo_a',
    'faq-modelo_b': 'modelo_b',
    // Chamada Final
    'cta-basic': 'modelo_a',
    'cta-showcase': 'modelo_b',
    'cta-banner-glass': 'modelo_c',
    'chamada_final-modelo_a': 'modelo_a',
    'chamada_final-modelo_b': 'modelo_b',
    'chamada_final-modelo_c': 'modelo_c',
    // Rodapé
    'footer-basic': 'modelo_a',
    'footer-columns': 'modelo_b',
    'rodape-modelo_a': 'modelo_a',
    'rodape-modelo_b': 'modelo_b',
    // Menu
    'menu-modelo_a': 'modelo_a',
    'menu-modelo_b': 'modelo_b',
  };

  return legacyMap[variant] || 'modelo_a';
}

function isLazyComponent(componentKey: string): boolean {
  const lazyComponents = [
    'HeroParallax',
    'hero-parallax',
    'HeroSplit',
    'hero-split',
    'Cards3DShowcase',
    'beneficios-showcase_3d',
    'FeaturesFloat',
    'beneficios-features_float',
    'TestimonialCinematic',
    'testimonial-cinematic',
    'testimonial_cinematic',
    'CTAFinal',
    'cta_final_animated',
  ];
  return lazyComponents.includes(componentKey);
}

// ============================================================
// SEPARATOR COMPONENT
// ============================================================

const PremiumSeparator: React.FC<{
  type: 'line' | 'gradient' | 'glow' | 'wave' | 'diagonal' | 'curve';
  position: 'before' | 'after';
}> = ({ type, position }) => {
  const isTop = position === 'before';

  switch (type) {
    case 'line':
      return (
        <div
          className={`absolute ${isTop ? 'top-0' : 'bottom-0'} left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent`}
        />
      );
    case 'gradient':
      return (
        <div
          className={`absolute ${isTop ? 'top-0' : 'bottom-0'} left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0`}
        />
      );
    case 'glow':
      return (
        <div
          className={`absolute ${isTop ? 'top-0' : 'bottom-0'} left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 blur-sm`}
        />
      );
    case 'wave':
      return (
        <svg
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          className={`absolute ${isTop ? 'top-0' : 'bottom-0'} left-0 w-full h-12 ${isTop ? 'rotate-180' : ''}`}
        >
          <path
            d="M0,30 C300,60 600,0 900,30 C1050,45 1150,15 1200,30 L1200,60 L0,60 Z"
            fill="currentColor"
            className="text-background"
          />
        </svg>
      );
    case 'diagonal':
      return (
        <svg
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
          className={`absolute ${isTop ? 'top-0' : 'bottom-0'} left-0 w-full h-16 ${isTop ? 'rotate-180' : ''}`}
        >
          <polygon
            points="0,10 100,0 100,10"
            fill="currentColor"
            className="text-background"
          />
        </svg>
      );
    case 'curve':
      return (
        <svg
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          className={`absolute ${isTop ? 'top-0' : 'bottom-0'} left-0 w-full h-12 ${isTop ? 'rotate-180' : ''}`}
        >
          <path
            d="M0,60 Q600,0 1200,60 L1200,60 L0,60 Z"
            fill="currentColor"
            className="text-background"
          />
        </svg>
      );
    default:
      return null;
  }
};

// ============================================================
// MAIN SECTION LOADER COMPONENT
// ============================================================

interface SectionLoaderProps {
  sectionKey: SectionKey;
  lpId?: string;
  content?: LPContent;
  previewOverride?: LPContent;
  settings?: Record<string, string | undefined>;
  disableAnimations?: boolean;

  userPlan?: PlanTier;
  context?: 'editor' | 'public';
}

function buildSectionStyles(content?: LPContent): React.CSSProperties {
  const styles: React.CSSProperties = {};

  if (!content) return styles;

  if (content.style_gradient) {
    styles.background = content.style_gradient as string;
  } else if (content.style_bg) {
    styles.backgroundColor = content.style_bg as string;
  }

  if (content.style_text) {
    styles.color = content.style_text as string;
  }

  return styles;
}

export const SectionLoader: React.FC<SectionLoaderProps> = memo(
  ({
    sectionKey,
    lpId,
    content = {} as LPContent,
    previewOverride,
    settings = {},
    disableAnimations = false,
    userPlan = 'free',
    context = 'public',
  }) => {
    // 1. Resolve variant
    const variant = resolveVariant(sectionKey, content, settings);

    // 2. Model
    const sectionModel = getSectionModel(sectionKey, variant);

    // 3. Visual config base
    const baseVisualConfig = parseVisualConfig(content as Record<string, any>);

    const reducedMotion = prefersReducedMotion();

    // 🔒 Aqui entra a trava de plano:
    // - editor: vê tudo (preview)
    // - public: filtra pelo plano (free limpa efeitos premium)
    const visualConfig = baseVisualConfig;


    // 4. Resolve componente
    let Component: ComponentType<any> | null = null;
    let componentKey = '';

    if (SECTION_COMPONENTS[variant]) {
      Component = SECTION_COMPONENTS[variant];
      componentKey = variant;
    } else if (sectionModel?.component && SECTION_COMPONENTS[sectionModel.component]) {
      Component = SECTION_COMPONENTS[sectionModel.component];
      componentKey = sectionModel.component;
    } else {
      Component = SECTION_FALLBACK[sectionKey];
      componentKey = sectionKey;

      if (!Component) {
        console.warn(
          `[SectionLoader] No component found for section: ${sectionKey}, variant: ${variant}`
        );
        return (
          <SectionError
            sectionName={sectionKey}
            error={`Componente não encontrado: ${variant}`}
          />
        );
      }

      console.warn(
        `[SectionLoader] Using fallback component for: ${sectionKey}, variant: ${variant}`
      );
    }

    const legacyVariant = mapVariantToLegacy(variant);

    const sectionStyles = buildSectionStyles(content);

    const visualClasses = getVisualClasses(
      visualConfig,
      reducedMotion || disableAnimations
    );

    const cardClasses = getCardClasses(visualConfig.card_style);

    const componentProps = {
      lpId,
      content,
      previewOverride,
      variante: legacyVariant,
      disableAnimations: disableAnimations || reducedMotion,
      buttonStyle: visualConfig.button_style,
      cardStyle: cardClasses,
    };
// --- Quick Hero Variant Mapper (Free version ready) ---
if (sectionKey === 'hero') {
  switch (variant) {
    case 'hero_center':
      componentProps.variante = 'modelo_b'; // central com mockup
      break;
    case 'hero_split_basic':
      componentProps.variante = 'modelo_a'; // split imagem
      break;
    case 'hero_benefits_intro':
      componentProps.variante = 'modelo_b'; // conversão inicial
      break;
    case 'hero-basic':
    default:
      componentProps.variante = 'modelo_a'; // padrão
      break;
  }
}

    const isLazy = isLazyComponent(componentKey);

    const hasSeparatorBefore =
      visualConfig.separator_before && visualConfig.separator_before !== 'none';
    const hasSeparatorAfter =
      visualConfig.separator_after && visualConfig.separator_after !== 'none';

    const hasCustomStyles =
      Object.keys(sectionStyles).length > 0 ||
      visualClasses.length > 0 ||
      hasSeparatorBefore ||
      hasSeparatorAfter;

    const enableAnimation =
      !!visualConfig.animation_preset &&
      visualConfig.animation_preset !== 'none' &&
      !reducedMotion &&
      !disableAnimations;

    const enableCursorEffect =
      !!visualConfig.cursor_effect &&
      visualConfig.cursor_effect !== 'none' &&
      !reducedMotion;

    const renderComponent = () => <Component {...componentProps} />;

    let node: React.ReactNode = renderComponent();

    if (hasCustomStyles) {
      node = (
        <div style={sectionStyles} className={`relative ${visualClasses}`}>
          {hasSeparatorBefore && visualConfig.separator_before && (
            <PremiumSeparator
              type={visualConfig.separator_before as any}
              position="before"
            />
          )}
          {node}
          {hasSeparatorAfter && visualConfig.separator_after && (
            <PremiumSeparator
              type={visualConfig.separator_after as any}
              position="after"
            />
          )}
        </div>
      );
    }

    if (enableCursorEffect) {
      node = (
        <CursorEffectWrapper
          effect={visualConfig.cursor_effect as any}
          disabled={reducedMotion || disableAnimations}
          className="block"
        >
          {node}
        </CursorEffectWrapper>
      );
    }

    if (enableAnimation) {
      node = (
        <AnimateOnScroll
          animation={visualConfig.animation_preset as any}
          disabled={disableAnimations || reducedMotion}
        >
          {node}
        </AnimateOnScroll>
      );
    }

    const finalContent = node;

    if (isLazy) {
      return (
        <SectionErrorBoundary sectionName={sectionKey}>
          <Suspense fallback={<SectionFallback sectionName={sectionKey} />}>
            {finalContent}
          </Suspense>
        </SectionErrorBoundary>
      );
    }

    return (
      <SectionErrorBoundary sectionName={sectionKey}>
        {finalContent}
      </SectionErrorBoundary>
    );
  }
);

SectionLoader.displayName = 'SectionLoader';

export default SectionLoader;
