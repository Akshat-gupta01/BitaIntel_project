import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { businesses } from '@/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '',
    '/demo',
    '/demo/directory',
    '/demo/feed',
    '/demo/how-it-works',
    '/demo/about',
    '/demo/faq',
    '/demo/contact',
    '/demo/register',
    '/demo/privacy',
    '/demo/terms',
    '/demo/compare',
  ];

  return [
    ...paths.map((path) => ({
      url: `${site.url}${path}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: path === '' || path === '/demo' ? 1 : 0.6,
    })),
    ...businesses.map((b) => ({
      url: `${site.url}/demo/business/${b.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
