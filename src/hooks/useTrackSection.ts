/**
 * Hook para tracking automático de seções
 * Encapsula IntersectionObserver para section_view events
 */

import { useEffect, useRef, useCallback } from 'react';
import { trackSectionView, trackCTAClick, hasAnalyticsConsent } from '@/lib/tracking';

interface UseTrackSectionOptions {
  lpId?: string;
  sectionKey: string;
  variantId?: string;
  enabled?: boolean;
}

export function useTrackSection({
  lpId,
  sectionKey,
  variantId,
  enabled = true,
}: UseTrackSectionOptions) {
  const hasTracked = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Track section view when it becomes visible
  useEffect(() => {
    if (!lpId || !enabled || hasTracked.current) return;
    if (!hasAnalyticsConsent()) return;

    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            hasTracked.current = true;
            trackSectionView(lpId, sectionKey, variantId);
          }
        });
      },
      {
        threshold: 0.3, // 30% visibility
        rootMargin: '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [lpId, sectionKey, variantId, enabled]);

  // Helper to track CTA clicks
  const trackPrimaryCTA = useCallback(() => {
    if (!lpId) return;
    trackCTAClick(lpId, sectionKey, 'primary', variantId);
  }, [lpId, sectionKey, variantId]);

  const trackSecondaryCTA = useCallback(() => {
    if (!lpId) return;
    trackCTAClick(lpId, sectionKey, 'secondary', variantId);
  }, [lpId, sectionKey, variantId]);

  return {
    sectionRef,
    trackPrimaryCTA,
    trackSecondaryCTA,
  };
}

export default useTrackSection;
