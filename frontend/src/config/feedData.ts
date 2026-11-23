export type FeedMediaType = 'text' | 'image' | 'video';

export type FeedCategory =
  | 'Platform Update'
  | 'Regulatory Alert'
  | 'Market Intelligence'
  | 'Audit Advisory'
  | 'Spotlight';

export interface FeedAuthor {
  name: string;
  role: string;
  badge: string;
}

export interface FeedPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string[];
  mediaType: FeedMediaType;
  category: FeedCategory;
  publishedAt: string; // ISO 8601 date string
  readTime: string;
  pinned?: boolean;
  author: FeedAuthor;
  tags: string[];
  // For 'text' posts — highlighted editorial takeaway / callout
  highlightMetric?: {
    label: string;
    value: string;
    context: string;
  };
  // For 'image' posts
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  // For 'video' posts
  videoUrl?: string;
  posterUrl?: string;
  videoDuration?: string;
  videoChapters?: Array<{
    time: string;
    label: string;
    detail: string;
  }>;
  // Optional action link to platform resources
  relatedLink?: {
    label: string;
    href: string;
  };
}

export const FEED_CATEGORIES: FeedCategory[] = [
  'Platform Update',
  'Regulatory Alert',
  'Market Intelligence',
  'Audit Advisory',
  'Spotlight',
];

export function formatFeedDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatFeedDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function getFeedShareUrl(slug: string, origin?: string): string {
  const base =
    origin ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://bitaintel.com');
  return `${base}/demo/feed?post=${encodeURIComponent(slug)}`;
}

export const feedPosts: FeedPost[] = [
  {
    id: 'FEED-001',
    slug: 'tds-coa-optional-catalog-bulk-excel-launch',
    title: 'Product Catalogs Now Support CSV/Excel Bulk Sync & Flexible TDS/COA Attachments',
    summary:
      'Verified vendors can now upload and update commercial product lines in bulk via .xlsx and .csv templates, with pricing, Technical Data Sheets (TDS), and Certificates of Analysis (COA) optional per SKU.',
    content: [
      'Enterprise suppliers operating multi-hundred SKU catalogs often need to onboard standard items immediately and attach batch-specific Certificates of Analysis (COA) or Technical Data Sheets (TDS) when laboratory runs conclude.',
      'With today’s platform release, Vendor Dashboard catalogs and Dossier product listings support full spreadsheet round-tripping. Vendors can export existing product IDs, modify indicative pricing, MOQs, or lead times offline in Excel or CSV, and re-upload to apply updates cleanly.',
      'To preserve procurement data hygiene, indicative pricing and technical documents remain role-gated on public business dossiers: unverified visitors see catalog capabilities, while approved corporate buyers unlock verified specification sheets and direct RFQ workflows.',
    ],
    mediaType: 'image',
    category: 'Platform Update',
    publishedAt: '2026-11-11T10:00:00Z',
    readTime: '3 min read',
    pinned: true,
    author: {
      name: 'BITAINTEL Product Desk',
      role: 'Platform Administration',
      badge: 'Official Admin',
    },
    tags: ['Product Catalog', 'Bulk Upload', 'TDS & COA', 'Vendor Portal'],
    imageUrl: '/feed/tds-coa-catalog-launch.svg',
    imageAlt: 'Overview of TDS, COA, and Excel/CSV Bulk Sync workflow on BITAINTEL',
    imageCaption: 'Figure 1: Three-stage product catalog sync with optional technical sheets and role-gated dossier display.',
    relatedLink: {
      label: 'Explore Vendor Dashboard',
      href: '/demo/dashboard/vendor',
    },
  },
  {
    id: 'FEED-002',
    slug: 'video-walkthrough-six-step-verification-audit',
    title: 'Video Briefing: Inside BITAINTEL’s 6-Step Statutory & Document Vault Audit',
    summary:
      'Watch a concise briefing from our Lead Compliance Officer covering how MCA corporate identity, 24-month GSTN filings, and SHA-256 vaulted documents combine into a Tier 1–4 Trust Score.',
    content: [
      'Understanding how corporate entities progress from initial registration to Tier-4 Comprehensive Audit helps both procurement heads and supplier compliance teams shorten vendor onboarding cycles.',
      'This administrative video walkthrough breaks down each verification checkpoint: dual-channel OTP signatory validation, live statutory registry matching, plant geolocation checks, and final compliance sign-off.',
    ],
    mediaType: 'video',
    category: 'Audit Advisory',
    publishedAt: '2026-11-08T14:30:00Z',
    readTime: '03:45 video',
    author: {
      name: 'Ananya Sharma',
      role: 'Lead Verification Officer · Admin',
      badge: 'Verified Admin',
    },
    tags: ['Verification Tiers', 'Modules A–F', 'Audit Briefing'],
    posterUrl: '/feed/video-poster-onboarding.svg',
    videoDuration: '03:45',
    videoChapters: [
      {
        time: '00:00',
        label: 'Stage 1–2: Signatory & Statutory Identity',
        detail: 'Dual OTP confirmation paired with CIN, PAN, and GSTIN cross-verification.',
      },
      {
        time: '01:15',
        label: 'Stage 3–4: Facility & ISO Evidence',
        detail: 'Validating manufacturing capacity, lab equipment, and non-expired ISO certificates.',
      },
      {
        time: '02:30',
        label: 'Stage 5–6: Solvency & Tier Assignment',
        detail: 'Bank confirmation checks, weighted 0–100 Trust Score persistence, and audit sign-off.',
      },
    ],
    relatedLink: {
      label: 'Read Verification Methodology',
      href: '/demo/how-it-works',
    },
  },
  {
    id: 'FEED-003',
    slug: 'gstn-filing-telemetry-v2-4-deployment',
    title: 'Engine Notice: 24-Month GSTN Continuity Telemetry & MCA Sync Live Across Directory',
    summary:
      'BITAINTEL’s automated statutory cross-check adapter now monitors trailing 24-month GSTR-3B return regularity and flags suspended GSTINs before procurement contracts are executed.',
    content: [
      'Statutory tax compliance is one of the highest-weighted pillars of the BITAINTEL Trust Score (20% dimension weight). Missing multiple consecutive GSTR-3B filings often precedes operational distress or supply disruption.',
      'Our upgraded telemetry cycle automatically compares declared trade names, registered states, and return cadence against registry updates, ensuring enterprise buyers always inspect current statutory health.',
      'Whenever an entity’s statutory record shifts or a required certificate approaches its 90-day renewal window, vendors receive automated portal alerts without silent delisting.',
    ],
    mediaType: 'image',
    category: 'Regulatory Alert',
    publishedAt: '2026-11-05T08:45:00Z',
    readTime: '4 min read',
    author: {
      name: 'BITAINTEL Regulatory Desk',
      role: 'Compliance Administration',
      badge: 'Official Admin',
    },
    tags: ['GSTN', 'MCA Compliance', 'Risk Monitoring'],
    imageUrl: '/feed/gstn-compliance-2026.svg',
    imageAlt: '24-Month Automated GSTN and MCA Telemetry Sync dashboard preview',
    imageCaption: 'Real-time statutory telemetry metrics across audited Tier-3 and Tier-4 vendors.',
    relatedLink: {
      label: 'Browse Audited Directory',
      href: '/demo/directory',
    },
  },
  {
    id: 'FEED-004',
    slug: 'mandatory-din-director-cross-check-update',
    title: 'Compliance Advisory: Director DIN Verification & Authorized Signatory Traceability',
    summary:
      'Updated due-diligence guidance for enterprise buyers evaluating newly incorporated private limited suppliers and partnership firms.',
    content: [
      'Over the last quarter, BITAINTEL analysts observed an increase in procurement disputes linked to unauthorized sales intermediaries posing as corporate representatives of legitimate industrial plants.',
      'As part of our Module B verification standards, every verified vendor profile requires an active Director Identification Number (DIN) or Managing Partner linkage alongside corporate domain email and mobile verification.',
      'Before releasing advance purchase deposits, corporate buyers should verify that the bank beneficiary title on commercial invoices matches the Legal Entity Name shown on the company’s verified BITAINTEL Dossier.',
    ],
    mediaType: 'text',
    category: 'Regulatory Alert',
    publishedAt: '2026-11-02T11:15:00Z',
    readTime: '3 min read',
    author: {
      name: 'BITAINTEL Governance Board',
      role: 'Risk & Compliance Admin',
      badge: 'Official Admin',
    },
    tags: ['DIN Validation', 'Fraud Prevention', 'Module B'],
    highlightMetric: {
      label: 'KEY MANDATE',
      value: '100% Signatory Match',
      context: 'Required across all Tier-2 to Tier-4 approved corporate profiles',
    },
    relatedLink: {
      label: 'View Tier Criteria',
      href: '/demo/how-it-works#tiers',
    },
  },
  {
    id: 'FEED-005',
    slug: 'verified-premium-subscriber-double-tick-rollout',
    title: 'Platform Update: Verified Premium Subscriber Double-Tick Identity Now Active',
    summary:
      'Subscribed enterprise vendors now display the blue double-tick verification mark across directory listings, search drawers, and business dossier headers.',
    content: [
      'To distinguish long-term subscribed enterprise participants from standard basic listings, BITAINTEL has introduced the Verified Premium Subscriber designation across all discovery surfaces.',
      'Crucially, subscription status never inflates a company’s statutory Trust Score or Verification Audit Tier. Trust Scores (0–100) and Tier 1–4 accreditations remain strictly earned through audited legal, tax, documentary, and operational compliance.',
      'Premium subscribers unlock Competitor Intelligence Radar benchmarking while giving procurement officers rapid clarity when shortlisting responsive enterprise partners.',
    ],
    mediaType: 'text',
    category: 'Platform Update',
    publishedAt: '2026-10-28T09:20:00Z',
    readTime: '2 min read',
    author: {
      name: 'BITAINTEL Product Desk',
      role: 'Platform Administration',
      badge: 'Official Admin',
    },
    tags: ['Premium Subscriber', 'Trust Independence', 'Directory UX'],
    highlightMetric: {
      label: 'SCORING INTEGRITY RULE',
      value: '0% Paid Bias',
      context: 'Subscription unlocks radar tools; scores stay 100% audit-driven',
    },
    relatedLink: {
      label: 'Filter Premium Entities',
      href: '/demo/directory',
    },
  },
  {
    id: 'FEED-006',
    slug: 'q4-industrial-vendor-risk-benchmark-report',
    title: 'Q4 2026 Industrial Vendor Risk Index: Aerospace & Pharma Lead Compliance Benchmarks',
    summary:
      'Analysis of audited vendor cohorts shows Tier-4 certified manufacturing and diagnostic labs achieved 42% faster enterprise onboarding times.',
    content: [
      'Our quarterly cross-sector intelligence synthesis evaluates verification medians across Metallurgy, Aerospace Forging, Clinical Diagnostics, and Cloud SecOps vendors.',
      'Suppliers maintaining pre-audited document vaults—incorporating non-expired ISO 9001/13485/27001 certifications, CA-attested turnover bands, and current TDS/COA technical sheets—reached enterprise RFP shortlists 3.1x faster than unverified bidders.',
      'Procurement teams can inspect side-by-side compliance variances across up to four shortlisted vendors using the Comparison Matrix tool.',
    ],
    mediaType: 'image',
    category: 'Market Intelligence',
    publishedAt: '2026-10-22T12:00:00Z',
    readTime: '5 min read',
    author: {
      name: 'BITAINTEL Research Team',
      role: 'Market Intelligence Admin',
      badge: 'Official Admin',
    },
    tags: ['Q4 Report', 'Benchmarks', 'Enterprise Procurement'],
    imageUrl: '/feed/supply-chain-risk-report.svg',
    imageAlt: 'Q4 2026 Industrial Vendor Risk Index chart showing Aerospace, Pharma, and SecOps medians',
    imageCaption: 'Benchmark findings from Q4 2026 audited supplier cohorts.',
    relatedLink: {
      label: 'Open Comparison Tool',
      href: '/demo/compare',
    },
  },
  {
    id: 'FEED-007',
    slug: 'video-spotting-shell-suppliers-gstin-gaps',
    title: 'Video Advisory: 3 Red Flags to Catch Shell Entities Before Issuing Purchase Orders',
    summary:
      'Our risk analysts highlight the top documentary and premises anomalies flagged during Level-2 and Level-3 vendor due diligence reviews.',
    content: [
      'Shell corporations and pass-through trading desks frequently replicate legitimate manufacturing catalogs without possessing physical warehousing or active statutory tax trails.',
      'In this video briefing, BITAINTEL auditors demonstrate how geotagged electricity deeds, DIN director network checks, and cryptographic SHA-256 document seals neutralize counterparty impersonation.',
    ],
    mediaType: 'video',
    category: 'Audit Advisory',
    publishedAt: '2026-10-16T15:10:00Z',
    readTime: '04:20 video',
    author: {
      name: 'Rajeev Menon',
      role: 'Senior Risk Analyst · Admin',
      badge: 'Verified Admin',
    },
    tags: ['Risk Advisory', 'Shell Detection', 'Due Diligence'],
    posterUrl: '/feed/video-poster-fraud-alerts.svg',
    videoDuration: '04:20',
    videoChapters: [
      {
        time: '00:00',
        label: 'Director DIN Cross-Linkage',
        detail: 'Detecting dissolved sister entities and disqualified signatory histories.',
      },
      {
        time: '01:40',
        label: 'Geotagged Premises Proof',
        detail: 'Why registered office PO boxes differ from audited industrial MIDC/SEZ plants.',
      },
      {
        time: '03:05',
        label: 'Tamper-Evident Document Vault',
        detail: 'Verifying SHA-256 checksums and expiry dates on statutory certificates.',
      },
    ],
  },
  {
    id: 'FEED-008',
    slug: 'aerospace-pharma-tier4-accreditation-benchmarks',
    title: 'Sector Spotlight: AS9100D, WHO-GMP & ISO 27001 Standards Across Tier-4 Suppliers',
    summary:
      'A closer look at how internationally recognized quality and security accreditations elevate vendor dossiers into Platinum & Gold performance tiers.',
    content: [
      'Global OEMs sourcing precision components or clinical reagents rarely evaluate price in isolation—documented quality management systems are non-negotiable prerequisites.',
      'Companies holding active AS9100D, IATF 16949, WHO-GMP, ISO 13485, or ISO 27001:2022 certificates undergo direct certificate number and issuing-body validation during BITAINTEL’s Document Audit.',
      'Once authenticated, expiry dates are actively tracked so procurement teams never rely on lapsed quality credentials.',
    ],
    mediaType: 'image',
    category: 'Spotlight',
    publishedAt: '2026-10-09T10:30:00Z',
    readTime: '4 min read',
    author: {
      name: 'BITAINTEL Audit Desk',
      role: 'Standards & Quality Admin',
      badge: 'Official Admin',
    },
    tags: ['ISO Standards', 'AS9100D', 'WHO-GMP', 'Tier 4'],
    imageUrl: '/feed/iso-audit-standards.svg',
    imageAlt: 'Showcase of Tier-4 accredited AS9100D, ISO 27001, WHO-GMP, and ISO 13485 benchmarks',
    imageCaption: 'Verified international accreditations featured across Platinum & Gold enterprise dossiers.',
    relatedLink: {
      label: 'Inspect Verified Leaders',
      href: '/demo/directory',
    },
  },
  {
    id: 'FEED-009',
    slug: 'udyam-msme-classification-sync-announcement',
    title: 'Statutory Notice: Automated MSME / Udyam Registration Matching for Priority Sourcing',
    summary:
      'Enterprise buyers with MSME procurement mandates can now verify Udyam registration numbers directly on vendor statutory records.',
    content: [
      'Large public and private sector undertakings frequently track Tier-1 and Tier-2 spend allocated to verified Micro, Small, and Medium Enterprises under statutory reporting guidelines.',
      'BITAINTEL’s onboarding workflow validates Udyam certificate formats alongside PAN and GSTIN linkage during Step 2 intake, reducing reconciliation errors for finance and accounts payable teams.',
    ],
    mediaType: 'text',
    category: 'Regulatory Alert',
    publishedAt: '2026-10-01T08:00:00Z',
    readTime: '3 min read',
    author: {
      name: 'BITAINTEL Regulatory Desk',
      role: 'Compliance Administration',
      badge: 'Official Admin',
    },
    tags: ['MSME', 'Udyam', 'Procurement Policy'],
    highlightMetric: {
      label: 'PAYMENT GOVERNANCE',
      value: '45-Day MSME Tracking',
      context: 'Cleaner Udyam verification simplifies statutory AP compliance',
    },
  },
  {
    id: 'FEED-010',
    slug: 'zero-trust-security-architecture-vault-encryption',
    title: 'Security Briefing: How Role-Gated Access & Mutual Consent Protect Vendor Financials',
    summary:
      'Detailed breakdown of how sensitive balance sheets, bank solvency letters, and client lists remain masked until proper verification and authorization.',
    content: [
      'Transparency should never force an industrial manufacturer to expose confidential financial statements or proprietary customer contracts to anonymous web visitors.',
      'BITAINTEL isolates sensitive Module E financial records and statutory vault uploads behind strict role-based controls. Public pages display audited summary signals, while full dossier inspection unlocks progressively as buyers verify their own corporate identity.',
    ],
    mediaType: 'text',
    category: 'Platform Update',
    publishedAt: '2026-09-24T13:45:00Z',
    readTime: '3 min read',
    author: {
      name: 'BITAINTEL Security Desk',
      role: 'Trust & Privacy Admin',
      badge: 'Official Admin',
    },
    tags: ['Data Privacy', 'Document Vault', 'RBAC'],
    highlightMetric: {
      label: 'PRIVACY GUARANTEE',
      value: 'AES-256 + SHA-256',
      context: 'Encrypted presigned vault storage with consent-logged document access',
    },
    relatedLink: {
      label: 'Read Privacy Framework',
      href: '/demo/privacy',
    },
  },
  {
    id: 'FEED-011',
    slug: '90-day-certificate-expiry-alert-cadence',
    title: 'Audit Policy Update: Automated 90-Day Renewal Reminders for ISO & Pollution Clearances',
    summary:
      'Vendors are now notified 90 days ahead of certificate expiration so Trust Scores remain uninterrupted during audit renewals.',
    content: [
      'An expired ISO certificate or factory consent order automatically impacts Document Audit scores until a renewed filing is reviewed.',
      'To give compliance managers ample runway for third-party surveillance audits, the Vendor Dashboard Status Banner now surfaces clear countdown alerts 90 days prior to any expiry milestone.',
    ],
    mediaType: 'text',
    category: 'Audit Advisory',
    publishedAt: '2026-09-14T09:10:00Z',
    readTime: '2 min read',
    author: {
      name: 'BITAINTEL Audit Desk',
      role: 'Compliance Administration',
      badge: 'Official Admin',
    },
    tags: ['Certificate Renewal', 'Score Continuity', 'Vendor Alerts'],
    highlightMetric: {
      label: 'RENEWAL WINDOW',
      value: '90-Day Early Warning',
      context: 'Prevents sudden Trust Score downgrades on expiring quality docs',
    },
  },
  {
    id: 'FEED-012',
    slug: 'meridian-zenith-cross-sector-excellence-spotlight',
    title: 'Directory Milestone: Over 14,200 Audited Entities Now Benchmarked Across 6 Core Sectors',
    summary:
      'Manufacturing, Healthcare & Pharma, Clean Energy, and Enterprise IT lead verification completions as procurement teams standardize pre-qualification.',
    content: [
      'From Pune heavy steel fabrication clusters to Hyderabad’s aerospace SEZ and Bengaluru SecOps providers, standardized verification records are replacing fragmented email spreadsheets.',
      'Procurement officers can filter businesses simultaneously by industry, state, minimum Trust Score, Verification Tier (Tier 1–4), and Verified Premium Subscriber status.',
    ],
    mediaType: 'text',
    category: 'Market Intelligence',
    publishedAt: '2026-09-02T16:00:00Z',
    readTime: '3 min read',
    author: {
      name: 'BITAINTEL Editorial Desk',
      role: 'Network Administration',
      badge: 'Official Admin',
    },
    tags: ['Network Milestone', 'Directory Search', 'Cross-Sector'],
    highlightMetric: {
      label: 'AUDITED COVERAGE',
      value: '14,200+ Entities',
      context: 'Spanning Manufacturing, Pharma, Clean Energy, Logistics & IT',
    },
    relatedLink: {
      label: 'Search Directory',
      href: '/demo/directory',
    },
  },
  {
    id: 'FEED-013',
    slug: 'dispute-and-fake-company-reporting-protocol',
    title: 'Trust Protocol: Standardized Investigation Workflow for Impersonation & Data Disputes',
    summary:
      'How reported anomalies in corporate filings, impersonated trade names, or outdated factory addresses trigger rapid compliance desk review.',
    content: [
      'Platform integrity relies on fast response whenever a market participant spots an inconsistency in corporate filings or suspects unauthorized use of a registered brand name.',
      'Submitted complaints generate an immediate compliance ticket linked to the entity’s audit log, suspending disputed badges if verification officers confirm a material discrepancy.',
    ],
    mediaType: 'text',
    category: 'Audit Advisory',
    publishedAt: '2026-08-21T10:15:00Z',
    readTime: '3 min read',
    author: {
      name: 'BITAINTEL Governance Board',
      role: 'Compliance Administration',
      badge: 'Official Admin',
    },
    tags: ['Anti-Fraud', 'Dispute Resolution', 'Audit Trail'],
    relatedLink: {
      label: 'Contact Compliance Desk',
      href: '/demo/contact',
    },
  },
  {
    id: 'FEED-014',
    slug: 'bitaintel-verified-methodology-whitepaper-release',
    title: 'Foundational Briefing: Why BITAINTEL Measures Evidence Instead of Paid Reviews',
    summary:
      'A transparent look at the mathematical principles separating BITAINTEL’s statutory Trust Score from subjective star-rating marketplaces.',
    content: [
      'Traditional B2B directories often rank suppliers using paid advertising budgets or unverified user star ratings, leaving procurement managers exposed to financial and compliance blind spots.',
      'BITAINTEL’s scoring engine aggregates objective statutory proof—incorporation longevity, continuous tax compliance, audited facilities, third-party certifications, and verified banking solvency—into a transparent 0–100 score.',
    ],
    mediaType: 'text',
    category: 'Spotlight',
    publishedAt: '2026-08-05T08:30:00Z',
    readTime: '4 min read',
    author: {
      name: 'BITAINTEL Editorial Desk',
      role: 'Platform Administration',
      badge: 'Official Admin',
    },
    tags: ['Methodology', 'Zero Paid Bias', 'Trust Score'],
    highlightMetric: {
      label: 'CORE PRINCIPLE',
      value: 'Verify Before You Trust',
      context: 'Evidence-backed ratings grounded in statutory and audited records',
    },
    relatedLink: {
      label: 'Explore How It Works',
      href: '/demo/how-it-works',
    },
  },
];

