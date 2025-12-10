// ============================================================
// PREMIUM PRESETS SYSTEM
// ============================================================

export type BackgroundStyle =
  | 'default'
  | 'gradient-animated'
  | 'mesh'
  | 'glass-subtle'
  | 'glass-medium'
  | 'glass-heavy'
  | 'visionos-panel';

export type OrnamentStyle =
  | 'none'
  | 'orbs'
  | 'blobs'
  | 'shine'
  | 'spotlight';

export type AnimationPreset =
  | 'none'
  | 'fade-up'
  | 'fade-left'
  | 'fade-right'
  | 'scale-in'
  | 'float';

export type ButtonStyle =
  | 'default'
  | 'glass'
  | 'gradient'
  | 'glow'
  | 'liquid'
  | 'neumorphic'
  | 'tilt'
  | 'magnetic';

export type CursorEffect =
  | 'none'
  | 'tilt'
  | 'spotlight'
  | 'magnetic';

export type SeparatorStyle =
  | 'none'
  | 'line'
  | 'gradient'
  | 'glow'
  | 'wave'
  | 'diagonal'
  | 'curve';

export type CardStyle =
  | 'default'
  | 'soft'
  | 'solid'
  | 'outline'
  | 'glass-subtle'
  | 'glass-medium'
  | 'glass-heavy';

export interface PremiumVisualConfig {
  background_style?: BackgroundStyle;
  ornament_style?: OrnamentStyle;
  animation_preset?: AnimationPreset;
  button_style?: ButtonStyle;
  cursor_effect?: CursorEffect;
  separator_before?: SeparatorStyle;
  separator_after?: SeparatorStyle;
  card_style?: CardStyle;
}

// Config base de fallback
const DEFAULT_VISUAL_CONFIG: Required<PremiumVisualConfig> = {
  background_style: 'default',
  ornament_style: 'none',
  animation_preset: 'none',
  button_style: 'default',
  cursor_effect: 'none',
  separator_before: 'none',
  separator_after: 'none',
  card_style: 'default',
};

// ============================================================
// PRESET OPTIONS (for UI dropdowns)
// ============================================================

export const BACKGROUND_OPTIONS: { value: BackgroundStyle; label: string; premium?: boolean }[] = [
  { value: 'default', label: 'Padrão' },
  { value: 'gradient-animated', label: 'Gradiente Animado', premium: true },
  { value: 'mesh', label: 'Mesh Gradient', premium: true },
  { value: 'glass-subtle', label: 'Glass Sutil' },
  { value: 'glass-medium', label: 'Glass Médio' },
  { value: 'glass-heavy', label: 'Glass Forte', premium: true },
  { value: 'visionos-panel', label: 'VisionOS Panel', premium: true },
];

export const ORNAMENT_OPTIONS: { value: OrnamentStyle; label: string; premium?: boolean }[] = [
  { value: 'none', label: 'Nenhum' },
  { value: 'orbs', label: 'Orbs Flutuantes', premium: true },
  { value: 'blobs', label: 'Blobs Morphing', premium: true },
  { value: 'shine', label: 'Brilho' },
  { value: 'spotlight', label: 'Spotlight', premium: true },
];

export const ANIMATION_OPTIONS: { value: AnimationPreset; label: string }[] = [
  { value: 'none', label: 'Sem animação' },
  { value: 'fade-up', label: 'Fade Up' },
  { value: 'fade-left', label: 'Fade Left' },
  { value: 'fade-right', label: 'Fade Right' },
  { value: 'scale-in', label: 'Scale In' },
  { value: 'float', label: 'Float' },
];

export const BUTTON_OPTIONS: { value: ButtonStyle; label: string; premium?: boolean }[] = [
  { value: 'default', label: 'Padrão' },
  { value: 'glass', label: 'Glass', premium: true },
  { value: 'gradient', label: 'Gradiente' },
  { value: 'glow', label: 'Glow', premium: true },
  { value: 'liquid', label: 'Liquid', premium: true },
  { value: 'neumorphic', label: 'Neumorphic', premium: true },
  { value: 'tilt', label: 'Tilt 3D', premium: true },
  { value: 'magnetic', label: 'Magnético', premium: true },
];

export const CURSOR_OPTIONS: { value: CursorEffect; label: string; premium?: boolean }[] = [
  { value: 'none', label: 'Nenhum' },
  { value: 'tilt', label: 'Tilt 3D', premium: true },
  { value: 'spotlight', label: 'Spotlight', premium: true },
  { value: 'magnetic', label: 'Magnético', premium: true },
];

export const SEPARATOR_OPTIONS: { value: SeparatorStyle; label: string; premium?: boolean }[] = [
  { value: 'none', label: 'Nenhum' },
  { value: 'line', label: 'Linha' },
  { value: 'gradient', label: 'Gradiente' },
  { value: 'glow', label: 'Glow', premium: true },
  { value: 'wave', label: 'Onda', premium: true },
  { value: 'diagonal', label: 'Diagonal', premium: true },
  { value: 'curve', label: 'Curva', premium: true },
];

export const CARD_OPTIONS: { value: CardStyle; label: string; premium?: boolean }[] = [
  { value: 'default', label: 'Padrão' },
  { value: 'soft', label: 'Suave' },
  { value: 'solid', label: 'Sólido' },
  { value: 'outline', label: 'Com borda' },
  { value: 'glass-subtle', label: 'Vidro leve', premium: true },
  { value: 'glass-medium', label: 'Vidro médio', premium: true },
  { value: 'glass-heavy', label: 'Vidro intenso', premium: true },
];

// ============================================================
// CSS CLASS MAPPING
// ============================================================

export const BACKGROUND_CLASSES: Record<BackgroundStyle, string> = {
  default: '',
  'gradient-animated': 'premium-bg-gradient-animated',
  mesh: 'premium-bg-mesh',
  'glass-subtle': 'premium-glass-subtle',
  'glass-medium': 'premium-glass-medium',
  'glass-heavy': 'premium-glass-heavy',
  'visionos-panel': 'premium-visionos-panel',
};

export const ORNAMENT_CLASSES: Record<OrnamentStyle, string> = {
  none: '',
  orbs: 'premium-ornament-orbs',
  blobs: 'premium-ornament-blobs',
  shine: 'premium-ornament-shine',
  spotlight: 'premium-ornament-spotlight',
};

export const ANIMATION_CLASSES: Record<AnimationPreset, string> = {
  none: '',
  'fade-up': 'premium-animate-fade-up',
  'fade-left': 'premium-animate-fade-left',
  'fade-right': 'premium-animate-fade-right',
  'scale-in': 'premium-animate-scale-in',
  float: 'premium-animate-float',
};

export const BUTTON_CLASSES: Record<ButtonStyle, string> = {
  default: '',
  glass: 'premium-btn-glass',
  gradient: 'premium-btn-gradient',
  glow: 'premium-btn-glow',
  liquid: 'premium-btn-liquid',
  neumorphic: 'premium-btn-neumorphic',
  tilt: 'premium-btn-tilt',
  magnetic: 'premium-btn-magnetic',
};

export const SEPARATOR_CLASSES: Record<SeparatorStyle, string> = {
  none: '',
  line: 'premium-separator-line',
  gradient: 'premium-separator-gradient',
  glow: 'premium-separator-glow',
  wave: 'premium-separator-wave',
  diagonal: 'premium-separator-diagonal',
  curve: 'premium-separator-curve',
};

export const CARD_CLASSES: Record<CardStyle, string> = {
  default: '',
  soft: 'premium-card-soft',
  solid: 'premium-card-solid',
  outline: 'premium-card-outline',
  'glass-subtle': 'premium-card-glass-subtle',
  'glass-medium': 'premium-card-glass-medium',
  'glass-heavy': 'premium-card-glass-heavy',
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function readVisualConfigFromContent(
  content: Record<string, any>
): Partial<PremiumVisualConfig> {
  const raw = content.visual_config ?? content._visual_config;

  if (!raw) return {};

  if (typeof raw === 'object') {
    return raw as Partial<PremiumVisualConfig>;
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed as Partial<PremiumVisualConfig>;
      }
    } catch {
      // ignore JSON errors
    }
  }

  return {};
}

export function getVisualClasses(
  config: PremiumVisualConfig,
  reducedMotion = false
): string {
  const classes: string[] = [];

  if (config.background_style && config.background_style !== 'default') {
    classes.push(BACKGROUND_CLASSES[config.background_style]);
  }

  if (config.ornament_style && config.ornament_style !== 'none') {
    classes.push(ORNAMENT_CLASSES[config.ornament_style]);
  }

  if (!reducedMotion && config.animation_preset && config.animation_preset !== 'none') {
    classes.push(ANIMATION_CLASSES[config.animation_preset]);
  }

  return classes.filter(Boolean).join(' ');
}

export function getButtonClasses(style: ButtonStyle = 'default'): string {
  return BUTTON_CLASSES[style] || '';
}

export function getSeparatorClasses(
  style: SeparatorStyle = 'none',
  position: 'before' | 'after'
): string {
  if (style === 'none') return '';
  return `${SEPARATOR_CLASSES[style]} separator-${position}`;
}

export function getCardClasses(style: CardStyle = 'default'): string {
  return CARD_CLASSES[style] || '';
}

export function parseVisualConfig(content: Record<string, any>): PremiumVisualConfig {
  const fromJson = readVisualConfigFromContent(content);

  return {
    background_style:
      (fromJson.background_style as BackgroundStyle) ||
      (content.background_style as BackgroundStyle) ||
      DEFAULT_VISUAL_CONFIG.background_style,

    ornament_style:
      (fromJson.ornament_style as OrnamentStyle) ||
      (content.ornament_style as OrnamentStyle) ||
      DEFAULT_VISUAL_CONFIG.ornament_style,

    animation_preset:
      (fromJson.animation_preset as AnimationPreset) ||
      (content.animation_preset as AnimationPreset) ||
      DEFAULT_VISUAL_CONFIG.animation_preset,

    button_style:
      (fromJson.button_style as ButtonStyle) ||
      (content.button_style as ButtonStyle) ||
      DEFAULT_VISUAL_CONFIG.button_style,

    cursor_effect:
      (fromJson.cursor_effect as CursorEffect) ||
      (content.cursor_effect as CursorEffect) ||
      DEFAULT_VISUAL_CONFIG.cursor_effect,

    separator_before:
      (fromJson.separator_before as SeparatorStyle) ||
      (content.separator_before as SeparatorStyle) ||
      DEFAULT_VISUAL_CONFIG.separator_before,

    separator_after:
      (fromJson.separator_after as SeparatorStyle) ||
      (content.separator_after as SeparatorStyle) ||
      DEFAULT_VISUAL_CONFIG.separator_after,

    card_style:
      (fromJson.card_style as CardStyle) ||
      (content.card_style as CardStyle) ||
      DEFAULT_VISUAL_CONFIG.card_style,
  };
}

export function buildVisualConfigPayload(
  partial: Partial<PremiumVisualConfig>
): PremiumVisualConfig {
  return {
    background_style: partial.background_style ?? DEFAULT_VISUAL_CONFIG.background_style,
    ornament_style: partial.ornament_style ?? DEFAULT_VISUAL_CONFIG.ornament_style,
    animation_preset: partial.animation_preset ?? DEFAULT_VISUAL_CONFIG.animation_preset,
    button_style: partial.button_style ?? DEFAULT_VISUAL_CONFIG.button_style,
    cursor_effect: partial.cursor_effect ?? DEFAULT_VISUAL_CONFIG.cursor_effect,
    separator_before: partial.separator_before ?? DEFAULT_VISUAL_CONFIG.separator_before,
    separator_after: partial.separator_after ?? DEFAULT_VISUAL_CONFIG.separator_after,
    card_style: partial.card_style ?? DEFAULT_VISUAL_CONFIG.card_style,
  };
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
