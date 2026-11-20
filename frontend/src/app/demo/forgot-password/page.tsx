import { Container } from '@/components/layout/Container';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createWebPageJsonLd } from '@/lib/schema';
import { ShieldCheck, Lock, LifeBuoy } from 'lucide-react';
import Link from 'next/link';

export const metadata = createPageMetadata({
  title: 'Forgot Password — Account Recovery',
  description:
    'Reset your BITAINTEL enterprise account credentials through 2-factor OTP authorization. Fast, secure access recovery for business representatives and verifiers.',
  pathname: '/forgot-password',
  keywords: ['Forgot Password', 'Account Recovery', 'OTP Verification', 'Reset Credentials', 'BITAINTEL Help'],
});

export default function ForgotPasswordPage() {
  const schema = createWebPageJsonLd({
    title: 'Forgot Password — Account Recovery | BITAINTEL',
    description:
      'Reset your BITAINTEL account credentials through multi-factor OTP authorization.',
    pathname: '/forgot-password',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Sign In', url: '/login' },
      { name: 'Forgot Password', url: '/forgot-password' },
    ],
  });

  return (
    <div className="min-h-[calc(100vh-140px)] py-12 sm:py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <JsonLd schema={schema} />
      <Container>
        <div className="max-w-xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50/80 px-3 py-1 text-xs font-bold text-primary-800">
              <ShieldCheck className="size-3.5" />
              <span>Multi-Factor Identity Recovery</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Access Recovery
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Follow the statutory identity verification steps below to reset your corporate account access.
            </p>
          </div>

          {/* Form */}
          <ForgotPasswordForm />

          {/* Help box */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-xs text-slate-600 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-slate-100 grid place-items-center text-slate-700">
                <LifeBuoy className="size-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Need Enterprise Assistance?</p>
                <p className="text-slate-500">Authorized corporate accounts can contact support directly.</p>
              </div>
            </div>
            <Link
              href="/demo/contact"
              className="text-xs font-bold text-primary-700 hover:text-primary-900 shrink-0"
            >
              Contact Support →
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
