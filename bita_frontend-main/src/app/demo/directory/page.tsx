import { Container } from '@/components/layout/Container';
import { DirectoryExplorer } from '@/components/business/DirectoryExplorer';
import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createWebPageJsonLd } from '@/lib/schema';
import { ShieldCheck } from 'lucide-react';

export const metadata = createPageMetadata({
  title: 'Business Directory & Intelligence',
  description:
    'Search and compare audited BITAINTEL business profiles by industry, location, verification tier, and composite trust score.',
  pathname: '/directory',
  keywords: ['Company Directory', 'Vendor Search', 'Verified Suppliers India', 'MCA Check'],
});

export default function DirectoryPage() {
  const schema = createWebPageJsonLd({
    title: 'Business Directory & Intelligence | BITAINTEL',
    description:
      'Search and compare audited BITAINTEL business profiles by industry, location, verification tier, and composite trust score.',
    pathname: '/directory',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Directory', url: '/directory' },
    ],
  });

  return (
    <section className="min-h-[75vh] py-10 sm:py-16">
      <JsonLd schema={schema} />
      <Container>
        {/* Header Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50/80 px-3 py-1 text-xs font-bold text-primary-800">
            <ShieldCheck className="size-3.5" />
            Verified Enterprise Database
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Search & Compare <span className="text-primary-700">Businesses.</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
            Explore structured corporate profiles, inspect statutory verification tiers, and compare key audited capabilities before initiating partner discussions.
          </p>
        </div>

        {/* Directory Explorer Component */}
        <DirectoryExplorer />
      </Container>
    </section>
  );
}
