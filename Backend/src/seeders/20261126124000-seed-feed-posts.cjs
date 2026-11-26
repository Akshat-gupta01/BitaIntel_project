'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const posts = [
      {
        slug: 'tds-coa-optional-catalog-bulk-excel-launch',
        title: 'Product Catalogs Now Support CSV/Excel Bulk Sync & Flexible TDS/COA Attachments',
        summary:
          'Verified vendors can now upload and update commercial product lines in bulk via .xlsx and .csv templates, with pricing, Technical Data Sheets (TDS), and Certificates of Analysis (COA) optional per SKU.',
        content: JSON.stringify([
          'Enterprise suppliers operating multi-hundred SKU catalogs often need to onboard standard items immediately and attach batch-specific Certificates of Analysis (COA) or Technical Data Sheets (TDS) when laboratory runs conclude.',
          'With today’s platform release, Vendor Dashboard catalogs and Dossier product listings support full spreadsheet round-tripping. Vendors can export existing product IDs, modify indicative pricing, MOQs, or lead times offline in Excel or CSV, and re-upload to apply updates cleanly.',
          'To preserve procurement data hygiene, indicative pricing and technical documents remain role-gated on public business dossiers: unverified visitors see catalog capabilities, while approved corporate buyers unlock verified specification sheets and direct RFQ workflows.',
        ]),
        mediaType: 'image',
        category: 'Platform Update',
        publishedAt: new Date('2026-11-11T10:00:00Z'),
        readTime: '3 min read',
        pinned: true,
        authorName: 'BITAINTEL Product Desk',
        authorRole: 'Platform Administration',
        authorBadge: 'Official Admin',
        tags: JSON.stringify(['Product Catalog', 'Bulk Upload', 'TDS & COA', 'Vendor Portal']),
        highlightMetric: null,
        imageUrl: '/feed/tds-coa-catalog-launch.svg',
        imageAlt: 'Overview of TDS, COA, and Excel/CSV Bulk Sync workflow on BITAINTEL',
        imageCaption:
          'Figure 1: Three-stage product catalog sync with optional technical sheets and role-gated dossier display.',
        videoUrl: null,
        posterUrl: null,
        videoDuration: null,
        videoChapters: null,
        relatedLink: JSON.stringify({
          label: 'Explore Vendor Dashboard',
          href: '/demo/dashboard/vendor',
        }),
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        slug: 'video-walkthrough-six-step-verification-audit',
        title: 'Video Briefing: Inside BITAINTEL’s Statutory & Document Vault Audit',
        summary:
          'Watch a concise briefing from our Lead Compliance Officer covering how MCA corporate identity, 24-month GSTN filings, and SHA-256 vaulted documents combine into a Tier 1–4 Trust Score.',
        content: JSON.stringify([
          'Understanding how corporate entities progress from initial registration to Tier-4 Comprehensive Audit helps both procurement heads and supplier compliance teams shorten vendor onboarding cycles.',
          'This administrative video walkthrough breaks down each verification checkpoint: dual-channel OTP signatory validation, live statutory registry matching, plant geolocation checks, and final compliance sign-off.',
        ]),
        mediaType: 'video',
        category: 'Audit Advisory',
        publishedAt: new Date('2026-11-08T14:30:00Z'),
        readTime: '03:45 video',
        pinned: false,
        authorName: 'Ananya Sharma',
        authorRole: 'Lead Verification Officer · Admin',
        authorBadge: 'Verified Admin',
        tags: JSON.stringify(['Verification Tiers', 'Modules A–F', 'Audit Briefing']),
        highlightMetric: null,
        imageUrl: null,
        imageAlt: null,
        imageCaption: null,
        videoUrl: null,
        posterUrl: '/feed/video-poster-onboarding.svg',
        videoDuration: '03:45',
        videoChapters: JSON.stringify([
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
        ]),
        relatedLink: JSON.stringify({
          label: 'Read Verification Methodology',
          href: '/demo/how-it-works',
        }),
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        slug: 'gstn-filing-telemetry-v2-4-deployment',
        title: 'Engine Notice: 24-Month GSTN Continuity Telemetry & MCA Sync Live Across Directory',
        summary:
          'BITAINTEL’s automated statutory cross-check adapter now monitors trailing 24-month GSTR-3B return regularity and flags suspended GSTINs before procurement contracts are executed.',
        content: JSON.stringify([
          'Statutory tax compliance is one of the highest-weighted pillars of the BITAINTEL Trust Score (20% dimension weight). Missing multiple consecutive GSTR-3B filings often precedes operational distress or supply disruption.',
          'Our upgraded telemetry cycle automatically compares declared trade names, registered states, and return cadence against registry updates, ensuring enterprise buyers always inspect current statutory health.',
          'Whenever an entity’s statutory record shifts or a required certificate approaches its 90-day renewal window, vendors receive automated portal alerts without silent delisting.',
        ]),
        mediaType: 'image',
        category: 'Regulatory Alert',
        publishedAt: new Date('2026-11-05T08:45:00Z'),
        readTime: '4 min read',
        pinned: false,
        authorName: 'BITAINTEL Regulatory Desk',
        authorRole: 'Compliance Administration',
        authorBadge: 'Official Admin',
        tags: JSON.stringify(['GSTN', 'MCA Compliance', 'Risk Monitoring']),
        highlightMetric: null,
        imageUrl: '/feed/gstn-compliance-2026.svg',
        imageAlt: '24-Month Automated GSTN and MCA Telemetry Sync dashboard preview',
        imageCaption: 'Real-time statutory telemetry metrics across audited Tier-3 and Tier-4 vendors.',
        videoUrl: null,
        posterUrl: null,
        videoDuration: null,
        videoChapters: null,
        relatedLink: JSON.stringify({
          label: 'Browse Audited Directory',
          href: '/demo/directory',
        }),
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        slug: 'mandatory-din-director-cross-check-update',
        title: 'Compliance Advisory: Director DIN Verification & Authorized Signatory Traceability',
        summary:
          'Updated due-diligence guidance for enterprise buyers evaluating newly incorporated private limited suppliers and partnership firms.',
        content: JSON.stringify([
          'Over the last quarter, BITAINTEL analysts observed an increase in procurement disputes linked to unauthorized sales intermediaries posing as corporate representatives of legitimate industrial plants.',
          'As part of our Module B verification standards, every verified vendor profile requires an active Director Identification Number (DIN) or Managing Partner linkage alongside corporate domain email and mobile verification.',
          'Before releasing advance purchase deposits, corporate buyers should verify that the bank beneficiary title on commercial invoices matches the Legal Entity Name shown on the company’s verified BITAINTEL Dossier.',
        ]),
        mediaType: 'text',
        category: 'Regulatory Alert',
        publishedAt: new Date('2026-11-02T11:15:00Z'),
        readTime: '3 min read',
        pinned: false,
        authorName: 'BITAINTEL Governance Board',
        authorRole: 'Risk & Compliance Admin',
        authorBadge: 'Official Admin',
        tags: JSON.stringify(['DIN Validation', 'Fraud Prevention', 'Module B']),
        highlightMetric: JSON.stringify({
          label: 'KEY MANDATE',
          value: '100% Signatory Match',
          context: 'Required across all Tier-2 to Tier-4 approved corporate profiles',
        }),
        imageUrl: null,
        imageAlt: null,
        imageCaption: null,
        videoUrl: null,
        posterUrl: null,
        videoDuration: null,
        videoChapters: null,
        relatedLink: JSON.stringify({
          label: 'View Tier Criteria',
          href: '/demo/how-it-works',
        }),
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const slugs = posts.map((p) => p.slug);
    const [existing] = await queryInterface.sequelize.query(
      'SELECT slug FROM feed_posts WHERE slug IN (:slugs);',
      { replacements: { slugs } }
    );
    const existingSet = new Set((existing || []).map((r) => String(r.slug)));
    const toInsert = posts.filter((p) => !existingSet.has(p.slug));
    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('feed_posts', toInsert);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'feed_posts',
      {
        slug: [
          'tds-coa-optional-catalog-bulk-excel-launch',
          'video-walkthrough-six-step-verification-audit',
          'gstn-filing-telemetry-v2-4-deployment',
          'mandatory-din-director-cross-check-update',
        ],
      },
      {}
    );
  },
};
