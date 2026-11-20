import { Suspense } from 'react';
import { JsonLd } from '@/components/shared/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { createWebPageJsonLd } from '@/lib/schema';
import { LoginPortalView } from '@/components/auth/LoginPortalView';

export const metadata = createPageMetadata({
  title: 'Sign In — Vendor Workspace & Admin Authority | BITAINTEL',
  description:
    'Sign in to BITAINTEL. Select Vendor Workspace to manage your statutory compliance dossier and 0–100 Trust Score, or select Admin Authority Desk for statutory verification oversight.',
  pathname: '/login',
  keywords: ['Vendor Login', 'Business Sign In', 'Admin Login', 'Trust Score Dashboard', 'BITAINTEL Login'],
});

export default function LoginPage() {
  const loginSchema = createWebPageJsonLd({
    title: 'Sign In | BITAINTEL',
    description: 'Sign in to BITAINTEL Vendor Workspace or Admin Authority.',
    pathname: '/login',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Sign In', url: '/login' },
    ],
  });

  return (
    <>
      <JsonLd schema={loginSchema} />
      <Suspense
        fallback={
          <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-8 text-center text-xs text-slate-500">
            Loading authentication portal...
          </div>
        }
      >
        <LoginPortalView initialPortal="vendor" />
      </Suspense>
    </>
  );
}
