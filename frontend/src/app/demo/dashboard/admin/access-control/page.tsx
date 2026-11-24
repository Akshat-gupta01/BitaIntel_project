'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/context/AuthContext';
import { AccessControlWorkspace } from '@/components/dashboard/admin/AccessControlWorkspace';
import { Logo } from '@/components/ui/Logo';
import {
  ShieldCheck,
  Building2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  LayoutDashboard,
  Menu,
  X,
  History,
  Settings,
  Scale,
  Calendar,
  MessageSquare,
  ArrowLeft,
  ArrowUpRight,
} from 'lucide-react';

export default function AdminAccessControlPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const sidebarNavItems = [
    {
      id: 'overview',
      label: 'Compliance Operations',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'queue',
      label: 'Vendor Verification Queue',
      icon: Clock,
      badge: null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'enquiries',
      label: 'Buyer Enquiries & RFQs',
      icon: MessageSquare,
      badge: 'Admin Only',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'vendors',
      label: 'Master Vendor Directory',
      icon: Building2,
      badge: null,
      badgeColor: 'bg-slate-100 text-slate-600',
    },
    {
      id: 'verified',
      label: 'Audited & Verified',
      icon: Eye,
      badge: null,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'action_required',
      label: 'Clarifications Required',
      icon: AlertTriangle,
      badge: null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'rejected',
      label: 'Rejected Dossiers',
      icon: XCircle,
      badge: null,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'expiring',
      label: 'Certificate Radar',
      icon: Calendar,
      badge: '30d Watch',
      badgeColor: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'logs',
      label: 'Auditor Activity Logs',
      icon: History,
      badge: null,
      badgeColor: 'bg-slate-100 text-slate-600',
    },
    {
      id: 'scoring',
      label: 'Trust Scoring Matrix',
      icon: Scale,
      badge: '7 Dimensions',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'access_control',
      label: 'Access Control',
      icon: ShieldCheck,
      badge: 'RBAC',
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      id: 'settings',
      label: 'Auditor Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/demo/login');
    } catch {
      router.push('/demo/login');
    }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'super_admin']}>
      <div className="h-screen w-full bg-slate-50 flex flex-col md:flex-row overflow-hidden font-sans text-slate-900">
        {/* ========================================================================= */}
        {/* 1. LEFT SIDEBAR NAVIGATION (Synchronized with Admin Workflows)            */}
        {/* ========================================================================= */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 h-full bg-white text-slate-800 border-r border-slate-200/80 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col justify-between shrink-0 overflow-hidden shadow-xs ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Top Brand Header */}
          <div className="p-5 border-b border-slate-200/80 shrink-0 bg-white">
            <div className="flex items-center justify-between">
              <Link href="/demo" className="flex items-center group py-0.5" title="Return to BITAINTEL Home">
                <Logo variant="default" size="md" showTagline={false} />
              </Link>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="size-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 grid place-items-center md:hidden"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Admin Desk Badge & Officer Profile Card */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-900 text-white space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-300 bg-primary-950 px-2 py-0.5 rounded-full border border-primary-700/60 flex items-center gap-1">
                  <ShieldCheck className="size-3 text-primary-400" />
                  <span>Admin Desk</span>
                </span>
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" title="System Live" />
              </div>
              <div>
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Super Administrator'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.designation || 'Verification Officer & Auditor'}</p>
              </div>
              <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-300">
                <span>Authority: <strong className="text-emerald-400">Platform IAM</strong></span>
                <span className="font-mono bg-white/10 px-1.5 py-0.2 rounded text-slate-200">
                  {user?.systemRole || 'super_admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1 bg-white">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Auditor Workflows & Registry
            </p>

            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'access_control';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'access_control') {
                      setMobileSidebarOpen(false);
                      return;
                    }
                    router.push(`/demo/dashboard/admin?tab=${item.id}`);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`size-4 ${isActive ? 'text-primary-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isActive
                          ? 'bg-slate-800 text-slate-200 border border-slate-700'
                          : item.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Profile & Actions */}
          <div className="p-4 border-t border-slate-200/80 space-y-2 bg-white shrink-0">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <span className="truncate max-w-[130px] font-medium text-slate-700">{user?.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ========================================================================= */}
        {/* 2. MAIN WORKSPACE CONTENT AREA                                           */}
        {/* ========================================================================= */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header Bar */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden hover:bg-slate-50"
                aria-label="Open sidebar"
              >
                <Menu className="size-5" />
              </button>

              <div className="flex items-center gap-2">
                <Link
                  href="/demo/dashboard/admin"
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition py-1 px-2 rounded-lg hover:bg-slate-100"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Admin Desk</span>
                </Link>
                <span className="hidden sm:inline text-slate-300">/</span>
                <span className="text-xs font-bold text-slate-900">Access Control & Role Matrix</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/demo/dashboard/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
              >
                <span>Operational Queue →</span>
              </Link>
            </div>
          </header>

          {/* Main Body - DEDICATED RBAC WORKSPACE (No unrelated vendor metrics) */}
          <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
            <AccessControlWorkspace />
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
