/**
 * Button Variants System - Modelos de Botão
 * Define variantes de estilo para botões CTA nas seções
 */

export type ButtonVariant = 
  | 'primary_solid'
  | 'secondary_outline'
  | 'ghost'
  | 'pill'
  | 'soft_glass';

export type ButtonRadius = 'small' | 'medium' | 'large' | 'full';

export interface ButtonStyleConfig {
  variant: ButtonVariant;
  colorOverride?: string;
  radius?: ButtonRadius;
}

// Classes base para cada variante
export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary_solid: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25',
  secondary_outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
  pill: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md',
  soft_glass: 'bg-white/10 backdrop-blur-md text-foreground border border-white/20 hover:bg-white/20',
};

// Classes de radius
export const BUTTON_RADIUS_CLASSES: Record<ButtonRadius, string> = {
  small: 'rounded-md',
  medium: 'rounded-lg',
  large: 'rounded-xl',
  full: 'rounded-full',
};

// Config padrão de cada variante
export const BUTTON_VARIANT_CONFIG: Record<ButtonVariant, { 
  name: string;
  description: string;
  defaultRadius: ButtonRadius;
}> = {
  primary_solid: {
    name: 'Sólido Primário',
    description: 'Botão preenchido com cor primária',
    defaultRadius: 'large',
  },
  secondary_outline: {
    name: 'Contorno',
    description: 'Botão com borda e fundo transparente',
    defaultRadius: 'large',
  },
  ghost: {
    name: 'Fantasma',
    description: 'Botão minimalista sem fundo',
    defaultRadius: 'medium',
  },
  pill: {
    name: 'Pílula',
    description: 'Botão arredondado estilo pílula',
    defaultRadius: 'full',
  },
  soft_glass: {
    name: 'Glass Suave',
    description: 'Botão translúcido com efeito glass',
    defaultRadius: 'large',
  },
};

/**
 * Gera as classes CSS para um botão baseado na config
 */
export function getButtonClasses(config: Partial<ButtonStyleConfig> = {}): string {
  const variant = config.variant || 'primary_solid';
  const radius = config.radius || BUTTON_VARIANT_CONFIG[variant].defaultRadius;
  
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 touch-manipulation';
  const variantClasses = BUTTON_VARIANT_CLASSES[variant];
  const radiusClasses = BUTTON_RADIUS_CLASSES[radius];
  
  return `${baseClasses} ${variantClasses} ${radiusClasses}`;
}

/**
 * Gera estilo inline para override de cor
 */
export function getButtonColorStyle(colorOverride?: string): React.CSSProperties {
  if (!colorOverride) return {};
  
  return {
    backgroundColor: colorOverride,
    borderColor: colorOverride,
  };
}

/**
 * Lista de variantes disponíveis para seleção no editor
 */
export const AVAILABLE_BUTTON_VARIANTS: ButtonVariant[] = [
  'primary_solid',
  'secondary_outline',
  'ghost',
  'pill',
  'soft_glass',
];

/**
 * Lista de opções de radius para seleção no editor
 */
export const AVAILABLE_BUTTON_RADIUS: ButtonRadius[] = [
  'small',
  'medium',
  'large',
  'full',
];
