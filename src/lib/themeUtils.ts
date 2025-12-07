import { LPSettings } from './lpContentApi';
import { GLOBAL_STYLE_TOKENS, getSectionStyles } from './styleTokens';

/**
 * Apply theme tokens from LP settings to the document as CSS custom properties
 */
export function applyThemeToLP(settings: LPSettings): void {
  const root = document.documentElement;

  // Apply global tokens
  for (const [key, defaultValue] of Object.entries(GLOBAL_STYLE_TOKENS)) {
    const value = (settings[key] as string) || defaultValue;
    const cssKey = key.replace('style_global_', '').replace(/_/g, '-');
    root.style.setProperty(`--lp-${cssKey}`, value);
  }

  // Apply section-specific tokens
  const sections = ['menu', 'hero', 'beneficios', 'provas_sociais', 'planos', 'faq', 'chamada_final', 'rodape'];
  
  for (const section of sections) {
    const sectionStyles = getSectionStyles(settings, section);
    for (const [key, value] of Object.entries(sectionStyles)) {
      if (value) {
        const cssKey = key.replace('style_', '').replace(/_/g, '-');
        root.style.setProperty(`--lp-${cssKey}`, value);
      }
    }
  }
}

/**
 * Remove all LP theme custom properties from document
 */
export function removeThemeFromLP(): void {
  const root = document.documentElement;
  
  // Remove all --lp-* custom properties
  for (const key of Object.keys(GLOBAL_STYLE_TOKENS)) {
    const cssKey = key.replace('style_global_', '').replace(/_/g, '-');
    root.style.removeProperty(`--lp-${cssKey}`);
  }
}

/**
 * Generate inline style object from settings for a section
 */
export function getSectionInlineStyles(
  settings: LPSettings, 
  sectionKey: string
): React.CSSProperties {
  const styles: React.CSSProperties = {};
  const sectionStyles = getSectionStyles(settings, sectionKey);

  // Map token keys to CSS properties
  const tokenToCSS: Record<string, keyof React.CSSProperties> = {
    [`style_${sectionKey}_bg`]: 'backgroundColor',
    [`style_${sectionKey}_text`]: 'color',
    [`style_${sectionKey}_title`]: 'color',
  };

  for (const [tokenKey, cssProperty] of Object.entries(tokenToCSS)) {
    const value = sectionStyles[tokenKey];
    if (value) {
      (styles as Record<string, string>)[cssProperty as string] = value;
    }
  }

  return styles;
}

/**
 * Check if a color value is valid
 */
export function isValidColor(color: string): boolean {
  if (!color) return false;
  
  // Check hex
  if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color)) return true;
  
  // Check rgb/rgba
  if (/^rgba?\(/.test(color)) return true;
  
  // Check hsl/hsla
  if (/^hsla?\(/.test(color)) return true;
  
  // Check named colors (basic check)
  const namedColors = ['transparent', 'inherit', 'currentColor', 'white', 'black'];
  if (namedColors.includes(color.toLowerCase())) return true;
  
  return false;
}

/**
 * Convert hex color to HSL string
 */
export function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
