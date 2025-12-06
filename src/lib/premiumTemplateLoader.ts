import { lazy, ComponentType } from 'react';

// Lazy load premium templates
const HeroParallax = lazy(() => import('@/components/sections/premium/HeroParallax'));
const HeroSplit = lazy(() => import('@/components/sections/premium/HeroSplit'));
const Cards3DShowcase = lazy(() => import('@/components/sections/premium/Cards3DShowcase'));
const FeaturesFloat = lazy(() => import('@/components/sections/premium/FeaturesFloat'));
const TestimonialCinematic = lazy(() => import('@/components/sections/premium/TestimonialCinematic'));
const CTAFinal = lazy(() => import('@/components/sections/premium/CTAFinal'));

// Component registry
export const PREMIUM_COMPONENT_MAP: Record<string, ComponentType<any>> = {
  HeroParallax,
  HeroSplit,
  Cards3DShowcase,
  FeaturesFloat,
  TestimonialCinematic,
  CTAFinal,
};

// Get premium component by name
export const getPremiumComponent = (componentName: string): ComponentType<any> | null => {
  return PREMIUM_COMPONENT_MAP[componentName] || null;
};

// Check if variant is a premium template
export const isPremiumVariant = (variantId: string): boolean => {
  const premiumVariants = [
    'hero_parallax',
    'hero_split',
    'showcase_3d',
    'features_float',
    'testimonial_cinematic',
    'cta_final_animated',
  ];
  return premiumVariants.includes(variantId);
};

// Map variant ID to component name
export const variantToComponent: Record<string, string> = {
  hero_parallax: 'HeroParallax',
  hero_split: 'HeroSplit',
  showcase_3d: 'Cards3DShowcase',
  features_float: 'FeaturesFloat',
  testimonial_cinematic: 'TestimonialCinematic',
  cta_final_animated: 'CTAFinal',
};

// Get component for variant
export const getComponentForVariant = (variantId: string): ComponentType<any> | null => {
  const componentName = variantToComponent[variantId];
  if (componentName) {
    return PREMIUM_COMPONENT_MAP[componentName] || null;
  }
  return null;
};

// Check if device can handle animations
export const canHandleAnimations = (): boolean => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return false;

  // Check for low-end device indicators
  const connection = (navigator as any).connection;
  if (connection) {
    const effectiveType = connection.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return false;
  }

  // Check device memory (if available)
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory && deviceMemory < 4) return false;

  return true;
};

// Log template error for monitoring
export const logTemplateError = async (
  templateId: string,
  errorMessage: string,
  clientCapability: {
    reducedMotion: boolean;
    connectionType?: string;
    deviceMemory?: number;
  }
) => {
  try {
    // This would normally log to Supabase system_logs
    console.error('[Template Error]', {
      templateId,
      errorMessage,
      clientCapability,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    // Silently fail
  }
};
