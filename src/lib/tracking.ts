/**
 * Sistema de tracking first-party completo
 * Suporta: view, scroll, click, conversion
 * Integração opcional com GA4, Meta Pixel, TikTok Pixel
 */

import { supabase } from '@/integrations/supabase/client';
import {
  getStoredUTMParams,
  captureUTMParams,
  UTMParams,
} from './utm';
import {
  getDefaultGA4Id,
  getDefaultMetaPixelId,
  getDefaultTikTokPixelId,
} from './config';

// =====================================================
// TIPOS
// =====================================================

export type EventType =
  | 'view'
  | 'scroll'
  | 'cta_click'
  | 'lead_submit'
  | 'form_start'
  | 'form_abandon'
  | 'section_view'
  | 'video_play'
  | 'file_download'
  | 'premium_gate';

export interface TrackingEvent {
  event_type: EventType;
  lp_id?: string; // antes obrigatório → agora opcional
  section?: string;
  metadata?: Record<string, unknown>;
  variant_id?: string;

  // Premium Gate additions
  feature?: string;
  plan?: string;
}


export interface TrackingConfig {
  ga4_id?: string;
  meta_pixel_id?: string;
  tiktok_pixel_id?: string;
  consent_given?: boolean;
}

interface SessionData {
  session_id: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  user_agent: string;
  referrer: string;
  utm: UTMParams;
}

// =====================================================
// SESSION MANAGEMENT
// =====================================================

const SESSION_KEY = 'lp_tracking_session';

const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';

  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  if (
    /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua) ||
    width < 768
  ) {
    return 'mobile';
  }
  if (
    /tablet|ipad|playbook|silk/i.test(ua) ||
    (width >= 768 && width < 1024)
  ) {
    return 'tablet';
  }
  return 'desktop';
};

export const getSessionData = (): SessionData => {
  if (typeof window === 'undefined') {
    return {
      session_id: generateSessionId(),
      device_type: 'desktop',
      user_agent: '',
      referrer: '',
      utm: {} as UTMParams,
    };
  }

  // Tentar recuperar sessão existente
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  // Capturar UTM na primeira visita
  captureUTMParams();

  return {
    session_id: sessionId,
    device_type: getDeviceType(),
    user_agent: navigator.userAgent,
    referrer: document.referrer,
    utm: getStoredUTMParams(),
  };
};

// =====================================================
// CONSENT MANAGEMENT
// =====================================================

const CONSENT_KEY = 'lp_cookie_consent';
const CONSENT_VERSION = 'v1';

export interface ConsentState {
  given: boolean;
  categories: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  version: string;
  timestamp: number;
}

export const getConsentState = (): ConsentState | null => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      const consent = JSON.parse(stored) as ConsentState;
      // Verificar versão
      if (consent.version === CONSENT_VERSION) {
        return consent;
      }
    }
  } catch (e) {
    console.error('[Tracking] Error reading consent:', e);
  }

  return null;
};

export const setConsentState = (
  categories: ConsentState['categories']
): void => {
  if (typeof window === 'undefined') return;

  const consent: ConsentState = {
    given: true,
    categories,
    version: CONSENT_VERSION,
    timestamp: Date.now(),
  };

  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
};

export const hasAnalyticsConsent = (): boolean => {
  const consent = getConsentState();
  // Se não houver consentimento registrado, assume false (LGPD-safe)
  return consent?.categories.analytics ?? false;
};

export const hasMarketingConsent = (): boolean => {
  const consent = getConsentState();
  return consent?.categories.marketing ?? false;
};

// =====================================================
// FIRST-PARTY TRACKING
// =====================================================

const ESSENTIAL_EVENTS: EventType[] = ['view', 'lead_submit'];

// Queue para batch de eventos
let eventQueue: Array<TrackingEvent & SessionData> = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

const FLUSH_INTERVAL = 2000; // 2 segundos
const MAX_QUEUE_SIZE = 10;

/**
 * Normaliza metadata para tipos permitidos pelo Supabase/JSON:
 * string | number | boolean | null
 */
const normalizeMetadata = (
  metadata?: Record<string, unknown>
): Record<string, string | number | boolean | null> | null => {
  if (!metadata) return null;

  const normalized: Record<string, string | number | boolean | null> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null
    ) {
      normalized[key] = value as string | number | boolean | null;
    } else {
      normalized[key] = JSON.stringify(value);
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
};

const flushEvents = async (): Promise<void> => {
  if (eventQueue.length === 0) return;

  const eventsToSend = [...eventQueue];
  eventQueue = [];

  try {
    // Enviar em batch
    const { error } = await supabase.from('lp_events').insert(
      eventsToSend.map((event) => ({
        lp_id: event.lp_id,
        event_type: event.event_type,
        section: event.section || null,
        metadata: normalizeMetadata(event.metadata),
        session_id: event.session_id || null,
        device_type: event.device_type || null,
        user_agent: event.user_agent || null,
        referrer: event.referrer || null,
        utm_source: event.utm.utm_source || null,
        utm_medium: event.utm.utm_medium || null,
        utm_campaign: event.utm.utm_campaign || null,
        utm_term: event.utm.utm_term || null,
        utm_content: event.utm.utm_content || null,
        variant_id: event.variant_id || null,
      }))
    );

    if (error) {
      console.error('[Tracking] Error sending events:', error);
      // Re-adicionar eventos à queue em caso de erro
      eventQueue = [...eventsToSend, ...eventQueue];
    }
  } catch (e) {
    console.error('[Tracking] Network error:', e);
    // Fail-safe: não quebrar o front
  }
};

const scheduleFlush = (): void => {
  if (flushTimeout) return;

  flushTimeout = setTimeout(() => {
    flushTimeout = null;
    void flushEvents();
  }, FLUSH_INTERVAL);
};

/**
 * Registra um evento de tracking
 * Respeita o consentimento de cookies para eventos não-essenciais
 */
export const trackEvent = (event: TrackingEvent): void => {
  const isEssential = ESSENTIAL_EVENTS.includes(event.event_type);

  // Para eventos não-essenciais, verificar consentimento
  if (!isEssential && !hasAnalyticsConsent()) {
    console.log(
      '[Tracking] Skipping non-essential event (no consent):',
      event.event_type
    );
    return;
  }

  const session = getSessionData();

  eventQueue.push({
    ...event,
    ...session,
  });

  // Flush imediato se atingir tamanho máximo
  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    if (flushTimeout) {
      clearTimeout(flushTimeout);
      flushTimeout = null;
    }
    void flushEvents();
  } else {
    scheduleFlush();
  }
};

// Flush ao sair da página
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      // Melhor esforço; não dá pra usar await aqui
      void flushEvents();
    }
  });
}

// =====================================================
// THIRD-PARTY INTEGRATIONS
// =====================================================

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
    ttq?: {
      track: (event: string, data?: Record<string, unknown>) => void;
      page: () => void;
    };
  }
}

/**
 * Inicializa GA4
 * TODO: Configurar VITE_DEFAULT_GA4_ID ou passar ga4_id nas settings da LP
 */
export const initGA4 = (measurementId?: string): void => {
  const id = measurementId || getDefaultGA4Id();
  if (!id || typeof window === 'undefined') return;

  // Verificar consentimento
  if (!hasMarketingConsent()) {
    console.log('[Tracking] Skipping GA4 init (no marketing consent)');
    return;
  }

  // Prevenir duplicação
  if (document.getElementById('ga4-script')) return;

  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: any[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, { anonymize_ip: true });
};

/**
 * Inicializa Meta Pixel
 * TODO: Configurar VITE_DEFAULT_META_PIXEL_ID ou passar meta_pixel_id nas settings da LP
 */
export const initMetaPixel = (pixelId?: string): void => {
  const id = pixelId || getDefaultMetaPixelId();
  if (!id || typeof window === 'undefined') return;

  if (!hasMarketingConsent()) {
    console.log('[Tracking] Skipping Meta Pixel init (no marketing consent)');
    return;
  }

  if (window.fbq) return;

  const script = document.createElement('script');
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${id}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
};

/**
 * Inicializa TikTok Pixel
 * TODO: Configurar VITE_DEFAULT_TIKTOK_PIXEL_ID ou passar tiktok_pixel_id nas settings da LP
 */
export const initTikTokPixel = (pixelId?: string): void => {
  const id = pixelId || getDefaultTikTokPixelId();
  if (!id || typeof window === 'undefined') return;

  if (!hasMarketingConsent()) {
    console.log('[Tracking] Skipping TikTok Pixel init (no marketing consent)');
    return;
  }

  if (window.ttq) return;

  const script = document.createElement('script');
  script.innerHTML = `
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('${id}');
      ttq.page();
    }(window, document, 'ttq');
  `;
  document.head.appendChild(script);
};

/**
 * Envia evento para todas as plataformas configuradas
 */
export const trackToThirdParty = (
  eventName: string,
  payload?: Record<string, unknown>,
  _config?: TrackingConfig
): void => {
  if (!hasMarketingConsent()) return;

  // GA4
  if (window.gtag) {
    window.gtag('event', eventName, payload);
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', eventName, payload);
  }

  // TikTok Pixel
  if (window.ttq) {
    window.ttq.track(eventName, payload);
  }
};

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

export const trackPageView = (
  lpId: string,
  section?: string
): void => {
  trackEvent({ lp_id: lpId, event_type: 'view', section });
  trackToThirdParty('PageView', { lp_id: lpId, section });
};

export const trackCTAClick = (
  lpId: string,
  section: string,
  ctaType: 'primary' | 'secondary',
  variantId?: string
): void => {
  trackEvent({
    lp_id: lpId,
    event_type: 'cta_click',
    section,
    variant_id: variantId,
    metadata: { cta_type: ctaType },
  });
  trackToThirdParty('ClickButton', {
    lp_id: lpId,
    section,
    cta_type: ctaType,
    variant_id: variantId,
  });
};

export const trackLeadSubmit = (
  lpId: string,
  section: string,
  variantId?: string
): void => {
  trackEvent({
    lp_id: lpId,
    event_type: 'lead_submit',
    section,
    variant_id: variantId,
  });
  trackToThirdParty('Lead', { lp_id: lpId, section, variant_id: variantId });
};

// 🔹 Overloads para trackSectionView

export function trackSectionView(
  lpId: string,
  section: string,
  variantId?: string
): void;

export function trackSectionView(
  section: string,
  metadata?: Record<string, unknown>
): void;

// Implementação
export function trackSectionView(
  arg1: string,
  arg2?: string | Record<string, unknown>,
  arg3?: string
): void {
  // Caso 1: trackSectionView(lpId, section, variantId?)
  if (typeof arg2 === 'string') {
    const lpId = arg1;
    const section = arg2;
    const variantId = arg3;

    trackEvent({
      lp_id: lpId,
      event_type: 'section_view',
      section,
      variant_id: variantId,
    });

    trackToThirdParty('section_view', {
      lp_id: lpId,
      section,
      variant_id: variantId,
    });

    return;
  }

  // Caso 2: trackSectionView(section, metadata?)
  const section = arg1;
  const metadata = (arg2 as Record<string, unknown> | undefined) ?? undefined;

  console.warn(
    '[Tracking] trackSectionView chamado sem lpId; evento não será salvo em lp_events.'
  );

  trackToThirdParty('section_view', {
    section,
    ...(metadata || {}),
  });
}

export const trackScroll = (
  lpId: string,
  percentage: number
): void => {
  trackEvent({
    lp_id: lpId,
    event_type: 'scroll',
    metadata: { scroll_percentage: percentage },
  });
};
