import React, { Suspense, lazy, ComponentType, memo } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { getSectionModel, SectionKey, SECTION_MODELS_BY_SECTION } from '@/lib/sectionModels';
import { LPContent } from '@/lib/lpContentApi';

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

// ============================================================
// COMPONENT REGISTRY - Maps model IDs and component names to React components
// ============================================================

export const SECTION_COMPONENTS: Record<string, ComponentType<any>> = {
  // Menu
  'MenuSection': MenuSection,
  'menu-modelo_a': MenuSection,
  'menu-modelo_b': MenuSection,
  
  // Hero - Base
  'Hero': Hero,
  'hero-basic': Hero,
  'hero-modelo_a': Hero,
  'hero-modelo_b': Hero,
  'hero-modelo_c': Hero,
  'hero-side-image': Hero,
  'HeroSideImage': Hero,
  'hero-dashboard': Hero,
  'HeroDashboard': Hero,
  'hero-cards': Hero,
  'HeroCards': Hero,
  'hero-cinematic-video': Hero,
  'HeroCinematicVideo': Hero,
  'hero-parallax-glass': Hero,
  'HeroParallaxGlass': Hero,
  // Hero - Premium
  'hero-parallax': HeroParallax,
  'HeroParallax': HeroParallax,
  'hero-split': HeroSplit,
  'HeroSplit': HeroSplit,
  
  // Como Funciona
  'ComoFunciona': ComoFunciona,
  'steps-basic': ComoFunciona,
  'como_funciona-modelo_a': ComoFunciona,
  'como_funciona-modelo_b': ComoFunciona,
  'steps-icons': ComoFunciona,
  'StepsIcons': ComoFunciona,
  'steps-image-left': ComoFunciona,
  'StepsImageLeft': ComoFunciona,
  'steps-vertical-timeline': ComoFunciona,
  'StepsVerticalTimeline': ComoFunciona,
  
  // Para Quem É
  'ParaQuemE': ParaQuemE,
  'target-basic': ParaQuemE,
  'para_quem_e-modelo_a': ParaQuemE,
  'para_quem_e-modelo_b': ParaQuemE,
  'target-grid': ParaQuemE,
  'TargetGrid': ParaQuemE,
  'target-cards': ParaQuemE,
  'TargetCards': ParaQuemE,
  'target-avatars': ParaQuemE,
  'TargetAvatars': ParaQuemE,
  'target-lit-line': ParaQuemE,
  'TargetLitLine': ParaQuemE,
  
  // Benefícios
  'Beneficios': Beneficios,
  'benefits-basic': Beneficios,
  'beneficios-modelo_a': Beneficios,
  'beneficios-modelo_b': Beneficios,
  'beneficios-modelo_c': Beneficios,
  'benefits-carousel': Beneficios,
  'BenefitsCarousel': Beneficios,
  'benefits-bento-grid': Beneficios,
  'BenefitsBentoGrid': Beneficios,
  'beneficios-showcase_3d': Cards3DShowcase,
  'beneficios-features_float': FeaturesFloat,
  'benefits-pictures': Beneficios,
  'BenefitsPictures': Beneficios,
  'benefits-motion-icons': Beneficios,
  'BenefitsMotionIcons': Beneficios,
  // Premium
  'Cards3DShowcase': Cards3DShowcase,
  'FeaturesFloat': FeaturesFloat,
  
  // Provas Sociais
  'ProvasSociais': ProvasSociais,
  'testimonials-basic': ProvasSociais,
  'provas_sociais-modelo_a': ProvasSociais,
  'provas_sociais-modelo_b': ProvasSociais,
  'provas_sociais-modelo_c': ProvasSociais,
  'testimonials-slider': ProvasSociais,
  'TestimonialsSlider': ProvasSociais,
  'testimonials-cards': ProvasSociais,
  'TestimonialsCards': ProvasSociais,
  'testimonials-profile-feed': ProvasSociais,
  'TestimonialsProfileFeed': ProvasSociais,
  'testimonials-video-grid': ProvasSociais,
  'TestimonialsVideoGrid': ProvasSociais,
  // Premium
  'testimonial-cinematic': TestimonialCinematic,
  'testimonial_cinematic': TestimonialCinematic,
  'TestimonialCinematic': TestimonialCinematic,
  
  // Planos
  'Planos': Planos,
  'pricing-basic': Planos,
  'planos-modelo_a': Planos,
  'planos-modelo_b': Planos,
  'pricing-feature-grid': Planos,
  'PricingFeatureGrid': Planos,
  'pricing-tabs': Planos,
  'PricingTabs': Planos,
  
  // FAQ
  'FAQ': FAQ,
  'faq-accordion': FAQ,
  'faq-modelo_a': FAQ,
  'faq-modelo_b': FAQ,
  'faq-cards': FAQ,
  'FAQCards': FAQ,
  'faq-sections': FAQ,
  'FAQSections': FAQ,
  
  // Chamada Final
  'ChamadaFinal': ChamadaFinal,
  'cta-basic': ChamadaFinal,
  'chamada_final-modelo_a': ChamadaFinal,
  'chamada_final-modelo_b': ChamadaFinal,
  'chamada_final-modelo_c': ChamadaFinal,
  'cta-showcase': ChamadaFinal,
  'CTAShowcase': ChamadaFinal,
  'cta-banner-glass': ChamadaFinal,
  'CTABannerGlass': ChamadaFinal,
  // Premium
  'cta_final_animated': CTAFinal,
  'CTAFinal': CTAFinal,
  
  // Rodapé
  'Rodape': Rodape,
  'footer-basic': Rodape,
  'rodape-modelo_a': Rodape,
  'rodape-modelo_b': Rodape,
  'footer-columns': Rodape,
  'FooterColumns': Rodape,
};

// ============================================================
// FALLBACK COMPONENTS BY SECTION
// ============================================================

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
  error 
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

/**
 * Resolves the variant ID from multiple sources:
 * 1. content.variant (new system)
 * 2. settings[sectionKey_variante] (legacy system)
 * 3. First model of the section (fallback)
 */
export function resolveVariant(
  sectionKey: SectionKey,
  content?: LPContent,
  settings?: Record<string, string | undefined>
): string {
  // 1. Check content.variant first (new system)
  const variantFromContent = content?.variant as string | undefined;
  if (variantFromContent) return variantFromContent;

  // 2. Check settings (legacy system)
  const variantFromSettings = settings?.[`${sectionKey}_variante`];
  if (variantFromSettings) return variantFromSettings;

  // 3. Return first model of section as fallback
  const models = SECTION_MODELS_BY_SECTION[sectionKey];
  if (models && models.length > 0) {
    return models[0].id;
  }

  // 4. Ultimate fallback
  return 'modelo_a';
}

/**
 * Maps variant IDs to legacy format for components that still use modelo_a/b/c
 */
export function mapVariantToLegacy(variant: string): string {
  // If already legacy format
  if (variant.startsWith('modelo_')) {
    return variant;
  }
  
  // Extract from section-modelo_X format
  const match = variant.match(/modelo_[a-z]$/);
  if (match) {
    return match[0];
  }
  
  // Map new IDs to legacy
  const legacyMap: Record<string, string> = {
    'hero-basic': 'modelo_a',
    'hero-side-image': 'modelo_a',
    'hero-dashboard': 'modelo_b',
    'hero-cards': 'modelo_b',
    'hero-cinematic-video': 'modelo_c',
    'hero-parallax-glass': 'modelo_c',
    'steps-basic': 'modelo_a',
    'steps-icons': 'modelo_a',
    'steps-image-left': 'modelo_b',
    'steps-vertical-timeline': 'modelo_b',
    'target-basic': 'modelo_a',
    'target-grid': 'modelo_a',
    'target-cards': 'modelo_b',
    'target-avatars': 'modelo_b',
    'target-lit-line': 'modelo_b',
    'benefits-basic': 'modelo_a',
    'benefits-carousel': 'modelo_a',
    'benefits-bento-grid': 'modelo_b',
    'benefits-pictures': 'modelo_c',
    'benefits-motion-icons': 'modelo_c',
    'testimonials-basic': 'modelo_a',
    'testimonials-slider': 'modelo_a',
    'testimonials-cards': 'modelo_b',
    'testimonials-profile-feed': 'modelo_c',
    'testimonials-video-grid': 'modelo_c',
    'pricing-basic': 'modelo_a',
    'pricing-feature-grid': 'modelo_a',
    'pricing-tabs': 'modelo_b',
    'faq-accordion': 'modelo_a',
    'faq-cards': 'modelo_a',
    'faq-sections': 'modelo_b',
    'cta-basic': 'modelo_a',
    'cta-showcase': 'modelo_b',
    'cta-banner-glass': 'modelo_c',
    'footer-basic': 'modelo_a',
    'footer-columns': 'modelo_b',
  };

  return legacyMap[variant] || 'modelo_a';
}

/**
 * Check if a component is lazy-loaded (premium)
 */
function isLazyComponent(componentKey: string): boolean {
  const lazyComponents = [
    'HeroParallax', 'hero-parallax',
    'HeroSplit', 'hero-split',
    'Cards3DShowcase', 'beneficios-showcase_3d',
    'FeaturesFloat', 'beneficios-features_float',
    'TestimonialCinematic', 'testimonial-cinematic', 'testimonial_cinematic',
    'CTAFinal', 'cta_final_animated',
  ];
  return lazyComponents.includes(componentKey);
}

// ============================================================
// MAIN SECTION LOADER COMPONENT
// ============================================================

interface SectionLoaderProps {
  sectionKey: SectionKey;
  content?: LPContent;
  previewOverride?: LPContent;
  settings?: Record<string, string | undefined>;
  disableAnimations?: boolean;
}

export const SectionLoader: React.FC<SectionLoaderProps> = memo(({
  sectionKey,
  content = {},
  previewOverride,
  settings = {},
  disableAnimations = false,
}) => {
  // 1. Resolve the variant to use
  const variant = resolveVariant(sectionKey, content, settings);
  
  // 2. Get the section model for this variant
  const sectionModel = getSectionModel(sectionKey, variant);
  
  // 3. Determine which component to render
  let Component: ComponentType<any> | null = null;
  let componentKey = '';
  
  // Try to find component by variant ID first
  if (SECTION_COMPONENTS[variant]) {
    Component = SECTION_COMPONENTS[variant];
    componentKey = variant;
  }
  // Then try the model's component name
  else if (sectionModel?.component && SECTION_COMPONENTS[sectionModel.component]) {
    Component = SECTION_COMPONENTS[sectionModel.component];
    componentKey = sectionModel.component;
  }
  // Fallback to section's default component
  else {
    Component = SECTION_FALLBACK[sectionKey];
    componentKey = sectionKey;
    
    if (!Component) {
      console.warn(`[SectionLoader] No component found for section: ${sectionKey}, variant: ${variant}`);
      return <SectionError sectionName={sectionKey} error={`Componente não encontrado: ${variant}`} />;
    }
    
    console.warn(`[SectionLoader] Using fallback component for: ${sectionKey}, variant: ${variant}`);
  }

  // 4. Prepare props for the component
  const legacyVariant = mapVariantToLegacy(variant);
  
  const componentProps = {
    content: content,
    previewOverride: previewOverride,
    variante: legacyVariant,
    disableAnimations: disableAnimations,
  };

  // Render with appropriate wrapper
  const isLazy = isLazyComponent(componentKey);

  if (isLazy) {
    return (
      <SectionErrorBoundary sectionName={sectionKey}>
        <Suspense fallback={<SectionFallback sectionName={sectionKey} />}>
          <Component {...componentProps} />
        </Suspense>
      </SectionErrorBoundary>
    );
  }
  return (
    <SectionErrorBoundary sectionName={sectionKey}>
      <Component {...componentProps} />
    </SectionErrorBoundary>
  );
});

SectionLoader.displayName = 'SectionLoader';

export default SectionLoader;
