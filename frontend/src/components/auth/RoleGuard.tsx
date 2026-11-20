'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, redirectTo }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  const isRoleAllowed = React.useMemo(() => {
    if (!user || !allowedRoles || allowedRoles.length === 0) return true;
    const userRole = (user.role || '').toLowerCase();
    const systemRole = (user.systemRole || '').toLowerCase();
    return (
      allowedRoles.some((r) => r.toLowerCase() === userRole) ||
      (systemRole ? allowedRoles.some((r) => r.toLowerCase() === systemRole) : false)
    );
  }, [user, allowedRoles]);

  useEffect(() => {
    // If authentication check is finished and user is not authenticated, redirect to login page immediately
    if (!isLoading && (!isAuthenticated || !user)) {
      const target = pathname ? `/demo/login?redirect=${encodeURIComponent(pathname)}` : '/demo/login';
      router.replace(target);
      return;
    }

    // Role check if authenticated
    if (!isLoading && isAuthenticated && user && !isRoleAllowed) {
      const isAdminUser =
        user.role === 'admin' ||
        user.role === 'super_admin' ||
        user.systemRole === 'admin' ||
        user.systemRole === 'super_admin' ||
        user.systemRole === 'verification_officer';

      const fallbackTarget = redirectTo || (isAdminUser ? '/demo/dashboard/admin' : '/demo/dashboard/vendor');
      router.replace(fallbackTarget);
    }
  }, [isLoading, isAuthenticated, user, router, pathname, isRoleAllowed, redirectTo]);

  // While checking auth state with backend, display security verification loader
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-primary-600 animate-spin" />
          <p className="text-xs font-bold text-slate-700 tracking-wide">
            Verifying security credentials...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, do NOT render protected dashboard children (redirection in progress)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-primary-600 animate-spin" />
          <p className="text-xs font-bold text-slate-700 tracking-wide">
            Unauthorized. Redirecting to Vendor Login...
          </p>
        </div>
      </div>
    );
  }

  // If authenticated user does not have permission for this route, block child render and show redirect loader
  if (!isRoleAllowed) {
    const isAdminUser =
      user.role === 'admin' ||
      user.role === 'super_admin' ||
      user.systemRole === 'admin' ||
      user.systemRole === 'super_admin' ||
      user.systemRole === 'verification_officer';

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-primary-600 animate-spin" />
          <p className="text-xs font-bold text-slate-700 tracking-wide">
            {isAdminUser ? 'Redirecting to Admin Verification Desk...' : 'Redirecting to your dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  // Authenticated user session verified
  return <>{children}</>;
}
