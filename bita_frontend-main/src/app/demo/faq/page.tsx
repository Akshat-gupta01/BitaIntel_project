import { Container } from '@/components/layout/Container';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createFaqJsonLd, createWebPageJsonLd } from '@/lib/schema';
import { faqs } from '@/data';
import { HelpCircle, ArrowRight, Mail } from 'lucide-react';

export const metadata = createPageMetadata({
  title: 'Frequently Asked Questions & Knowledge Base',
  description:
    'Answers about BITAINTEL verification methodology, scoring index, corporate data privacy, and procurement integration.',
  pathname: '/faq',
  keywords: ['BITAINTEL FAQ', 'Verification FAQ', 'Vendor Scoring Criteria', 'Enterprise Auditing Help'],
});

export default function FAQPage() {
  const faqSchema = createFaqJsonLd(faqs);
  const breadcrumbSchema = createWebPageJsonLd({
    title: 'Frequently Asked Questions & Knowledge Base | BITAINTEL',
    description:
      'Answers about BITAINTEL verification methodology, scoring index, corporate data privacy, and procurement integration.',
    pathname: '/faq',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'FAQ', url: '/faq' },
    ],
  });

  return (
    <section className="min-h-[75vh] py-12 sm:py-20">
      <JsonLd schema={[faqSchema, breadcrumbSchema]} />
      <Container>
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50/80 px-3.5 py-1 text-xs font-bold text-primary-800">
              <HelpCircle className="size-3.5" />
              Help Center & Due Diligence Guide
            </div>
            <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Frequently asked <span className="text-primary-700">questions.</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
              Understand how our verification framework and transparent scoring operate, what a trust dossier shows, and how data privacy is maintained.
            </p>
          </div>

          {/* Accordion Component */}
          <Accordion items={faqs} defaultOpenIndex={0} />

          {/* Bottom Help Box */}
          <div className="mt-12 rounded-3xl border border-slate-200/80 bg-white/80 p-8 text-center backdrop-blur-xl shadow-xs">
            <div className="mx-auto size-12 rounded-2xl bg-primary-50 text-primary-600 grid place-items-center mb-4">
              <Mail className="size-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Still have questions regarding statutory verification?
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Our regulatory compliance analysts can help you tailor custom verification thresholds for your enterprise supplier database.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button href="/demo/contact" variant="primary" rightIcon={<ArrowRight className="size-4" />}>
                Contact Trust Team
              </Button>
              <Button href="/demo/directory" variant="secondary">
                Explore Directory
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
