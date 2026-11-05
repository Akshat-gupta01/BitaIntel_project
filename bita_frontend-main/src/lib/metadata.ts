import type { Metadata } from 'next';
import { site } from '@/config/site';

export interface PageMetadataOptions {
  title: string;
  description?: string;
  pathname?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
}

/**
 * Reusable metadata generator for BITAINTEL pages.
 * Handles canonical URL, OpenGraph, Twitter Cards, robots, and title formatting.
 */
export function createPageMetadata({
  title,
  description = site.description,
  pathname = '',
  image = '/logo-2.png',
  keywords = [],
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const cleanPath = pathname ? (pathname.startsWith('/') ? pathname : `/${pathname}`) : '';
  const url = cleanPath ? `${site.url}${cleanPath}` : site.url;
  const fullTitle = `${title} | ${site.name}`;

  const defaultKeywords = [
    'B2B Verification',
    'Vendor Due Diligence',
    'MCA Company Search',
    'GSTN Filing Verification',
    'Corporate Trust Score',
    'Enterprise Risk Management',
    'Supplier Auditing',
    'BITAINTEL',
  ];

  return {
    title,
    description,
    keywords: Array.from(new Set([...defaultKeywords, ...keywords])),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: site.name,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: image.startsWith('http') ? image : `${site.url}${image}`,
          width: 1200,
          height: 630,
          alt: `${title} — ${site.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image.startsWith('http') ? image : `${site.url}${image}`],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
  };
}
