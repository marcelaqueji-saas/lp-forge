/**
 * Componente para injetar JSON-LD Schema.org na página
 * Suporta: FAQ, Organization, Product, Course, Event, LocalBusiness
 */

import { useEffect } from 'react';

export type SchemaType = 'FAQ' | 'Organization' | 'LocalBusiness' | 'Product' | 'Course' | 'Event' | 'WebPage';

interface FAQItem {
  question: string;
  answer: string;
}

interface SchemaOrgProps {
  type: SchemaType;
  data: Record<string, unknown>;
}

// Gerar schema FAQ
const generateFAQSchema = (items: FAQItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
});

// Gerar schema Organization
const generateOrganizationSchema = (data: {
  name: string;
  url?: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: data.name,
  url: data.url || (typeof window !== 'undefined' ? window.location.origin : ''),
  ...(data.logo && { logo: data.logo }),
  ...(data.description && { description: data.description }),
  ...(data.sameAs && { sameAs: data.sameAs }),
});

// Gerar schema LocalBusiness
const generateLocalBusinessSchema = (data: {
  name: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  telephone?: string;
  image?: string;
  priceRange?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: data.name,
  ...(data.description && { description: data.description }),
  ...(data.telephone && { telephone: data.telephone }),
  ...(data.image && { image: data.image }),
  ...(data.priceRange && { priceRange: data.priceRange }),
  ...(data.address && {
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address.street,
      addressLocality: data.address.city,
      addressRegion: data.address.state,
      postalCode: data.address.postalCode,
      addressCountry: data.address.country || 'BR',
    },
  }),
});

// Gerar schema Product
const generateProductSchema = (data: {
  name: string;
  description?: string;
  image?: string;
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  ratingValue?: number;
  reviewCount?: number;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: data.name,
  ...(data.description && { description: data.description }),
  ...(data.image && { image: data.image }),
  ...(data.price && {
    offers: {
      '@type': 'Offer',
      price: data.price,
      priceCurrency: data.currency || 'BRL',
      availability: `https://schema.org/${data.availability || 'InStock'}`,
    },
  }),
  ...(data.ratingValue && {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: data.ratingValue,
      reviewCount: data.reviewCount || 1,
    },
  }),
});

// Gerar schema Course
const generateCourseSchema = (data: {
  name: string;
  description?: string;
  provider?: string;
  image?: string;
  price?: number;
  currency?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: data.name,
  ...(data.description && { description: data.description }),
  ...(data.image && { image: data.image }),
  ...(data.provider && {
    provider: {
      '@type': 'Organization',
      name: data.provider,
    },
  }),
  ...(data.price && {
    offers: {
      '@type': 'Offer',
      price: data.price,
      priceCurrency: data.currency || 'BRL',
    },
  }),
});

// Gerar schema Event
const generateEventSchema = (data: {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: {
    name?: string;
    address?: string;
  };
  image?: string;
  organizer?: string;
  price?: number;
  currency?: string;
  eventAttendanceMode?: 'OnlineEventAttendanceMode' | 'OfflineEventAttendanceMode' | 'MixedEventAttendanceMode';
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: data.name,
  ...(data.description && { description: data.description }),
  ...(data.startDate && { startDate: data.startDate }),
  ...(data.endDate && { endDate: data.endDate }),
  ...(data.image && { image: data.image }),
  ...(data.eventAttendanceMode && {
    eventAttendanceMode: `https://schema.org/${data.eventAttendanceMode}`,
  }),
  ...(data.location && {
    location: {
      '@type': 'Place',
      name: data.location.name,
      address: data.location.address,
    },
  }),
  ...(data.organizer && {
    organizer: {
      '@type': 'Organization',
      name: data.organizer,
    },
  }),
  ...(data.price !== undefined && {
    offers: {
      '@type': 'Offer',
      price: data.price,
      priceCurrency: data.currency || 'BRL',
    },
  }),
});

// Gerar schema WebPage
const generateWebPageSchema = (data: {
  name: string;
  description?: string;
  url?: string;
  image?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: data.name,
  ...(data.description && { description: data.description }),
  url: data.url || (typeof window !== 'undefined' ? window.location.href : ''),
  ...(data.image && { image: data.image }),
});

export const SchemaOrg = ({ type, data }: SchemaOrgProps) => {
  useEffect(() => {
    // Remover schema existente do mesmo tipo
    const existingScript = document.querySelector(`script[data-schema-type="${type}"]`);
    if (existingScript) {
      existingScript.remove();
    }
    
    let schema: Record<string, unknown> | null = null;
    
    switch (type) {
      case 'FAQ':
        schema = generateFAQSchema(data.items as FAQItem[]);
        break;
      case 'Organization':
        schema = generateOrganizationSchema(data as Parameters<typeof generateOrganizationSchema>[0]);
        break;
      case 'LocalBusiness':
        schema = generateLocalBusinessSchema(data as Parameters<typeof generateLocalBusinessSchema>[0]);
        break;
      case 'Product':
        schema = generateProductSchema(data as Parameters<typeof generateProductSchema>[0]);
        break;
      case 'Course':
        schema = generateCourseSchema(data as Parameters<typeof generateCourseSchema>[0]);
        break;
      case 'Event':
        schema = generateEventSchema(data as Parameters<typeof generateEventSchema>[0]);
        break;
      case 'WebPage':
        schema = generateWebPageSchema(data as Parameters<typeof generateWebPageSchema>[0]);
        break;
    }
    
    if (schema) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema-type', type);
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }
    
    return () => {
      const script = document.querySelector(`script[data-schema-type="${type}"]`);
      if (script) script.remove();
    };
  }, [type, data]);
  
  return null;
};

/**
 * Componente para múltiplos schemas
 */
interface MultiSchemaProps {
  schemas: Array<{ type: SchemaType; data: Record<string, unknown> }>;
}

export const MultiSchemaOrg = ({ schemas }: MultiSchemaProps) => {
  return (
    <>
      {schemas.map((schema, index) => (
        <SchemaOrg key={`${schema.type}-${index}`} type={schema.type} data={schema.data} />
      ))}
    </>
  );
};

export default SchemaOrg;
