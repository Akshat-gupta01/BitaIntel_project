import { site } from '@/config/site';
import type { Business } from '@/data';

/**
 * Creates Website + Organization JSON-LD Schema (for layout / home).
 */
export function createWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${site.url}/#organization`,
        name: site.name,
        url: site.url,
        logo: {
          '@type': 'ImageObject',
          url: `${site.url}/logo-2.png`,
          caption: site.name,
        },
        description: site.description,
        email: site.email,
        sameAs: [],
      },
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        url: site.url,
        name: site.name,
        description: site.description,
        publisher: {
          '@id': `${site.url}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${site.url}/directory?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

/**
 * Creates WebPage JSON-LD schema with optional breadcrumbs.
 */
export function createWebPageJsonLd({
  title,
  description,
  pathname,
  breadcrumbs = [],
}: {
  title: string;
  description: string;
  pathname: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
}) {
  const url = `${site.url}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: {
      '@id': `${site.url}/#website`,
    },
    inLanguage: 'en-US',
  };

  if (breadcrumbs.length > 0) {
    schema.breadcrumb = {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.name,
        item: b.url.startsWith('http') ? b.url : `${site.url}${b.url}`,
      })),
    };
  }

  return schema;
}

/**
 * Creates Corporate Organization schema for dynamic business dossiers.
 */
export function createBusinessJsonLd(b: Business) {
  const url = `${site.url}/business/${b.id}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Corporation',
    '@id': `${url}#corporation`,
    name: b.name,
    legalName: b.legalName,
    url,
    description: b.summary,
    taxID: b.gstin,
    identifier: b.cin,
    address: {
      '@type': 'PostalAddress',
      addressLocality: b.city,
      addressRegion: b.state,
      addressCountry: 'IN',
    },
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      description: b.employees,
    },
    knowsAbout: b.products,
    award: `${b.isoCertified} (Tier ${b.level} Audited)`,
  };
}

/**
 * Creates FAQPage JSON-LD schema from questions & answers.
 */
export function createFaqJsonLd(faqs: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };
}

/**
 * Creates ContactPage JSON-LD schema.
 */
export function createContactJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${site.name}`,
    url: `${site.url}/contact`,
    description: `Connect with ${site.name} verification analysts and procurement specialists.`,
    mainEntity: {
      '@type': 'Organization',
      name: site.name,
      email: site.email,
      url: site.url,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          email: site.email,
          contactType: 'customer support',
          areaServed: 'IN',
          availableLanguage: ['English', 'Hindi'],
        },
      ],
    },
  };
}
