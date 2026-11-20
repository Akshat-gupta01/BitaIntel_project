import {
  Hero,
  TrustStrip,
  BenefitsBento,
  HowItWorks,
  FeaturedBusinesses,
  ScoreExplainer,
  BottomCta,
} from '@/components/sections/HomeSections';
import { Accordion } from '@/components/ui/Accordion';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createWebPageJsonLd, createFaqJsonLd } from '@/lib/schema';
import { faqs } from '@/data';
import { ArrowRight, HelpCircle } from 'lucide-react';

export const metadata = createPageMetadata({
  title: 'For Businesses & Vendors — Get Verified & Build Credibility',
  description:
    'Empanel your enterprise on BITAINTEL. Showcase audited statutory compliance, boost your 0–100 Trust Score, and win enterprise procurement contracts.',
  pathname: '/for-vendors',
  keywords: ['Vendor Verification', 'Supplier Credibility', 'Get Audited', 'B2B Trust Index', 'Vendor Onboarding'],
});

export default function ForVendorsPage() {
  const vendorSchema = createWebPageJsonLd({
    title: 'For Businesses & Vendors — Get Verified & Build Credibility | BITAINTEL',
    description:
      'Empanel your enterprise on BITAINTEL. Showcase audited statutory compliance, boost your 0–100 Trust Score, and win enterprise procurement contracts.',
    pathname: '/for-vendors',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'For Vendors', url: '/for-vendors' },
    ],
  });
  const faqSchema = createFaqJsonLd(faqs.slice(0, 4));

  return (
    <>
      <JsonLd schema={[vendorSchema, faqSchema]} />
      <Hero />
      <TrustStrip />
      <BenefitsBento />
      <HowItWorks />
      <FeaturedBusinesses />
      <ScoreExplainer />

      {/* FAQ Preview Section */}
      <section className="section-pad">
        <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <span className="eyebrow">Clarity & Confidence</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Know exactly what verification <span className="text-primary-700">means for vendors.</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600">
              Clear expectations build reliable partnerships. Learn what our multi-layer audit verifies, how scoring is calculated, and what checks belong in your bespoke due diligence.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                href="/demo/faq"
                variant="secondary"
                rightIcon={<ArrowRight className="size-4" />}
              >
                Visit Help Center
              </Button>
              <Button href="/demo/contact" variant="ghost">
                Ask a Question
              </Button>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white/70 p-4 text-xs text-slate-500 backdrop-blur-md flex items-start gap-3">
              <HelpCircle className="size-5 text-primary-600 shrink-0 mt-0.5" />
              <span>
                Need vendor onboarding assistance? Our regulatory analysts guide your compliance team through Modules A–F.
              </span>
            </div>
          </div>

          <Accordion items={faqs.slice(0, 4)} />
        </Container>
      </section>

      <BottomCta />
    </>
  );
}
