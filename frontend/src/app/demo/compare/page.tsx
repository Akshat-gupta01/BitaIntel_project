import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { businesses, type Business } from '@/data';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ScoreRing } from '@/components/business/ScoreRing';
import { Scale, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createWebPageJsonLd } from '@/lib/schema';

export const metadata = createPageMetadata({
  title: 'Compare Corporate Profiles',
  description:
    'Compare statutory compliance checkpoints, verified credentials, and composite BITAINTEL scores side by side.',
  pathname: '/compare',
  keywords: ['Vendor Comparison', 'Due Diligence Matrix', 'Supplier Score Comparison'],
});

type SearchParams = { ids?: string };

import { CompareTableClient } from '@/components/compare/CompareTableClient';

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { ids } = await searchParams;
  const selected: Business[] = ids
    ? ids
        .split(',')
        .map((id) => businesses.find((b) => b.id === id))
        .filter((b): b is Business => Boolean(b))
        .slice(0, 4)
    : businesses.slice(0, 3);

  const compareSchema = createWebPageJsonLd({
    title: 'Compare Corporate Profiles | BITAINTEL',
    description:
      'Compare statutory compliance checkpoints, verified credentials, and composite BITAINTEL scores side by side.',
    pathname: '/compare',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Compare', url: '/compare' },
    ],
  });

  return (
    <section className="min-h-[75vh] py-10 sm:py-16">
      <JsonLd schema={compareSchema} />
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50/80 px-3 py-1 text-xs font-bold text-primary-800">
              <Scale className="size-3.5" />
              Side-by-Side Due Diligence
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Compare Corporate <span className="text-primary-700">Dossiers.</span>
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Inspect objective statutory metrics, compliance audits, and trust scores across multiple candidate suppliers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" href="/demo/directory" rightIcon={<ExternalLink className="size-3.5" />}>
              Add / Change Businesses
            </Button>
          </div>
        </div>

        {selected.length < 2 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-12 text-center backdrop-blur-xl">
            <h2 className="text-lg font-bold text-slate-900">Select at least two businesses to compare</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              Choose candidate suppliers from our verified directory to inspect side-by-side compliance matrices.
            </p>
            <Button href="/demo/directory" className="mt-6" variant="primary">
              Browse Directory
            </Button>
          </div>
        ) : (
          <CompareTableClient selected={selected} />
        )}

        <div className="mt-6 rounded-2xl border border-slate-200/60 bg-white/60 p-4 text-xs text-slate-400 backdrop-blur-md">
          Notice: Side-by-side comparison uses standardized Phase 1 illustrative parameters. Commercial terms and bilateral pricing agreements require direct contact.
        </div>
      </Container>
    </section>
  );
}
