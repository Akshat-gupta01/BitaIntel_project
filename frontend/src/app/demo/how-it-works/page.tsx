import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createWebPageJsonLd } from '@/lib/schema';
import {
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const metadata = createPageMetadata({
  title: 'Verification Methodology & Architecture',
  description:
    'Learn how the BITAINTEL 11-step verification workflow, 7-dimension scoring engine, and 10-state lifecycle evaluate B2B trust.',
  pathname: '/demo/how-it-works',
  keywords: ['Verification Methodology', '7-Dimension Scoring Algorithm', 'Statutory Pipeline', 'ROC Filing Verification'],
});

const workflowSteps = [
  { number: '01', tag: 'Onboarding', title: 'Vendor Registration', description: 'Authorized account creation with corporate identity and statutory credentials (CIN, GSTIN, PAN).' },
  { number: '02', tag: 'Validation', title: 'Syntactic & Field Check', description: 'Automated Zod schema validation verifying 15-char GSTIN, 21-char CIN, and 10-char PAN formats.' },
  { number: '03', tag: 'Identity', title: 'Dual-Channel OTP', description: 'Simultaneous email and mobile verification codes confirming authorized signatory control.' },
  { number: '04', tag: 'Registry', title: 'Statutory Cross-Check', description: 'Adapter checks GSTIN jurisdiction, taxpayer type, PAN linkage, and active filing status.' },
  { number: '05', tag: 'Vault', title: 'Document Vault & Hash', description: 'Statutory, quality, and banking proofs stored with SHA-256 tamper-evident checksums.' },
  { number: '06', tag: 'Controls', title: 'Anomaly & Mismatch Scan', description: 'Cross-checks submitted legal names, registered addresses, and statutory records for discrepancies.' },
  { number: '07', tag: 'Review', title: 'Auditor Queue Inspection', description: 'Compliance and quality auditors inspect factory licenses, ISO certs, and settlement proofs.' },
  { number: '08', tag: 'Decision', title: 'Auditor Sign-Off', description: 'Verification team issues Approved, Action Required, or Rejected decisions with audit notes.' },
  { number: '09', tag: 'Scoring', title: '7-Dimension Engine', description: 'Weighted mathematical formula computes the 0–100 Trust Score, grade, and risk level.' },
  { number: '10', tag: 'Badge', title: 'Tier & Badge Issuance', description: 'Assigns Platinum, Gold, Silver, or Verified badge alongside Verification Level 1–4.' },
  { number: '11', tag: 'Publish', title: 'Live Directory Index', description: 'Publishes verified B2B profile to directory search, comparison matrix, and RFQ workflows.' },
];

const sevenDimensions = [
  {
    title: 'Corporate Legal Identity',
    weight: '20%',
    status: 'Automated',
    desc: 'MCA active status, valid CIN/LLPIN, Director DIN verification, PAN entity matching, and registered office proof.',
  },
  {
    title: 'Government Tax Registry',
    weight: '20%',
    status: 'Automated',
    desc: 'Active GSTIN status, 24-month continuous GSTR-3B filing continuity, PAN linkage, and MSME/Udyam validity.',
  },
  {
    title: 'Operations & Physical Tenure',
    weight: '15%',
    status: 'Audited',
    desc: 'Operational age (tenure points), physical plant/office geolocation, utility proof, and workforce headcount.',
  },
  {
    title: 'Documents & Certifications',
    weight: '15%',
    status: 'Documented',
    desc: 'Active ISO (9001/27001/14001), IATF 16949, WHO-GMP, CE, and lab accreditations with expiry tracking.',
  },
  {
    title: 'Financial & Solvency Signals',
    weight: '15%',
    status: 'Structured',
    desc: 'Audited turnover consistency band, verified bank settlement proof, and financial statement validation.',
  },
  {
    title: 'Compliance & Risk Safeguards',
    weight: '10%',
    status: 'Governed',
    desc: 'Signatory authorization, address proof verification, and active dispute/open complaint governance.',
  },
  {
    title: 'Profile Completeness',
    weight: '5%',
    status: 'Structured',
    desc: 'Complete 12-point company profile, product catalog with HSN/TDS/COA, capabilities taxonomy, and contacts.',
  },
];

const lifecycleStates = [
  { state: 'Registered', badge: 'neutral' as const, desc: 'Account and preliminary entity details created. Hidden from public directory.' },
  { state: 'Info Submitted', badge: 'info' as const, desc: 'Modules A–F and statutory documents submitted into the vault for review.' },
  { state: 'In Progress', badge: 'info' as const, desc: 'Assigned to the BITAINTEL verification desk for active compliance inspection.' },
  { state: 'Action Required', badge: 'amber' as const, desc: 'Auditor requested clarification, GSTIN submission, or updated evidence.' },
  { state: 'Partially Verified', badge: 'level' as const, desc: 'Basic identity and tax checks confirmed (Tier 1); operational audit pending.' },
  { state: 'BITAINTEL Verified', badge: 'success' as const, desc: 'Complete statutory and documentary audit passed (Tier 2/3).' },
  { state: 'Enhanced Verified', badge: 'verified' as const, desc: 'Comprehensive Tier-4 audit with ISO accreditation and plant verification passed.' },
  { state: 'Verification Expired', badge: 'warning' as const, desc: '12-month re-audit window lapsed without certificate or filing renewal.' },
  { state: 'Suspended', badge: 'rose' as const, desc: 'Temporarily withheld due to open compliance dispute or regulatory notice.' },
  { state: 'Rejected', badge: 'rose' as const, desc: 'Failed statutory checks or non-compliant corporate identity.' },
];

export default function HowItWorksPage() {
  const methodologySchema = createWebPageJsonLd({
    title: 'Verification Methodology & Architecture | BITAINTEL',
    description:
      'Learn how the BITAINTEL 11-step verification workflow, 7-dimension scoring engine, and 10-state lifecycle evaluate B2B trust.',
    pathname: '/demo/how-it-works',
    breadcrumbs: [
      { name: 'Home', url: '/demo' },
      { name: 'How It Works', url: '/demo/how-it-works' },
    ],
  });

  return (
    <>
      <JsonLd schema={methodologySchema} />
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-primary-950 to-primary-900 py-16 sm:py-24 text-white">
        <div className="pointer-events-none absolute right-0 top-0 size-96 rounded-full bg-primary-500/15 blur-3xl" />
        <Container className="relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-400/30 bg-primary-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-300">
              <Sparkles className="size-3.5" />
              Statutory Verification Framework
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              A clear process. <br />
              <span className="text-primary-300">A more informed decision.</span>
            </h1>
            <p className="mt-5 text-sm sm:text-base leading-relaxed text-slate-300 max-w-2xl">
              BITAINTEL&apos;s verification engine combines an 11-step audit workflow, a 7-dimension mathematical scoring model, and a 10-state compliance lifecycle.
            </p>
          </div>
        </Container>
      </section>

      {/* The 11-Step Pipeline */}
      <section className="section-pad">
        <Container>
          <div className="max-w-2xl mb-12">
            <span className="eyebrow">The 11-Step Verification Workflow</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              From Registration to Verifiable Trust
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Every profile progresses through 11 structured milestones so both corporate buyers and suppliers understand evidence, audit status, and requirements.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((s) => (
              <Card key={s.number} variant="bento" className="p-5">
                <span className="text-xs font-black tracking-widest text-primary-700">
                  STEP {s.number}
                </span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {s.tag}
                </span>
                <h3 className="mt-2.5 text-base font-bold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {s.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 7-Dimension Scoring Weighting */}
      <section className="section-pad bg-slate-50/70 border-y border-slate-200/80">
        <Container>
          <div className="max-w-2xl mb-12">
            <span className="eyebrow">SRS §5.7 Scoring Matrix</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              The Seven Weighted Trust Dimensions
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              The 0–100 composite Trust Score is computed across 7 weighted statutory, operational, documentary, financial, and governance dimensions.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sevenDimensions.map((cp) => (
              <Card key={cp.title} variant="bento" className="p-6">
                <div className="flex items-center justify-between">
                  <Badge kind="level">{cp.status}</Badge>
                  <span className="text-sm font-extrabold text-primary-700">{cp.weight} Weight</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {cp.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {cp.desc}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 10-State Verification Lifecycle */}
      <section id="tiers" className="section-pad">
        <Container>
          <div className="max-w-2xl mb-10">
            <span className="eyebrow">Lifecycle &amp; Governance (10 States)</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Active Profile Lifecycle States
            </h2>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              Verification is governed by a 10-state compliance lifecycle tracking onboarding, auditor review, re-verification, and enforcement.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {lifecycleStates.map((st) => (
              <div
                key={st.state}
                className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 backdrop-blur-xl shadow-xs"
              >
                <Badge kind={st.badge}>{st.state}</Badge>
                <p className="mt-3 text-xs leading-relaxed text-slate-600">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Limitations Card */}
          <div className="mt-12 rounded-3xl border border-amber-200 bg-amber-50/60 p-8 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-800">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Important Operational Scope &amp; Limitations
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                  Verification confirms that defined statutory and quality checks have been completed according to published methodology at the stated audit timestamp. It does not constitute a credit rating, an insolvency warranty, or a guarantee of commercial contract fulfillment. Procurement teams must conduct their own customized legal due diligence.
                </p>
                <Button variant="dark" href="/demo/directory" className="mt-5" rightIcon={<ArrowRight className="size-3.5" />}>
                  Explore Verified Directory
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
