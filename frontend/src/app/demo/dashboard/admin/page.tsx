'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/context/AuthContext';
import {
  AdminQueueItem,
  getVerificationQueue,
  getAllVendors,
} from '@services/admin.service';
import { VendorAuditModal } from '@/components/dashboard/admin/VendorAuditModal';
import { AccessControl } from '@/components/dashboard/admin/AccessControl';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Building2,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  XCircle,
  Eye,
  LayoutDashboard,
  Menu,
  X,
  History,
  Settings,
  Scale,
  Calendar,
} from 'lucide-react';

export type AdminNavTab =
  | 'overview'
  | 'queue'
  | 'vendors'
  | 'verified'
  | 'action_required'
  | 'rejected'
  | 'expiring'
  | 'scoring'
  | 'logs'
  | 'settings'
  | 'access_control';

export interface AuditLogEntry {
  id: string;
  companyName: string;
  gstin: string;
  decision: 'APPROVED' | 'REJECTED' | 'ACTION_REQUIRED';
  auditor: string;
  timestamp: string;
  notes: string;
  scoreAwarded?: number;
  badgeAwarded?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Sidebar navigation state
  const [activeTab, setActiveTab] = useState<AdminNavTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data states
  const [queue, setQueue] = useState<AdminQueueItem[]>([]);
  const [allVendors, setAllVendors] = useState<AdminQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [badgeFilter, setBadgeFilter] = useState<string>('all');

  // Modal audit state
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [selectedVendorInitial, setSelectedVendorInitial] = useState<AdminQueueItem | undefined>(undefined);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Local persistent audit log state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'LOG-101',
      companyName: 'Meridian Steel Works Ltd',
      gstin: '27AABCM8291Q1Z4',
      decision: 'APPROVED',
      auditor: 'Admin Verification Officer',
      timestamp: 'Today, 02:15 PM',
      notes: 'GSTIN active, 240 subcategories cross-checked, banking cancelled cheque verified.',
      scoreAwarded: 89,
      badgeAwarded: 'Gold',
    },
    {
      id: 'LOG-100',
      companyName: 'Nexora Precision Systems Ltd',
      gstin: '27AABCN9812M1ZF',
      decision: 'APPROVED',
      auditor: 'Super Administrator',
      timestamp: 'Yesterday, 04:45 PM',
      notes: 'Level 2 audit complete. ISO 9001 and plant CNC machinery inspected.',
      scoreAwarded: 92,
      badgeAwarded: 'Platinum',
    },
  ]);

  // Load Dashboard Data
  const loadData = async (showLoadingState = true) => {
    if (showLoadingState) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [queueRes, vendorsRes] = await Promise.allSettled([
        getVerificationQueue(),
        getAllVendors(),
      ]);

      if (queueRes.status === 'fulfilled') {
        setQueue(queueRes.value?.queue || []);
      }
      if (vendorsRes.status === 'fulfilled') {
        setAllVendors(vendorsRes.value?.vendors || []);
      }
    } catch (err: unknown) {
      console.error('Error fetching admin data:', err);
      const msg = err instanceof Error ? err.message : 'Please check your backend connection.';
      toast.error('Failed to refresh data', {
        description: msg,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        const [queueRes, vendorsRes] = await Promise.allSettled([
          getVerificationQueue(),
          getAllVendors(),
        ]);
        if (!isMounted) return;
        if (queueRes.status === 'fulfilled') {
          setQueue(queueRes.value?.queue || []);
        }
        if (vendorsRes.status === 'fulfilled') {
          setAllVendors(vendorsRes.value?.vendors || []);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        console.error('Error fetching initial admin data:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculated Metrics
  const metrics = useMemo(() => {
    const total = allVendors.length;
    const pending = queue.length;
    const verified = allVendors.filter(
      (v) => v.verificationStatus === 'Verified' || v.verificationStatus === 'approved' || v.verified === true
    ).length;
    const rejected = allVendors.filter(
      (v) => v.verificationStatus === 'Rejected' || v.statutory?.gstnStatus === 'INVALID'
    ).length;

    const scoredVendors = allVendors.filter((v) => typeof v.score === 'number' && v.score > 0);
    const avgScore =
      scoredVendors.length > 0
        ? Math.round(scoredVendors.reduce((acc, v) => acc + (v.score || 0), 0) / scoredVendors.length)
        : 78;

    return { total, pending, verified, rejected, avgScore };
  }, [allVendors, queue]);

  // Filtered Lists
  const filteredQueue = useMemo(() => {
    if (!searchQuery.trim()) return queue;
    const q = searchQuery.toLowerCase().trim();
    return queue.filter(
      (v) =>
        v.name?.toLowerCase().includes(q) ||
        v.legalName?.toLowerCase().includes(q) ||
        v.statutory?.gstin?.toLowerCase().includes(q) ||
        v.statutory?.pan?.toLowerCase().includes(q) ||
        v.owner?.fullName?.toLowerCase().includes(q) ||
        v.owner?.email?.toLowerCase().includes(q)
    );
  }, [queue, searchQuery]);

  const verifiedVendorsList = useMemo(() => {
    return allVendors.filter(
      (v) => v.verificationStatus === 'Verified' || v.verificationStatus === 'approved' || v.verified === true
    );
  }, [allVendors]);

  const actionRequiredVendorsList = useMemo(() => {
    return allVendors.filter(
      (v) => v.verificationStatus === 'action_required'
    );
  }, [allVendors]);

  const rejectedVendorsList = useMemo(() => {
    return allVendors.filter(
      (v) => v.verificationStatus === 'Rejected' || v.statutory?.gstnStatus === 'INVALID'
    );
  }, [allVendors]);

  const expiringVendorsList = useMemo(() => {
    return allVendors.filter(
      (v) =>
        (v.certifications && v.certifications.some((c: { status?: string }) => c.status === 'Expiring Soon')) ||
        v.verificationStatus === 'Verified'
    );
  }, [allVendors]);

  const filteredVendors = useMemo(() => {
    return allVendors.filter((v) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          v.name?.toLowerCase().includes(q) ||
          v.legalName?.toLowerCase().includes(q) ||
          v.statutory?.gstin?.toLowerCase().includes(q) ||
          v.statutory?.pan?.toLowerCase().includes(q) ||
          v.owner?.fullName?.toLowerCase().includes(q) ||
          v.owner?.email?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (statusFilter !== 'all') {
        const isVerified = v.verificationStatus === 'Verified' || v.verificationStatus === 'approved' || v.verified;
        const isRejected = v.verificationStatus === 'Rejected' || v.statutory?.gstnStatus === 'INVALID';
        const isPending = !isVerified && !isRejected;

        if (statusFilter === 'verified' && !isVerified) return false;
        if (statusFilter === 'pending' && !isPending) return false;
        if (statusFilter === 'rejected' && !isRejected) return false;
      }

      if (badgeFilter !== 'all') {
        if ((v.badge || '').toLowerCase() !== badgeFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [allVendors, searchQuery, statusFilter, badgeFilter]);

  // Open audit modal for a vendor
  const handleOpenAudit = (vendor: AdminQueueItem) => {
    setSelectedVendorId(vendor.id);
    setSelectedVendorInitial(vendor);
    setIsAuditModalOpen(true);
  };

  // Callback on completion of audit
  const handleAuditComplete = (result: {
    decision: 'APPROVED' | 'REJECTED' | 'ACTION_REQUIRED';
    businessId: number;
    updatedData?: unknown;
  }) => {
    loadData(false);

    const data = (result.updatedData as Record<string, unknown> | undefined) || {};

    // Append to live audit logs
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      companyName: typeof data.companyName === 'string' ? data.companyName : `Business #${result.businessId}`,
      gstin: typeof data.gstin === 'string' ? data.gstin : 'GSTIN Validated',
      decision: result.decision,
      auditor: user?.name || 'Admin Auditor',
      timestamp: 'Just now',
      notes:
        typeof data.notes === 'string'
          ? data.notes
          : result.decision === 'APPROVED'
          ? 'Approved by Admin'
          : result.decision === 'ACTION_REQUIRED'
          ? 'Clarification requested from vendor'
          : 'Rejected by Admin',
      scoreAwarded: typeof data.finalScore === 'number' ? data.finalScore : typeof data.updatedTrustScore === 'number' ? data.updatedTrustScore : undefined,
      badgeAwarded: typeof data.finalBadge === 'string' ? data.finalBadge : typeof data.badge === 'string' ? data.badge : undefined,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/demo/login');
    } catch {
      router.push('/demo/login');
    }
  };

  // Synchronized Sidebar Navigation Items
  const sidebarNavItems: {
    id: AdminNavTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number | null;
    badgeColor?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Admin Overview',
      icon: LayoutDashboard,
      badge: `${metrics.avgScore} Avg`,
      badgeColor: 'bg-primary-100 text-primary-800',
    },
    {
      id: 'queue',
      label: 'Verification Queue',
      icon: Clock,
      badge: metrics.pending > 0 ? `${metrics.pending} Pending` : '0',
      badgeColor: metrics.pending > 0 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-100 text-slate-600',
    },
    {
      id: 'vendors',
      label: 'All Vendors Directory',
      icon: Building2,
      badge: metrics.total,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'verified',
      label: 'Audited & Verified',
      icon: CheckCircle2,
      badge: metrics.verified,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'action_required',
      label: 'Action Required / Resubmit',
      icon: AlertTriangle,
      badge: actionRequiredVendorsList.length > 0 ? actionRequiredVendorsList.length : null,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold',
    },
    {
      id: 'rejected',
      label: 'Flagged & Rejected',
      icon: XCircle,
      badge: metrics.rejected,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'expiring',
      label: 'Expiring Certifications',
      icon: Calendar,
      badge: expiringVendorsList.length > 0 ? `${expiringVendorsList.length}` : null,
      badgeColor: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'scoring',
      label: 'Trust Scoring Matrix',
      icon: Scale,
      badge: '7 Dimensions',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'logs',
      label: 'Audit Trail & Logs',
      icon: History,
      badge: auditLogs.length,
      badgeColor: 'bg-slate-100 text-slate-600',
    },
    {
      id: 'settings',
      label: 'Auditor Settings',
      icon: Settings,
      badge: null,
    },
    {
      id: 'access_control',
      label: 'Access Control',
      icon: ShieldCheck,
      badge: 'RBAC',
      badgeColor: 'bg-teal-100 text-teal-800',
    },
  ];

  return (
    <RoleGuard allowedRoles={['admin', 'super_admin', 'verification_officer']}>
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
                <span>Authority: <strong className="text-emerald-400">Level 2 Audit</strong></span>
                <span className="font-mono bg-white/10 px-1.5 py-0.2 rounded text-slate-200">
                  {user?.systemRole || 'super_admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links (Synchronized Tabs) */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1 bg-white">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Auditor Workflows & Registry
            </p>

            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedVendorId(null);
                    setSelectedVendorInitial(undefined);
                    setIsAuditModalOpen(false);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive && !selectedVendorId
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
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
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
          {isAuditModalOpen && selectedVendorId ? (
            <VendorAuditModal
              businessId={selectedVendorId}
              initialVendor={selectedVendorInitial}
              isOpen={isAuditModalOpen}
              onClose={() => {
                setIsAuditModalOpen(false);
                setSelectedVendorId(null);
                setSelectedVendorInitial(undefined);
              }}
              onAuditComplete={handleAuditComplete}
            />
          ) : (
            <div className="flex-1 flex flex-col min-w-0">
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

                  <div>
                    <h1 className="text-base sm:text-lg font-black text-slate-900 capitalize flex items-center gap-2">
                      <span>
                        {activeTab === 'overview' && 'Compliance Operations & Scoring'}
                        {activeTab === 'queue' && 'Vendor Verification Queue (Awaiting Audit)'}
                        {activeTab === 'vendors' && 'Master Vendor Directory'}
                        {activeTab === 'verified' && 'Audited & Verified Suppliers'}
                        {activeTab === 'action_required' && 'Clarification Required (Action Pending)'}
                        {activeTab === 'rejected' && 'Flagged / Rejected Supplier Dossiers'}
                        {activeTab === 'expiring' && 'Certificate Expiry & Renewal Radar'}
                        {activeTab === 'scoring' && '7-Dimension Trust Score Engine Matrix'}
                        {activeTab === 'logs' && 'Auditor Activity Trail & Compliance Log'}
                        {activeTab === 'settings' && 'Auditor Access & Verification Settings'}
                        {activeTab === 'access_control' && 'Access Control & Role Permissions Matrix'}
                      </span>
                    </h1>
                    <p className="text-[11px] text-slate-500 hidden sm:block">
                      BITAINTEL Enterprise Governance • Real-time Statutory Due Diligence Engine
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadData(false)}
                    disabled={isRefreshing || isLoading}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                  </Button>
                </div>
              </header>

              {/* Main Content Body */}
              <div className="p-4 sm:p-8 space-y-6">
            {/* Top 5 KPI Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
              <div
                onClick={() => setActiveTab('vendors')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                  activeTab === 'vendors' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'vendors' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Total Vendors
                  </span>
                  <Building2 className={`size-4 ${activeTab === 'vendors' ? 'text-primary-300' : 'text-slate-400'}`} />
                </div>
                <p className="text-2xl font-black">{metrics.total}</p>
                <p className={`text-[10px] mt-0.5 ${activeTab === 'vendors' ? 'text-slate-400' : 'text-slate-500'}`}>
                  In master directory
                </p>
              </div>

              <div
                onClick={() => setActiveTab('queue')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                  activeTab === 'queue' ? 'bg-amber-500 text-white border-amber-600' : 'bg-white border-amber-200 bg-linear-to-b from-amber-50/40 to-white hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'queue' ? 'text-amber-100' : 'text-amber-700'}`}>
                    Queue Pending
                  </span>
                  <Clock className={`size-4 ${activeTab === 'queue' ? 'text-white' : 'text-amber-600'}`} />
                </div>
                <p className={`text-2xl font-black ${activeTab === 'queue' ? 'text-white' : 'text-amber-950'}`}>
                  {metrics.pending}
                </p>
                <p className={`text-[10px] mt-0.5 ${activeTab === 'queue' ? 'text-amber-100' : 'text-amber-700/80'}`}>
                  Awaiting audit action
                </p>
              </div>

              <div
                onClick={() => setActiveTab('verified')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                  activeTab === 'verified' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white border-emerald-200 bg-linear-to-b from-emerald-50/40 to-white hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'verified' ? 'text-emerald-100' : 'text-emerald-700'}`}>
                    Verified Suppliers
                  </span>
                  <CheckCircle2 className={`size-4 ${activeTab === 'verified' ? 'text-white' : 'text-emerald-600'}`} />
                </div>
                <p className={`text-2xl font-black ${activeTab === 'verified' ? 'text-white' : 'text-emerald-950'}`}>
                  {metrics.verified}
                </p>
                <p className={`text-[10px] mt-0.5 ${activeTab === 'verified' ? 'text-emerald-100' : 'text-emerald-700/80'}`}>
                  Trust score issued
                </p>
              </div>

              <div
                onClick={() => setActiveTab('rejected')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                  activeTab === 'rejected' ? 'bg-rose-600 text-white border-rose-700' : 'bg-white border-rose-200 bg-linear-to-b from-rose-50/40 to-white hover:border-rose-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'rejected' ? 'text-rose-100' : 'text-rose-700'}`}>
                    Flagged / Rejected
                  </span>
                  <XCircle className={`size-4 ${activeTab === 'rejected' ? 'text-white' : 'text-rose-600'}`} />
                </div>
                <p className={`text-2xl font-black ${activeTab === 'rejected' ? 'text-white' : 'text-rose-950'}`}>
                  {metrics.rejected}
                </p>
                <p className={`text-[10px] mt-0.5 ${activeTab === 'rejected' ? 'text-rose-100' : 'text-rose-700/80'}`}>
                  Invalidated records
                </p>
              </div>

              <div
                onClick={() => setActiveTab('scoring')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs col-span-2 md:col-span-1 ${
                  activeTab === 'scoring' ? 'bg-primary-950 text-white border-primary-950' : 'bg-white border-primary-200 bg-linear-to-b from-primary-50/40 to-white hover:border-primary-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'scoring' ? 'text-primary-300' : 'text-primary-800'}`}>
                    Avg Trust Score
                  </span>
                  <Sparkles className={`size-4 ${activeTab === 'scoring' ? 'text-primary-300' : 'text-primary-600'}`} />
                </div>
                <div className="flex items-baseline gap-1">
                  <p className={`text-2xl font-black ${activeTab === 'scoring' ? 'text-white' : 'text-primary-950'}`}>
                    {metrics.avgScore}
                  </p>
                  <span className={`text-xs font-bold ${activeTab === 'scoring' ? 'text-primary-300' : 'text-slate-400'}`}>/ 100</span>
                </div>
                <p className={`text-[10px] mt-0.5 ${activeTab === 'scoring' ? 'text-primary-300' : 'text-primary-800/80'}`}>
                  7-Dimension Matrix
                </p>
              </div>
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Pending Actions Quick Banner */}
                {metrics.pending > 0 && (
                  <div className="p-5 rounded-2xl border border-amber-300 bg-linear-to-r from-amber-500/10 via-amber-50/70 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-center gap-3.5">
                      <div className="size-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                        <Clock className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {metrics.pending} Vendor Dossiers Awaiting Audit
                        </h3>
                        <p className="text-xs text-slate-600">
                          Suppliers have submitted Step 1 to Step 5 credentials. Verify GSTIN & banking proofs to activate their profile.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveTab('queue')}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 self-start sm:self-auto shrink-0"
                    >
                      <span>Review Verification Queue</span>
                      <ArrowUpRight className="size-3.5 ml-1" />
                    </Button>
                  </div>
                )}

                {/* Split Grid: Queue Summary + Recent Audit Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Pending Vendors */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Pending Review Queue</h4>
                        <p className="text-xs text-slate-500">Recently submitted supplier applications</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('queue')}
                        className="text-xs font-bold text-primary-700 hover:underline"
                      >
                        View All ({queue.length}) →
                      </button>
                    </div>

                    {queue.length === 0 ? (
                      <div className="py-10 text-center text-xs text-slate-500">
                        <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2" />
                        <p className="font-bold text-slate-700">Verification queue is completely clear!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 text-xs">
                        {queue.slice(0, 4).map((v) => (
                          <div key={v.id} className="py-3 flex items-center justify-between gap-3">
                            <div>
                              <p className="font-bold text-slate-900">{v.legalName || v.name}</p>
                              <p className="text-[11px] text-slate-500">
                                GSTIN: <span className="font-mono text-slate-700">{v.statutory?.gstin || 'Pending'}</span> • {v.owner?.fullName || 'Signatory'}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenAudit(v)}
                              className="text-xs px-3 py-1 text-primary-800 border-primary-200 hover:bg-primary-50"
                            >
                              <span>Audit</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Compliance Logs */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Recent Audit Decisions</h4>
                        <p className="text-xs text-slate-500">Chronological trail of verified credentials</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('logs')}
                        className="text-xs font-bold text-primary-700 hover:underline"
                      >
                        Full Audit Log →
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs">
                      {auditLogs.slice(0, 4).map((log) => (
                        <div key={log.id} className="py-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{log.companyName}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                log.decision === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {log.decision}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{log.notes}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Auditor: {log.auditor}</span>
                            <span>{log.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: VERIFICATION QUEUE */}
            {activeTab === 'queue' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Pending Review Queue ({filteredQueue.length})</h3>
                    <p className="text-xs text-slate-500">
                      Suppliers awaiting statutory inspection, dual OTP check, and Level 2 badge computation.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search company or GSTIN..."
                      className="w-full text-xs pl-9 pr-3 py-1.5 bg-white rounded-xl border border-slate-200 outline-none focus:border-primary-600"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="py-20 text-center">
                    <div className="size-8 border-3 border-primary-200 border-t-primary-800 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-600">Loading pending verification dossiers...</p>
                  </div>
                ) : filteredQueue.length === 0 ? (
                  <div className="py-16 text-center text-slate-500">
                    <CheckCircle2 className="size-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800">No Applications Pending Review</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchQuery ? 'No suppliers match your search filters.' : 'All supplier registrations have been audited!'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                        <tr>
                          <th className="py-3 px-6">Company & Identity</th>
                          <th className="py-3 px-6">Authorized Signatory</th>
                          <th className="py-3 px-6">Statutory IDs</th>
                          <th className="py-3 px-6">Status</th>
                          <th className="py-3 px-6">Turnaround & SLA</th>
                          <th className="py-3 px-6">Submitted Date</th>
                          <th className="py-3 px-6 text-right">Audit Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredQueue.map((vendor) => (
                          <tr key={vendor.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-4 px-6">
                              <p className="font-bold text-slate-900 text-sm">{vendor.legalName || vendor.name}</p>
                              <p className="text-[11px] text-slate-500">
                                {vendor.companyType || 'Corporate'} • {vendor.city || 'India'}
                              </p>
                            </td>

                            <td className="py-4 px-6">
                              <p className="font-medium text-slate-800">{vendor.owner?.fullName || 'Not Provided'}</p>
                              <p className="text-[11px] text-slate-500">{vendor.owner?.email || 'N/A'}</p>
                            </td>

                            <td className="py-4 px-6">
                              <div className="font-mono text-slate-800 text-[11px]">
                                <span>GSTIN: {vendor.statutory?.gstin || 'Pending'}</span>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm inline-block mt-0.5 ${
                                  vendor.statutory?.gstnStatus === 'ACTIVE'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                GSTN: {vendor.statutory?.gstnStatus || 'PENDING'}
                              </span>
                            </td>

                            <td className="py-4 px-6">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                <Clock className="size-3 text-amber-600" />
                                <span>{vendor.verificationStatus || 'In Review'}</span>
                              </span>
                            </td>

                            <td className="py-4 px-6">
                              {(() => {
                                const daysInQueue = vendor.updatedAt
                                  ? Math.max(1, Math.floor((Date.now() - new Date(vendor.updatedAt).getTime()) / (1000 * 3600 * 24)))
                                  : 1;
                                const isPriority = daysInQueue > 2;
                                return (
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-slate-800 text-[11px] block">
                                      {daysInQueue} {daysInQueue === 1 ? 'Day' : 'Days'} in Queue
                                    </span>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded inline-block ${
                                        isPriority ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                      }`}
                                    >
                                      {isPriority ? '⚠️ Priority SLA' : '✓ Within 24h SLA'}
                                    </span>
                                  </div>
                                );
                              })()}
                            </td>

                            <td className="py-4 px-6 text-slate-500 text-[11px]">
                              {vendor.updatedAt ? new Date(vendor.updatedAt).toLocaleDateString() : 'Recent'}
                            </td>

                            <td className="py-4 px-6 text-right">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenAudit(vendor)}
                                className="bg-primary-950 hover:bg-primary-900 text-xs px-3.5 py-1.5 shadow-2xs"
                              >
                                <ShieldCheck className="size-3.5 mr-1 text-primary-400" />
                                <span>Audit Dossier</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: ALL VENDORS / VERIFIED / ACTION_REQUIRED / REJECTED / EXPIRING (Directory View) */}
            {(activeTab === 'vendors' ||
              activeTab === 'verified' ||
              activeTab === 'action_required' ||
              activeTab === 'rejected' ||
              activeTab === 'expiring') && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {activeTab === 'verified'
                        ? `Audited & Verified Suppliers (${verifiedVendorsList.length})`
                        : activeTab === 'action_required'
                        ? `Vendors Pending Clarification / Resubmission (${actionRequiredVendorsList.length})`
                        : activeTab === 'rejected'
                        ? `Flagged / Rejected Applications (${rejectedVendorsList.length})`
                        : activeTab === 'expiring'
                        ? `Certifications & Annual Re-Audits Due (${expiringVendorsList.length})`
                        : `Master Vendor Directory (${filteredVendors.length})`}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Complete database records with assigned Trust Scores, Level badges, and audit history.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-60">
                      <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search company, GSTIN, PAN..."
                        className="w-full text-xs pl-9 pr-3 py-1.5 bg-white rounded-xl border border-slate-200 outline-none focus:border-primary-600"
                      />
                    </div>

                    {activeTab === 'vendors' && (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="text-xs py-1.5 px-2 bg-white rounded-xl border border-slate-200 text-slate-700 outline-none"
                        >
                          <option value="all">All Statuses</option>
                          <option value="verified">Verified</option>
                          <option value="pending">Pending</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <select
                          value={badgeFilter}
                          onChange={(e) => setBadgeFilter(e.target.value)}
                          className="text-xs py-1.5 px-2 bg-white rounded-xl border border-slate-200 text-slate-700 outline-none"
                        >
                          <option value="all">All Badges</option>
                          <option value="platinum">Platinum</option>
                          <option value="gold">Gold</option>
                          <option value="silver">Silver</option>
                          <option value="verified">Verified</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {(() => {
                  const displayList =
                    activeTab === 'verified'
                      ? verifiedVendorsList
                      : activeTab === 'action_required'
                      ? actionRequiredVendorsList
                      : activeTab === 'rejected'
                      ? rejectedVendorsList
                      : activeTab === 'expiring'
                      ? expiringVendorsList
                      : filteredVendors;

                  if (isLoading) {
                    return (
                      <div className="py-20 text-center">
                        <div className="size-8 border-3 border-primary-200 border-t-primary-800 rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-xs font-bold text-slate-600">Loading vendor records...</p>
                      </div>
                    );
                  }

                  if (displayList.length === 0) {
                    return (
                      <div className="py-16 text-center text-slate-500">
                        <Building2 className="size-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-800">No Vendors Found</p>
                        <p className="text-xs text-slate-500 mt-1">No supplier records match the selected category.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                          <tr>
                            <th className="py-3 px-6">Vendor Company</th>
                            <th className="py-3 px-6">GSTIN & PAN</th>
                            <th className="py-3 px-6">Trust Score</th>
                            <th className="py-3 px-6">Tier Badge</th>
                            <th className="py-3 px-6">Status</th>
                            <th className="py-3 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {displayList.map((vendor) => {
                            const isVerified =
                              vendor.verificationStatus === 'Verified' ||
                              vendor.verificationStatus === 'approved' ||
                              vendor.verified;

                            return (
                              <tr key={vendor.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-4 px-6">
                                  <p className="font-bold text-slate-900 text-sm">{vendor.legalName || vendor.name}</p>
                                  <p className="text-[11px] text-slate-500">
                                    {vendor.companyType || 'Corporate'} • {vendor.owner?.fullName || 'Contact'}
                                  </p>
                                </td>

                                <td className="py-4 px-6">
                                  <p className="font-mono text-slate-800 text-[11px]">
                                    {vendor.statutory?.gstin || 'No GSTIN'}
                                  </p>
                                  <p className="font-mono text-slate-400 text-[10px]">
                                    PAN: {vendor.statutory?.pan || 'N/A'}
                                  </p>
                                </td>

                                <td className="py-4 px-6">
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-base font-black text-slate-900">{vendor.score ?? 0}</span>
                                    <span className="text-[10px] text-slate-400">/ 100</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-bold block">
                                    Level {vendor.level || 1}
                                  </span>
                                </td>

                                <td className="py-4 px-6">
                                  <span
                                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                      vendor.badge === 'Platinum'
                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                        : vendor.badge === 'Gold'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : vendor.badge === 'Silver'
                                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}
                                  >
                                    ★ {vendor.badge || 'Verified'}
                                  </span>
                                </td>

                                <td className="py-4 px-6">
                                  <span
                                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                      isVerified
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : vendor.verificationStatus === 'Rejected'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {isVerified && <CheckCircle2 className="size-3 text-emerald-600" />}
                                    {vendor.verificationStatus === 'Rejected' && <XCircle className="size-3 text-rose-600" />}
                                    <span>{vendor.verificationStatus || 'Pending'}</span>
                                  </span>
                                </td>

                                <td className="py-4 px-6 text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenAudit(vendor)}
                                    className="text-xs text-slate-700 border-slate-200 hover:bg-slate-100 px-3 py-1.5"
                                  >
                                    <Eye className="size-3.5 mr-1 text-slate-500" />
                                    <span>View Dossier</span>
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB: SCORING ENGINE MATRIX */}
            {activeTab === 'scoring' && (
              <div className="space-y-6">
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md">
                  <div className="max-w-3xl">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-300 bg-primary-950 px-2.5 py-1 rounded-full border border-primary-700">
                      Scoring Architecture
                    </span>
                    <h3 className="text-xl font-black mt-2">BITAINTEL 7-Dimension Composite Trust Scoring Matrix</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Every supplier dossier is mathematically evaluated through 7 weighted dimensions totaling 100 points.
                      Admin verification of GSTIN, PAN, Bank Proof, and Facilities unlocks Level 2 and Platinum/Gold badges.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: '1. Statutory & Regulatory Compliance',
                      weight: '25% Weight',
                      points: '25 Points Max',
                      desc: 'Active GSTIN filing, PAN validation, MCA CIN/LLPIN match, MSME/Udyam & IEC documentation.',
                      color: 'border-blue-200 bg-blue-50/50',
                    },
                    {
                      title: '2. Governance & Key Management',
                      weight: '15% Weight',
                      points: '15 Points Max',
                      desc: 'Director DIN verification, authorized signatory dual OTP verification (SMS + Email), promoter KYC.',
                      color: 'border-purple-200 bg-purple-50/50',
                    },
                    {
                      title: '3. Financial Stability & Bank Settlement',
                      weight: '15% Weight',
                      points: '15 Points Max',
                      desc: 'Verified bank account, IFSC validation, cancelled cheque proof match, turnover disclosure.',
                      color: 'border-emerald-200 bg-emerald-50/50',
                    },
                    {
                      title: '4. Manufacturing & Operational Scale',
                      weight: '15% Weight',
                      points: '15 Points Max',
                      desc: 'Factory units, CNC/automated machinery, production capacity, in-house testing laboratories.',
                      color: 'border-amber-200 bg-amber-50/50',
                    },
                    {
                      title: '5. Quality & Standards Certifications',
                      weight: '10% Weight',
                      points: '10 Points Max',
                      desc: 'ISO 9001/14001, CE marking, NABL accredited test reports, validity status monitoring.',
                      color: 'border-indigo-200 bg-indigo-50/50',
                    },
                    {
                      title: '6. Commercial Terms & Trade Credit',
                      weight: '10% Weight',
                      points: '10 Points Max',
                      desc: 'Payment credit period, standard delivery terms, currency protocols, logistics empanelment.',
                      color: 'border-teal-200 bg-teal-50/50',
                    },
                    {
                      title: '7. Legal Declarations & Disclosures',
                      weight: '10% Weight',
                      points: '10 Points Max',
                      desc: 'Anti-bribery pledge, environmental compliance, no-litigation declaration, authenticity warranty.',
                      color: 'border-slate-200 bg-slate-50',
                    },
                  ].map((dim, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${dim.color} shadow-2xs space-y-1.5`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900">{dim.title}</h4>
                        <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                          {dim.weight}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{dim.desc}</p>
                      <span className="text-[10px] font-bold text-primary-800 block">{dim.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: AUDIT LOGS */}
            {activeTab === 'logs' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">System Audit Trail & Decision Logs</h3>
                  <p className="text-xs text-slate-500">Immutable ledger of auditor actions, GSTIN activations, and rejections.</p>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="py-4 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{log.companyName}</span>
                          <span className="font-mono text-[11px] text-slate-500">({log.gstin})</span>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full self-start sm:self-auto ${
                            log.decision === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.decision}
                        </span>
                      </div>
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{log.notes}</p>
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                        <span>Log ID: <strong className="font-mono text-slate-600">{log.id}</strong></span>
                        <span>Auditor: <strong className="text-slate-600">{log.auditor}</strong></span>
                        <span>Timestamp: {log.timestamp}</span>
                        {log.scoreAwarded && (
                          <span className="text-emerald-700 font-bold">
                            Score: {log.scoreAwarded}/100 ({log.badgeAwarded} Badge)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Auditor Permissions & Security Keys</h3>
                  <p className="text-xs text-slate-500">Platform administrator governance configuration.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 block">Logged-in Officer</span>
                    <span className="font-bold text-slate-900 text-sm">{user?.name || 'Super Administrator'}</span>
                    <span className="text-[11px] text-slate-500 block">{user?.email}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 block">Assigned Role</span>
                    <span className="font-bold text-slate-900 text-sm">Super Admin / Platform Head</span>
                    <span className="text-[11px] text-emerald-700 font-bold block">Full Statutory Approval Authority</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-primary-200 bg-primary-50/50 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-primary-950 flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-primary-700" />
                    <span>Level 2 Verification Security Protocol Active</span>
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    Statutory approvals trigger the 7-Dimension scoring algorithm on the backend. GSTIN records are marked as ACTIVE in database, and Trust Badges (Platinum, Gold, Silver) are generated in real-time.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: ACCESS CONTROL & RBAC MATRIX */}
            {activeTab === 'access_control' && <AccessControl />}
          </div>
            </div>
          )}
        </main>
      </div>
    </RoleGuard>
  );
}
