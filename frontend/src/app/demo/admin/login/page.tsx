import { Suspense } from 'react';
import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createWebPageJsonLd } from '@/lib/schema';
import { LoginPortalView } from '@/components/auth/LoginPortalView';

export const metadata = createPageMetadata({
  title: 'Compliance Authority & Admin Sign In — BITAINTEL',
  description:
    'Administrative sign-in portal for BITAINTEL verification officers, statutory auditors, and platform administrators. Review vendor dossiers, audit MCA/GSTN records, and manage trust scoring.',
  pathname: '/admin/login',
  keywords: ['Admin Login', 'Compliance Authority Sign In', 'Auditor Login', 'BITAINTEL Admin'],
});

export default function AdminLoginPage() {
  const adminLoginSchema = createWebPageJsonLd({
    title: 'Compliance Authority Sign In | BITAINTEL',
    description: 'Sign in to the BITAINTEL Statutory Verification & Compliance Authority Desk.',
    pathname: '/admin/login',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Admin Sign In', url: '/demo/admin/login' },
    ],
  });

  return (
    <>
      <JsonLd schema={adminLoginSchema} />
      <Suspense
        fallback={
          <div className="min-h-[calc(100vh-140px)] bg-slate-900 flex items-center justify-center p-8 text-center text-xs text-slate-400">
            Loading compliance authority portal...
          </div>
        }
      >
        <LoginPortalView initialPortal="admin" />
      </Suspense>
    </>
  );
}
