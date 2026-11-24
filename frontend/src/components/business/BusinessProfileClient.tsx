'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { PersonaSwitcher } from '@/components/shared/PersonaSwitcher';
import { getStoredVendorDossier } from '@/config/initialVendorDossier';
import { ProductCatalogItem } from '@/types/vendorRegistration';
import { ProductThumbnail } from '@/components/shared/ProductThumbnail';
import {
  MapPin,
  ShieldCheck,
  ArrowLeft,
  LockKeyhole,
  CheckCircle2,
  Layers,
  Sparkles,
  Download,
  AlertTriangle,
  FileText,
  UserCheck,
  TrendingUp,
  Award,
  Lock,
  ExternalLink,
  Package,
  Send,
} from 'lucide-react';

import { toast } from 'sonner';

interface BusinessProfileClientProps {
  business: Business;
}

export function BusinessProfileClient({ business: b }: BusinessProfileClientProps) {
  const { role, user } = useAuth();

  const isVisitor = role === 'visitor';
  const isUnverified = role === 'unverified';
  const isPendingApproval = role === 'pending_approval';
  const isApproved = role === 'approved_business';
  const isPremium = role === 'premium_subscriber';

  // Commercial Products Catalog State
  const [catalogProducts, setCatalogProducts] = useState<ProductCatalogItem[]>([]);
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductCatalogItem | null>(null);
  const [customLogoUrl, setCustomLogoUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    // 1. If viewing reference demo or company with stored vendor dossier, load stored products & logo from vendor dossier
    if (b.logoUrl) {
      setCustomLogoUrl(b.logoUrl);
    }
    const stored = getStoredVendorDossier();
    if (
      stored &&
      (b.id === 'meridian-steel-works' ||
        b.name.toLowerCase().includes('meridian') ||
        b.id.toLowerCase().includes('propack') ||
        b.name.toLowerCase().includes('propack'))
    ) {
      if (stored.step2?.logoUrl) {
        setCustomLogoUrl(stored.step2.logoUrl);
      }
      if (stored.step4?.products && stored.step4.products.length > 0) {
        setCatalogProducts(stored.step4.products);
        return;
      }
    }

    // 2. For any business with registered products in b.products, map them into structured catalog items
    if (b.products && b.products.length > 0) {
      const mapped: ProductCatalogItem[] = b.products.map((prodName, idx) => ({
        id: `PRD-${b.id}-${idx + 1}`,
        name: prodName,
        type: 'Product',
        categoryId: 'CAT017',
        subcategoryId: 'SUB187',
        brand: b.name,
        description: `Verified high-precision ${prodName.toLowerCase()} engineered to stringent tolerances for ${b.industry.toLowerCase()} applications.`,
        specifications: `Custom engineered specifications, audited and certified under ${b.isoCertified}`,
        grade: 'High-Purity / Industrial Grade',
        standards: b.isoCertified,
        hsnCode: `${72000000 + idx * 10500}`,
        countryOfOrigin: 'India',
        moq: '100 Units',
        standardOrderQty: '500 Units',
        monthlyCapacity: '20,000 Units',
        availableStock: '1,500 Units',
        leadTimeDays: '14–21 Days',
        sampleAvailability: idx % 2 === 0 ? 'Available Free' : 'Available Paid',
        indicativePrice: idx === 0 ? '4,850' : '',
        currency: 'INR',
        priceValidity: '60 Days',
        targetMarkets: 'Domestic & Global Exports',
        technicalDataSheetDoc: `TDS_${prodName.replace(/[^a-zA-Z0-9]/g, '_')}_Spec.pdf`,
        coaDoc: idx % 2 === 0 ? `COA_Batch_${b.id.slice(0, 4).toUpperCase()}_2026.pdf` : undefined,
      }));
      setCatalogProducts(mapped);
    } else {
      setCatalogProducts([]);
    }
  }, [b]);

  const metadataRows = [
    ['Legal Entity Name', b.legalName],
    ['Corporate CIN', isVisitor ? `${b.cin.slice(0, 8)}********` : b.cin],
    ['GSTIN Identifier', isVisitor ? `${b.gstin.slice(0, 5)}******${b.gstin.slice(-2)}` : b.gstin],
    ['Industry Sector', b.industry],
    ['Registered Location', b.location],
    ['Operational Tenure', `${b.age} years active`],
    ['Headcount Band', isVisitor ? 'Gated for Visitors' : `${b.employees} personnel`],
    ['Annual Turnover Band', isVisitor ? 'Gated for Visitors' : b.turnover],
    ['Verification Tier', `Tier ${b.level} (Audited)`],
    ['Membership Status', b.isPremiumSubscriber ? '⭐ Verified Premium Subscriber' : 'Standard Empanelled'],
    ['Last Audit Date', b.lastAudited],
  ];

  const checkpoints = [
    { label: 'Corporate Legal Identity', value: b.identity, max: 10, pct: 100 },
    { label: 'Statutory Document Dossier', value: isVisitor ? 'Gated' : b.documents, max: 20, pct: isVisitor ? 50 : 95 },
    { label: 'Representative Identity & Contact', value: isVisitor ? 'Gated' : b.contact, max: 5, pct: isVisitor ? 50 : 100 },
    { label: 'Physical Plant / Office Geolocation', value: b.address, max: 5, pct: 90 },
    { label: 'Public Profile Completeness', value: `${b.profile}/15`, max: 15, pct: 100 },
  ];

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
                    <Badge kind="verified">Verified Entity</Badge>
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
                      <span>{b.location} · {b.industry}</span>
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
                  {isVisitor ? '₹ Confidential' : b.turnover}
                </span>
                <span className="text-[11px] text-slate-500">
                  {isVisitor ? 'Gated for Visitors' : 'Audited Financials'}
                </span>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Quality Standard
                </span>
                <span className="mt-1 text-sm font-bold text-primary-700 block truncate">
                  {b.isoCertified}
                </span>
                <span className="text-[11px] text-slate-500">Active Certification</span>
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
                    onClick={() =>
                      toast.success(`Dossier Exported for ${b.name}`, {
                        description: 'Downloaded complete intelligence report in PDF format.',
                      })
                    }
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
            <Card variant="bento" className="p-6 bg-white space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-primary-50 text-primary-700 border border-primary-200 grid place-items-center shrink-0">
                    <Package className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">
                        Commercial Products &amp; Verified Offerings
                      </h2>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 border border-primary-200">
                        {catalogProducts.length} {catalogProducts.length === 1 ? 'Product' : 'Products'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Audited product lines, certified technical documents (TDS &amp; COA), and supply parameters.
                    </p>
                  </div>
                </div>
              </div>

              {/* Visitor Gating Notice or Verified Buyer Banner */}
              {isVisitor ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <Lock className="size-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
                    <p className="text-amber-900 leading-relaxed">
                      <strong className="font-bold">Visitor Preview Mode:</strong> Commercial unit pricing and downloadable certified batch compliance documents (TDS &amp; COA) are gated for visitors.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button href="/demo/login" size="xs" variant="primary" className="text-xs font-bold">
                      Sign In
                    </Button>
                    <Button href="/demo/register" size="xs" variant="outline" className="text-xs bg-white font-bold">
                      Register Free
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-medium">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong className="font-bold">Verified Buyer Mode ({role.replace('_', ' ').toUpperCase()}):</strong> Commercial unit pricing and downloadable certified compliance files (TDS &amp; COA) are unlocked.
                    </span>
                  </div>
                </div>
              )}

              {/* Product Cards List */}
              <div className="grid gap-4">
                {catalogProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 hover:border-primary-300 hover:shadow-xs transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <ProductThumbnail images={prod.images} alt={prod.name} size="md" showCountBadge />
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-50 text-primary-800 border border-primary-200">
                              {prod.brand || b.name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {prod.type || 'Product'}
                            </span>
                            {prod.hsnCode && (
                              <span className="text-[10px] font-mono text-slate-400">
                                HSN: {prod.hsnCode}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                            {prod.name}
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                            {prod.description || prod.specifications}
                          </p>
                        </div>
                      </div>

                      {/* Price / Commercial Status */}
                      <div className="shrink-0 text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                          Indicative Price
                        </span>
                        {isVisitor ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
                            <Lock className="size-3 text-slate-400" />
                            <span>Gated for Visitors</span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-sm sm:text-base font-black text-slate-900">
                              {prod.indicativePrice &&
                              prod.indicativePrice !== '0' &&
                              prod.indicativePrice.toLowerCase() !== 'on request'
                                ? `${prod.currency || 'INR'} ${prod.indicativePrice}`
                                : 'On Request'}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              MOQ: {prod.moq || '50 Units'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Specifications & Compliance Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2.5 px-3 rounded-xl bg-slate-50/80 border border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">MOQ</span>
                        <span className="font-semibold text-slate-800">{prod.moq || '50 Units'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Lead Time</span>
                        <span className="font-semibold text-slate-800">{prod.leadTimeDays || '14 Days'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Grade / Standard</span>
                        <span className="font-semibold text-slate-800 truncate block">
                          {prod.grade || prod.standards || 'Standard Spec'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Sample Availability</span>
                        <span className="font-semibold text-slate-800 block truncate">
                          {prod.sampleAvailability || 'Available Free'}
                        </span>
                      </div>
                    </div>

                    {/* Technical Documents (TDS & COA) and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
                          Technical Docs:
                        </span>

                        {/* TDS */}
                        {isVisitor ? (
                          <button
                            type="button"
                            onClick={() =>
                              toast.info('Access Restricted to Verified Buyers', {
                                description: 'Please sign in or create an account to view and download certified Technical Data Sheets (TDS).',
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                            title="Sign in to view TDS"
                          >
                            <Lock className="size-3 text-slate-400" />
                            <span>TDS Available</span>
                          </button>
                        ) : prod.technicalDataSheetDoc ? (
                          <button
                            type="button"
                            onClick={() =>
                              toast.success('Technical Data Sheet Downloaded', {
                                description: `Downloaded ${prod.technicalDataSheetDoc}`,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary-50 hover:bg-primary-100 text-primary-800 border border-primary-200 transition-colors shadow-2xs cursor-pointer"
                            title={`Download ${prod.technicalDataSheetDoc}`}
                          >
                            <FileText className="size-3.5 text-primary-700" />
                            <span>TDS Sheet</span>
                            <Download className="size-3 text-primary-600 ml-0.5" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">TDS on Request</span>
                        )}

                        {/* COA */}
                        {isVisitor ? (
                          <button
                            type="button"
                            onClick={() =>
                              toast.info('Access Restricted to Verified Buyers', {
                                description: 'Please sign in or create an account to view and download certified Certificates of Analysis (COA).',
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                            title="Sign in to view COA"
                          >
                            <Lock className="size-3 text-slate-400" />
                            <span>COA Available</span>
                          </button>
                        ) : prod.coaDoc ? (
                          <button
                            type="button"
                            onClick={() =>
                              toast.success('Certificate of Analysis Downloaded', {
                                description: `Downloaded ${prod.coaDoc}`,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
                            title={`Download ${prod.coaDoc}`}
                          >
                            <ShieldCheck className="size-3.5 text-emerald-700" />
                            <span>COA Report</span>
                            <Download className="size-3 text-emerald-600 ml-0.5" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">COA on Request</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProductForModal(prod)}
                          className="text-xs font-semibold"
                        >
                          Full Specs
                        </Button>

                        {isVisitor ? (
                          <Button
                            href="/demo/login"
                            variant="primary"
                            size="sm"
                            className="text-xs font-bold"
                          >
                            <Lock className="size-3 mr-1" /> Request RFQ
                          </Button>
                        ) : (
                          <EnquiryModal
                            business={b}
                            productName={prod.name}
                            triggerButton={
                              <Button
                                variant="primary"
                                size="sm"
                                className="text-xs font-bold shadow-2xs"
                              >
                                <Send className="size-3 mr-1" /> Request Quote
                              </Button>
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
                  {isVisitor ? (
                    <div className="flex items-center gap-2 text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                      <Lock className="size-4 text-slate-400 shrink-0" />
                      <span className="font-semibold">Indicative Price is Gated for Visitors.</span>
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
                    {isVisitor ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductForModal(null);
                          toast.info('Sign in to view certified TDS documents');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        <Lock className="size-3 text-slate-400" /> TDS Document (Login to view)
                      </button>
                    ) : selectedProductForModal.technicalDataSheetDoc ? (
                      <button
                        type="button"
                        onClick={() =>
                          toast.success('Technical Data Sheet Downloaded', {
                            description: `Downloaded ${selectedProductForModal.technicalDataSheetDoc}`,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-50 border border-primary-200 text-primary-800 hover:bg-primary-100 cursor-pointer"
                      >
                        <FileText className="size-3.5 text-primary-700" />
                        Download TDS ({selectedProductForModal.technicalDataSheetDoc})
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">No TDS attached</span>
                    )}

                    {/* COA */}
                    {isVisitor ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductForModal(null);
                          toast.info('Sign in to view certified COA documents');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        <Lock className="size-3 text-slate-400" /> COA Document (Login to view)
                      </button>
                    ) : selectedProductForModal.coaDoc ? (
                      <button
                        type="button"
                        onClick={() =>
                          toast.success('Certificate of Analysis Downloaded', {
                            description: `Downloaded ${selectedProductForModal.coaDoc}`,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                      >
                        <ShieldCheck className="size-3.5 text-emerald-700" />
                        Download COA ({selectedProductForModal.coaDoc})
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
