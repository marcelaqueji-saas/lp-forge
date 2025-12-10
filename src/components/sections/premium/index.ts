// Premium section templates
export { default as HeroParallax } from './HeroParallax';
export { HeroSplit } from './HeroSplit';
export { Cards3DShowcase } from './Cards3DShowcase';
export { FeaturesFloat } from './FeaturesFloat';
export { TestimonialCinematic } from './TestimonialCinematic';
export { CTAFinal } from './CTAFinal';
export { SectionSeparator } from './SectionSeparator';

// Template registry for dynamic loading
export const PREMIUM_TEMPLATES: Record<string, {
  component: string;
  section: string;
  name: string;
  description: string;
  category: string;
  minPlan: 'free' | 'pro' | 'premium';
}> = {
  'hero_parallax': {
    component: 'HeroParallax',
    section: 'hero',
    name: 'Parallax Mount',
    description: 'Hero fullscreen com camadas em parallax, fade+up+blur em texto e CTA magnético',
    category: 'animado',
    minPlan: 'pro',
  },
  'hero_split': {
    component: 'HeroSplit',
    section: 'hero',
    name: 'Split Navigation',
    description: 'Colunas verticais interativas com hover expandindo',
    category: 'animado',
    minPlan: 'pro',
  },
  'showcase_3d': {
    component: 'Cards3DShowcase',
    section: 'beneficios',
    name: '3D Cards Slider',
    description: 'Cards em 3D com rotateY e destaque central',
    category: 'animado',
    minPlan: 'pro',
  },
  'features_float': {
    component: 'FeaturesFloat',
    section: 'beneficios',
    name: 'Float Minimal',
    description: 'Benefícios com ícones e flutuação leve',
    category: 'avançado',
    minPlan: 'free',
  },
  'testimonial_cinematic': {
    component: 'TestimonialCinematic',
    section: 'provas_sociais',
    name: 'Cinematic',
    description: 'Depoimento central com fade/shadow e alternância suave',
    category: 'animado',
    minPlan: 'pro',
  },
  'cta_final_animated': {
    component: 'CTAFinal',
    section: 'chamada_final',
    name: 'CTA Animado',
    description: 'Chamada final com partículas flutuantes e botão animado',
    category: 'animado',
    minPlan: 'free',
  },
};

// Separator types
export const SEPARATOR_TYPES = [
  { id: 'wave', name: 'Wave', description: 'Onda animada suave' },
  { id: 'diagonal', name: 'Diagonal Cut', description: 'Corte diagonal simples' },
  { id: 'zigzag', name: 'Zig-Zag', description: 'Padrão zig-zag' },
  { id: 'glass', name: 'Glass Overlap', description: 'Sobreposição com efeito glass' },
] as const;
