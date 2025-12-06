// Analytics utilities - GA4 & Meta Pixel

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export const initGA4 = (measurementId: string) => {
  if (!measurementId || typeof window === 'undefined') return;

  // Prevent duplicate initialization
  if (document.getElementById('ga4-script')) return;

  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
};

export const initMetaPixel = (pixelId: string) => {
  if (!pixelId || typeof window === 'undefined') return;

  // Prevent duplicate initialization
  if (window.fbq) return;

  // Simple Meta Pixel initialization
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
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
};

export const trackEvent = (eventName: string, payload?: Record<string, unknown>) => {
  // GA4
  if (window.gtag) {
    window.gtag('event', eventName, payload);
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', eventName, payload);
  }

  // Console log for debugging
  console.log('[Analytics]', eventName, payload);
};

export const trackPageView = (pagePath?: string) => {
  // GA4
  if (window.gtag) {
    window.gtag('event', 'page_view', { page_path: pagePath || window.location.pathname });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};
