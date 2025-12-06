import React, { Suspense, lazy, ComponentType, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { getSectionModel, SectionKey } from '@/lib/sectionModels';
import { LPContent } from '@/lib/lpContentApi';
import { toast } from '@/hooks/use-toast';

// ============================================================
// LAZY LOAD DE COMPONENTES
// ============================================================

// Componentes base (sempre carregados)
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
// REGISTRO DE COMPONENTES
// Usamos Record<string, any> porque cada componente tem seus próprios tipos de props
// ============================================================

const SECTION_COMPONENTS: Record<string, ComponentType<any>> = {
  // Base components
  Hero,
  HeroBasic: Hero,
  HeroSideImage: Hero,
  HeroDashboard: Hero,
  HeroCards: Hero,
  HeroCinematicVideo: Hero,
  HeroParallaxGlass: Hero,
  ComoFunciona,
  StepsIcons: ComoFunciona,
  StepsImageLeft: ComoFunciona,
  StepsVerticalTimeline: ComoFunciona,
  ParaQuemE,
  TargetGrid: ParaQuemE,
  TargetCards: ParaQuemE,
  TargetAvatars: ParaQuemE,
  TargetLitLine: ParaQuemE,
  Beneficios,
  BenefitsCarousel: Beneficios,
  BenefitsBentoGrid: Beneficios,
  BenefitsPictures: Beneficios,
  BenefitsMotionIcons: Beneficios,
  ProvasSociais,
  TestimonialsSlider: ProvasSociais,
  TestimonialsCards: ProvasSociais,
  TestimonialsProfileFeed: ProvasSociais,
  TestimonialsVideoGrid: ProvasSociais,
  Planos,
  PricingFeatureGrid: Planos,
  PricingTabs: Planos,
  FAQ,
  FAQCards: FAQ,
  FAQSections: FAQ,
  ChamadaFinal,
  CTAShowcase: ChamadaFinal,
  CTABannerGlass: ChamadaFinal,
  Rodape,
  FooterColumns: Rodape,
  MenuSection,
  
  // Premium components (lazy)
  HeroParallax,
  HeroSplit,
  Cards3DShowcase,
  FeaturesFloat,
  TestimonialCinematic,
  CTAFinal,
};

// ============================================================
// COMPONENTES AUXILIARES
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
  onRetry 
}: { 
  sectionName: string; 
  error?: string;
  onRetry?: () => void;
}) => (
  <div className="py-16 text-center bg-destructive/5 border border-destructive/20 rounded-lg mx-4 my-4">
    <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
    <p className="text-destructive font-medium mb-1">
      Não foi possível carregar a seção {sectionName}
    </p>
    <p className="text-muted-foreground text-sm mb-4">
      {error || 'Ocorreu um erro inesperado'}
    </p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="text-sm text-primary hover:underline"
      >
        Tentar novamente
      </button>
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
  { children: React.ReactNode; sectionName: string; onError?: (error: Error) => void },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; sectionName: string; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[SectionLoader] Error in ${this.props.sectionName}:`, error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SectionError 
          sectionName={this.props.sectionName} 
          error={this.state.error?.message}
          onRetry={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================================
// SECTION LOADER PRINCIPAL
// ============================================================

interface SectionLoaderProps {
  sectionKey: SectionKey;
  content?: LPContent;
  previewOverride?: LPContent;
  settings?: Record<string, string | undefined>;
  disableAnimations?: boolean;
}

export const SectionLoader: React.FC<SectionLoaderProps> = ({
  sectionKey,
  content = {},
  previewOverride,
  settings = {},
  disableAnimations = false,
}) => {
  const [retryKey, setRetryKey] = useState(0);

  // Determinar a variante a usar
  const variantFromContent = content?.variant as string | undefined;
  const variantFromSettings = settings[`${sectionKey}_variante`] as string | undefined;
  const variant = variantFromContent || variantFromSettings || 'modelo_a';

  // Buscar o modelo correspondente
  const sectionModel = getSectionModel(sectionKey, variant);
  
  if (!sectionModel) {
    console.warn(`[SectionLoader] No model found for section: ${sectionKey}, variant: ${variant}`);
    return (
      <SectionError 
        sectionName={sectionKey} 
        error={`Modelo não encontrado: ${variant}`}
      />
    );
  }

  // Determinar o componente a renderizar
  const componentName = sectionModel.component || getDefaultComponentName(sectionKey);
  const Component = SECTION_COMPONENTS[componentName];

  if (!Component) {
    console.warn(`[SectionLoader] Component not found: ${componentName}`);
    // Tentar fallback para componente base da seção
    const fallbackComponent = getFallbackComponent(sectionKey);
    if (fallbackComponent) {
      return (
        <SectionErrorBoundary 
          sectionName={sectionKey}
          onError={(error) => {
            toast({
              title: `Erro na seção ${sectionKey}`,
              description: error.message,
              variant: 'destructive',
            });
          }}
        >
          {React.createElement(fallbackComponent, {
            content,
            previewOverride,
            variante: mapVariantToLegacy(variant),
            disableAnimations,
          })}
        </SectionErrorBoundary>
      );
    }
    
    return (
      <SectionError 
        sectionName={sectionKey} 
        error={`Componente não encontrado: ${componentName}`}
      />
    );
  }

  // Verificar se é um componente lazy (premium)
  const isLazy = isPremiumComponent(componentName);

  const handleError = (error: Error) => {
    console.error(`[SectionLoader] Error rendering ${sectionKey}:`, error);
    toast({
      title: `Erro na seção ${sectionKey}`,
      description: 'A seção não pôde ser carregada. Tente recarregar a página.',
      variant: 'destructive',
    });
  };

  const props = {
    content,
    previewOverride,
    variante: mapVariantToLegacy(variant),
    disableAnimations,
  };

  if (isLazy) {
    return (
      <SectionErrorBoundary 
        key={retryKey}
        sectionName={sectionKey}
        onError={handleError}
      >
        <Suspense fallback={<SectionFallback sectionName={sectionKey} />}>
          <Component {...props} />
        </Suspense>
      </SectionErrorBoundary>
    );
  }

  return (
    <SectionErrorBoundary 
      key={retryKey}
      sectionName={sectionKey}
      onError={handleError}
    >
      <Component {...props} />
    </SectionErrorBoundary>
  );
};

// ============================================================
// UTILITÁRIOS
// ============================================================

function getDefaultComponentName(sectionKey: SectionKey): string {
  const map: Record<SectionKey, string> = {
    menu: 'MenuSection',
    hero: 'Hero',
    como_funciona: 'ComoFunciona',
    para_quem_e: 'ParaQuemE',
    beneficios: 'Beneficios',
    provas_sociais: 'ProvasSociais',
    planos: 'Planos',
    faq: 'FAQ',
    chamada_final: 'ChamadaFinal',
    rodape: 'Rodape',
  };
  return map[sectionKey] || 'Hero';
}

function getFallbackComponent(sectionKey: SectionKey): ComponentType<any> | null {
  const map: Record<SectionKey, ComponentType<any>> = {
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
  return map[sectionKey] || null;
}

function isPremiumComponent(componentName: string): boolean {
  const premiumComponents = [
    'HeroParallax',
    'HeroSplit',
    'Cards3DShowcase',
    'FeaturesFloat',
    'TestimonialCinematic',
    'CTAFinal',
  ];
  return premiumComponents.includes(componentName);
}

/**
 * Mapeia IDs de variante do novo sistema para o formato legado
 * que os componentes base ainda utilizam
 */
function mapVariantToLegacy(variant: string): string {
  // Se já é um formato legado, retorna
  if (variant.startsWith('modelo_')) {
    return variant;
  }
  
  // Extrai o sufixo após o hífen (ex: 'hero-modelo_a' -> 'modelo_a')
  const parts = variant.split('-');
  if (parts.length > 1) {
    const suffix = parts[parts.length - 1];
    if (suffix.startsWith('modelo_')) {
      return suffix;
    }
  }
  
  // Para variantes premium, usa o nome completo
  return variant;
}

export default SectionLoader;
