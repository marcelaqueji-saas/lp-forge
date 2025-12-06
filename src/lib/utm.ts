// UTM Parameter utilities

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  utm_id?: string;
  gclid?: string;
  fbclid?: string;
  [key: string]: string | undefined;
}

const UTM_STORAGE_KEY = 'lp_utm_params';

export const captureUTMParams = (): UTMParams => {
  if (typeof window === 'undefined') return {};

  const urlParams = new URLSearchParams(window.location.search);
  const utmParams: UTMParams = {};

  const paramKeys: string[] = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'utm_id',
    'gclid',
    'fbclid',
  ];

  paramKeys.forEach((key) => {
    const value = urlParams.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });

  // Only store if we have any UTM params
  if (Object.keys(utmParams).length > 0) {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmParams));
  }

  return utmParams;
};

export const getStoredUTMParams = (): UTMParams => {
  if (typeof window === 'undefined') return {};

  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading UTM params:', e);
  }

  return {};
};

export const getUTMParams = (): UTMParams => {
  // First check URL for fresh params
  const urlParams = captureUTMParams();
  
  // If no URL params, return stored params
  if (Object.keys(urlParams).length === 0) {
    return getStoredUTMParams();
  }

  return urlParams;
};

export const clearUTMParams = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(UTM_STORAGE_KEY);
};
