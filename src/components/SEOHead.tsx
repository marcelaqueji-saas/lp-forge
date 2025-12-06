import { useEffect } from 'react';
import { LPSettings } from '@/lib/lpContentApi';

interface SEOHeadProps {
  settings: LPSettings;
  defaultTitle?: string;
  defaultDescription?: string;
}

export const SEOHead = ({ settings, defaultTitle, defaultDescription }: SEOHeadProps) => {
  useEffect(() => {
    // Update title
    const title = settings.meta_title || defaultTitle || 'Landing Page';
    document.title = title;

    // Update/create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', settings.meta_description || defaultDescription || '');

    // Update/create OG tags
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: settings.meta_description || defaultDescription || '' },
      { property: 'og:image', content: settings.meta_image_url || '' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: settings.meta_description || defaultDescription || '' },
      { name: 'twitter:image', content: settings.meta_image_url || '' },
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

    // Cleanup on unmount
    return () => {
      document.title = 'Landing Page Builder';
    };
  }, [settings, defaultTitle, defaultDescription]);

  return null;
};