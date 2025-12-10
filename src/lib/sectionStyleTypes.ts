/**
 * Section Style Types - Tipos para edição de estilo das seções
 * Define estruturas para background, cores e configurações visuais
 */

// ============================================================
// TIPOS DE FUNDO (BACKGROUND)
// ============================================================

export type BackgroundType = 'solid' | 'gradient' | 'image';

export interface BackgroundConfig {
  type: BackgroundType;
  color?: string;
  gradient?: string;
  imageUrl?: string;
  overlay?: string; // cor de overlay sobre imagem
  opacity?: number; // 0-100
}

// ============================================================
// MODO DE FUNDO (GLOBAL vs POR SEÇÃO)
// ============================================================

export type BackgroundMode = 'global' | 'per_section';

// ============================================================
// CORES DA SEÇÃO
// ============================================================

export interface SectionColors {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  textColor?: string;
}

// ============================================================
// CONFIGURAÇÃO COMPLETA DE ESTILO DA SEÇÃO
// ============================================================

export interface SectionStyleConfig {
  background?: BackgroundConfig;
  colors?: SectionColors;
  buttonVariant?: string;
  buttonColorOverride?: string;
  buttonRadius?: string;
}

// ============================================================
// CONFIGURAÇÃO GLOBAL DA LP (lp_settings)
// ============================================================

export interface LPGlobalStyleSettings {
  // Modo de fundo
  background_mode?: BackgroundMode;
  
  // Fundo global
  background_global_type?: BackgroundType;
  background_global_color?: string;
  background_global_gradient?: string;
  background_global_image_url?: string;
  
  // Cores globais
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  text_color?: string;
  
  // Botão global
  button_variant?: string;
  button_color_override?: string;
  button_radius?: string;
}

// ============================================================
// CONFIGURAÇÃO POR SEÇÃO (em lp_content)
// ============================================================

export interface SectionContentStyle {
  // Fundo da seção (override)
  background_type?: BackgroundType;
  background_color?: string;
  background_gradient?: string;
  background_image_url?: string;
  
  // Cores da seção (override)
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  text_color?: string;
  
  // Botão da seção (override)
  button_variant?: string;
  button_color_override?: string;
  button_radius?: string;
}

// ============================================================
// PRESETS DE GRADIENTE
// ============================================================

export const GRADIENT_PRESETS = [
  { name: 'Sunset', value: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'Sky', value: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' },
  { name: 'Night', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { name: 'Rose', value: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)' },
  { name: 'Minimal Light', value: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)' },
  { name: 'Minimal Dark', value: 'linear-gradient(180deg, hsl(220 20% 10%) 0%, hsl(220 20% 5%) 100%)' },
  { name: 'Primary Glow', value: 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--background)) 100%)' },
];

// ============================================================
// PRESETS DE CORES
// ============================================================

export const COLOR_PRESETS = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0',
  '#0f172a', '#1e293b', '#334155', '#475569',
  '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af',
  '#10b981', '#059669', '#047857', '#065f46',
  '#f59e0b', '#d97706', '#b45309', '#92400e',
  '#ef4444', '#dc2626', '#b91c1c', '#991b1b',
  '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6',
  '#ec4899', '#db2777', '#be185d', '#9d174d',
];

// ============================================================
// UTILITÁRIOS
// ============================================================

/**
 * Gera CSS styles a partir da config de background
 */
export function getBackgroundStyle(config?: BackgroundConfig): React.CSSProperties {
  if (!config) return {};
  
  const styles: React.CSSProperties = {};
  
  switch (config.type) {
    case 'solid':
      if (config.color) styles.backgroundColor = config.color;
      break;
    case 'gradient':
      if (config.gradient) styles.background = config.gradient;
      break;
    case 'image':
      if (config.imageUrl) {
        styles.backgroundImage = `url(${config.imageUrl})`;
        styles.backgroundSize = 'cover';
        styles.backgroundPosition = 'center';
      }
      break;
  }
  
  return styles;
}

/**
 * Gera CSS styles a partir das cores da seção
 */
export function getSectionColorStyles(colors?: SectionColors): React.CSSProperties {
  if (!colors) return {};
  
  const styles: Record<string, string> = {};
  
  if (colors.primaryColor) styles['--section-primary'] = colors.primaryColor;
  if (colors.secondaryColor) styles['--section-secondary'] = colors.secondaryColor;
  if (colors.accentColor) styles['--section-accent'] = colors.accentColor;
  if (colors.textColor) styles.color = colors.textColor;
  
  return styles as React.CSSProperties;
}

/**
 * Mescla configurações globais com override por seção
 */
export function mergeSectionStyles(
  globalSettings: LPGlobalStyleSettings,
  sectionContent: SectionContentStyle
): SectionStyleConfig {
  const backgroundMode = globalSettings.background_mode || 'global';
  
  // Se modo global, usa config global. Se per_section, usa override da seção (ou global como fallback)
  const useGlobalBg = backgroundMode === 'global' || !sectionContent.background_type;
  
  const background: BackgroundConfig = useGlobalBg
    ? {
        type: globalSettings.background_global_type || 'solid',
        color: globalSettings.background_global_color,
        gradient: globalSettings.background_global_gradient,
        imageUrl: globalSettings.background_global_image_url,
      }
    : {
        type: sectionContent.background_type || 'solid',
        color: sectionContent.background_color,
        gradient: sectionContent.background_gradient,
        imageUrl: sectionContent.background_image_url,
      };
  
  const colors: SectionColors = {
    primaryColor: sectionContent.primary_color || globalSettings.primary_color,
    secondaryColor: sectionContent.secondary_color || globalSettings.secondary_color,
    accentColor: sectionContent.accent_color || globalSettings.accent_color,
    textColor: sectionContent.text_color || globalSettings.text_color,
  };
  
  return {
    background,
    colors,
    buttonVariant: sectionContent.button_variant || globalSettings.button_variant,
    buttonColorOverride: sectionContent.button_color_override || globalSettings.button_color_override,
    buttonRadius: sectionContent.button_radius || globalSettings.button_radius,
  };
}
