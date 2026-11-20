import { Container } from '@/components/layout/Container';
import { steps, verificationCheckpoints } from '@/data';
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
    'Learn how the BITAINTEL multi-layer verification framework evaluates corporate identity, statutory filings, and trust scoring.',
  pathname: '/how-it-works',
  keywords: ['Verification Methodology', 'Scoring Algorithm', 'Statutory Pipeline', 'ROC Filing Verification'],
});

export default function HowItWorksPage() {
  const lifecycleStates = [
    {
      state: 'Active Verified',
      badge: 'verified' as const,
      desc: 'All statutory filings (MCA, GSTN) validated, physical premises audited, and ISO certificates current.',
    },
    {
      state: 'Pending Verification',
      badge: 'info' as const,
      desc: 'Dossier submitted by authorized representative; awaiting automated cross-check and analyst review.',
    },
    {
      state: 'Action Required',
      badge: 'warning' as const,
      desc: 'One or more certificates (e.g. ISO 9001 or license) has lapsed or requires updated filing evidence.',
    },
    {
      state: 'Suspended / Inactive',
      badge: 'neutral' as const,
      desc: 'Entity struck off by ROC or persistent statutory non-compliance detected. Profile unlisted.',
    },
  ];

  const methodologySchema = createWebPageJsonLd({
    title: 'Verification Methodology & Architecture | BITAINTEL',
    description:
      'Learn how the BITAINTEL multi-layer verification framework evaluates corporate identity, statutory filings, and trust scoring.',
    pathname: '/how-it-works',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'How It Works', url: '/how-it-works' },
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
              BITAINTEL&apos;s Phase 1 architecture synthesizes government statutory APIs, multi-factor director identity authentication, documented quality audits, and transparent mathematical scoring.
            </p>
          </div>
        </Container>
      </section>

      {/* The 5-Step Pipeline */}
      <section className="section-pad">
        <Container>
          <div className="max-w-2xl mb-12">
            <span className="eyebrow">The Five-Step Pipeline</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              From Registration to Verifiable Trust
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Every profile progresses through transparent milestones so both buyers and suppliers understand status, evidence, and requirements.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s) => (
              <Card key={s.number} variant="bento" className="p-6">
                <span className="text-xs font-black tracking-widest text-primary-700">
                  STEP {s.number}
                </span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {s.tag}
                </span>
                <h3 className="mt-3 text-base font-bold text-slate-900">
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

      {/* Checkpoints & Weighting */}
      <section className="section-pad bg-slate-50/70 border-y border-slate-200/80">
        <Container>
          <div className="max-w-2xl mb-12">
            <span className="eyebrow">Audit Dimensions</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              The Six Statutory Checkpoints
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Trust requires more than a simple badge. Each checkpoint verifies an independent commercial dimension.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {verificationCheckpoints.map((cp) => (
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

      {/* Verification Lifecycle States */}
      <section className="section-pad">
        <Container>
          <div className="max-w-2xl mb-10">
            <span className="eyebrow">Lifecycle & Governance</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Active Profile Lifecycle States
            </h2>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              Verification is dynamic. Profiles automatically update when certificates lapse or statutory returns fall delinquent.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {lifecycleStates.map((st) => (
              <div
                key={st.state}
                className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 backdrop-blur-xl shadow-xs"
              >
                <Badge kind={st.badge}>{st.state}</Badge>
                <p className="mt-4 text-xs leading-relaxed text-slate-600">
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
                  Important Operational Scope & Limitations
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
