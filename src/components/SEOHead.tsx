import { useEffect } from 'react';
import { LPSettings } from '@/lib/lpContentApi';
import { getBaseUrl } from '@/lib/config';

interface SEOHeadProps {
  settings: LPSettings;
  defaultTitle?: string;
  defaultDescription?: string;
  canonicalPath?: string;
}

export const SEOHead = ({ 
  settings, 
  defaultTitle, 
  defaultDescription,
  canonicalPath 
}: SEOHeadProps) => {
  useEffect(() => {
    // Update title
    const title = settings.meta_title || defaultTitle || 'Landing Page';
    document.title = title;

    // Get canonical URL
    const baseUrl = getBaseUrl();
    const canonicalUrl = canonicalPath 
      ? `${baseUrl}${canonicalPath}`
      : typeof window !== 'undefined' 
        ? window.location.href.split('?')[0] 
        : baseUrl;

    // Update/create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', settings.meta_description || defaultDescription || '');

    // Update/create canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Update/create OG tags
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: settings.meta_description || defaultDescription || '' },
      { property: 'og:image', content: settings.meta_image_url || '' },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'noBRon' },
      { property: 'og:locale', content: 'pt_BR' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: settings.meta_description || defaultDescription || '' },
      { name: 'twitter:image', content: settings.meta_image_url || '' },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'noBRon' },
    ];

    ogTags.forEach(tag => {
      const selector = tag.property 
        ? `meta[property="${tag.property}"]` 
        : `meta[name="${tag.name}"]`;
      
      let element = document.querySelector(selector);
      
      if (!element && tag.content) {
        element = document.createElement('meta');
        if (tag.property) {
          element.setAttribute('property', tag.property);
        } else if (tag.name) {
          element.setAttribute('name', tag.name);
        }
        document.head.appendChild(element);
      }
      
      if (element && tag.content) {
        element.setAttribute('content', tag.content);
      }
    });

    // Add structured data (JSON-LD)
    let jsonLd = document.querySelector('script[type="application/ld+json"]');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLd);
    }
    
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description: settings.meta_description || defaultDescription || '',
      url: canonicalUrl,
      ...(settings.meta_image_url && {
        image: settings.meta_image_url
      })
    };
    
    jsonLd.textContent = JSON.stringify(structuredData);

    // Cleanup on unmount
    return () => {
      document.title = 'noBRon - Landing Pages';
    };
  }, [settings, defaultTitle, defaultDescription, canonicalPath]);

  return null;
};

export default SEOHead;
