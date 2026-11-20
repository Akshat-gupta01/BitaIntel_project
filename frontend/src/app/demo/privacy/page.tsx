import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createWebPageJsonLd } from '@/lib/schema';
import { Lock } from 'lucide-react';

export const metadata = createPageMetadata({
  title: 'Privacy Framework & Data Governance',
  description:
    'BITAINTEL privacy principles, role-based visibility controls, and statutory data protection protocols.',
  pathname: '/privacy',
  keywords: ['Data Privacy', 'NDA Security', 'Enterprise Compliance Privacy', 'Corporate Data Governance'],
});

export default function PrivacyPage() {
  const privacySchema = createWebPageJsonLd({
    title: 'Privacy Framework & Data Governance | BITAINTEL',
    description:
      'BITAINTEL privacy principles, role-based visibility controls, and statutory data protection protocols.',
    pathname: '/privacy',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Privacy Framework', url: '/privacy' },
    ],
  });

  return (
    <section className="py-12 sm:py-20">
      <JsonLd schema={privacySchema} />
      <Container>
        <article className="prose-copy mx-auto max-w-3xl rounded-3xl border border-slate-200/80 bg-white/80 p-8 sm:p-12 backdrop-blur-xl shadow-xs">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50/80 px-3 py-1 text-xs font-bold text-primary-800">
            <Lock className="size-3.5" />
            Data Protection & Privacy Protocol
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Privacy Framework & Data Governance
          </h1>
          <p className="!mt-4 text-sm text-slate-500 leading-relaxed">
            This document outlines the privacy and data governance framework governing the BITAINTEL platform and this demonstration application.
          </p>

          <hr className="my-6 border-slate-100" />

          <h2>1. Demonstration Scope & Local Processing</h2>
          <p>
            This website is an interactive frontend reference demonstration built to illustrate modern UI patterns and enterprise due-diligence workflows. Corporate profiles, GSTIN identifiers, and scoring metrics showcased herein are fictional sample datasets. Contact and registration forms execute client-side validation within your browser session and do not persist data to external databases or send unencrypted emails.
          </p>

          <h2>2. Enterprise Confidentiality Standards</h2>
          <p>
            In the planned production architecture, BITAINTEL enforces strict role-based access control (RBAC). Sensitive corporate assets—including non-public financial statements, credit agreements, customer rosters, and proprietary margin data—remain strictly compartmentalized and require explicit, bilateral NDA authorization before disclosure to verified counterparties.
          </p>

          <h2>3. Statutory Public Data vs. Private Dossiers</h2>
          <p>
            The platform differentiates between statutory public records (such as MCA active incorporation status, corporate CIN, and registered office address) and private enterprise documentation. Public directory profiles display only high-level commercial credentials necessary for partner discovery.
          </p>

          <h2>4. Verification & Third-Party Integrations</h2>
          <p>
            In the live platform, automated cross-checks utilize authorized government API gateways (MCA, GSTN, and MSME/Udyam registries). Live third-party API calls, SMS OTP verifications, and credit bureau inquiries are not active in this frontend demo.
          </p>

          <h2>5. Inquiries & Contact</h2>
          <p>
            For inquiries regarding our compliance protocols or privacy standards, please reach out via our{' '}
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
