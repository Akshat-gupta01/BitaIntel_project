import { cache } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { businesses } from '@/data';
import { Container } from '@/components/layout/Container';

import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createBusinessJsonLd, createWebPageJsonLd } from '@/lib/schema';

const fetchBusinessData = cache(async (slug: string, cookieHeader: string) => {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api/v1').replace(/\/api\/v1\/?$/, '');
  const candidateUrls = Array.from(
    new Set([
      `http://127.0.0.1:3000/api/v1/master/business/${slug}`,
      `${apiBase}/api/v1/master/business/${slug}`,
      `http://localhost:3000/api/v1/master/business/${slug}`,
    ])
  );

  try {
    const result = await Promise.any(
      candidateUrls.map(async (url) => {
        const res = await fetch(url, {
          cache: 'no-store',
          headers: cookieHeader ? { cookie: cookieHeader } : undefined,
          signal: AbortSignal.timeout(2500),
        });
        if (res.status === 404) {
          return { notFoundOnServer: true as const, business: null };
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json?.data?.business) throw new Error('Missing business payload');
        return { notFoundOnServer: false as const, business: json.data.business };
      })
    );
    if (result.notFoundOnServer) {
      // Fall back to static demo catalog only if the slug belongs to a seed demo entry
      return (
        businesses.find(
          (x) => x.id === slug || x.slug === slug || x.id.toLowerCase() === slug.toLowerCase()
        ) || null
      );
    }
    return result.business;
  } catch {
    return (
      businesses.find(
        (x) => x.id === slug || x.slug === slug || x.id.toLowerCase() === slug.toLowerCase()
      ) || null
    );
  }
});

export function generateStaticParams() {
  return businesses.map((b) => ({ slug: b.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const b = await fetchBusinessData(slug, cookieStore.toString());

  if (!b) {
    return createPageMetadata({
      title: 'Business Dossier Not Found',
      description: 'The requested business profile could not be found.',
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `${b.name} (${b.legalName}) — Audited Trust Dossier`,
    description: `${b.name}: ${b.summary} Verification Tier ${b.level} with composite score of ${b.score}/100.`,
    pathname: `/business/${b.id}`,
    keywords: [b.name, b.legalName, b.industry, b.location, 'Vendor Verification'],
  });
}

import { BusinessProfileClient } from '@/components/business/BusinessProfileClient';

export default async function BusinessProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const b = await fetchBusinessData(slug, cookieStore.toString());

  if (!b) notFound();

  const businessSchema = createBusinessJsonLd(b);
  const breadcrumbSchema = createWebPageJsonLd({
    title: `${b.name} — Verified Business Dossier`,
    description: b.summary,
    pathname: `/business/${b.id}`,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Directory', url: '/directory' },
      { name: b.name, url: `/business/${b.id}` },
    ],
  });

  return (
    <section className="py-10 sm:py-16">
      <JsonLd schema={[businessSchema, breadcrumbSchema]} />
      <Container>
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link
            href="/demo/directory"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to Business Directory
          </Link>
        </div>

        {/* Dynamic 5-Tier Role-Aware Profile Dossier */}
        <BusinessProfileClient business={b} />
      </Container>
    </section>
  );
}
