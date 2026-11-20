import { Container } from '@/components/layout/Container';
import { Step1QuickRegisterForm } from '@/components/shared/registration/Step1QuickRegisterForm';
import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createWebPageJsonLd } from '@/lib/schema';
import {
  ShieldCheck,
  Lock,
  TrendingUp,
  FileCheck2,
  CheckCircle2,
  Award,
  Building2,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export const metadata = createPageMetadata({
  title: 'Register Your Business — Verified Network',
  description:
    'Join the BITAINTEL verified enterprise network. Build corporate credibility with statutory cross-checks and a transparent trust index.',
  pathname: '/register',
  keywords: ['Vendor Registration', 'Business Signup', 'Verified Profile Registration', 'B2B Empanelment'],
});

export default function RegisterPage() {
  const registerSchema = createWebPageJsonLd({
    title: 'Register Your Business — Verified Network | BITAINTEL',
    description:
      'Join the BITAINTEL verified enterprise network. Build corporate credibility with statutory cross-checks and a transparent trust index.',
    pathname: '/register',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Register', url: '/register' },
    ],
  });

  const vendorBenefits = [
    {
      icon: ShieldCheck,
      title: 'Audited Corporate Credibility',
      desc: 'Establish confidence with an objective, statutory-backed Trust Score cross-validated against MCA21, GSTN, and ISO certifications.',
    },
    {
      icon: TrendingUp,
      title: 'Direct Enterprise Procurement RFIs',
      desc: 'Receive qualified procurement inquiries and high-value tender invitations from corporate buyers seeking accredited suppliers.',
    },
    {
      icon: FileCheck2,
      title: 'Fast-Track Empanelment',
      desc: 'Eliminate weeks of repetitive manual paperwork with a shareable, tamper-evident statutory compliance dossier.',
    },
    {
      icon: Lock,
      title: 'Enterprise Data Safeguards',
      desc: 'Your sensitive banking credentials, trade terms, and confidential files are protected under ISO 27001 security protocols.',
    },
  ];

  const networkStats = [
    { label: 'Audited Vendors', value: '14,200+' },
    { label: 'Industrial Categories', value: '240+' },
    { label: 'Procurement Inquiries', value: '₹4,800 Cr+' },
  ];

  return (
    <section className="py-12 sm:py-20">
      <JsonLd schema={registerSchema} />
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          {/* Left Description Column: Value Proposition & Vendor Benefits */}
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50/80 px-3 py-1 text-xs font-bold text-primary-800">
              <ShieldCheck className="size-3.5 text-primary-600" />
              Verified Enterprise Network
            </div>
            <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Build a profile that <br />
              <span className="text-primary-700">builds confidence.</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600">
              Commercial partners look for verifiable evidence. Joining the BITAINTEL network gives your business an objective, statutory-backed trust index that expedites vendor empanelment and eliminates manual paperwork.
            </p>

            {/* Network Statistics Triplet */}
            <div className="mt-8 grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              {networkStats.map((st) => (
                <div key={st.label} className="text-center">
                  <div className="text-lg sm:text-xl font-black text-slate-900">{st.value}</div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">{st.label}</div>
                </div>
              ))}
            </div>

            {/* Value Highlights (Clean Benefits, No Subsequent Steps) */}
            <div className="mt-8 space-y-4">
              {vendorBenefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.title}
                    className="flex gap-3.5 items-start p-3.5 rounded-2xl border border-slate-200/80 bg-white/70 shadow-2xs transition-all hover:border-slate-300 hover:bg-white"
                  >
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700 border border-primary-200/60 mt-0.5">
                      <Icon className="size-4.5" />
                    </div>
                    <div>
                      <h2 className="text-xs sm:text-sm font-bold text-slate-900">{b.title}</h2>
                      <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Enterprise Trust Quote / Testimonial Box */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white/70 p-5 text-xs text-slate-600 backdrop-blur-md space-y-2">
              <p className="italic leading-relaxed text-slate-700">
                &ldquo;Empanelment on BITAINTEL expedited our supplier onboarding with tier-1 contractors from 6 weeks to under 48 hours.&rdquo;
              </p>
              <div className="flex items-center gap-2 pt-1 font-semibold text-slate-900 text-[11px]">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>Verified Manufacturing Supplier · Pune MIDC Cluster</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Vendor Registration Form */}
          <div>
            <Step1QuickRegisterForm />
          </div>
        </div>
      </Container>
    </section>
  );
}


