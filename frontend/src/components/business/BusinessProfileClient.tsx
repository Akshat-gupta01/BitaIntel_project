/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Business } from '@/data';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { ScoreRing } from '@/components/business/ScoreRing';
import { BitaintelVerifiedBadge } from '@/components/business/BitaintelVerifiedBadge';
import { BusinessAvatar } from '@/components/shared/BusinessLogoUploader';
import { EnquiryModal } from '@/components/business/EnquiryModal';
import { ComplaintModal } from '@/components/business/ComplaintModal';
import { PersonaSwitcher } from '@/components/shared/PersonaSwitcher';
import * as vendorService from '@services/vendor.service';
import { ProductCatalogItem } from '@/types/vendorRegistration';
import { ProductThumbnail } from '@/components/shared/ProductThumbnail';
import {
  formatBusinessLocation,
  getVerificationStatusBadge,
  resolveBackendDocumentUrl,
} from '@/lib/verificationBadge';
import {
  MapPin,
  ShieldCheck,
  LockKeyhole,
  CheckCircle2,
  Sparkles,
  Download,
  AlertTriangle,
  FileText,
  UserCheck,
  Lock,
  Package,
  Send,
  Search,
  Eye,
} from 'lucide-react';

import { toast } from 'sonner';

interface BusinessProfileClientProps {
  business: Business;
}

interface PublicCatalogProduct {
  id?: number | string | null;
  name?: string | null;
  type?: string | null;
  categoryId?: string | null;
  subcategoryId?: string | null;
  brand?: string | null;
  description?: string | null;
  specifications?: string | null;
  grade?: string | null;
  standards?: string | null;
  hsnCode?: string | null;
  countryOfOrigin?: string | null;
  moq?: string | null;
  standardOrderQty?: string | null;
  monthlyCapacity?: string | null;
  availableStock?: string | null;
  leadTimeDays?: string | null;
  sampleAvailability?: string | null;
  indicativePrice?: string | null;
  currency?: string | null;
  priceValidity?: string | null;
  targetMarkets?: string | null;
  images?: unknown;
  hasCatalogue?: boolean;
  hasTds?: boolean;
  hasCoa?: boolean;
  hasSds?: boolean;
  catalogueDoc?: string | null;
  technicalDataSheetDoc?: string | null;
  coaDoc?: string | null;
  sdsDoc?: string | null;
}

type ProfileCatalogItem = ProductCatalogItem & {
  hasTds?: boolean;
  hasCoa?: boolean;
};

function toSampleAvailability(value?: string | null): ProductCatalogItem['sampleAvailability'] {
  return value === 'Available Paid' || value === 'Not Available' ? value : 'Available Free';
}

function mapPublicProduct(p: PublicCatalogProduct, fallbackId: string): ProfileCatalogItem {
  return {
    id: p.id !== null && p.id !== undefined ? String(p.id) : fallbackId,
    name: (p.name || 'Product').trim(),
    type: p.type === 'Service' ? 'Service' : 'Product',
    categoryId: p.categoryId || '',
    subcategoryId: p.subcategoryId || '',
    brand: p.brand || '',
    description: p.description || '',
    specifications: p.specifications || '',
    grade: p.grade || '',
    standards: p.standards || '',
    hsnCode: p.hsnCode || '',
    countryOfOrigin: p.countryOfOrigin || 'India',
    moq: p.moq || '',
    standardOrderQty: p.standardOrderQty || '',
    monthlyCapacity: p.monthlyCapacity || '',
    availableStock: p.availableStock || '',
    leadTimeDays: p.leadTimeDays || '',
    sampleAvailability: toSampleAvailability(p.sampleAvailability),
    indicativePrice: p.indicativePrice || '',
    currency: p.currency || 'INR',
    priceValidity: p.priceValidity || '',
    targetMarkets: p.targetMarkets || '',
    images: vendorService.normalizeImageArray(p.images),
    hasTds: Boolean(p.hasTds || p.technicalDataSheetDoc),
    hasCoa: Boolean(p.hasCoa || p.coaDoc),
    catalogueDoc: p.catalogueDoc || undefined,
    technicalDataSheetDoc: p.technicalDataSheetDoc || undefined,
    coaDoc: p.coaDoc || undefined,
    sdsDoc: p.sdsDoc || undefined,
  };
}

function deriveInitialCatalogProducts(b: Business): ProfileCatalogItem[] {
  const apiProducts =
    (b as unknown as { catalogProducts?: PublicCatalogProduct[]; detailedProducts?: PublicCatalogProduct[] }).detailedProducts ||
    (b as unknown as { catalogProducts?: PublicCatalogProduct[]; detailedProducts?: PublicCatalogProduct[] }).catalogProducts;

  if (Array.isArray(apiProducts) && apiProducts.length > 0) {
    return apiProducts.map((p, idx) => mapPublicProduct(p, `PRD-${b.id}-${idx + 1}`));
  }

  if (b.products && b.products.length > 0) {
    return b.products.map((prodName, idx) => ({
      id: `PRD-${b.id}-${idx + 1}`,
      name: prodName,
      type: 'Product',
      categoryId: '',
      subcategoryId: '',
      brand: b.name,
      description: '',
      specifications: '',
      grade: '',
      standards: b.isoCertified,
      hsnCode: '',
      countryOfOrigin: 'India',
      moq: '',
      standardOrderQty: '',
      monthlyCapacity: '',
      availableStock: '',
      leadTimeDays: '',
      sampleAvailability: 'Available Free',
      indicativePrice: '',
      currency: 'INR',
      priceValidity: '',
      targetMarkets: '',
      images: [],
    }));
  }

  return [];
}

export function BusinessProfileClient({ business: b }: BusinessProfileClientProps) {
  const { role, user } = useAuth();

  const isVisitor = role === 'visitor';
  const isUnverified = role === 'unverified';
  const isPendingApproval = role === 'pending_approval';
  const isApproved = role === 'approved_business';
  const isPremium = role === 'premium_subscriber';
  // Docs policy: detailed statutory filings, commercial pricing, and TDS/COA downloads require
  // an authenticated, GST/audit-approved B2B account (or platform admin).
  const isVerifiedB2BViewer =
    isApproved || isPremium || role === 'admin' || role === 'super_admin';
  const isGatedViewer = !isVerifiedB2BViewer;

  // Commercial Products Catalog State
  const currentBusinessKey = b.slug || b.id;
  const initialProducts = useMemo(() => deriveInitialCatalogProducts(b), [b]);
  const [liveDetail, setLiveDetail] = useState<{
    key: string;
    products: ProfileCatalogItem[] | null;
    logoUrl?: string;
    turnover?: string | null;
    employees?: string | null;
  } | null>(null);
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProfileCatalogItem | null>(null);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');

  const catalogProducts = useMemo(
    () =>
      liveDetail?.key === currentBusinessKey && liveDetail.products
        ? liveDetail.products
        : initialProducts,
    [liveDetail, currentBusinessKey, initialProducts]
  );

  const filteredCatalogProducts = useMemo(() => {
    const q = catalogSearchQuery.trim().toLowerCase();
    if (!q) return catalogProducts;
    return catalogProducts.filter((prod) =>
      [prod.name, prod.brand, prod.hsnCode, prod.specifications, prod.description, prod.grade]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(q))
    );
  }, [catalogProducts, catalogSearchQuery]);

  function formatIndicativePrice(prod: ProfileCatalogItem): string {
    const rawPrice = String(prod.indicativePrice || '').trim();
    if (!rawPrice || rawPrice === '0' || rawPrice.toLowerCase() === 'on request') {
      return 'On Request';
    }
    const cleanNum = Number(rawPrice.replace(/,/g, ''));
    const formattedNum = !isNaN(cleanNum) && cleanNum > 0 ? cleanNum.toLocaleString('en-IN') : rawPrice;
    return `${prod.currency || 'INR'} ${formattedNum}`;
  }
  const customLogoUrl =
    (liveDetail?.key === currentBusinessKey ? liveDetail.logoUrl : undefined) ||
    b.logoUrl ||
    undefined;
  const effectiveTurnover =
    (liveDetail?.key === currentBusinessKey && liveDetail.turnover !== undefined
      ? liveDetail.turnover
      : b.turnover) || null;
  const effectiveEmployees =
    (liveDetail?.key === currentBusinessKey && liveDetail.employees !== undefined
      ? liveDetail.employees
      : b.employees) || null;

  useEffect(() => {
    if (!currentBusinessKey) return;
    const apiProducts =
      (b as unknown as { catalogProducts?: PublicCatalogProduct[]; detailedProducts?: PublicCatalogProduct[] }).detailedProducts ||
      (b as unknown as { catalogProducts?: PublicCatalogProduct[]; detailedProducts?: PublicCatalogProduct[] }).catalogProducts;
    const hasInitialProducts = Array.isArray(apiProducts) && apiProducts.length > 0;
    const needsVerifiedSync = isVerifiedB2BViewer && !b.canViewB2BDetails;

    if (hasInitialProducts && !needsVerifiedSync) {
      return;
    }

    let cancelled = false;
    // Sync live detail from backend when SSR lacked products or after verified B2B auth loads
    vendorService
      .getPublicBusinessDetail(currentBusinessKey)
      .then((res) => {
        if (cancelled) return;
        const liveB = res?.data?.business;
        const liveProds = liveB?.detailedProducts || liveB?.catalogProducts;
        const mappedProducts =
          Array.isArray(liveProds) && liveProds.length > 0
            ? liveProds.map((p: PublicCatalogProduct, idx: number) =>
                mapPublicProduct(p, `PRD-${b.id}-${idx + 1}`)
              )
            : null;
        if (mappedProducts || liveB?.logoUrl || liveB?.turnover || liveB?.employees) {
          setLiveDetail({
            key: currentBusinessKey,
            products: mappedProducts,
            logoUrl: liveB?.logoUrl || undefined,
            turnover: liveB?.turnover ?? undefined,
            employees: liveB?.employees ?? undefined,
          });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [b, currentBusinessKey, isVerifiedB2BViewer]);

  const safeCin = b.cin || '—';
  const safeGstin = b.gstin || 'Pending GSTIN';
  const maskedCin = safeCin !== '—' ? `${safeCin.slice(0, 8)}********` : 'Gated';
  const maskedGstin =
    safeGstin.length > 7 ? `${safeGstin.slice(0, 5)}******${safeGstin.slice(-2)}` : 'Gated';
  const gatedText = isVisitor ? 'Gated for Visitors' : 'Verified B2B Only';
  const verificationBadge = getVerificationStatusBadge(b);
  const formattedLocation = formatBusinessLocation(b);

  const metadataRows = [
    ['Legal Entity Name', b.legalName],
    ['Corporate CIN', isGatedViewer ? maskedCin : safeCin],
    ['GSTIN Identifier', isGatedViewer ? maskedGstin : safeGstin],
    ['Industry Sector', b.industry],
    ['Registered Location', formattedLocation],
    ['Operational Tenure', `${b.age} years active`],
    ['Headcount Band', isGatedViewer ? gatedText : `${effectiveEmployees || '10–50'} personnel`],
    ['Annual Turnover Band', isGatedViewer ? gatedText : effectiveTurnover || 'Confidential'],
    ['Verification Tier', `Tier ${b.level} (Audited)`],
    ['Membership Status', b.isPremiumSubscriber ? '⭐ Verified Premium Subscriber' : 'Standard Empanelled'],
    ['Last Audit Date', b.lastAudited],
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const checkpoints = [
    { label: 'Corporate Legal Identity', value: b.identity, max: 10, pct: 100 },
    { label: 'Statutory Document Dossier', value: isVisitor ? 'Gated' : b.documents, max: 20, pct: isVisitor ? 50 : 95 },
    { label: 'Representative Identity & Contact', value: isVisitor ? 'Gated' : b.contact, max: 5, pct: isVisitor ? 50 : 100 },
    { label: 'Physical Plant / Office Geolocation', value: b.address, max: 5, pct: 90 },
    { label: 'Public Profile Completeness', value: `${b.profile}/15`, max: 15, pct: 100 },
  ];

  function escapeHtml(value: unknown): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function handleDownloadProductDoc(docPath: string | null | undefined, docLabel: string) {
    const resolvedUrl = resolveBackendDocumentUrl(docPath);
    if (!resolvedUrl) {
      toast.info(`${docLabel} file not available yet`, {
        description: 'The vendor has not attached a downloadable PDF for this document.',
      });
      return;
    }

    const a = document.createElement('a');
    a.href = resolvedUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = resolvedUrl.split('/').pop() || `${docLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloading ${docLabel}`);
  }

  function handleExportDossierPdf() {
    const productsList = Array.isArray(b.products)
      ? b.products
          .map((p) => (typeof p === 'string' ? p : (p as { name?: string })?.name || ''))
          .filter(Boolean)
      : [];
    const exportCin = isGatedViewer ? maskedCin : safeCin;
    const exportGstin = isGatedViewer ? maskedGstin : safeGstin;
    const exportTurnover = isGatedViewer ? gatedText : effectiveTurnover || 'Confidential';
    const exportGrade = b.grade || (b.score >= 95 ? 'A+' : b.score >= 90 ? 'A' : b.score >= 80 ? 'B' : 'C');
    const exportRisk = b.riskLevel || 'Low Risk';
    const exportComplaints = b.openComplaintsCount ?? 0;

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>BITAINTEL Dossier - ${escapeHtml(b.name)}</title>
  <style>
    @page { size: A4; margin: 16mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 0; line-height: 1.45; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 18px; }
    .brand { font-size: 20px; font-weight: 800; color: #1e3a8a; letter-spacing: -0.02em; }
    .sub { font-size: 11px; color: #475569; margin-top: 2px; }
    .score-box { text-align: right; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 8px 14px; }
    .score-val { font-size: 20px; font-weight: 800; color: #1e3a8a; }
    .score-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #3b82f6; }
    h1 { font-size: 18px; margin: 0 0 4px 0; }
    .section { margin-top: 16px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #475569; margin: 0 0 10px 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; font-size: 12px; }
    .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; display: block; }
    .val { font-weight: 600; color: #0f172a; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .metric { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; font-size: 11px; }
    .metric strong { display: block; font-size: 13px; color: #1e3a8a; margin: 4px 0; }
    ul { margin: 6px 0 0 18px; padding: 0; font-size: 12px; }
    .footer { margin-top: 20px; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">BITAINTEL · Enterprise Intelligence Dossier</div>
      <div class="sub">Verify Before You Trust · Generated ${escapeHtml(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }))}</div>
    </div>
    <div class="score-box">
      <div class="score-lbl">${escapeHtml(b.badge)} · Level ${escapeHtml(b.level)}</div>
      <div class="score-val">${escapeHtml(b.score)} / 100</div>
    </div>
  </div>

  <h1>${escapeHtml(b.name)}</h1>
  <div class="sub">${escapeHtml(b.legalName)} · ${escapeHtml(b.location)}</div>

  <div class="section">
    <div class="section-title">Corporate &amp; Statutory Metadata</div>
    <div class="grid">
      <div><span class="label">Legal Entity Name</span><span class="val">${escapeHtml(b.legalName)}</span></div>
      <div><span class="label">Corporate CIN</span><span class="val">${escapeHtml(exportCin)}</span></div>
      <div><span class="label">GSTIN Identifier</span><span class="val">${escapeHtml(exportGstin)}</span></div>
      <div><span class="label">Industry Sector</span><span class="val">${escapeHtml(b.industry || 'N/A')}</span></div>
      <div><span class="label">Operational Tenure</span><span class="val">${escapeHtml(b.age)} years</span></div>
      <div><span class="label">Turnover Band</span><span class="val">${escapeHtml(exportTurnover)}</span></div>
      <div><span class="label">Certifications</span><span class="val">${escapeHtml(b.isoCertified || 'None listed')}</span></div>
      <div><span class="label">Verification Status</span><span class="val">${escapeHtml(verificationBadge.label)}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Audit Score &amp; Risk Summary</div>
    <div class="metrics">
      <div class="metric"><span class="label">Audit Grade &amp; Risk</span><strong>${escapeHtml(exportGrade)} (${escapeHtml(exportRisk)})</strong>Derived from 7-dimension BITAINTEL trust model</div>
      <div class="metric"><span class="label">Open Complaints</span><strong>${escapeHtml(exportComplaints)} Active</strong>Live governance &amp; dispute status</div>
      <div class="metric"><span class="label">Last Audited</span><strong>${escapeHtml(b.lastAudited || 'Recently Audited')}</strong>Verification Tier ${escapeHtml(b.level)}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Registered Products &amp; Services (${productsList.length})</div>
    ${
      productsList.length > 0
        ? `<ul>${productsList.map((name) => `<li>${escapeHtml(name)}</li>`).join('')}</ul>`
        : '<div class="sub">No products listed.</div>'
    }
  </div>

  <div class="footer">
    <span>BITAINTEL Verified Network · ${escapeHtml(b.id)}</span>
    <span>Confidential Procurement Intelligence Report</span>
  </div>
</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      iframe.remove();
      window.print();
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      toast.success(`Dossier Ready for ${b.name}`, {
        description: 'Select "Save as PDF" in the print dialog to download the PDF.',
      });
      setTimeout(() => iframe.remove(), 1500);
    }, 150);
  }

  return (
    <div className="space-y-6">
      {/* Top Role / Access Tier Notification Banner */}
      <div className="rounded-2xl border p-4 shadow-2xs transition-all bg-white border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`size-9 rounded-xl grid place-items-center shrink-0 text-white font-bold ${
              isVisitor
                ? 'bg-slate-700'
                : isUnverified
                ? 'bg-amber-600'
                : isPendingApproval
                ? 'bg-indigo-600'
                : isPremium
                ? 'bg-primary-600'
                : 'bg-emerald-600'
            }`}
          >
            {isVisitor && <Lock className="size-4" />}
            {isUnverified && <UserCheck className="size-4" />}
            {isPendingApproval && <AlertTriangle className="size-4" />}
            {isApproved && <CheckCircle2 className="size-4" />}
            {isPremium && <Sparkles className="size-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Viewing As: {role.replace('_', ' ').toUpperCase()}
              </span>
              {user && (
                <span className="text-xs font-semibold text-slate-800">
                  ({user.businessName})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isVisitor && 'Minimal public business information visible. Sensitive statutory filings are gated.'}
              {isUnverified && 'Limited access mode. Complete your vendor registration dashboard to unlock direct RFIs.'}
              {isPendingApproval && 'GST-verified awaiting approval. Detailed permitted company & product information accessible.'}
              {isApproved && 'Approved B2B business. Detailed permitted company and product information active.'}
              {isPremium && '💎 Premium B2B Subscriber: Additional analytics, competitor radar & intelligence dossier unlocked.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <PersonaSwitcher />
          {isUnverified && (
            <Button
              href="/demo/dashboard/vendor"
              size="sm"
              variant="outline"
              className="text-xs bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 font-bold"
            >
              Open Dashboard
            </Button>
          )}
          {isVisitor && (
            <Button
              href="/demo/register"
              size="sm"
              variant="primary"
              className="text-xs font-bold"
            >
              Register Business
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Main Dossier, Right Sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Comprehensive Dossier */}
        <div className="space-y-6">
          {/* Header Hero Card */}
          <Card variant="bento" className="relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400" />
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              {/* Business Identity: Logo on Left, Details & Summary on Right */}
              <div className="flex flex-col sm:flex-row items-start gap-5 flex-1 min-w-0">
                {/* Logo with BITAINTEL Verified 'b' Seal on Bottom-Right */}
                <div className="relative shrink-0 group">
                  <BusinessAvatar
                    logoUrl={customLogoUrl || b.logoUrl || undefined}
                    businessName={b.name}
                    fallbackInitials={b.initials}
                    className="size-16 sm:size-20 rounded-2xl sm:rounded-3xl"
                    textClassName="text-xl sm:text-2xl"
                  />
                  {b.isPremiumSubscriber && (
                    <BitaintelVerifiedBadge size="lg" />
                  )}
                </div>

                {/* Right side of Logo: Name, Badges, Legal/Location, and Description */}
                <div className="space-y-2 flex-1 min-w-0">
                  <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900 break-words">
                    {b.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <Badge kind={verificationBadge.kind}>{verificationBadge.label}</Badge>
                    {b.isPremiumSubscriber && (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide border transition-all duration-200 select-none bg-gradient-to-r from-amber-500/20 via-primary-500/15 to-purple-500/15 text-primary-950 border-amber-300 shadow-2xs">
                        <Sparkles className="size-3.5 text-amber-500 shrink-0 animate-pulse" />
                        <span>Verified Premium Subscriber</span>
                      </span>
                    )}
                    <Badge kind="level">Tier {b.level} Audited</Badge>
                    <Badge kind="mint" icon={false}>{b.industry}</Badge>
                    <Badge kind="amber" icon={false}>{b.badge} Accreditation</Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                    <p className="break-all">
                      Legal: <span className="text-slate-700 font-semibold">{b.legalName}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="size-3 text-slate-400 shrink-0" />
                      <span>{formattedLocation} · {b.industry}</span>
                    </p>
                  </div>

                  {/* Summary / Description next to logo */}
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-600 pt-1">
                    {b.summary}
                  </p>
                </div>
              </div>

              {/* Score Widget */}
              <div className="flex items-center gap-3 self-start rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs shrink-0">
                <ScoreRing score={b.score} size={54} strokeWidth={4} showGrade />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Trust Score
                  </span>
                  <span className="text-xs font-bold text-primary-600">
                    {b.score >= 90 ? 'Platinum Tier' : 'High Confidence'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Audited {b.lastAudited}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick stats triplet */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Incorporation
                </span>
                <span className="mt-1 text-sm font-bold text-slate-900 block">
                  {b.age} Years Active
                </span>
                <span className="text-[11px] text-slate-500">
                  Est. {new Date().getFullYear() - b.age}
                </span>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Turnover Band
                </span>
                <span className="mt-1 text-sm font-bold text-slate-900 block">
                  {isGatedViewer ? '₹ Confidential' : effectiveTurnover || 'Confidential'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {isGatedViewer ? gatedText : 'Audited Financials'}
                </span>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Quality Standard
                </span>
                <span className="mt-1 text-sm font-bold text-primary-700 block truncate">
                  {b.isoCertified || 'No Certifications Listed'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {b.isoCertified ? 'Active Certification' : 'Standard Compliance'}
                </span>
              </div>
            </div>
          </Card>

          {/* Premium Exclusive Competitor Radar & Market Intelligence Widget */}
          {(isPremium || b.isPremiumSubscriber) && (
            <Card variant="bento" className="p-6 bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white space-y-5 border border-primary-500/30 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-bold border border-primary-400/30">
                    <Sparkles className="size-3.5 text-amber-400" />
                    <span>
                      {b.isPremiumSubscriber
                        ? 'Verified Premium Subscriber Intelligence Feature'
                        : 'Exclusive Premium Intelligence Feature'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white mt-2">
                    {b.name} — Competitor Intelligence & Radar Benchmark
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Peer group comparative risk index against top 15 category competitors.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleExportDossierPdf}
                    className="text-xs bg-primary-600 hover:bg-primary-500 text-white font-bold h-8"
                    icon={<Download className="size-3.5" />}
                  >
                    Export Dossier (PDF)
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Statutory Filing Consistency</span>
                  <span className="font-extrabold text-emerald-400 text-sm block">99.2% (Top 2%)</span>
                  <p className="text-[11px] text-slate-300">24 months consecutive GSTR-3B filed without penalty</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Credit & Solvency Grade</span>
                  <span className="font-extrabold text-primary-400 text-sm block">AA+ High Solvency</span>
                  <p className="text-[11px] text-slate-300">Calculated via MCA charge filings & bank confirmations</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Procurement Repeat Ratio</span>
                  <span className="font-extrabold text-cyan-400 text-sm block">91.4% Retention</span>
                  <p className="text-[11px] text-slate-300">Based on cross-vendor buyer feedback & RFI awards</p>
                </div>
              </div>
            </Card>
          )}

          {/*
            ===================================================================================
            NOTE FOR DEVELOPERS & AI AGENTS:
            The Statutory Verification Matrix component below is intentionally commented out 
            / hidden because the customer does not want it displayed here for now.
            DO NOT DELETE THIS COMPONENT. Any developer or AI working on this codebase must 
            preserve this component for future reactivation.
            ===================================================================================
          */}
          {/*
          <Card variant="bento">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Statutory Verification Matrix
                </h2>
              </div>
              <span className="text-xs font-bold text-primary-600 inline-flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> 100% Checkpoint Clearance
              </span>
            </div>

            {isVisitor ? (
              <div className="my-5 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="size-11 rounded-2xl bg-slate-100 text-slate-700 border border-slate-300 grid place-items-center mx-auto">
                  <LockKeyhole className="size-5" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-sm font-bold text-slate-900">
                    Detailed Statutory Checklist Gated for Visitors
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Unregistered visitors can inspect high-level profiles. To access audited MCA director filings, GSTN returns, and plant compliance reports, create an account in 60 seconds.
                  </p>
                  <Button href="/demo/register" size="sm" variant="primary" className="mt-4 font-bold text-xs">
                    Create Free Account to Unlock →
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {checkpoints.map((cp, idx) => {
                  const barColors = [
                    'from-primary-600 to-primary-400 text-primary-700',
                    'from-primary-600 to-primary-400 text-primary-800',
                    'from-primary-500 to-primary-400 text-primary-700',
                    'from-amber-500 to-orange-400 text-amber-800',
                    'from-rose-500 to-pink-400 text-rose-700',
                  ];
                  const chosenColor = barColors[idx % barColors.length];
                  const [grad, textColor] = chosenColor.split(' ');

                  function escapeHtml(value: unknown): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function handleExportDossierPdf() {
    const productsList = Array.isArray(b.products)
      ? b.products
          .map((p) => (typeof p === 'string' ? p : (p as { name?: string })?.name || ''))
          .filter(Boolean)
      : [];

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>BITAINTEL Dossier - ${escapeHtml(b.name)}</title>
  <style>
    @page { size: A4; margin: 16mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 0; line-height: 1.45; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 18px; }
    .brand { font-size: 20px; font-weight: 800; color: #1e3a8a; letter-spacing: -0.02em; }
    .sub { font-size: 11px; color: #475569; margin-top: 2px; }
    .score-box { text-align: right; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 8px 14px; }
    .score-val { font-size: 20px; font-weight: 800; color: #1e3a8a; }
    .score-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #3b82f6; }
    h1 { font-size: 18px; margin: 0 0 4px 0; }
    .section { margin-top: 16px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #475569; margin: 0 0 10px 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; font-size: 12px; }
    .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; display: block; }
    .val { font-weight: 600; color: #0f172a; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .metric { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; font-size: 11px; }
    .metric strong { display: block; font-size: 13px; color: #1e3a8a; margin: 4px 0; }
    ul { margin: 6px 0 0 18px; padding: 0; font-size: 12px; }
    .footer { margin-top: 20px; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">BITAINTEL · Enterprise Intelligence Dossier</div>
      <div class="sub">Verify Before You Trust · Generated ${escapeHtml(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }))}</div>
    </div>
    <div class="score-box">
      <div class="score-lbl">${escapeHtml(b.badge)} · Level ${escapeHtml(b.level)}</div>
      <div class="score-val">${escapeHtml(b.score)} / 100</div>
    </div>
  </div>

  <h1>${escapeHtml(b.name)}</h1>
  <div class="sub">${escapeHtml(b.legalName)} · ${escapeHtml(b.location)}</div>

  <div class="section">
    <div class="section-title">Corporate &amp; Statutory Metadata</div>
    <div class="grid">
      <div><span class="label">Legal Entity Name</span><span class="val">${escapeHtml(b.legalName)}</span></div>
      <div><span class="label">Corporate CIN</span><span class="val">${escapeHtml(b.cin || 'N/A')}</span></div>
      <div><span class="label">GSTIN Identifier</span><span class="val">${escapeHtml(b.gstin || 'N/A')}</span></div>
      <div><span class="label">Industry Sector</span><span class="val">${escapeHtml(b.industry || 'N/A')}</span></div>
      <div><span class="label">Operational Tenure</span><span class="val">${escapeHtml(b.age)} years</span></div>
      <div><span class="label">Turnover Band</span><span class="val">${escapeHtml(b.turnover || 'N/A')}</span></div>
      <div><span class="label">Certifications</span><span class="val">${escapeHtml(b.isoCertified || 'N/A')}</span></div>
      <div><span class="label">Last Audited</span><span class="val">${escapeHtml(b.lastAudited || 'Verified')}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Competitor Intelligence &amp; Radar Benchmark</div>
    <div class="metrics">
      <div class="metric"><span class="label">Statutory Filing Consistency</span><strong>99.2% (Top 2%)</strong>24 months consecutive GSTR-3B filed without penalty</div>
      <div class="metric"><span class="label">Credit &amp; Solvency Grade</span><strong>AA+ High Solvency</strong>Calculated via MCA charge filings &amp; bank confirmations</div>
      <div class="metric"><span class="label">Procurement Repeat Ratio</span><strong>91.4% Retention</strong>Based on cross-vendor buyer feedback &amp; RFI awards</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Registered Products &amp; Services (${productsList.length})</div>
    ${
      productsList.length > 0
        ? `<ul>${productsList.map((name) => `<li>${escapeHtml(name)}</li>`).join('')}</ul>`
        : '<div class="sub">No products listed.</div>'
    }
  </div>

  <div class="footer">
    <span>BITAINTEL Verified Network · ${escapeHtml(b.id)}</span>
    <span>Confidential Procurement Intelligence Report</span>
  </div>
</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      iframe.remove();
      window.print();
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      toast.success(`Dossier Ready for ${b.name}`, {
        description: 'Select "Save as PDF" in the print dialog to download the PDF.',
      });
      setTimeout(() => iframe.remove(), 1500);
    }, 150);
  }

  return (
                    <div key={cp.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{cp.label}</span>
                        <span className={`font-extrabold ${textColor}`}>{cp.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`}
                          style={{ width: `${cp.pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
          */}

          {/* ========================================================================= */}
          {/* COMMERCIAL PRODUCTS & AUDITED OFFERINGS SECTION (ROLE & VISITOR AWARE)     */}
          {/* ========================================================================= */}
          {catalogProducts.length > 0 && (
            <Card variant="bento" className="p-6 bg-white space-y-4">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-xl bg-primary-50 text-primary-700 grid place-items-center shrink-0 border border-primary-100">
                    <Package className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-slate-900">
                        Commercial Products &amp; Services Catalog
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {catalogProducts.length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                      Products visible to corporate buyers with audited Technical Data Sheets (TDS) and Certificates of Analysis (COA)
                    </p>
                  </div>
                </div>

                <div className="relative w-full sm:w-56 shrink-0">
                  <Search className="size-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={catalogSearchQuery}
                    onChange={(e) => setCatalogSearchQuery(e.target.value)}
                    placeholder="Search products or HSN..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
                  />
                </div>
              </div>

              {/* Visitor / Unverified Gating Notice or Verified B2B Buyer Banner */}
              {isGatedViewer ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <Lock className="size-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
                    <p className="text-amber-900 leading-relaxed">
                      {isVisitor ? (
                        <>
                          <strong className="font-bold">Visitor Preview Mode:</strong> Commercial unit pricing and downloadable certified batch compliance documents (TDS &amp; COA) require a verified B2B account.
                        </>
                      ) : (
                        <>
                          <strong className="font-bold">GST &amp; Account Verification Required:</strong> Commercial unit pricing and certified TDS &amp; COA downloads unlock automatically once your B2B entity verification is approved.
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isVisitor ? (
                      <>
                        <Button href="/demo/login" size="xs" variant="primary" className="text-xs font-bold">
                          Sign In
                        </Button>
                        <Button href="/demo/register" size="xs" variant="outline" className="text-xs bg-white font-bold">
                          Register Free
                        </Button>
                      </>
                    ) : (
                      <Button href="/demo/dashboard/vendor" size="xs" variant="primary" className="text-xs font-bold">
                        Complete Verification
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-medium">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong className="font-bold">Verified B2B Mode ({role.replace('_', ' ').toUpperCase()}):</strong> Commercial unit pricing and downloadable certified compliance files (TDS &amp; COA) are unlocked.
                    </span>
                  </div>
                </div>
              )}

              {/* Catalog Table (matching Vendor Catalog UI) */}
              <div className="rounded-2xl border border-slate-200 overflow-x-auto bg-white">
                <table className="w-full min-w-[700px] text-left text-xs">
                  <thead className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Product / Service</th>
                      <th className="p-3">HSN Code</th>
                      <th className="p-3">MOQ &amp; Batch</th>
                      <th className="p-3">Lead Time</th>
                      <th className="p-3">Price / Currency</th>
                      <th className="p-3">Technical Docs (TDS / COA)</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCatalogProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                          No matching catalog products found for &ldquo;{catalogSearchQuery}&rdquo;.
                        </td>
                      </tr>
                    ) : (
                      filteredCatalogProducts.map((prod) => {
                        const hasTds = Boolean(prod.hasTds || prod.technicalDataSheetDoc);
                        const hasCoa = Boolean(prod.hasCoa || prod.coaDoc);

                        return (
                          <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-3 max-w-[240px]">
                              <div className="flex items-center gap-3">
                                <ProductThumbnail
                                  images={prod.images}
                                  src={prod.images && prod.images.length > 0 ? prod.images[0] : (prod as any).imageUrl}
                                  alt={prod.name}
                                  size="sm"
                                  showCountBadge
                                />
                                <div className="min-w-0 flex-1">
                                  <span className="text-[10px] font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200/80 inline-block mb-1">
                                    {prod.brand || b.name}
                                  </span>
                                  <strong className="text-slate-900 block truncate" title={prod.name}>
                                    {prod.name}
                                  </strong>
                                  <span className="text-[11px] text-slate-500 line-clamp-1">
                                    {prod.specifications || prod.description || prod.grade || 'Audited specification'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3 font-mono text-slate-700 whitespace-nowrap">
                              {prod.hsnCode || '—'}
                            </td>

                            <td className="p-3 whitespace-nowrap">
                              <span className="font-semibold text-slate-800 block">
                                {prod.moq || '50 Units'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {prod.standardOrderQty ? `Batch: ${prod.standardOrderQty}` : 'Standard Batch'}
                              </span>
                            </td>

                            <td className="p-3 text-slate-700 font-medium whitespace-nowrap">
                              {prod.leadTimeDays || '14 Days'}
                            </td>

                            <td className="p-3 whitespace-nowrap">
                              {isGatedViewer ? (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold"
                                  title={gatedText}
                                >
                                  <Lock className="size-3 text-slate-400" />
                                  <span>{gatedText}</span>
                                </span>
                              ) : (
                                <>
                                  <span className="font-black text-slate-900 block">
                                    {formatIndicativePrice(prod)}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block">
                                    {prod.sampleAvailability || 'Available Free'}
                                  </span>
                                </>
                              )}
                            </td>

                            <td className="p-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {/* TDS Pill */}
                                {isGatedViewer && hasTds ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toast.info('Access Restricted to Verified B2B Accounts', {
                                        description: isVisitor
                                          ? 'Please sign in with an approved B2B account to download Technical Data Sheets (TDS).'
                                          : 'Complete GST and entity verification to unlock TDS downloads.',
                                      })
                                    }
                                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-600 border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Verified B2B required to download TDS"
                                  >
                                    <Lock className="size-2.5 text-slate-400" />
                                    <span>TDS</span>
                                  </button>
                                ) : prod.technicalDataSheetDoc ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDownloadProductDoc(
                                        prod.technicalDataSheetDoc,
                                        'Technical Data Sheet (TDS)'
                                      )
                                    }
                                    className="px-2.5 py-1 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 border border-emerald-300 flex items-center gap-1.5 transition-all shadow-2xs group cursor-pointer"
                                    title={`Download TDS: ${prod.technicalDataSheetDoc}`}
                                  >
                                    <FileText className="size-3 text-emerald-600 group-hover:scale-110 transition-transform" />
                                    <span>TDS</span>
                                    <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">TDS N/A</span>
                                )}

                                {/* COA Pill */}
                                {isGatedViewer && hasCoa ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toast.info('Access Restricted to Verified B2B Accounts', {
                                        description: isVisitor
                                          ? 'Please sign in with an approved B2B account to download Certificates of Analysis (COA).'
                                          : 'Complete GST and entity verification to unlock COA downloads.',
                                      })
                                    }
                                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-600 border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Verified B2B required to download COA"
                                  >
                                    <Lock className="size-2.5 text-slate-400" />
                                    <span>COA</span>
                                  </button>
                                ) : prod.coaDoc ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDownloadProductDoc(
                                        prod.coaDoc,
                                        'Certificate of Analysis (COA)'
                                      )
                                    }
                                    className="px-2.5 py-1 rounded-full bg-blue-50 text-[10px] font-bold text-blue-800 hover:bg-blue-100 border border-blue-300 flex items-center gap-1.5 transition-all shadow-2xs group cursor-pointer"
                                    title={`Download COA: ${prod.coaDoc}`}
                                  >
                                    <CheckCircle2 className="size-3 text-blue-600 group-hover:scale-110 transition-transform" />
                                    <span>COA</span>
                                    <span className="size-1.5 rounded-full bg-blue-500 inline-block" />
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">COA N/A</span>
                                )}
                              </div>
                            </td>

                            <td className="p-3 text-right whitespace-nowrap">
                              <div className="inline-flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedProductForModal(prod)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-primary-700 font-semibold text-[11px] transition-colors cursor-pointer"
                                  title="View Full Specifications"
                                >
                                  <Eye className="size-3.5" />
                                  <span>Specs</span>
                                </button>

                                {isVisitor ? (
                                  <Button
                                    href="/demo/login"
                                    variant="primary"
                                    size="xs"
                                    className="text-[11px] font-bold"
                                  >
                                    <Lock className="size-3 mr-1" /> RFQ
                                  </Button>
                                ) : (
                                  <EnquiryModal
                                    business={b}
                                    productId={prod.id}
                                    productName={prod.name}
                                    triggerButton={
                                      <Button
                                        variant="primary"
                                        size="xs"
                                        className="text-[11px] font-bold shadow-2xs"
                                      >
                                        <Send className="size-3 mr-1" /> RFQ
                                      </Button>
                                    }
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* High-Level Manufacturing Capability Keywords */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Audited Manufacturing Portfolio &amp; Specializations
                </span>
                <div className="flex flex-wrap gap-2">
                  {b.products.map((p) => (
                    <span
                      key={p}
                      className="rounded-full bg-slate-100/90 border border-slate-200 px-3.5 py-1 text-xs font-semibold text-slate-800"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Privacy Shield Box */}
              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
                <LockKeyhole className="size-5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Confidential unit pricing, bank credit facility agreements, and proprietary customer contracts are restricted under reciprocal NDA protocols and are not published on the open directory.
                </p>
              </div>
            </Card>
          )}

          {/* Quick Specs Dialog for Selected Product */}
          {selectedProductForModal && (
            <Dialog
              open={!!selectedProductForModal}
              onClose={() => setSelectedProductForModal(null)}
              title={selectedProductForModal.name}
              description={`${selectedProductForModal.brand || b.name} · Product Details & Specifications`}
            >
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3.5 pb-2">
                  <ProductThumbnail
                    images={selectedProductForModal.images}
                    src={selectedProductForModal.images && selectedProductForModal.images.length > 0 ? selectedProductForModal.images[0] : (selectedProductForModal as any).imageUrl}
                    alt={selectedProductForModal.name}
                    size="lg"
                    showCountBadge
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Description</span>
                    <p className="text-slate-700 leading-relaxed">
                      {selectedProductForModal.description || selectedProductForModal.specifications}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] font-bold block">Brand</span>
                    <span className="font-semibold text-slate-900">{selectedProductForModal.brand || b.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] font-bold block">HSN Code</span>
                    <span className="font-semibold text-slate-900">{selectedProductForModal.hsnCode || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] font-bold block">Material Grade</span>
                    <span className="font-semibold text-slate-900">{selectedProductForModal.grade || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] font-bold block">Standards / Certs</span>
                    <span className="font-semibold text-slate-900">{selectedProductForModal.standards || b.isoCertified}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] font-bold block">Minimum Order Qty (MOQ)</span>
                    <span className="font-semibold text-slate-900">{selectedProductForModal.moq || '50 Units'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] font-bold block">Standard Lead Time</span>
                    <span className="font-semibold text-slate-900">{selectedProductForModal.leadTimeDays || '14 Days'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] font-bold block">Country of Origin</span>
                    <span className="font-semibold text-slate-900">{selectedProductForModal.countryOfOrigin || 'India'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[9px] font-bold block">Sample Policy</span>
                    <span className="font-semibold text-slate-900">{selectedProductForModal.sampleAvailability || 'Available Free'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Commercial Pricing &amp; Terms</span>
                  {isGatedViewer ? (
                    <div className="flex items-center gap-2 text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                      <Lock className="size-4 text-slate-400 shrink-0" />
                      <span className="font-semibold">Indicative Price is available to Verified B2B accounts only.</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Unit Price</span>
                        <span className="text-sm font-extrabold text-slate-900">
                          {selectedProductForModal.indicativePrice &&
                          selectedProductForModal.indicativePrice !== '0' &&
                          selectedProductForModal.indicativePrice.toLowerCase() !== 'on request'
                            ? `${selectedProductForModal.currency || 'INR'} ${selectedProductForModal.indicativePrice}`
                            : 'On Request'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-bold">Validity</span>
                        <span className="text-xs font-semibold text-slate-700">{selectedProductForModal.priceValidity || '60 Days'}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Technical &amp; Compliance Documents</span>
                  <div className="flex gap-2 flex-wrap">
                    {/* TDS */}
                    {isGatedViewer &&
                    (selectedProductForModal.hasTds || selectedProductForModal.technicalDataSheetDoc) ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductForModal(null);
                          toast.info('Verified B2B account required to download certified TDS documents');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        <Lock className="size-3 text-slate-400" /> TDS Document ({gatedText})
                      </button>
                    ) : selectedProductForModal.technicalDataSheetDoc ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadProductDoc(
                            selectedProductForModal.technicalDataSheetDoc,
                            'Technical Data Sheet (TDS)'
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-50 border border-primary-200 text-primary-800 hover:bg-primary-100 cursor-pointer"
                      >
                        <FileText className="size-3.5 text-primary-700" />
                        Download TDS PDF
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">No TDS attached</span>
                    )}

                    {/* COA */}
                    {isGatedViewer &&
                    (selectedProductForModal.hasCoa || selectedProductForModal.coaDoc) ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductForModal(null);
                          toast.info('Verified B2B account required to download certified COA documents');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        <Lock className="size-3 text-slate-400" /> COA Document ({gatedText})
                      </button>
                    ) : selectedProductForModal.coaDoc ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadProductDoc(
                            selectedProductForModal.coaDoc,
                            'Certificate of Analysis (COA)'
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                      >
                        <ShieldCheck className="size-3.5 text-emerald-700" />
                        Download COA PDF
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">No COA attached</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button variant="outline" size="sm" onClick={() => setSelectedProductForModal(null)}>
                    Close
                  </Button>
                  {isVisitor ? (
                    <Button href="/demo/login" variant="primary" size="sm" className="font-bold">
                      Sign In to Enquire
                    </Button>
                  ) : (
                    <EnquiryModal
                      business={b}
                      productId={selectedProductForModal.id}
                      productName={selectedProductForModal.name}
                      triggerButton={
                        <Button variant="primary" size="sm" className="font-bold">
                          <Send className="size-3.5 mr-1" /> Request RFQ / Quote
                        </Button>
                      }
                    />
                  )}
                </div>
              </div>
            </Dialog>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-6">
          {/* Quick Action Card with Modal Trigger */}
          <Card variant="bento" className="p-6">
            <span className="text-[10px] uppercase font-bold text-primary-700 tracking-wider block">
              Procurement Gateway
            </span>
            <h3 className="mt-2 text-base font-bold text-slate-900">
              Connect with {b.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Send a verified procurement enquiry or request access to the complete statutory audit pack.
            </p>

            <div className="mt-5 space-y-2.5">
              {isVisitor ? (
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    className="w-full justify-center"
                    href="/demo/login"
                  >
                    Sign In to Send Enquiry
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center text-xs"
                    href="/demo/register"
                  >
                    Create Vendor Account
                  </Button>
                </div>
              ) : (
                <EnquiryModal business={b} />
              )}

              <Button
                variant="secondary"
                className="w-full justify-center"
                href={`/demo/compare?ids=${b.id}`}
              >
                Compare with Another Business
              </Button>

              {!isVisitor && (
                <ComplaintModal business={b} />
              )}
            </div>
          </Card>

          {/* Profile At A Glance Table */}
          <Card variant="bento" className="p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
              Corporate Metadata
            </h4>
            <dl className="mt-4 space-y-3">
              {metadataRows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between items-start gap-3 text-xs py-1.5 border-b border-slate-100 last:border-0"
                >
                  <dt className="text-slate-500 font-medium shrink-0">{label}</dt>
                  <dd className="font-semibold text-slate-900 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* Disclaimer */}
          <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-4 text-[11px] leading-relaxed text-slate-400 backdrop-blur-md">
            Disclaimer: Verification confirms statutory checks at the stated audit date. Corporate parties must independently conduct transaction-specific commercial due diligence.
          </div>
        </aside>
      </div>
    </div>
  );
}
