import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createWebPageJsonLd } from '@/lib/schema';
import { Scale } from 'lucide-react';

export const metadata = createPageMetadata({
  title: 'Terms of Use & Legal Overview',
  description:
    'Terms of use, demonstration disclaimer, and commercial limitations of the BITAINTEL platform.',
  pathname: '/terms',
  keywords: ['Terms of Use', 'Legal Disclaimer', 'Regulatory Scope', 'Due Diligence Terms'],
});

export default function TermsPage() {
  const termsSchema = createWebPageJsonLd({
    title: 'Terms of Use & Legal Overview | BITAINTEL',
    description:
      'Terms of use, demonstration disclaimer, and commercial limitations of the BITAINTEL platform.',
    pathname: '/terms',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Terms of Use', url: '/terms' },
    ],
  });

  return (
    <section className="py-12 sm:py-20">
      <JsonLd schema={termsSchema} />
      <Container>
        <article className="prose-copy mx-auto max-w-3xl rounded-3xl border border-slate-200/80 bg-white/80 p-8 sm:p-12 backdrop-blur-xl shadow-xs">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50/80 px-3 py-1 text-xs font-bold text-primary-800">
            <Scale className="size-3.5" />
            Terms of Use & Regulatory Limits
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Terms of Use & Legal Disclaimer
          </h1>
          <p className="!mt-4 text-sm text-slate-500 leading-relaxed">
            Please review the following terms and operational parameters governing the use of the BITAINTEL frontend demonstration.
          </p>

          <hr className="my-6 border-slate-100" />

          <h2>1. Demonstration & Fictional Data Notice</h2>
          <p>
            All corporate names, profiles, scores, GSTIN identifiers, and audit records displayed on this website are illustrative simulation assets created for interface demonstration purposes. They do not represent real-world entities or active statutory standings.
          </p>

          <h2>2. No Commercial Guarantee or Warranty</h2>
          <p>
            A BITAINTEL verification status or trust index summarizes defined statutory and documented parameters at an exact point in time. It does not constitute a warranty of financial solvency, contract fulfillment, creditworthiness, or absence of commercial risk.
          </p>

          <h2>3. Independent Due Diligence Requirement</h2>
          <p>
            Users and enterprise procurement professionals must conduct their own customized legal, operational, and financial due diligence and seek professional advice appropriate to the specific nature and value of any proposed business relationship.
          </p>

          <h2>4. Intellectual Property & Architecture</h2>
          <p>
            The BITAINTEL verification methodology, UI component architecture, and design tokens are proprietary to BITAINTEL Technologies Inc.
          </p>

          <p className="pt-4 text-xs text-slate-400">
            Questions regarding terms of service? Use our{' '}
            <Link className="font-semibold text-primary-700 hover:text-primary-900" href="/demo/contact">
              contact form
            </Link>
            .
          </p>
        </article>
      </Container>
    </section>
  );
}
