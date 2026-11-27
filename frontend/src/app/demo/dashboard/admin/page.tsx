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
  AdminEnquiryItem,
  getAdminEnquiries,
  updateAdminEnquiryStatus,
  replyAdminEnquiry,
  getAdminAuditLogs,
  getAdminContactInquiries,
  updateAdminContactStatus,
  type AdminContactInquiryItem,
  type ContactInquiryStatus,
  type BackendAuditLogItem,
} from '@services/admin.service';
import {
  getAdminComplaints,
  updateAdminComplaint,
  type ComplaintItem,
  type ComplaintStatus,
} from '@services/complaint.service';
import { VendorAuditModal } from '@/components/dashboard/admin/VendorAuditModal';
import { AccessControlWorkspace } from '@/components/dashboard/admin/AccessControlWorkspace';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Building2,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Mail,
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
  MessageSquare,
  Send,
  ClipboardList,
  ExternalLink,
} from 'lucide-react';

export type AdminNavTab =
  | 'overview'
  | 'queue'
  | 'enquiries'
  | 'enquiry_records'
  | 'complaints'
  | 'vendors'
  | 'verified'
  | 'action_required'
  | 'rejected'
  | 'expiring'
  | 'scoring'
  | 'logs'
  | 'contact_tickets'
  | 'settings'
  | 'access_control';

export interface AuditLogEntry {
  id: string;
  companyName: string;
  gstin: string;
  decision: 'APPROVED' | 'REJECTED' | 'ACTION_REQUIRED' | string;
  auditor: string;
  timestamp: string;
  notes: string;
  scoreAwarded?: number;
  badgeAwarded?: string;
}

function mapBackendAuditLog(item: BackendAuditLogItem): AuditLogEntry {
  const meta = (item.metadata || {}) as Record<string, unknown>;
  const decision =
    typeof meta.decision === 'string'
      ? meta.decision
      : item.action;
  return {
    id: `LOG-${item.id}`,
    companyName: item.companyName || `${item.targetType} #${item.targetId || item.id}`,
    gstin: typeof meta.gstin === 'string' ? meta.gstin : item.targetType,
    decision,
    auditor: item.actorName || item.actorRole || 'System',
    timestamp: item.createdAt
      ? new Date(item.createdAt).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Recent',
    notes: item.summary,
    scoreAwarded: typeof meta.score === 'number' ? meta.score : undefined,
    badgeAwarded: typeof meta.badge === 'string' ? meta.badge : undefined,
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout, hasPermission } = useAuth();

  // Sidebar navigation state
  const [activeTab, setActiveTab] = useState<AdminNavTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data states
  const [queue, setQueue] = useState<AdminQueueItem[]>([]);
  const [allVendors, setAllVendors] = useState<AdminQueueItem[]>([]);
  const [enquiries, setEnquiries] = useState<AdminEnquiryItem[]>([]);
  const [contactInquiries, setContactInquiries] = useState<AdminContactInquiryItem[]>([]);
  const [updatingContactId, setUpdatingContactId] = useState<number | null>(null);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [complaintStatusInput, setComplaintStatusInput] = useState<ComplaintStatus>('UNDER_INVESTIGATION');
  const [complaintAdminNotes, setComplaintAdminNotes] = useState('');
  const [isUpdatingComplaint, setIsUpdatingComplaint] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<AdminEnquiryItem | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminReplySuccess, setAdminReplySuccess] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [badgeFilter, setBadgeFilter] = useState<string>('all');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<string>('all');

  // Master Enquiry Table states
  const [enquirySearchQuery, setEnquirySearchQuery] = useState('');
  const [enquiryTableStatusFilter, setEnquiryTableStatusFilter] = useState<string>('all');
  const [enquiryTableVendorFilter, setEnquiryTableVendorFilter] = useState<string>('all');
  const [tableModalEnquiry, setTableModalEnquiry] = useState<AdminEnquiryItem | null>(null);
  const [tableModalReplyText, setTableModalReplyText] = useState('');
  const [tableModalIsReplying, setTableModalIsReplying] = useState(false);

  // Modal audit state
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [selectedVendorInitial, setSelectedVendorInitial] = useState<AdminQueueItem | undefined>(undefined);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Live persistent audit log state from DB
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Load Dashboard Data
  const loadData = async (showLoadingState = true) => {
    if (showLoadingState) setIsLoading(true);

    try {
      const [queueRes, vendorsRes, enquiriesRes, complaintsRes, logsRes, contactsRes] = await Promise.allSettled([
        getVerificationQueue(),
        getAllVendors(),
        getAdminEnquiries(),
        getAdminComplaints(),
        getAdminAuditLogs(),
        getAdminContactInquiries(),
      ]);

      if (queueRes.status === 'fulfilled') {
        setQueue(queueRes.value?.queue || []);
      }
      if (vendorsRes.status === 'fulfilled') {
        setAllVendors(vendorsRes.value?.vendors || []);
      }
      if (enquiriesRes.status === 'fulfilled') {
        const enqList = enquiriesRes.value?.enquiries || [];
        setEnquiries(enqList);
        if (enqList.length > 0) {
          setSelectedEnquiry((prev) => prev || enqList[0]);
        }
      }
      if (complaintsRes.status === 'fulfilled') {
        setComplaints(complaintsRes.value?.complaints || []);
      }
      if (logsRes.status === 'fulfilled') {
        setAuditLogs((logsRes.value?.logs || []).map(mapBackendAuditLog));
      }
      if (contactsRes.status === 'fulfilled') {
        setContactInquiries(contactsRes.value?.inquiries || []);
      }
    } catch (err: unknown) {
      console.error('Error fetching admin data:', err);
      const msg = err instanceof Error ? err.message : 'Please check your backend connection.';
      toast.error('Failed to refresh data', {
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        const [queueRes, vendorsRes, enquiriesRes, complaintsRes, logsRes, contactsRes] = await Promise.allSettled([
          getVerificationQueue(),
          getAllVendors(),
          getAdminEnquiries(),
          getAdminComplaints(),
          getAdminAuditLogs(),
          getAdminContactInquiries(),
        ]);
        if (!isMounted) return;
        if (queueRes.status === 'fulfilled') {
          setQueue(queueRes.value?.queue || []);
        }
        if (vendorsRes.status === 'fulfilled') {
          setAllVendors(vendorsRes.value?.vendors || []);
        }
        if (enquiriesRes.status === 'fulfilled') {
          const enqList = enquiriesRes.value?.enquiries || [];
          setEnquiries(enqList);
          if (enqList.length > 0) {
            setSelectedEnquiry(enqList[0]);
          }
        }
        if (complaintsRes.status === 'fulfilled') {
          setComplaints(complaintsRes.value?.complaints || []);
        }
        if (logsRes.status === 'fulfilled') {
          setAuditLogs((logsRes.value?.logs || []).map(mapBackendAuditLog));
        }
        if (contactsRes.status === 'fulfilled') {
          setContactInquiries(contactsRes.value?.inquiries || []);
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

  // Handle URL tab parameter if arriving from subpages like /access-control
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') as AdminNavTab | null;
      if (tabParam) {
        if (tabParam === 'access_control') {
          router.push('/demo/dashboard/admin/access-control');
        } else {
          queueMicrotask(() => {
            setActiveTab((prev) => (prev !== tabParam ? tabParam : prev));
          });
        }
      }
    }
  }, [router]);

  // Handle Admin Enquiry Status Change
  const handleAdminStatusChange = async (
    id: string,
    newStatus: 'New' | 'Viewed' | 'Responded' | 'In Discussion' | 'Closed/Rejected'
  ) => {
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id || e.enquiryNumber === id ? { ...e, status: newStatus } : e))
    );
    if (selectedEnquiry && (selectedEnquiry.id === id || selectedEnquiry.enquiryNumber === id)) {
      setSelectedEnquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    try {
      await updateAdminEnquiryStatus(id, newStatus);
      toast.success(`Enquiry status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status on server');
    }
  };

  // Handle Admin Reply / Proposal to Buyer
  const handleAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText || !selectedEnquiry) return;

    const currentId = selectedEnquiry.id || selectedEnquiry.enquiryNumber;
    const currentEmail = selectedEnquiry.buyerEmail;
    const textToSend = adminReplyText;

    handleAdminStatusChange(currentId, 'Responded');
    const msg = `Official response transmitted from Admin Desk to ${currentEmail}`;
    setAdminReplySuccess(msg);
    toast.success('Admin Proposal Sent', { description: msg });
    setAdminReplyText('');
    setTimeout(() => setAdminReplySuccess(''), 4000);

    // Update in-memory selected enquiry
    setEnquiries((prev) =>
      prev.map((item) =>
        item.id === currentId || item.enquiryNumber === currentId
          ? { ...item, status: 'Responded', replyMessage: textToSend, repliedAt: new Date().toISOString() }
          : item
      )
    );
    setSelectedEnquiry((prev) =>
      prev && (prev.id === currentId || prev.enquiryNumber === currentId)
        ? { ...prev, status: 'Responded', replyMessage: textToSend, repliedAt: new Date().toISOString() }
        : prev
    );

    try {
      await replyAdminEnquiry(currentId, textToSend);
    } catch {
      // Fallback
    }
  };

  // Master Enquiry Table - Unique Target Vendors for Dropdown
  const uniqueTargetVendors = useMemo(() => {
    const set = new Set<string>();
    enquiries.forEach((e) => {
      if (e.targetBusinessName) set.add(e.targetBusinessName);
    });
    return Array.from(set).sort();
  }, [enquiries]);

  // Master Enquiry Table - Filtered List
  const filteredTableEnquiries = useMemo(() => {
    return enquiries.filter((enq) => {
      if (enquirySearchQuery.trim()) {
        const q = enquirySearchQuery.toLowerCase().trim();
        const matchesRef = (enq.enquiryNumber || enq.id || '').toLowerCase().includes(q);
        const matchesBuyer =
          (enq.buyerCompany || '').toLowerCase().includes(q) ||
          (enq.buyerName || '').toLowerCase().includes(q) ||
          (enq.buyerEmail || '').toLowerCase().includes(q) ||
          (enq.buyerPhone || '').toLowerCase().includes(q);
        const matchesVendor = (enq.targetBusinessName || '').toLowerCase().includes(q);
        const matchesSubject =
          (enq.subject || '').toLowerCase().includes(q) ||
          (enq.productName || '').toLowerCase().includes(q) ||
          (enq.details || '').toLowerCase().includes(q);
        const matchesReply = (enq.replyMessage || '').toLowerCase().includes(q);
        if (!matchesRef && !matchesBuyer && !matchesVendor && !matchesSubject && !matchesReply) {
          return false;
        }
      }

      if (enquiryTableStatusFilter !== 'all') {
        if (enquiryTableStatusFilter === 'has_response') {
          if (!enq.replyMessage && enq.status !== 'Responded') return false;
        } else if (enquiryTableStatusFilter === 'pending_response') {
          if (enq.replyMessage || enq.status === 'Responded') return false;
        } else if (enq.status !== enquiryTableStatusFilter) {
          return false;
        }
      }

      if (enquiryTableVendorFilter !== 'all') {
        if (enq.targetBusinessName !== enquiryTableVendorFilter) return false;
      }

      return true;
    });
  }, [enquiries, enquirySearchQuery, enquiryTableStatusFilter, enquiryTableVendorFilter]);

  // Handle Response submission from Master Enquiry Table modal
  const handleTableModalReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableModalReplyText.trim() || !tableModalEnquiry) return;

    const currentId = tableModalEnquiry.enquiryNumber || tableModalEnquiry.id;
    const textToSend = tableModalReplyText.trim();
    setTableModalIsReplying(true);

    try {
      await replyAdminEnquiry(currentId, textToSend);
      await updateAdminEnquiryStatus(currentId, 'Responded');

      setEnquiries((prev) =>
        prev.map((item) =>
          item.id === currentId || item.enquiryNumber === currentId
            ? {
                ...item,
                status: 'Responded',
                replyMessage: textToSend,
                repliedAt: new Date().toISOString(),
              }
            : item
        )
      );

      if (tableModalEnquiry.id === currentId || tableModalEnquiry.enquiryNumber === currentId) {
        setTableModalEnquiry((prev) =>
          prev
            ? {
                ...prev,
                status: 'Responded',
                replyMessage: textToSend,
                repliedAt: new Date().toISOString(),
              }
            : null
        );
      }

      toast.success('Admin Response Transmitted', {
        description: `Official response saved and status updated to Responded.`,
      });
    } catch {
      toast.error('Failed to submit response to backend');
    } finally {
      setTableModalIsReplying(false);
    }
  };

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

  const vendorDisplayList = useMemo(() => {
    if (activeTab === 'verified') return verifiedVendorsList;
    if (activeTab === 'action_required') return actionRequiredVendorsList;
    if (activeTab === 'rejected') return rejectedVendorsList;
    if (activeTab === 'expiring') return expiringVendorsList;
    return filteredVendors;
  }, [
    activeTab,
    verifiedVendorsList,
    actionRequiredVendorsList,
    rejectedVendorsList,
    expiringVendorsList,
    filteredVendors,
  ]);

  const queuePagination = usePagination(filteredQueue, 10);
  const vendorDirectoryPagination = usePagination(vendorDisplayList, 10);
  const enquiryLedgerPagination = usePagination(filteredTableEnquiries, 10);
  const auditLogsPagination = usePagination(auditLogs, 10);
  const complaintsPagination = usePagination(complaints, 10);
  const contactTicketsPagination = usePagination(contactInquiries, 10);

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
      id: 'vendors',
      label: 'All Vendors Directory',
      icon: Building2,
      badge: metrics.total,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'queue',
      label: 'Verification Queue',
      icon: Clock,
      badge: metrics.pending > 0 ? `${metrics.pending} Pending` : '0',
      badgeColor: metrics.pending > 0 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-100 text-slate-600',
    },
    {
      id: 'enquiries',
      label: 'Buyer Enquiries & RFQs',
      icon: MessageSquare,
      badge: enquiries.filter((e) => e.status === 'New').length > 0 ? `${enquiries.filter((e) => e.status === 'New').length} New` : null,
      badgeColor: 'bg-primary-600 text-white font-bold',
    },
    {
      id: 'enquiry_records',
      label: 'Enquiry',
      icon: ClipboardList,
      badge: enquiries.length > 0 ? `${enquiries.length}` : null,
      badgeColor: 'bg-slate-100 text-slate-700 font-semibold',
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
      id: 'logs',
      label: 'Audit Trail & Logs',
      icon: History,
      badge: auditLogs.length,
      badgeColor: 'bg-slate-100 text-slate-600',
    },
    {
      id: 'complaints',
      label: 'Complaints Desk',
      icon: AlertTriangle,
      badge: complaints.filter((c) => c.status === 'OPEN' || c.status === 'UNDER_INVESTIGATION').length || null,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'contact_tickets',
      label: 'Contact Tickets',
      icon: Mail,
      badge: contactInquiries.filter((c) => c.status === 'OPEN').length || null,
      badgeColor: 'bg-primary-600 text-white font-bold',
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
    }
   
  ];

  const TAB_REQUIRED_PERMISSION: Partial<Record<AdminNavTab, string>> = {
    vendors: 'vendors.view',
    queue: 'verification.view',
    verified: 'verification.view',
    action_required: 'verification.view',
    rejected: 'verification.view',
    expiring: 'verification.view',
    enquiries: 'enquiries.view',
    enquiry_records: 'enquiries.view',
    contact_tickets: 'enquiries.view',
    logs: 'audit_logs.view',
    complaints: 'complaints.view',
    scoring: 'scoring.view',
    access_control: 'users.edit',
  };

  const visibleNavItems = sidebarNavItems.filter((item) => {
    const reqPerm = TAB_REQUIRED_PERMISSION[item.id];
    return reqPerm ? hasPermission(reqPerm) : true;
  });

  return (
    <RoleGuard
      allowedRoles={[
        'admin',
        'super_admin',
        'verification_officer',
        'quality_auditor',
        'support_team',
      ]}
    >
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

            {visibleNavItems.map((item) => {
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
          ) : activeTab === 'access_control' ? (
            <div className="flex-1 flex flex-col min-w-0 p-3 sm:p-4 max-w-7xl mx-auto w-full">
              <AccessControlWorkspace />
            </div>
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
                        {activeTab === 'enquiries' && 'Buyer Enquiries & RFQ Leads Desk'}
                        {activeTab === 'enquiry_records' && 'All Enquiry Records & Fulfillment Ledger'}
                        {activeTab === 'vendors' && 'Master Vendor Directory'}
                        {activeTab === 'verified' && 'Audited & Verified Suppliers'}
                        {activeTab === 'action_required' && 'Clarification Required (Action Pending)'}
                        {activeTab === 'rejected' && 'Flagged / Rejected Supplier Dossiers'}
                        {activeTab === 'expiring' && 'Certificate Expiry & Renewal Radar'}
                        {activeTab === 'scoring' && '7-Dimension Trust Score Engine Matrix'}
                        {activeTab === 'logs' && 'Auditor Activity Trail & Compliance Log'}
                        {activeTab === 'contact_tickets' && 'Contact & Support Tickets'}
                        {activeTab === 'settings' && 'Auditor Access & Verification Settings'}
                      </span>
                    </h1>
                    <p className="text-[11px] text-slate-500 hidden sm:block">
                      BITAINTEL Enterprise Governance • Real-time Statutory Due Diligence Engine
                    </p>
                  </div>
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
                        {queuePagination.paginatedItems.map((vendor) => (
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

                {!isLoading && filteredQueue.length > 0 && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50/40">
                    <Pagination
                      page={queuePagination.page}
                      totalPages={queuePagination.totalPages}
                      totalItems={queuePagination.totalItems}
                      pageSize={queuePagination.pageSize}
                      onPageChange={queuePagination.setPage}
                      onPageSizeChange={queuePagination.setPageSize}
                      itemLabel="pending vendors"
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB: BUYER PROCUREMENT ENQUIRIES & RFQs (SUPER ADMIN DESK) */}
            {activeTab === 'enquiries' && (
              <div className="space-y-6">
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="max-w-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-300 bg-primary-950 px-2.5 py-1 rounded-full border border-primary-700 inline-flex items-center gap-1.5">
                      <MessageSquare className="size-3 text-primary-400" />
                      <span>Centralized Procurement Gateway</span>
                    </span>
                    <h3 className="text-xl font-black mt-2">Buyer Enquiries & RFQ Leads Desk</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      All buyer enquiries submitted across company dossiers are routed here for Super Admin verification, commercial evaluation, and official response transmission.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{enquiries.length} Total Enquiries</span>
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
                  {/* Left: Enquiries List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                        Incoming Requests ({enquiries.length})
                      </h4>
                      <div className="flex gap-1 text-[11px]">
                        {['all', 'New', 'Viewed', 'Responded', 'In Discussion'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setEnquiryStatusFilter(s)}
                            className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                              enquiryStatusFilter === s
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {s === 'all' ? 'All' : s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {enquiries.length === 0 ? (
                      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                        <MessageSquare className="size-8 mx-auto text-slate-400 mb-2" />
                        <p className="text-xs font-bold text-slate-800">No Buyer Enquiries Yet</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          When buyers submit enquiries on vendor profiles or products, they will appear here.
                        </p>
                      </div>
                    ) : (
                      enquiries
                        .filter((enq) => enquiryStatusFilter === 'all' || enq.status === enquiryStatusFilter)
                        .map((enq) => {
                          const isSelected = selectedEnquiry?.id === enq.id || selectedEnquiry?.enquiryNumber === enq.enquiryNumber;
                          return (
                            <div
                              key={enq.id}
                              onClick={() => {
                                setSelectedEnquiry(enq);
                                if (enq.status === 'New') {
                                  handleAdminStatusChange(enq.enquiryNumber || enq.id, 'Viewed');
                                }
                              }}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-primary-600 bg-primary-50/40 shadow-xs ring-1 ring-primary-500'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[10px] text-slate-400 font-bold">{enq.enquiryNumber || enq.id}</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                                      Target: {enq.targetBusinessName}
                                    </span>
                                  </div>
                                  <h3 className="text-xs font-bold text-slate-900">{enq.buyerCompany}</h3>
                                  <p className="text-[11px] text-slate-600">{enq.buyerName}</p>
                                </div>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    enq.status === 'New'
                                      ? 'bg-primary-600 text-white'
                                      : enq.status === 'In Discussion'
                                      ? 'bg-primary-100 text-primary-800'
                                      : enq.status === 'Responded'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {enq.status}
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-slate-700 line-clamp-1 font-medium">{enq.subject}</p>
                              {enq.productName && (
                                <p className="text-[10px] text-blue-700 font-semibold mt-1">
                                  Scope: {enq.productName}
                                </p>
                              )}
                              <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
                                <span className="font-semibold text-primary-800">{enq.budget}</span>
                                <span>{enq.date}</span>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>

                  {/* Right: Enquiry Detail & Admin Proposal Composer */}
                  {selectedEnquiry ? (
                    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-5 self-start">
                      {adminReplySuccess && (
                        <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                          <span>{adminReplySuccess}</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-400 font-bold">{selectedEnquiry.enquiryNumber || selectedEnquiry.id}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white flex items-center gap-1">
                              <Building2 className="size-3 text-primary-300" />
                              <span>Vendor: {selectedEnquiry.targetBusinessName}</span>
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedEnquiry.buyerCompany}</h3>
                          <p className="text-xs text-slate-500">
                            Buyer: {selectedEnquiry.buyerName} · {selectedEnquiry.buyerEmail}
                            {selectedEnquiry.buyerPhone && selectedEnquiry.buyerPhone !== 'N/A' && ` · ${selectedEnquiry.buyerPhone}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Status:</span>
                          <select
                            value={selectedEnquiry.status}
                            onChange={(e) =>
                              handleAdminStatusChange(
                                selectedEnquiry.enquiryNumber || selectedEnquiry.id,
                                e.target.value as AdminEnquiryItem['status']
                              )
                            }
                            className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:border-primary-600"
                          >
                            <option value="New">New</option>
                            <option value="Viewed">Viewed</option>
                            <option value="In Discussion">In Discussion</option>
                            <option value="Responded">Responded</option>
                            <option value="Closed/Rejected">Closed/Rejected</option>
                          </select>
                        </div>
                      </div>

                      {/* Product Scope Tag */}
                      {selectedEnquiry.productName && (
                        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-200 text-blue-800">
                              Product Scope
                            </span>
                            <span className="font-bold">{selectedEnquiry.productName}</span>
                          </div>
                          {selectedEnquiry.product?.hsnCode && (
                            <span className="font-mono text-[11px] text-blue-700 font-semibold">
                              HSN: {selectedEnquiry.product.hsnCode}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Intent & Details */}
                      <div className="space-y-2 text-xs">
                        <p className="font-bold text-slate-900 text-sm">{selectedEnquiry.subject}</p>
                        <p className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {selectedEnquiry.details}
                        </p>
                      </div>

                      {/* Dispatched Response if any */}
                      {selectedEnquiry.replyMessage && (
                        <div className="p-3.5 rounded-2xl bg-primary-50/60 border border-primary-200 text-xs text-slate-800 space-y-1">
                          <div className="flex justify-between font-bold text-primary-900">
                            <span>Dispatched Admin Proposal / Response:</span>
                            <span className="text-[10px] font-normal text-slate-500">
                              {selectedEnquiry.repliedAt ? new Date(selectedEnquiry.repliedAt).toLocaleString() : ''}
                            </span>
                          </div>
                          <p className="text-slate-700 whitespace-pre-wrap">{selectedEnquiry.replyMessage}</p>
                        </div>
                      )}

                      {/* Reply Form */}
                      <form onSubmit={handleAdminReply} className="space-y-3 pt-2 border-t border-slate-100">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                          Transmit Super Admin Response / Verification Pack
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          placeholder="Type official response, verified statutory report, or quotation details to the buyer..."
                          className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-900 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                              handleAdminStatusChange(
                                selectedEnquiry.enquiryNumber || selectedEnquiry.id,
                                'In Discussion'
                              )
                            }
                          >
                            Mark &quot;In Discussion&quot;
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            icon={<Send className="size-3.5" />}
                          >
                            Send Admin Response
                          </Button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
                      <p className="text-xs font-bold">Select an enquiry from the left list to review and respond.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB: MASTER ENQUIRY RECORDS TABLE (With Status Sync & Admin Response)     */}
            {/* ========================================================================= */}
            {activeTab === 'enquiry_records' && (
              <div className="space-y-6">
                {/* 1. Header Banner */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-300 bg-primary-950 px-2 py-0.5 rounded-full border border-primary-700 inline-flex items-center gap-1.5">
                      <ClipboardList className="size-3 text-primary-400" />
                      <span>Centralized Enquiry Ledger</span>
                    </span>
                    <h3 className="text-lg font-black mt-1.5">Enterprise Enquiry Records</h3>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Complete master ledger of all B2B procurement enquiries. Track lifecycle status updates and verified Super Admin responses in one audit-ready ledger.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                      <p className="text-base font-black text-white">{enquiries.length}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Total</p>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-center">
                      <p className="text-base font-black text-emerald-400">
                        {enquiries.filter((e) => e.status === 'Responded' || !!e.replyMessage).length}
                      </p>
                      <p className="text-[10px] text-emerald-300 font-medium">Responded</p>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/60 text-center">
                      <p className="text-base font-black text-amber-400">
                        {enquiries.filter((e) => e.status === 'In Discussion').length}
                      </p>
                      <p className="text-[10px] text-amber-300 font-medium">In Discussion</p>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-primary-950/60 border border-primary-800/60 text-center">
                      <p className="text-base font-black text-primary-300">
                        {enquiries.filter((e) => e.status === 'New').length}
                      </p>
                      <p className="text-[10px] text-primary-300 font-medium">New</p>
                    </div>
                  </div>
                </div>

                {/* 2. Filters & Search */}
                <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search Enquiry #, Buyer, Vendor, or Subject..."
                        value={enquirySearchQuery}
                        onChange={(e) => setEnquirySearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary-600 focus:ring-1 focus:ring-primary-600 text-slate-900 transition-colors"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Filter Vendor:</span>
                      <select
                        value={enquiryTableVendorFilter}
                        onChange={(e) => setEnquiryTableVendorFilter(e.target.value)}
                        className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 outline-none focus:border-primary-600"
                      >
                        <option value="all">All Vendors ({uniqueTargetVendors.length})</option>
                        {uniqueTargetVendors.map((vnd) => (
                          <option key={vnd} value={vnd}>
                            {vnd}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
                    {[
                      { id: 'all', label: `All (${enquiries.length})` },
                      { id: 'has_response', label: `Responded (${enquiries.filter((e) => e.status === 'Responded' || !!e.replyMessage).length})` },
                      { id: 'In Discussion', label: `In Discussion (${enquiries.filter((e) => e.status === 'In Discussion').length})` },
                      { id: 'New', label: `New (${enquiries.filter((e) => e.status === 'New').length})` },
                      { id: 'Viewed', label: `Viewed (${enquiries.filter((e) => e.status === 'Viewed').length})` },
                      { id: 'pending_response', label: `Pending Response (${enquiries.filter((e) => e.status !== 'Responded' && !e.replyMessage).length})` },
                      { id: 'Closed/Rejected', label: `Closed (${enquiries.filter((e) => e.status === 'Closed/Rejected').length})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setEnquiryTableStatusFilter(tab.id)}
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-all ${
                          enquiryTableStatusFilter === tab.id
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. High-Precision Compact Enquiry Table (Fits viewport without horizontal scroll) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="py-2.5 px-3 w-[115px] whitespace-nowrap">Ref &amp; Date</th>
                          <th className="py-2.5 px-3 w-[165px]">Buyer Enterprise</th>
                          <th className="py-2.5 px-3 w-[125px]">Target Supplier</th>
                          <th className="py-2.5 px-3 min-w-[200px]">Scope &amp; Budget</th>
                          <th className="py-2.5 px-3 w-[130px] whitespace-nowrap">Status (Sync)</th>
                          <th className="py-2.5 px-3 min-w-[170px] max-w-[220px]">Admin Response</th>
                          <th className="py-2.5 px-3 w-[70px] text-right whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTableEnquiries.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-10 text-center text-slate-400">
                              <ClipboardList className="size-7 mx-auto text-slate-300 mb-1.5" />
                              <p className="text-xs font-bold text-slate-600">No matching enquiry records found</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">Try resetting your filters or search keywords.</p>
                            </td>
                          </tr>
                        ) : (
                          enquiryLedgerPagination.paginatedItems.map((enq) => {
                            const isResponded = enq.status === 'Responded' || !!enq.replyMessage;
                            return (
                              <tr key={enq.id} className="hover:bg-slate-50/80 transition-colors">
                                {/* Column 1: Ref & Date */}
                                <td className="py-2.5 px-3 align-top whitespace-nowrap">
                                  <div className="font-mono text-xs font-bold text-slate-900">
                                    {enq.enquiryNumber || enq.id}
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">{enq.date}</div>
                                </td>

                                {/* Column 2: Buyer Enterprise */}
                                <td className="py-2.5 px-3 align-top">
                                  <div className="font-bold text-slate-900 leading-snug">{enq.buyerCompany}</div>
                                  <div className="text-[11px] text-slate-600 font-medium">{enq.buyerName}</div>
                                  <div className="flex flex-col text-[10px] text-slate-500 font-mono mt-0.5 leading-tight">
                                    <span>{enq.buyerEmail}</span>
                                    {enq.buyerPhone && enq.buyerPhone !== 'N/A' && (
                                      <span>{enq.buyerPhone}</span>
                                    )}
                                  </div>
                                </td>

                                {/* Column 3: Target Supplier */}
                                <td className="py-2.5 px-3 align-top">
                                  <div className="font-bold text-slate-900 flex items-center gap-1">
                                    <Building2 className="size-3 text-primary-600 shrink-0" />
                                    <span>{enq.targetBusinessName}</span>
                                  </div>
                                  {enq.targetBusinessSlug && (
                                    <Link
                                      href={`/demo/business/${enq.targetBusinessSlug}`}
                                      target="_blank"
                                      className="text-[10px] text-primary-600 hover:underline inline-flex items-center gap-0.5 mt-0.5 font-medium"
                                    >
                                      <span>View Profile</span>
                                      <ExternalLink className="size-2.5" />
                                    </Link>
                                  )}
                                </td>

                                {/* Column 4: Scope & Commercials (Combined for Precision) */}
                                <td className="py-2.5 px-3 align-top">
                                  <div className="font-semibold text-slate-800 line-clamp-1">{enq.subject}</div>
                                  <div className="flex flex-wrap items-center gap-1 mt-1">
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px]">
                                      {enq.budget || 'Commercial RFQ'}
                                    </span>
                                    {enq.productName && (
                                      <span className="px-1.5 py-0.2 rounded bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-[10px]">
                                        Scope: {enq.productName}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-1 leading-relaxed">
                                    {enq.details}
                                  </p>
                                </td>

                                {/* Column 5: Status with Live Update */}
                                <td className="py-2.5 px-3 align-top">
                                  <select
                                    value={enq.status}
                                    onChange={(e) =>
                                      handleAdminStatusChange(
                                        enq.enquiryNumber || enq.id,
                                        e.target.value as AdminEnquiryItem['status']
                                      )
                                    }
                                    className={`text-[11px] font-bold rounded-lg px-2 py-1 border transition-colors outline-none cursor-pointer w-full ${
                                      enq.status === 'New'
                                        ? 'bg-primary-50 text-primary-800 border-primary-300'
                                        : enq.status === 'In Discussion'
                                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                                        : enq.status === 'Responded'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : enq.status === 'Viewed'
                                        ? 'bg-slate-100 text-slate-800 border-slate-300'
                                        : 'bg-rose-50 text-rose-800 border-rose-300'
                                    }`}
                                  >
                                    <option value="New">New</option>
                                    <option value="Viewed">Viewed</option>
                                    <option value="In Discussion">In Discussion</option>
                                    <option value="Responded">Responded</option>
                                    <option value="Closed/Rejected">Closed/Rejected</option>
                                  </select>
                                </td>

                                {/* Column 6: Admin Response */}
                                <td className="py-2.5 px-3 align-top">
                                  {isResponded ? (
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                                        <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                                        <span>Official Response Transmitted</span>
                                      </div>
                                      {enq.replyMessage ? (
                                        <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/70 italic leading-snug">
                                          &ldquo;{enq.replyMessage}&rdquo;
                                        </p>
                                      ) : (
                                        <span className="text-[10px] text-slate-400 italic">No text logged</span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                                        <Clock className="size-2.5 text-amber-500" />
                                        Awaiting Response
                                      </span>
                                      <div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setTableModalEnquiry(enq);
                                            setTableModalReplyText(enq.replyMessage || '');
                                          }}
                                          className="text-[11px] font-bold text-primary-600 hover:text-primary-800 hover:underline inline-flex items-center gap-0.5"
                                        >
                                          <span>Add Response →</span>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </td>

                                {/* Column 7: Action */}
                                <td className="py-2.5 px-3 align-top text-right whitespace-nowrap">
                                  <Button
                                    size="xs"
                                    variant="secondary"
                                    onClick={() => {
                                      setTableModalEnquiry(enq);
                                      setTableModalReplyText(enq.replyMessage || '');
                                    }}
                                    className="px-2.5 py-1 text-[11px] h-7"
                                    icon={<Eye className="size-3 text-slate-500" />}
                                  >
                                    Details
                                  </Button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {filteredTableEnquiries.length > 0 && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/40">
                      <Pagination
                        page={enquiryLedgerPagination.page}
                        totalPages={enquiryLedgerPagination.totalPages}
                        totalItems={enquiryLedgerPagination.totalItems}
                        pageSize={enquiryLedgerPagination.pageSize}
                        onPageChange={enquiryLedgerPagination.setPage}
                        onPageSizeChange={enquiryLedgerPagination.setPageSize}
                        itemLabel="enquiries"
                      />
                    </div>
                  )}
                </div>

                {/* 4. Detail & Response Modal */}
                {tableModalEnquiry && (
                  <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 my-8">
                      {/* Modal Header */}
                      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-400">
                              {tableModalEnquiry.enquiryNumber || tableModalEnquiry.id}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                tableModalEnquiry.status === 'New'
                                  ? 'bg-primary-50 text-primary-700'
                                  : tableModalEnquiry.status === 'In Discussion'
                                  ? 'bg-amber-50 text-amber-700'
                                  : tableModalEnquiry.status === 'Responded'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {tableModalEnquiry.status}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mt-1">{tableModalEnquiry.subject}</h3>
                          <p className="text-xs text-slate-500">
                            Submitted on {tableModalEnquiry.date}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTableModalEnquiry(null)}
                          className="size-8 rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 grid place-items-center"
                        >
                          <X className="size-4" />
                        </button>
                      </div>

                      {/* Modal Grid: Buyer & Target Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Buyer Information
                          </span>
                          <p className="font-bold text-slate-900">{tableModalEnquiry.buyerCompany}</p>
                          <p className="text-slate-600">{tableModalEnquiry.buyerName}</p>
                          <p className="text-slate-500 font-mono">{tableModalEnquiry.buyerEmail}</p>
                          {tableModalEnquiry.buyerPhone && tableModalEnquiry.buyerPhone !== 'N/A' && (
                            <p className="text-slate-500 font-mono">{tableModalEnquiry.buyerPhone}</p>
                          )}
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Target Supplier &amp; Commercials
                          </span>
                          <p className="font-bold text-slate-900">{tableModalEnquiry.targetBusinessName}</p>
                          {tableModalEnquiry.productName && (
                            <p className="text-blue-700 font-semibold">Scope: {tableModalEnquiry.productName}</p>
                          )}
                          <p className="text-primary-700 font-bold">Estimated Budget: {tableModalEnquiry.budget}</p>
                        </div>
                      </div>

                      {/* Enquiry Details Message */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">Buyer Requirement Details</label>
                        <p className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {tableModalEnquiry.details}
                        </p>
                      </div>

                      {/* Lifecycle Status Modifier */}
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-xs font-bold text-slate-700">Update Lifecycle Status:</span>
                        <select
                          value={tableModalEnquiry.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as AdminEnquiryItem['status'];
                            handleAdminStatusChange(
                              tableModalEnquiry.enquiryNumber || tableModalEnquiry.id,
                              newStatus
                            );
                            setTableModalEnquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
                          }}
                          className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 outline-none focus:border-primary-600"
                        >
                          <option value="New">New</option>
                          <option value="Viewed">Viewed</option>
                          <option value="In Discussion">In Discussion</option>
                          <option value="Responded">Responded</option>
                          <option value="Closed/Rejected">Closed/Rejected</option>
                        </select>
                      </div>

                      {/* Admin Response Composer */}
                      <form onSubmit={handleTableModalReply} className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Send className="size-3.5 text-primary-600" />
                            <span>Super Admin Official Response</span>
                          </label>
                          {tableModalEnquiry.replyMessage && (
                            <span className="text-[10px] font-bold text-emerald-700">
                              ✓ Previously Responded
                            </span>
                          )}
                        </div>
                        <textarea
                          rows={3}
                          value={tableModalReplyText}
                          onChange={(e) => setTableModalReplyText(e.target.value)}
                          placeholder="Type official admin response, commercial qualification, or vendor routing guidance..."
                          className="w-full text-xs p-3.5 rounded-2xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                          required
                        />

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setTableModalEnquiry(null)}
                          >
                            Close
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            isLoading={tableModalIsReplying}
                            icon={<Send className="size-3.5" />}
                          >
                            {tableModalIsReplying ? 'Transmitting...' : 'Save & Transmit Response'}
                          </Button>
                        </div>
                      </form>
                    </div>
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

                {isLoading ? (
                  <div className="py-20 text-center">
                    <div className="size-8 border-3 border-primary-200 border-t-primary-800 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-600">Loading vendor records...</p>
                  </div>
                ) : vendorDisplayList.length === 0 ? (
                  <div className="py-16 text-center text-slate-500">
                    <Building2 className="size-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800">No Vendors Found</p>
                    <p className="text-xs text-slate-500 mt-1">No supplier records match the selected category.</p>
                  </div>
                ) : (
                  <>
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
                          {vendorDirectoryPagination.paginatedItems.map((vendor) => {
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

                    <div className="p-4 border-t border-slate-100 bg-slate-50/40">
                      <Pagination
                        page={vendorDirectoryPagination.page}
                        totalPages={vendorDirectoryPagination.totalPages}
                        totalItems={vendorDirectoryPagination.totalItems}
                        pageSize={vendorDirectoryPagination.pageSize}
                        onPageChange={vendorDirectoryPagination.setPage}
                        onPageSizeChange={vendorDirectoryPagination.setPageSize}
                        itemLabel="vendors"
                      />
                    </div>
                  </>
                )}
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
                  {auditLogsPagination.paginatedItems.map((log) => (
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

                <Pagination
                  page={auditLogsPagination.page}
                  totalPages={auditLogsPagination.totalPages}
                  totalItems={auditLogsPagination.totalItems}
                  pageSize={auditLogsPagination.pageSize}
                  onPageChange={auditLogsPagination.setPage}
                  onPageSizeChange={auditLogsPagination.setPageSize}
                  itemLabel="audit logs"
                />
              </div>
            )}

            {/* TAB: COMPLAINTS DESK */}
            {activeTab === 'complaints' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Compliance &amp; Buyer Complaints Desk</h3>
                    <p className="text-xs text-slate-500">
                      Centralized compliance &amp; buyer complaints reviewed by authorized officers.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                      Open: {complaints.filter((c) => c.status === 'OPEN' || c.status === 'UNDER_INVESTIGATION').length}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Resolved: {complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'DISMISSED').length}
                    </span>
                  </div>
                </div>

                {complaints.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    No compliance or buyer complaints filed yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                        <tr>
                          <th className="py-2.5 px-3">Ref</th>
                          <th className="py-2.5 px-3">Target Vendor</th>
                          <th className="py-2.5 px-3">Complainant</th>
                          <th className="py-2.5 px-3">Category / Severity</th>
                          <th className="py-2.5 px-3">Subject</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {complaintsPagination.paginatedItems.map((cmp) => (
                          <tr key={cmp.id} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                              {cmp.complaintNumber}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{cmp.business?.legalName || cmp.business?.name || `Business #${cmp.businessId}`}</div>
                              {cmp.business?.score !== undefined && (
                                <span className="text-[11px] text-slate-500">Score: {cmp.business.score}/100</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-800">{cmp.complainantName}</div>
                              <div className="text-[11px] text-slate-500">{cmp.complainantEmail}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-slate-700 block">{cmp.category.replace(/_/g, ' ')}</span>
                              <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                cmp.severity === 'CRITICAL' || cmp.severity === 'HIGH'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {cmp.severity}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 max-w-[220px]">
                              <div className="font-semibold text-slate-800 truncate">{cmp.subject}</div>
                              <div className="text-[11px] text-slate-500 truncate">{cmp.description}</div>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                cmp.status === 'OPEN'
                                  ? 'bg-rose-100 text-rose-800'
                                  : cmp.status === 'UNDER_INVESTIGATION'
                                  ? 'bg-amber-100 text-amber-800'
                                  : cmp.status === 'RESOLVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {cmp.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedComplaint(cmp);
                                  setComplaintStatusInput(cmp.status);
                                  setComplaintAdminNotes(cmp.adminNotes || '');
                                }}
                              >
                                Review
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {complaints.length > 0 && (
                  <Pagination
                    page={complaintsPagination.page}
                    totalPages={complaintsPagination.totalPages}
                    totalItems={complaintsPagination.totalItems}
                    pageSize={complaintsPagination.pageSize}
                    onPageChange={complaintsPagination.setPage}
                    onPageSizeChange={complaintsPagination.setPageSize}
                    itemLabel="complaints"
                  />
                )}

                {selectedComplaint && (
                  <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-xl">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-mono font-bold text-rose-700">{selectedComplaint.complaintNumber}</span>
                          <h4 className="text-base font-bold text-slate-900">{selectedComplaint.subject}</h4>
                          <p className="text-xs text-slate-500">
                            Against: {selectedComplaint.business?.legalName || selectedComplaint.business?.name} · By: {selectedComplaint.complainantName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedComplaint(null)}
                          className="text-xs text-slate-400 hover:text-slate-700 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {selectedComplaint.description}
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Update Status</label>
                          <select
                            value={complaintStatusInput}
                            onChange={(e) => setComplaintStatusInput(e.target.value as ComplaintStatus)}
                            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-800"
                          >
                            <option value="OPEN">OPEN</option>
                            <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="DISMISSED">DISMISSED</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Auditor / Resolution Notes</label>
                          <textarea
                            rows={3}
                            value={complaintAdminNotes}
                            onChange={(e) => setComplaintAdminNotes(e.target.value)}
                            placeholder="Document investigation findings or resolution remarks..."
                            className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedComplaint(null)} disabled={isUpdatingComplaint}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={isUpdatingComplaint}
                          onClick={async () => {
                            setIsUpdatingComplaint(true);
                            try {
                              const res = await updateAdminComplaint(selectedComplaint.id, {
                                status: complaintStatusInput,
                                adminNotes: complaintAdminNotes,
                              });
                              setComplaints((prev) =>
                                prev.map((c) => (c.id === selectedComplaint.id && res.complaint ? { ...c, ...res.complaint } : c))
                              );
                              setSelectedComplaint(null);
                              loadData(false);
                            } finally {
                              setIsUpdatingComplaint(false);
                            }
                          }}
                        >
                          {isUpdatingComplaint ? 'Saving...' : 'Save Decision'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: CONTACT TICKETS */}
            {activeTab === 'contact_tickets' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Contact &amp; Support Tickets ({contactInquiries.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Inquiries submitted from the public Contact page (/demo/contact).
                    </p>
                  </div>
                  <span className="text-xs font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200 self-start sm:self-auto">
                    {contactInquiries.filter((c) => c.status === 'OPEN').length} Open
                  </span>
                </div>

                {contactInquiries.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                    No contact inquiries submitted yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Ticket ID</th>
                          <th className="py-2.5 px-3">Sender</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Message</th>
                          <th className="py-2.5 px-3">Submitted</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Update</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {contactTicketsPagination.paginatedItems.map((tkt) => (
                          <tr key={tkt.id} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                              {tkt.ticketId}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{tkt.name}</div>
                              <div className="text-[11px] text-slate-500">{tkt.email}</div>
                              {tkt.company && (
                                <div className="text-[11px] text-primary-700 font-semibold">{tkt.company}</div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-700">
                              {tkt.category}
                            </td>
                            <td className="py-2.5 px-3 max-w-[260px]">
                              <p className="text-slate-700 line-clamp-2">{tkt.message}</p>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                              {new Date(tkt.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  tkt.status === 'OPEN'
                                    ? 'bg-rose-100 text-rose-800'
                                    : tkt.status === 'IN_PROGRESS'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {tkt.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <select
                                aria-label={`Status for ${tkt.ticketId}`}
                                value={tkt.status}
                                disabled={updatingContactId === tkt.id}
                                onChange={async (e) => {
                                  const nextStatus = e.target.value as ContactInquiryStatus;
                                  setUpdatingContactId(tkt.id);
                                  try {
                                    const res = await updateAdminContactStatus(tkt.id, nextStatus);
                                    setContactInquiries((prev) =>
                                      prev.map((item) =>
                                        item.id === tkt.id ? res.inquiry || { ...item, status: nextStatus } : item
                                      )
                                    );
                                    toast.success(`Ticket ${tkt.ticketId} marked ${nextStatus.replace(/_/g, ' ')}`);
                                  } catch {
                                    toast.error('Failed to update ticket status');
                                  } finally {
                                    setUpdatingContactId(null);
                                  }
                                }}
                                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                              >
                                <option value="OPEN">OPEN</option>
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="RESOLVED">RESOLVED</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {contactInquiries.length > 0 && (
                  <Pagination
                    page={contactTicketsPagination.page}
                    totalPages={contactTicketsPagination.totalPages}
                    totalItems={contactTicketsPagination.totalItems}
                    pageSize={contactTicketsPagination.pageSize}
                    onPageChange={contactTicketsPagination.setPage}
                    onPageSizeChange={contactTicketsPagination.setPageSize}
                    itemLabel="tickets"
                  />
                )}
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
          </div>
            </div>
          )}
        </main>
      </div>
    </RoleGuard>
  );
}
