import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createWebPageJsonLd } from '@/lib/schema';
import { Eye, ShieldCheck, Layers, ArrowRight, Check } from 'lucide-react';

export const metadata = createPageMetadata({
  title: 'About BITAINTEL — Corporate Identity & Mission',
  description:
    'The BITAINTEL mission to bring verifiable transparency, statutory synthesis, and confidence to B2B commercial relationships.',
  pathname: '/about',
  keywords: ['About BITAINTEL', 'B2B Trust Intelligence', 'Statutory Synthesis', 'Vendor Due Diligence Platform'],
});

export default function AboutPage() {
  const aboutSchema = createWebPageJsonLd({
    title: 'About BITAINTEL — Corporate Identity & Mission',
    description:
      'The BITAINTEL mission to bring verifiable transparency, statutory synthesis, and confidence to B2B commercial relationships.',
    pathname: '/about',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'About', url: '/about' },
    ],
  });

  const commitments = [
    'Explain the objective scope and regulatory boundaries of every verification check',
    'Keep sensitive financial, proprietary customer, and supplier data strictly protected under mutual consent',
    'Maintain a verifiable statutory cross-check pipeline against official MCA & GSTN registries',
    'Ensure transparent mathematical scoring weights without speculative black-box predictions',
    'Enable structured correction workflows and regular audit cadence for growing enterprises',
  ];

  return (
    <>
      <JsonLd schema={aboutSchema} />
      {/* Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-primary-950 to-primary-900 py-16 sm:py-24 text-white">
        <div className="pointer-events-none absolute right-0 top-0 size-96 rounded-full bg-primary-500/15 blur-3xl" />
        <Container className="relative">
          <div className="max-w-3xl">
            <div className="mb-6 inline-block">
              <Logo variant="white" size="lg" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-400/30 bg-primary-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-300">
                <ShieldCheck className="size-3.5" />
                Corporate Identity & Verification
              </span>
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Not just a directory. <br />
              <span className="text-primary-300">A clearer view of trust.</span>
            </h1>
            <p className="mt-5 text-sm sm:text-base leading-relaxed text-slate-300 max-w-2xl">
              BITAINTEL was founded to replace unverified sales brochures, opaque supplier claims, and manual paperwork with an enterprise-grade, statutory-backed trust intelligence layer.
            </p>
          </div>
        </Container>
      </section>

      {/* Core Values Bento */}
      <section className="section-pad">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Eye,
                title: 'Clarity Over Claims',
                desc: 'We replace self-asserted marketing bullet points with verifiable government registry filings, active corporate status, and documented audit trails.',
              },
              {
                icon: ShieldCheck,
                title: 'Evidence-Led Trust',
                desc: 'A verification badge is only as credible as its underlying evidence. Every checkpoint exposes exact audit timestamps and scoring criteria.',
              },
              {
                icon: Layers,
                title: 'Composable Architecture',
                desc: 'Engineered from the ground up for ERP integration, allowing enterprise procurement platforms to pull live supplier trust signals via secure APIs.',
              },
            ].map((item) => (
              <Card key={item.title} variant="bento" className="p-8">
                <div className="grid size-12 place-items-center rounded-2xl bg-primary-50 text-primary-600 mb-5">
                  <item.icon className="size-6" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {item.title}
                </h2>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>

          {/* Deep dive two-column */}
          <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="eyebrow">Our Foundational Principle</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Verify before you trust.
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600">
                Every commercial agreement entails counterparty risk. Traditional credit ratings often lack operational context, while static supplier brochures offer no legal accountability.
              </p>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
                A modern B2B trust dossier synthesizes incorporation legitimacy, active tax filing consistency, physical operating footprints, and verified management representation into a standardized commercial asset.
              </p>
              <div className="mt-8 flex gap-3">
                <Button href="/demo/directory" variant="primary" rightIcon={<ArrowRight className="size-4" />}>
                  Explore Verified Directory
                </Button>
                <Button href="/demo/how-it-works" variant="secondary">
                  Our Methodology
                </Button>
              </div>
            </div>

            {/* Commitments Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 sm:p-10 backdrop-blur-xl shadow-md">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-700 block">
                Platform Standards
              </span>
              <h3 className="mt-2 text-xl font-bold text-slate-900">
                Our Architectural Commitments
              </h3>
              <ul className="mt-6 space-y-4">
                {commitments.map((comm) => (
                  <li key={comm} className="flex items-start gap-3 text-xs sm:text-sm text-slate-600">
                    <div className="size-5 rounded-full bg-primary-100 text-primary-600 grid place-items-center shrink-0 mt-0.5">
                      <Check className="size-3 font-bold" />
                    </div>
                    <span>{comm}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
