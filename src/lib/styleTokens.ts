// Style tokens system for granular LP customization
import { LPSettings } from './lpContentApi';

// Global style tokens with defaults
export const GLOBAL_STYLE_TOKENS = {
  // Colors
  style_global_primary: '#3B82F6',
  style_global_secondary: '#8B5CF6',
  style_global_accent: '#EC4899',
  style_global_background: '#F5F5F7',
  style_global_surface: '#FFFFFF',
  style_global_text_primary: '#1F2937',
  style_global_text_secondary: '#6B7280',
  
  // Typography
  style_global_font_family: 'Inter',
  style_global_heading_weight: '700',
  style_global_body_weight: '400',
  
  // Borders and radius
  style_global_radius_sm: '0.5rem',
  style_global_radius_lg: '1rem',
  
  // Shadows
  style_global_shadow_soft: '0 4px 24px -4px rgba(0,0,0,0.1)',
  style_global_shadow_strong: '0 8px 40px -8px rgba(0,0,0,0.2)',
};

// Per-section style tokens
export const SECTION_STYLE_TOKENS: Record<string, Record<string, string>> = {
  menu: {
    style_menu_bg: '',
    style_menu_text: '',
    style_menu_link_hover: '',
    style_menu_cta_bg: '',
    style_menu_cta_text: '',
  },
  hero: {
    style_hero_bg: '',
    style_hero_badge_bg: '',
    style_hero_badge_text: '',
    style_hero_title: '',
    style_hero_subtitle: '',
    style_hero_cta_primary_bg: '',
    style_hero_cta_primary_text: '',
    style_hero_cta_secondary_border: '',
    style_hero_cta_secondary_text: '',
  },
  beneficios: {
    style_beneficios_bg: '',
    style_beneficios_card_bg: '',
    style_beneficios_card_border: '',
    style_beneficios_icon: '',
    style_beneficios_title: '',
    style_beneficios_text: '',
  },
  provas_sociais: {
    style_provas_bg: '',
    style_provas_card_bg: '',
    style_provas_text: '',
    style_provas_highlight_bg: '',
  },
  planos: {
    style_planos_bg: '',
    style_planos_card_bg: '',
    style_planos_card_highlight_bg: '',
    style_planos_price: '',
    style_planos_cta_bg: '',
  },
  faq: {
    style_faq_bg: '',
    style_faq_question: '',
    style_faq_answer: '',
  },
  chamada_final: {
    style_chamada_bg: '',
    style_chamada_title: '',
    style_chamada_cta_bg: '',
    style_chamada_cta_text: '',
  },
  rodape: {
    style_rodape_bg: '',
    style_rodape_text: '',
    style_rodape_link: '',
    style_rodape_border: '',
  },
};

// Section display names for UI
export const SECTION_STYLE_LABELS: Record<string, string> = {
  menu: 'Menu',
  hero: 'Topo (Hero)',
  beneficios: 'Benefícios',
  provas_sociais: 'Provas Sociais',
  planos: 'Planos',
  faq: 'FAQ',
  chamada_final: 'Chamada Final',
  rodape: 'Rodapé',
};

// Token labels for UI
export const TOKEN_LABELS: Record<string, string> = {
  // Global
  style_global_primary: 'Cor primária',
  style_global_secondary: 'Cor secundária',
  style_global_accent: 'Cor de destaque',
  style_global_background: 'Fundo da página',
  style_global_surface: 'Fundo dos cards',
  style_global_text_primary: 'Texto principal',
  style_global_text_secondary: 'Texto secundário',
  style_global_font_family: 'Fonte',
  style_global_heading_weight: 'Peso dos títulos',
  style_global_body_weight: 'Peso do texto',
  style_global_radius_sm: 'Arredondamento pequeno',
  style_global_radius_lg: 'Arredondamento grande',
  style_global_shadow_soft: 'Sombra suave',
  style_global_shadow_strong: 'Sombra forte',
  
  // Section-specific
  style_menu_bg: 'Fundo do menu',
  style_menu_text: 'Cor do texto',
  style_menu_link_hover: 'Cor do hover nos links',
  style_menu_cta_bg: 'Fundo do botão CTA',
  style_menu_cta_text: 'Texto do botão CTA',
  
  style_hero_bg: 'Fundo do hero',
  style_hero_badge_bg: 'Fundo do badge',
  style_hero_badge_text: 'Texto do badge',
  style_hero_title: 'Cor do título',
  style_hero_subtitle: 'Cor do subtítulo',
  style_hero_cta_primary_bg: 'Fundo botão principal',
  style_hero_cta_primary_text: 'Texto botão principal',
  style_hero_cta_secondary_border: 'Borda botão secundário',
  style_hero_cta_secondary_text: 'Texto botão secundário',
  
  style_beneficios_bg: 'Fundo da seção',
  style_beneficios_card_bg: 'Fundo dos cards',
  style_beneficios_card_border: 'Borda dos cards',
  style_beneficios_icon: 'Cor dos ícones',
  style_beneficios_title: 'Cor dos títulos',
  style_beneficios_text: 'Cor do texto',
  
  style_provas_bg: 'Fundo da seção',
  style_provas_card_bg: 'Fundo dos cards',
  style_provas_text: 'Cor do texto',
  style_provas_highlight_bg: 'Fundo de destaque',
  
  style_planos_bg: 'Fundo da seção',
  style_planos_card_bg: 'Fundo dos cards',
  style_planos_card_highlight_bg: 'Fundo do card destacado',
  style_planos_price: 'Cor do preço',
  style_planos_cta_bg: 'Fundo do botão',
  
  style_faq_bg: 'Fundo da seção',
  style_faq_question: 'Cor das perguntas',
  style_faq_answer: 'Cor das respostas',
  
  style_chamada_bg: 'Fundo da seção',
  style_chamada_title: 'Cor do título',
  style_chamada_cta_bg: 'Fundo do botão',
  style_chamada_cta_text: 'Texto do botão',
  
  style_rodape_bg: 'Fundo do rodapé',
  style_rodape_text: 'Cor do texto',
  style_rodape_link: 'Cor dos links',
  style_rodape_border: 'Cor da borda',
};

// Font families available
export const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter (Moderna)' },
  { value: 'system-ui', label: 'Sistema' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegante)' },
];

// Font weights available
export const FONT_WEIGHTS = [
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semibold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
];

/**
 * Get a style token value, falling back to global or default
 */
export const getStyleToken = (
  settings: LPSettings,
  tokenKey: string,
  sectionKey?: string
): string => {
  // First check section-specific override
  if (sectionKey) {
    const sectionToken = `style_${sectionKey}_${tokenKey.replace('style_', '').replace(`${sectionKey}_`, '')}`;
    if (settings[sectionToken]) {
      return settings[sectionToken] as string;
    }
  }
  
  // Then check if it's a direct token
  if (settings[tokenKey]) {
    return settings[tokenKey] as string;
  }
  
  // Fall back to global token
  const globalKey = tokenKey.startsWith('style_global_') ? tokenKey : `style_global_${tokenKey}`;
  if (settings[globalKey]) {
    return settings[globalKey] as string;
  }
  
  // Finally, use default
  return GLOBAL_STYLE_TOKENS[globalKey as keyof typeof GLOBAL_STYLE_TOKENS] || '';
};

/**
 * Get all style tokens for a section with fallbacks applied
 */
export const getSectionStyles = (
  settings: LPSettings,
  sectionKey: string
): Record<string, string> => {
  const sectionTokens = SECTION_STYLE_TOKENS[sectionKey] || {};
  const result: Record<string, string> = {};
  
  for (const [key, defaultValue] of Object.entries(sectionTokens)) {
    const value = settings[key] as string;
    if (value) {
      result[key] = value;
    } else {
      // Try to map to a global token
      const tokenSuffix = key.replace(`style_${sectionKey}_`, '');
      const globalMapping: Record<string, string> = {
        'bg': 'style_global_background',
        'card_bg': 'style_global_surface',
        'text': 'style_global_text_primary',
        'title': 'style_global_text_primary',
        'subtitle': 'style_global_text_secondary',
        'cta_bg': 'style_global_primary',
        'cta_primary_bg': 'style_global_primary',
        'cta_text': 'style_global_surface',
        'cta_primary_text': 'style_global_surface',
        'icon': 'style_global_primary',
        'link': 'style_global_primary',
        'price': 'style_global_primary',
        'border': 'style_global_text_secondary',
        'link_hover': 'style_global_primary',
      };
      
      const globalKey = globalMapping[tokenSuffix];
      if (globalKey && settings[globalKey]) {
        result[key] = settings[globalKey] as string;
      } else if (globalKey && GLOBAL_STYLE_TOKENS[globalKey as keyof typeof GLOBAL_STYLE_TOKENS]) {
        result[key] = GLOBAL_STYLE_TOKENS[globalKey as keyof typeof GLOBAL_STYLE_TOKENS];
      } else {
        result[key] = defaultValue;
      }
    }
  }
  
  return result;
};

/**
 * Generate CSS custom properties from style tokens
 */
export const generateStyleVars = (settings: LPSettings): Record<string, string> => {
  const vars: Record<string, string> = {};
  
  // Global tokens
  for (const [key, defaultValue] of Object.entries(GLOBAL_STYLE_TOKENS)) {
    const value = (settings[key] as string) || defaultValue;
    const cssKey = key.replace('style_', '').replace(/_/g, '-');
    vars[`--lp-${cssKey}`] = value;
  }
  
  // Section tokens
  for (const [section, tokens] of Object.entries(SECTION_STYLE_TOKENS)) {
    for (const [key] of Object.entries(tokens)) {
      const value = settings[key] as string;
      if (value) {
        const cssKey = key.replace('style_', '').replace(/_/g, '-');
        vars[`--lp-${cssKey}`] = value;
      }
    }
  }
  
  return vars;
};

// Image tokens per section
export const SECTION_IMAGE_TOKENS: Record<string, { key: string; label: string }[]> = {
  menu: [
    { key: 'menu_logo_url', label: 'Logo do menu' },
  ],
  hero: [
    { key: 'hero_image_url', label: 'Imagem principal' },
    { key: 'hero_background_url', label: 'Imagem de fundo' },
  ],
  beneficios: [
    { key: 'beneficios_illustration_url', label: 'Ilustração' },
  ],
  provas_sociais: [
    { key: 'provas_avatar_default_url', label: 'Avatar padrão' },
  ],
  planos: [
    { key: 'planos_illustration_url', label: 'Ilustração' },
  ],
  chamada_final: [
    { key: 'chamada_background_url', label: 'Imagem de fundo' },
  ],
};

// ============================================================
// STYLE PRESET CLASSES (for stylePreset prop)
// ============================================================

import type { StylePreset, MotionPreset } from './sectionModels';

export const STYLE_PRESET_CLASSES: Record<StylePreset, {
  container: string;
  card: string;
  title: string;
  subtitle: string;
  accent: string;
  badge: string;
}> = {
  glass: {
    container: 'bg-background/60 backdrop-blur-xl',
    card: 'bg-card/70 backdrop-blur-md border border-border/50 shadow-soft',
    title: 'text-foreground',
    subtitle: 'text-muted-foreground',
    accent: 'bg-primary/10 text-primary',
    badge: 'bg-primary/10 text-primary border border-primary/20',
  },
  visionos: {
    container: 'bg-gradient-to-b from-background via-background/95 to-background/90',
    card: 'bg-card/90 backdrop-blur-2xl border border-border/30 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] rounded-3xl',
    title: 'text-foreground font-semibold',
    subtitle: 'text-muted-foreground/80',
    accent: 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary',
    badge: 'bg-gradient-to-r from-primary/15 to-accent/15 text-primary rounded-full px-4 py-1.5',
  },
  aurora: {
    container: 'bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden',
    card: 'bg-card/80 backdrop-blur-sm border border-primary/10 shadow-[0_0_40px_-10px_hsl(var(--primary)/0.2)]',
    title: 'text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text',
    subtitle: 'text-muted-foreground',
    accent: 'bg-gradient-to-r from-primary to-accent text-primary-foreground',
    badge: 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary animate-pulse',
  },
  neumorphic: {
    container: 'bg-muted/30',
    card: 'bg-card shadow-[6px_6px_12px_rgba(0,0,0,0.08),-6px_-6px_12px_rgba(255,255,255,0.8)] border-0 rounded-2xl',
    title: 'text-foreground',
    subtitle: 'text-muted-foreground',
    accent: 'bg-primary/10 text-primary shadow-inner',
    badge: 'bg-muted shadow-[inset_2px_2px_4px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] text-foreground',
  },
};

// ============================================================
// MOTION PRESET ANIMATIONS
// ============================================================

export const MOTION_PRESETS: Record<MotionPreset, {
  container: object;
  item: object;
  stagger?: number;
}> = {
  'fade-stagger': {
    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } },
    item: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } },
    stagger: 0.1,
  },
  parallax: {
    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } },
    item: { hidden: { opacity: 0, y: 60, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6 } } },
    stagger: 0.15,
  },
  tilt: {
    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } },
    item: { hidden: { opacity: 0, rotateX: -15, y: 30 }, visible: { opacity: 1, rotateX: 0, y: 0, transition: { duration: 0.5, type: 'spring' } } },
    stagger: 0.08,
  },
  spotlight: {
    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } },
    item: { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } } },
    stagger: 0.12,
  },
  magnetic: {
    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } },
    item: { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } } },
    stagger: 0.1,
  },
  'slide-in-right': {
    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } },
    item: { hidden: { opacity: 0, x: 100 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } },
    stagger: 0.1,
  },
  'slide-in-up': {
    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } },
    item: { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } },
    stagger: 0.1,
  },
  accordion: {
    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } },
    item: { hidden: { opacity: 0, height: 0 }, visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } } },
    stagger: 0.05,
  },
};

// ============================================================
// HELPER FUNCTIONS FOR PRESETS
// ============================================================

export function getStyleClasses(preset?: StylePreset) {
  return STYLE_PRESET_CLASSES[preset || 'glass'];
}

export function getMotionVariants(preset?: MotionPreset) {
  return MOTION_PRESETS[preset || 'fade-stagger'];
}

export function getCardClassName(stylePreset?: StylePreset, baseClass?: string): string {
  const preset = STYLE_PRESET_CLASSES[stylePreset || 'glass'];
  return `${baseClass || ''} ${preset.card}`.trim();
}

export function getContainerClassName(stylePreset?: StylePreset, baseClass?: string): string {
  const preset = STYLE_PRESET_CLASSES[stylePreset || 'glass'];
  return `${baseClass || ''} ${preset.container}`.trim();
}
