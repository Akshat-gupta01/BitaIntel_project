import { Suspense } from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { LoginForm } from '@/components/auth/LoginForm';
import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createWebPageJsonLd } from '@/lib/schema';
import { Building2, ShieldCheck, Award, ArrowRight } from 'lucide-react';

export const metadata = createPageMetadata({
  title: 'Business & Vendor Sign In — BITAINTEL',
  description:
    'Sign in to your BITAINTEL vendor workspace. Manage your statutory verification dossier, track your 0–100 Trust Score, and manage incoming buyer inquiries.',
  pathname: '/login',
  keywords: ['Vendor Login', 'Business Sign In', 'Trust Score Dashboard', 'BITAINTEL Login'],
});

export default function LoginPage() {
  const loginSchema = createWebPageJsonLd({
    title: 'Business & Vendor Sign In | BITAINTEL',
    description: 'Sign in to your BITAINTEL vendor workspace.',
    pathname: '/login',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Sign In', url: '/login' },
    ],
  });

  return (
    <div className="min-h-[calc(100vh-140px)] py-10 sm:py-16 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <JsonLd schema={loginSchema} />
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center max-w-5xl mx-auto">
          {/* Left Column: Vendor Value Proposition */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-bold text-primary-800">
              <Building2 className="size-3.5" />
              <span>Vendor Workspace & Trust Score Portal</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Manage Your Verified <br />
              <span className="text-primary-700">Enterprise Profile.</span>
            </h1>

            <p className="text-sm sm:text-base leading-relaxed text-slate-600">
              Access your official BITAINTEL vendor workspace. Upload compliance documentation (Modules A–F), view your real-time 0–100 Trust Index, track audit milestones, and respond to commercial buyer RFIs.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Award className="size-4 text-primary-600" />
                  <span>0–100 Trust Score Simulator</span>
                </p>
                <p className="text-xs text-slate-500">
                  Track dynamic weighted contributions across GSTN, MCA, physical factory audits, and financial health.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary-600" />
                  <span>Incoming Procurement Enquiries</span>
                </p>
                <p className="text-xs text-slate-500">
                  Buyers browse your verified statutory profile and send direct procurement inquiries without needing buyer logins.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-600">
              <span>Need to register your business first?</span>
              <Link
                href="/demo/register"
                className="font-bold text-primary-700 hover:text-primary-900 inline-flex items-center gap-1"
              >
                Start Registration Wizard <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>

          {/* Right Column: Clean Vendor Login Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
            <Suspense
              fallback={
                <div className="p-8 text-center text-xs text-slate-500">
                  Loading authentication portal...
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </Container>
    </div>
  );
}
