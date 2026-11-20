'use client';

import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { LoginForm } from '@/components/auth/LoginForm';
import {
  Building2,
  ShieldCheck,
  Award,
  ArrowRight,
  Lock,
  Scale,
  FileCheck2,
} from 'lucide-react';

export interface LoginPortalViewProps {
  initialPortal?: 'vendor' | 'admin';
}

export function LoginPortalView({ initialPortal = 'vendor' }: LoginPortalViewProps) {
  const isVendor = initialPortal === 'vendor';

  return (
    <div
      className={`min-h-[calc(100vh-140px)] py-10 sm:py-16 transition-colors duration-500 ${
        isVendor
          ? 'bg-gradient-to-b from-slate-50 via-white to-slate-50'
          : 'bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white'
      }`}
    >
      <Container>
        {/* Main Grid: Left Value Proposition & Right Sign In Form */}
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center max-w-5xl mx-auto">
          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN: DYNAMIC BASED ON PORTAL (VENDOR vs ADMIN)                 */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <div className="space-y-6">
            {isVendor ? (
              // Vendor View
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-bold text-primary-800">
                  <Building2 className="size-3.5" />
                  <span>Vendor Workspace & Trust Score Portal</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Manage Your Verified <br />
                  <span className="text-primary-700">Enterprise Profile.</span>
                </h1>

                <p className="text-sm sm:text-base leading-relaxed text-slate-600">
                  Access your official BITAINTEL vendor workspace. Upload compliance documentation
                  (Modules A–F), view your real-time 0–100 Trust Index, track audit milestones, and
                  respond to commercial buyer RFIs.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Award className="size-4 text-primary-600" />
                      <span>0–100 Trust Score Simulator</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Track dynamic weighted contributions across GSTN, MCA, physical factory audits,
                      and financial health.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="size-4 text-primary-600" />
                      <span>Incoming Procurement Enquiries</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Buyers browse your verified statutory profile and send direct procurement
                      inquiries without needing buyer logins.
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
            ) : (
              // Admin & Compliance Authority View
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300">
                  <ShieldCheck className="size-3.5 text-indigo-400" />
                  <span>Compliance Authority & Oversight Desk</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Statutory Verification & <br />
                  <span className="text-indigo-400">Audit Oversight.</span>
                </h1>

                <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                  Administrative gateway for BITAINTEL verification officers and statutory auditors.
                  Review submitted dossiers (Modules A–F), inspect RoC and GSTN cross-checks, audit
                  0–100 Trust Indices, and manage verified vendor listings.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md space-y-1">
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <Scale className="size-4 text-indigo-400" />
                      <span>MCA & GSTN Verification Gateway</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Cross-verify RoC filings, 15-digit GSTIN authenticity, active taxpayer status,
                      and authorized director DINs in real-time.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md space-y-1">
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <FileCheck2 className="size-4 text-emerald-400" />
                      <span>Trust Index & Badge Adjudication</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Calibrate 0–100 scoring matrices, inspect physical factory audits, and award
                      Platinum, Gold, Silver or Verified badges.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md space-y-1">
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <Lock className="size-4 text-amber-400" />
                      <span>Restricted Administrative Access</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Multi-factor authentication checkpoint with automated session logging and
                      role-governed audit access.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                  <span>Are you an enterprise vendor?</span>
                  <Link
                    href="/demo/login"
                    className="font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                  >
                    Go to Vendor Workspace <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN: LOGIN FORM CARD (STYLED FOR ACTIVE PORTAL)             */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <div
            className={`rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 border ${
              isVendor
                ? 'bg-white border-slate-200'
                : 'bg-slate-800/95 border-slate-700 text-slate-100 shadow-indigo-950/50'
            }`}
          >
            {/* Form Header */}
            <div className="mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className={`text-lg sm:text-xl font-bold tracking-tight ${
                      isVendor ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {isVendor ? 'Vendor Workspace Sign In' : 'Administrative Authority Sign In'}
                  </h2>
                  <p
                    className={`text-xs mt-0.5 ${isVendor ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    {isVendor
                      ? 'Enter your credentials to manage your verified vendor profile.'
                      : 'Authorized personnel only. Access compliance audit terminal.'}
                  </p>
                </div>
                <div
                  className={`size-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    isVendor ? 'bg-primary-50 text-primary-700' : 'bg-indigo-500/20 text-indigo-400'
                  }`}
                >
                  {isVendor ? <Building2 className="size-5" /> : <ShieldCheck className="size-5" />}
                </div>
              </div>

              {!isVendor && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
                  <Lock className="size-3.5 shrink-0 text-amber-400" />
                  <span>Role verification active: Only Admin & SuperAdmin accounts are granted dashboard access.</span>
                </div>
              )}
            </div>

            <LoginForm portal={initialPortal} />
          </div>
        </div>
      </Container>
    </div>
  );
}
