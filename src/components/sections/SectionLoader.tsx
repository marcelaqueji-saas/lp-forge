import React, {
  Suspense,
  lazy,
  ComponentType,
  memo,
  useEffect,
  useState,
} from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  getSectionModel,
  SectionKey,
  SECTION_MODELS_BY_SECTION,
  SECTION_MODEL_KEY,
  StylePreset,
} from '@/lib/sectionModels';
import { LPContent } from '@/lib/lpContentApi';
import {
  parseVisualConfig,
  getVisualClasses,
  getCardClasses,
  prefersReducedMotion,
} from '@/lib/premiumPresets';
import {
  mergeSectionStyles,
  getBackgroundStyle,
  getSectionColorStyles,
  LPGlobalStyleSettings,
  SectionContentStyle,
} from '@/lib/sectionStyleTypes';

import type { PlanTier } from '@/lib/authApi';
import type { PlanLevelWithMaster } from '@/lib/sectionModels';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

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

// EDITABLE SECTION COMPONENTS (Sprint 4.4)
import { HeroEditable } from './HeroEditable';
import { BeneficiosEditable } from './BeneficiosEditable';
import { FAQEditable } from './FAQEditable';
import { ComoFuncionaEditable } from './ComoFuncionaEditable';
import { ParaQuemEEditable } from './ParaQuemEEditable';
import { ProvasSociaisEditable } from './ProvasSociaisEditable';
import { PlanosEditable } from './PlanosEditable';
import { ChamadaFinalEditable } from './ChamadaFinalEditable';
import { MenuEditable } from './MenuEditable';
import { RodapeEditable } from './RodapeEditable';
import HeroCenter from './HeroCenter';
import HeroSplitBasic from './HeroSplitBasic';
import HeroCarousel from './HeroCarousel';
import StoriesCarousel from './StoriesCarousel';
import LogosInfiniteScroll from './LogosInfiniteScroll';
import { SectionSeparator, SeparatorType } from './SectionSeparator';

// Premium components (lazy loaded)
const HeroParallax = lazy(() => import('./premium/HeroParallax'));
const HeroSplit = lazy(() => import('./premium/HeroSplit'));
const Cards3DShowcase = lazy(() => import('./premium/Cards3DShowcase'));
const FeaturesFloat = lazy(() => import('./premium/FeaturesFloat'));
const TestimonialCinematic = lazy(
  () => import('./premium/TestimonialCinematic')
);
const CTAFinal = lazy(() => import('./premium/CTAFinal'));

type SectionTemplateRow = Tables<'section_templates'>;

// ============================================================
// REGISTRO DE COMPONENTES POR SEÇÃO
// ============================================================

const SECTION_COMPONENT_REGISTRY: Record<
  SectionKey,
  Record<string, ComponentType<any>> & { default?: ComponentType<any> }
> = {
  hero: {
    default: Hero,
    Hero,
    HeroCenter,
    HeroSplitBasic,
    HeroCarousel,
    HeroParallax,
    HeroSplit,
  },
  beneficios: {
    default: Beneficios,
    Beneficios,
    Cards3DShowcase,
    FeaturesFloat,
  },
  provas_sociais: {
    default: ProvasSociais,
    ProvasSociais,
    StoriesCarousel,
    LogosInfiniteScroll,
    TestimonialCinematic,
  },
  como_funciona: {
    default: ComoFunciona,
    ComoFunciona,
  },
  para_quem_e: {
    default: ParaQuemE,
    ParaQuemE,
  },
  planos: {
    default: Planos,
    Planos,
  },
  faq: {
    default: FAQ,
    FAQ,
  },
  chamada_final: {
    default: ChamadaFinal,
    ChamadaFinal,
    CTAFinal,
  },
  rodape: {
    default: Rodape,
    Rodape,
  },
  menu: {
    default: MenuSection,
    MenuSection,
  },
};

// ============================================================
// LOADING AND ERROR COMPONENTS
// ============================================================

const SectionFallback = ({ sectionName }: { sectionName: string }) => (
  <div className="py-20 text-center bg-muted/30">
    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
    <p className="text-muted-foreground text-sm">
      Carregando {sectionName}...
    </p>
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
    <p className="text-destructive font-medium text-sm">
      Erro ao carregar {sectionName}
    </p>
    {error && (
      <p className="text-muted-foreground text-xs mt-1">{error}</p>
    )}
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
    console.error(
      `[SectionLoader] Error in ${this.props.sectionName}:`,
      error,
      errorInfo
    );
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
  // 1) NOVO: tenta ler o id do modelo salvo em lp_content (__model_id)
  const variantFromModelId = content?.[SECTION_MODEL_KEY] as string | undefined;
  if (variantFromModelId) return variantFromModelId;

  // 2) Compatibilidade: campo "variant" direto no conteúdo (legado)
  const variantFromContent = content?.variant as string | undefined;
  if (variantFromContent) return variantFromContent;

  // 3) Compatibilidade: _variante salvo em lp_settings
  const variantFromSettings = settings?.[`${sectionKey}_variante`];
  if (variantFromSettings) return variantFromSettings;

  // 4) Default: primeiro modelo cadastrado para a seção
  const models = SECTION_MODELS_BY_SECTION[sectionKey];
  if (models && models.length > 0) {
    return models[0].id;
  }

  // 5) Fallback legado
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
    hero_center: 'modelo_b',
    hero_split_basic: 'modelo_a',
    hero_benefits_intro: 'modelo_b',
    hero_gallery_slider: 'modelo_b',
    hero_metrics: 'modelo_b',
    hero_social: 'modelo_b',
    hero_video_cinematic: 'modelo_c',
    hero_rotating_headline: 'modelo_b',
    hero_parallax: 'modelo_c',

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
          className={`absolute ${
            isTop ? 'top-0' : 'bottom-0'
          } left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent`}
        />
      );
    case 'gradient':
      return (
        <div
          className={`absolute ${
            isTop ? 'top-0' : 'bottom-0'
          } left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0`}
        />
      );
    case 'glow':
      return (
        <div
          className={`absolute ${
            isTop ? 'top-0' : 'bottom-0'
          } left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 blur-sm`}
        />
      );
    case 'wave':
      return (
        <svg
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          className={`absolute ${
            isTop ? 'top-0' : 'bottom-0'
          } left-0 w-full h-12 ${isTop ? 'rotate-180' : ''}`}
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
          className={`absolute ${
            isTop ? 'top-0' : 'bottom-0'
          } left-0 w-full h-16 ${isTop ? 'rotate-180' : ''}`}
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
          className={`absolute ${
            isTop ? 'top-0' : 'bottom-0'
          } left-0 w-full h-12 ${isTop ? 'rotate-180' : ''}`}
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
  userPlan?: PlanLevelWithMaster;
  context?: 'editor' | 'public';
  editable?: boolean;
  onContentUpdate?: (sectionKey: SectionKey, newContent: LPContent) => void;
}

function buildSectionStyles(
  content?: LPContent,
  settings?: Record<string, string | undefined>
): React.CSSProperties {
  const styles: React.CSSProperties = {};

  if (!content && !settings) return styles;

  // Extract global settings
  const globalSettings: LPGlobalStyleSettings = {
    background_mode: (settings?.background_mode as 'global' | 'per_section') || 'global',
    background_global_type: (settings?.background_global_type as 'solid' | 'gradient' | 'image') || 'solid',
    background_global_color: settings?.background_global_color,
    background_global_gradient: settings?.background_global_gradient,
    background_global_image_url: settings?.background_global_image_url,
    primary_color: settings?.primary_color,
    secondary_color: settings?.secondary_color,
    accent_color: settings?.accent_color,
  };

  // Extract section-specific style content
  const sectionStyleContent: SectionContentStyle = {
    background_type: (content as any)?.background_type,
    background_color: (content as any)?.background_color,
    background_gradient: (content as any)?.background_gradient,
    background_image_url: (content as any)?.background_image_url,
    primary_color: (content as any)?.primary_color,
    secondary_color: (content as any)?.secondary_color,
    accent_color: (content as any)?.accent_color,
  };

  // Merge global and section styles
  const mergedConfig = mergeSectionStyles(globalSettings, sectionStyleContent);

  // Apply background style
  const bgStyle = getBackgroundStyle(mergedConfig.background);
  Object.assign(styles, bgStyle);

  // Apply section colors as CSS variables
  const colorStyles = getSectionColorStyles(mergedConfig.colors);
  Object.assign(styles, colorStyles);

  // Legacy support: if content has old style_gradient/style_bg fields
  if (!mergedConfig.background.type || mergedConfig.background.type === 'solid') {
    if ((content as any)?.style_gradient) {
      styles.background = (content as any).style_gradient as string;
    } else if ((content as any)?.style_bg) {
      styles.backgroundColor = (content as any).style_bg as string;
    }
  }

  if ((content as any)?.style_text) {
    styles.color = (content as any).style_text as string;
  }

  return styles;
}

// Map section keys to editable components
const EDITABLE_COMPONENT_REGISTRY: Record<SectionKey, React.ComponentType<any> | null> = {
  hero: HeroEditable,
  beneficios: BeneficiosEditable,
  faq: FAQEditable,
  como_funciona: ComoFuncionaEditable,
  para_quem_e: ParaQuemEEditable,
  provas_sociais: ProvasSociaisEditable,
  planos: PlanosEditable,
  chamada_final: ChamadaFinalEditable,
  menu: MenuEditable,
  rodape: RodapeEditable,
};

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
    editable = false,
    onContentUpdate,
  }) => {
    // [S4.4 QA] Check if editable mode
    const globalTheme = settings?.global_theme;
    console.log(`[S4.4 QA] SectionLoader: ${sectionKey}, editable=${editable}, context=${context}, globalTheme=${globalTheme}`);
    const [templateMeta, setTemplateMeta] =
      useState<SectionTemplateRow | null>(null);

    // 1. Resolve variant (agora priorizando __model_id no conteúdo)
    const variant = resolveVariant(sectionKey, content, settings);

    // 2. Modelo da seção com base no variant
    const sectionModel = getSectionModel(sectionKey, variant);

    // 3. Visual config
    const visualConfig = parseVisualConfig(content as Record<string, any>);
    const reducedMotion = prefersReducedMotion();

    useEffect(() => {
      let active = true;
      setTemplateMeta(null);

      const loadTemplate = async () => {
        const { data, error } = await supabase
          .from('section_templates')
          .select('id, section, variant_id, componente_front')
          .eq('section', sectionKey)
          .eq('variant_id', variant)
          .eq('is_active', true)
          .limit(1);

        if (error) {
          console.warn(
            `[SectionLoader] Failed to load template for ${sectionKey}/${variant}`,
            error.message
          );
          return;
        }

        if (data && data.length > 0 && active) {
          setTemplateMeta(data[0] as SectionTemplateRow);
        }
      };

      loadTemplate();

      return () => {
        active = false;
      };
    }, [sectionKey, variant]);

    // 4. Resolver componente a partir do registry + modelo (SEM depender do templateMeta)
    const registryForSection = SECTION_COMPONENT_REGISTRY[sectionKey];

    if (!registryForSection) {
      console.warn(
        `[SectionLoader] Nenhum registro encontrado para a seção: ${sectionKey}`
      );
      return (
        <SectionError
          sectionName={sectionKey}
          error={`Seção não registrada: ${sectionKey}`}
        />
      );
    }

    let Component: ComponentType<any> | null = null;
    let componentKey = '';

    // Get effective style preset from settings or model
    const effectiveStylePreset = (settings?.global_theme as StylePreset) || sectionModel?.stylePreset || 'glass';

    // [S4.4] If editable mode, use editable component directly
    if (editable && lpId) {
      const EditableComponent = EDITABLE_COMPONENT_REGISTRY[sectionKey];
      if (EditableComponent) {
        console.log(`[S5.2 QA] Using editable component for: ${sectionKey}, modelId=${variant}, stylePreset=${effectiveStylePreset}`);
        return (
          <SectionErrorBoundary sectionName={sectionKey}>
            <EditableComponent
              lpId={lpId}
              content={previewOverride || content}
              userPlan={userPlan}
              editable={true}
              variante={mapVariantToLegacy(variant)}
              modelId={variant}
              stylePreset={effectiveStylePreset}
            />
          </SectionErrorBoundary>
        );
      }
    }

    // 1) Se o modelo da seção define explicitamente um componente, usa ele
    if (
      sectionModel?.component &&
      registryForSection[sectionModel.component]
    ) {
      Component = registryForSection[sectionModel.component];
      componentKey = sectionModel.component;
    }
    // 2) Se existir um "default" registrado para a seção, usa como fallback estável
    else if (registryForSection.default) {
      Component = registryForSection.default;
      componentKey = 'default';
      console.warn(
        `[SectionLoader] Usando componente default para seção: ${sectionKey}, variant: ${variant}`
      );
    }
    // 3) Erro hard se não tiver nada mapeado
    else {
      console.error(
        `[SectionLoader] Nenhum componente mapeado para seção: ${sectionKey}`
      );
      return (
        <SectionError
          sectionName={sectionKey}
          error={`Nenhum componente definido para a seção: ${sectionKey}`}
        />
      );
    }

    const legacyVariant = mapVariantToLegacy(variant);
    const sectionStyles = buildSectionStyles(content, settings);
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
      modelId: variant, // Pass the actual model ID
      stylePreset: effectiveStylePreset, // Use global theme override or model's preset
      motionPreset: sectionModel?.motionPreset || 'fade-stagger', // Pass motion preset from model
      disableAnimations: disableAnimations || reducedMotion,
      buttonStyle: visualConfig.button_style,
      cardStyle: cardClasses,
      userPlan,
      context,
    };

    // Ajuste rápido para heros novos → mapeia para variantes legadas coerentes
    if (sectionKey === 'hero') {
      switch (variant) {
        case 'hero_center':
          componentProps.variante = 'modelo_b';
          break;
        case 'hero_split_basic':
          componentProps.variante = 'modelo_a';
          break;
        case 'hero_benefits_intro':
          componentProps.variante = 'modelo_b';
          break;
        default:
          break;
      }
    }

    const isLazy = isLazyComponent(componentKey);

    const hasSeparatorBefore =
      visualConfig.separator_before &&
      visualConfig.separator_before !== 'none';
    const hasSeparatorAfter =
      visualConfig.separator_after &&
      visualConfig.separator_after !== 'none';

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

    // Map stylePreset to CSS wrapper class for cascade
    const presetWrapperClass = effectiveStylePreset && ['dark', 'neon', 'minimal'].includes(effectiveStylePreset)
      ? `preset-${effectiveStylePreset}`
      : '';

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

    // Wrap with preset class for CSS cascade
    if (presetWrapperClass) {
      node = (
        <div className={presetWrapperClass}>
          {node}
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
