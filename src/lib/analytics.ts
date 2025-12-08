// src/lib/analytics.ts
// Proxy fino para manter compatibilidade com código antigo
// e reutilizar a implementação centralizada em tracking.ts

import {
  initGA4 as baseInitGA4,
  initMetaPixel as baseInitMetaPixel,
  trackToThirdParty,
} from './tracking';

/**
 * Inicializa GA4 usando o sistema novo de tracking
 * (respeita consentimento etc.)
 */
export const initGA4 = (measurementId?: string) => {
  baseInitGA4(measurementId);
};

/**
 * Inicializa Meta Pixel usando o sistema novo de tracking
 */
export const initMetaPixel = (pixelId?: string) => {
  baseInitMetaPixel(pixelId);
};

/**
 * Mantém a assinatura antiga:
 * trackEvent('NomeEvento', { payload })
 *
 * Por baixo dos panos, manda para GA4 / Meta / TikTok via trackToThirdParty.
 */
export const trackEvent = (
  eventName: string,
  payload?: Record<string, unknown>
) => {
  trackToThirdParty(eventName, payload);
};

/**
 * Mantém a assinatura antiga:
 * trackPageView('/caminho')
 *
 * Internamente, também usa o sistema novo (trackToThirdParty).
 */
export const trackPageView = (pagePath?: string) => {
  if (typeof window === 'undefined') return;

  trackToThirdParty('PageView', {
    page_path: pagePath || window.location.pathname,
  });
};
