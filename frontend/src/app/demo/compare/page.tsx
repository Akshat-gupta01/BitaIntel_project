import { Container } from '@/components/layout/Container';
import { businesses, type Business } from '@/data';
import { Button } from '@/components/ui/Button';
import { Scale, ExternalLink } from 'lucide-react';
import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createWebPageJsonLd } from '@/lib/schema';
import { CompareTableClient, type CompareBusiness } from '@/components/compare/CompareTableClient';

export const metadata = createPageMetadata({
  title: 'Compare Corporate Profiles',
  description:
    'Compare statutory compliance checkpoints, verified credentials, and composite BITAINTEL scores side by side.',
  pathname: '/compare',
  keywords: ['Vendor Comparison', 'Due Diligence Matrix', 'Supplier Score Comparison'],
});

type SearchParams = { ids?: string };

function getCandidateApiBases(): string[] {
  const configured = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api/v1').replace(/\/api\/v1\/?$/, '');
  return Array.from(new Set(['http://127.0.0.1:3000', configured, 'http://localhost:3000']));
}

async function fetchJsonFromBackend<T>(path: string): Promise<T | null> {
  const bases = getCandidateApiBases();
  try {
    return await Promise.any(
      bases.map(async (base) => {
        const res = await fetch(`${base}${path}`, {
          cache: 'no-store',
          signal: AbortSignal.timeout(2500),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as T;
      })
    );
  } catch {
    return null;
  }
}

async function fetchAvailableBusinesses(): Promise<CompareBusiness[]> {
  const json = await fetchJsonFromBackend<{ data?: { businesses?: CompareBusiness[] } }>(
    '/api/v1/master/directory'
  );
  const dbList = Array.isArray(json?.data?.businesses) ? json.data.businesses : [];
  if (dbList.length === 0) return businesses;

  const dbKeys = new Set(
    dbList.map((b) => String(b.slug || b.id || b.name).toLowerCase())
  );
  const remainingDemo = businesses.filter(
    (b) =>
      !dbKeys.has(b.id.toLowerCase()) &&
      !dbKeys.has((b.slug || '').toLowerCase()) &&
      !dbKeys.has(b.name.toLowerCase())
  );
  return [...dbList, ...remainingDemo];
}

async function fetchComparedBusinesses(
  requestedIds: string[],
  available: CompareBusiness[]
): Promise<CompareBusiness[]> {
  if (requestedIds.length === 0) {
    return available.slice(0, 3);
  }

  const compareJson = await fetchJsonFromBackend<{ data?: { businesses?: CompareBusiness[] } }>(
    `/api/v1/master/compare?ids=${encodeURIComponent(requestedIds.join(','))}`
  );
  const dbMatches = Array.isArray(compareJson?.data?.businesses)
    ? compareJson.data.businesses
    : [];

  const lookupPool = new Map<string, CompareBusiness>();
  for (const item of [...available, ...dbMatches]) {
    if (item.id) lookupPool.set(String(item.id).toLowerCase(), item);
    if (item.slug) lookupPool.set(String(item.slug).toLowerCase(), item);
  }

  // Live compare response should win over directory summary / static seed entries
  for (const dbItem of dbMatches) {
    if (dbItem.id) lookupPool.set(String(dbItem.id).toLowerCase(), dbItem);
    if (dbItem.slug) lookupPool.set(String(dbItem.slug).toLowerCase(), dbItem);
  }

  return requestedIds
    .map((rawId) => lookupPool.get(rawId.toLowerCase()))
    .filter((b): b is CompareBusiness => Boolean(b))
    .slice(0, 4);
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { ids } = await searchParams;
  const requestedIds = ids
    ? Array.from(
        new Set(
          ids
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean)
        )
      ).slice(0, 4)
    : [];

  const availableBusinesses = await fetchAvailableBusinesses();
  const selected: Business[] = await fetchComparedBusinesses(requestedIds, availableBusinesses);

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

        {selected.length === 0 ? (
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
          <CompareTableClient selected={selected} availableBusinesses={availableBusinesses} />
        )}

        <div className="mt-6 rounded-2xl border border-slate-200/60 bg-white/60 p-4 text-xs text-slate-400 backdrop-blur-md">
          Notice: Side-by-side comparison uses standardized Phase 1 illustrative parameters. Commercial terms and bilateral pricing agreements require direct contact.
        </div>
      </Container>
    </section>
  );
}
