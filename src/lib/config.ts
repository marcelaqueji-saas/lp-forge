/**
 * Configuração central do sistema
 * 
 * TODO: Configurar variáveis de ambiente conforme necessário:
 * - VITE_BASE_URL: URL base do frontend (ex: https://seudominio.com)
 * - VITE_CDN_BASE_URL: URL base da CDN para imagens otimizadas
 * - VITE_CORS_ALLOWED_ORIGINS: Origens permitidas separadas por vírgula
 * - VITE_SECURITY_MODE: 'strict' | 'permissive' (default: 'permissive' em dev)
 * - VITE_DEFAULT_GA4_ID: ID padrão do GA4 (opcional)
 * - VITE_DEFAULT_META_PIXEL_ID: ID padrão do Meta Pixel (opcional)
 * - VITE_DEFAULT_TIKTOK_PIXEL_ID: ID padrão do TikTok Pixel (opcional)
 * - VITE_ACME_EMAIL: Email para certificados Let's Encrypt
 * - VITE_ACME_STAGING: 'true' para usar staging do Let's Encrypt
 */

// Detectar ambiente
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// URLs base
export const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_BASE_URL;
  if (envUrl) return envUrl;
  
  // Em desenvolvimento, usar localhost
  if (isDevelopment) {
    return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080';
  }
  
  // Em produção sem config, usar origin atual
  return typeof window !== 'undefined' ? window.location.origin : '';
};

// CDN para imagens otimizadas
// TODO: Configurar VITE_CDN_BASE_URL quando tiver CDN (Cloudflare Images, etc)
export const getCDNBaseUrl = (): string | null => {
  return import.meta.env.VITE_CDN_BASE_URL || null;
};

/**
 * Retorna URL otimizada para imagem
 * Se CDN estiver configurada, usa CDN. Caso contrário, retorna URL original.
 * 
 * @param originalUrl URL original da imagem
 * @param options Opções de otimização (width, quality, format)
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  options?: { width?: number; quality?: number; format?: 'webp' | 'avif' | 'auto' }
): string => {
  const cdnBase = getCDNBaseUrl();
  
  // Se não tiver CDN configurada, retorna URL original
  if (!cdnBase) return originalUrl;
  
  // Se já for uma URL da CDN, retorna como está
  if (originalUrl.startsWith(cdnBase)) return originalUrl;
  
  // TODO: Implementar transformação de URL conforme CDN escolhida
  // Exemplo para Cloudflare Images:
  // return `${cdnBase}/cdn-cgi/image/width=${options?.width || 800},quality=${options?.quality || 80},format=${options?.format || 'auto'}/${encodeURIComponent(originalUrl)}`;
  
  return originalUrl;
};

// Configuração CORS
export const getCorsAllowedOrigins = (): string[] => {
  const envOrigins = import.meta.env.VITE_CORS_ALLOWED_ORIGINS;
  
  if (envOrigins) {
    return envOrigins.split(',').map((o: string) => o.trim());
  }
  
  // Em desenvolvimento, permitir localhost
  if (isDevelopment) {
    return ['http://localhost:8080', 'http://localhost:5173', 'http://127.0.0.1:8080'];
  }
  
  // Em produção sem config, usar origin atual
  return [getBaseUrl()];
};

// Modo de segurança
export const getSecurityMode = (): 'strict' | 'permissive' => {
  const mode = import.meta.env.VITE_SECURITY_MODE;
  if (mode === 'strict') return 'strict';
  
  // Em produção, default é strict. Em dev, permissive.
  return isProduction ? 'strict' : 'permissive';
};

// Security headers recomendados
export const getSecurityHeaders = (): Record<string, string> => {
  const mode = getSecurityMode();
  
  const baseHeaders: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
  
  if (mode === 'strict') {
    return {
      ...baseHeaders,
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      // TODO: Configurar Content-Security-Policy conforme necessidades específicas
      // 'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; ...",
    };
  }
  
  return baseHeaders;
};

// Tracking defaults
export const getDefaultGA4Id = (): string | null => {
  return import.meta.env.VITE_DEFAULT_GA4_ID || null;
};

export const getDefaultMetaPixelId = (): string | null => {
  return import.meta.env.VITE_DEFAULT_META_PIXEL_ID || null;
};

export const getDefaultTikTokPixelId = (): string | null => {
  return import.meta.env.VITE_DEFAULT_TIKTOK_PIXEL_ID || null;
};

// ACME/SSL config (para deploy)
export const getACMEConfig = () => ({
  email: import.meta.env.VITE_ACME_EMAIL || '',
  staging: import.meta.env.VITE_ACME_STAGING === 'true',
  enabled: !!import.meta.env.VITE_ACME_EMAIL,
});

// Feature flags por plano
export type PlanFeature = 
  | 'export_leads'
  | 'ab_testing'
  | 'advanced_integrations'
  | 'premium_sections'
  | 'custom_domain'
  | 'remove_branding';

export const PLAN_FEATURES: Record<string, PlanFeature[]> = {
  free: ['export_leads'],
  pro: ['export_leads', 'ab_testing', 'advanced_integrations', 'premium_sections', 'custom_domain'],
  premium: ['export_leads', 'ab_testing', 'advanced_integrations', 'premium_sections', 'custom_domain', 'remove_branding'],
};

/**
 * Verifica se um plano tem acesso a uma feature
 */
export const planHasFeature = (plan: string, feature: PlanFeature): boolean => {
  const features = PLAN_FEATURES[plan] || PLAN_FEATURES.free;
  return features.includes(feature);
};
