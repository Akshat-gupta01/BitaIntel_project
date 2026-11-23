import { Suspense } from 'react';
import { Newspaper } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { FeedExplorer } from '@/components/feed/FeedExplorer';
import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createWebPageJsonLd } from '@/lib/schema';

export const metadata = createPageMetadata({
  title: 'Official Feed — News, Regulatory Alerts & Briefings',
  description:
    'Read and share official BITAINTEL announcements, statutory compliance advisories, market intelligence visuals, and audit video briefings.',
  pathname: '/demo/feed',
  keywords: [
    'BITAINTEL Feed',
    'B2B Compliance News',
    'GSTN Alerts',
    'Vendor Verification Briefings',
    'Enterprise Procurement News',
  ],
});

export default function FeedPage() {
  const schema = createWebPageJsonLd({
    title: 'Official Feed — News, Regulatory Alerts & Briefings | BITAINTEL',
    description:
      'Official updates, statutory advisories, visual reports, and video briefings posted by the BITAINTEL administration team.',
    pathname: '/demo/feed',
    breadcrumbs: [
      { name: 'Home', url: '/demo' },
      { name: 'Feed', url: '/demo/feed' },
    ],
  });

  return (
    <section className="min-h-[75vh] py-10 sm:py-16">
      <JsonLd schema={schema} />
      <Container>
        {/* Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50/80 px-3 py-1 text-xs font-bold text-primary-800">
            <Newspaper className="size-3.5" />
            Official Admin News &amp; Briefings
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Intelligence <span className="text-primary-700">Feed.</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
            Official updates, regulatory compliance advisories, visual benchmarks, and video briefings published by the BITAINTEL Editorial &amp; Verification Admin Team. Share any announcement directly with your procurement network.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-96 rounded-3xl border border-slate-200/80 bg-white/70 animate-pulse"
                />
              ))}
            </div>
          }
        >
          <FeedExplorer />
        </Suspense>
      </Container>
    </section>
  );
}

