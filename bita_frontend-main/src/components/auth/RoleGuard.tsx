'use client';

import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, LogIn, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RoleGuardProps {
  children: React.ReactNode;
}

export function RoleGuard({ children }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth();

  // If user is not authenticated, show friendly sign-in prompt
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl space-y-4">
          <div className="mx-auto size-14 rounded-2xl bg-primary-50 text-primary-700 border border-primary-200 grid place-items-center">
            <ShieldAlert className="size-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Vendor Sign In Required</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            This dashboard contains confidential statutory dossiers and requires an authenticated vendor session.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="primary"
              href="/demo/login"
              className="w-full justify-center"
              icon={<LogIn className="size-4" />}
            >
              Sign In to Vendor Dashboard
            </Button>
            <Button
              variant="secondary"
              href="/demo/register"
              className="w-full justify-center"
              rightIcon={<ArrowRight className="size-4" />}
            >
              Register New Business
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
