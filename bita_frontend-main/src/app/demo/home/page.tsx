import {
  BuyerHero,
  LiveDossierTerminal,
  BuyerComparisonSandbox,
  BuyerCategoryGrid,
  BuyerFeaturedSuppliers,
  BuyerWhyUsBento,
  BuyerFaqSection,
  BuyerBottomCta,
} from '@/components/sections/BuyerHomeSections';
import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createWebPageJsonLd } from '@/lib/schema';

export const metadata = createPageMetadata({
  title: 'Find, Verify & Compare Audited B2B Suppliers — BITAINTEL',
  description:
    'Search 1,200+ audited enterprise suppliers. Inspect verified GSTN filings, active MCA incorporation, physical factory audits, and objective 0–100 Trust Scores side-by-side.',
  pathname: '/',
  keywords: [
    'Find Suppliers India',
    'Verify B2B Vendors',
    'Supplier Comparison Tool',
    'MCA Active Check',
    'GSTN Verified Suppliers',
    'B2B Due Diligence Platform',
    'Corporate Trust Scores',
  ],
});

export default function HomePage() {
  const homeSchema = createWebPageJsonLd({
    title: 'Find, Verify & Compare Audited B2B Suppliers | BITAINTEL',
    description:
      'Search 1,200+ audited enterprise suppliers. Inspect verified GSTN filings, active MCA incorporation, physical factory audits, and objective 0–100 Trust Scores side-by-side.',
    pathname: '/',
    breadcrumbs: [{ name: 'Home', url: '/' }],
  });

  return (
    <>
      <JsonLd schema={homeSchema} />
      {/* 1. Buyer Hero with Interactive Search & The Full Verification Engine Console */}
      <BuyerHero />

      {/* 2. Interactive Master-Detail Terminal (Left: Elements / Vendors, Right: Deep Live Details) */}
      <LiveDossierTerminal />

      {/* 3. Interactive Side-by-Side Comparison Sandbox with Presets */}
      <BuyerComparisonSandbox />

      {/* 4. Industry Verticals Breakdown for Buyers */}
      <BuyerCategoryGrid />

      {/* 5. Featured Verified Suppliers with Compare Checkboxes */}
      <BuyerFeaturedSuppliers />

      {/* 6. Why Procurement Teams Choose BITAINTEL (Derisking Bento) */}
      <BuyerWhyUsBento />

      {/* 7. Buyer-Curated Frequently Asked Questions */}
      <BuyerFaqSection />

      {/* 8. Bottom CTA with Dual-Persona Vendor Switcher Strip */}
      <BuyerBottomCta />
    </>
  );
}
