/**
 * Componente para gerenciar Canonical URL
 */

import { useEffect } from 'react';
import { getBaseUrl } from '@/lib/config';

interface CanonicalUrlProps {
  url?: string;
  path?: string;
}

export const CanonicalUrl = ({ url, path }: CanonicalUrlProps) => {
  useEffect(() => {
    // Determinar URL canônica
    let canonicalUrl = url;
    
    if (!canonicalUrl && path) {
      canonicalUrl = `${getBaseUrl()}${path}`;
    }
    
    if (!canonicalUrl) {
      canonicalUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';
    }
    
    // Remover canonical existente
    const existing = document.querySelector('link[rel="canonical"]');
    if (existing) {
      existing.remove();
    }
    
    // Adicionar novo canonical
    if (canonicalUrl) {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = canonicalUrl;
      document.head.appendChild(link);
    }
    
    return () => {
      const link = document.querySelector('link[rel="canonical"]');
      if (link) link.remove();
    };
  }, [url, path]);
  
  return null;
};

export default CanonicalUrl;
