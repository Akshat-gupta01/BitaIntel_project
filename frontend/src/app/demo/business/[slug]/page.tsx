import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  ShieldCheck,
  ArrowLeft,
  LockKeyhole,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { businesses } from '@/data';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScoreRing } from '@/components/business/ScoreRing';
import { EnquiryModal } from '@/components/business/EnquiryModal';

import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createBusinessJsonLd, createWebPageJsonLd } from '@/lib/schema';

export function generateStaticParams() {
  return businesses.map((b) => ({ slug: b.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = businesses.find((x) => x.id === slug);
  if (!b) {
    return createPageMetadata({
      title: 'Business Dossier Not Found',
      description: 'The requested business profile could not be found.',
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `${b.name} (${b.legalName}) — Audited Trust Dossier`,
    description: `${b.name}: ${b.summary} GSTIN: ${b.gstin}, CIN: ${b.cin}. Verification Tier ${b.level} with composite score of ${b.score}/100.`,
    pathname: `/business/${b.id}`,
    keywords: [b.name, b.legalName, b.industry, b.location, 'Vendor Verification', b.gstin],
  });
}

import { BusinessProfileClient } from '@/components/business/BusinessProfileClient';

export default async function BusinessProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const b = businesses.find((x) => x.id === slug);
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
