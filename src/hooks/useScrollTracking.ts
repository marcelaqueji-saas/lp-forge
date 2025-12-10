/**
 * Hook para tracking de scroll depth
 * Dispara eventos em marcos específicos (25%, 50%, 75%, 90%)
 */

import { useEffect, useRef } from 'react';
import { trackScroll, hasAnalyticsConsent } from '@/lib/tracking';

interface UseScrollTrackingOptions {
  lpId?: string;
  enabled?: boolean;
  thresholds?: number[];
}

export function useScrollTracking({
  lpId,
  enabled = true,
  thresholds = [25, 50, 75, 90],
}: UseScrollTrackingOptions) {
  const trackedMilestones = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!lpId || !enabled) return;
    if (!hasAnalyticsConsent()) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      thresholds.forEach((threshold) => {
        if (scrollPercent >= threshold && !trackedMilestones.current.has(threshold)) {
          trackedMilestones.current.add(threshold);
          trackScroll(lpId, threshold);
        }
      });
    };

    // Throttle scroll handler
    let ticking = false;
    const throttledHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandler, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandler);
    };
  }, [lpId, enabled, thresholds]);
}

export default useScrollTracking;
