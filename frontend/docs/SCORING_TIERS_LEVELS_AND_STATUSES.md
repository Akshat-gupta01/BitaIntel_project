# BITAINTEL: Trust Score, Tier, Verification Level, and Badge/Status Calculation Guide

> **Scope & Status Note:** This document explains both **(1) how these values currently work in this Next.js frontend demo codebase** and **(2) how they are specified to be calculated in the production backend architecture** (`docs/API_AND_DATABASE_REQUIREMENTS.md` and `docs/srs.pdf`).

---

## 1. Executive Summary: Static Demo Data vs. Dynamic Calculation

Today, this repository is a **frontend demonstration** without a connected backend, database, or live government API integration.

| Metric / Status | Current Behavior in Frontend Demo (`src/`) | Target Production Behavior (`docs/`) |
|---|---|---|
| **Composite Trust Score (`score`: 0–100)** | **Hardcoded** per sample business in `src/data.ts` and hardcoded to `89` in `src/app/demo/dashboard/vendor/page.tsx`. | **Calculated dynamically** by the Scoring Engine service using the weighted formula across verified statutory, operational, documentary, and compliance parameters, then stored in `business_entities.score` and `trust_score_snapshots`. |
| **Score Tier & Grade (`Platinum Tier`, `Gold Tier`, `Silver Tier`, `A+`–`F`)** | **Dynamically derived in UI** from numeric `score` inside `getScoreColor(score)` (`src/components/business/ScoreRing.tsx`). *(Note: two summary widgets use a simplified `score >= 90 ? 'Platinum Tier' : 'High Confidence'` check.)* | Computed alongside the composite score in the backend and returned consistently across API responses, UI rings, dossiers, and tables. |
| **Verification Audit Level (`level`: `1–4` / `Tier 1–4`)** | **Hardcoded** (`1 \| 2 \| 3 \| 4`) per company in `src/data.ts`. | **Assigned by the Verification Workflow** based on which audit stages have passed (Identity Basic → Statutory Cross-Check → Document Verified → Comprehensive Audit) and compliance-team sign-off. |
| **Accreditation Badge (`badge`: `Platinum`, `Gold`, `Silver`, `Verified`)** | **Hardcoded** per company in `src/data.ts`; vendor dashboard shows a static string (`BITAINTEL Verified — October 2026`). | Automatically derived from score + verification level + active audit validity (or tier issuance rules) with audit date attached. |
| **Premium Subscriber (`isPremiumSubscriber` / `subscriptionPlan`)** | **Manually flagged** (`true` + `'Premium'`) on 4 sample businesses in `src/data.ts` (`meridian-steel-works`, `nexora-cloud-systems`, `aurora-clean-energy`, `zenith-aerospace-alloys`). | Driven by active paid billing/subscription status, independent of statutory verification score. |
| **User Access Tier (`UserRole`)** | **Simulated via React Context + `localStorage`** (`src/context/AuthContext.tsx`) with 5 presets in `PersonaSwitcher`. | Enforced server-side via RBAC permissions, KYC verification state, and subscription entitlements. |

---

## 2. Clearing Up Terminology ("Tier" Means Multiple Things)

Across the UI and planning documents, words like **Tier**, **Level**, **Grade**, and **Status** refer to **five separate concepts**:

1. **Score Tier (Performance Band)** — e.g. `Platinum Tier`, `Gold Tier`, `Silver Tier`, `Audited`, `Under Review` (or SRS names `Excellent`, `Strong`, `Good`, `Moderate`, `Limited/Review`). Derived from `score` (0–100).
2. **Letter Grade** — `A+`, `A`, `B+`, `B`, `C+`, `C`, `D`, `F`. Derived from `score` inside `<ScoreRing />`.
3. **Verification Audit Level (`level`: `1`–`4`)** — Displayed in the directory and dossiers as `Tier 1` through `Tier 4` (e.g., `Tier 4 Audited`). Measures **depth of audit**, not just numeric score.
4. **Accreditation Badge (`badge`)** — `'Platinum' | 'Gold' | 'Silver' | 'Verified'` on a `Business` record. Displayed on dossiers as `{badge} Accreditation` and in the Compare table as `{badge} Tier`.
5. **Account Access Tier / Subscription / Lifecycle Status**:
   - **5-Tier RBAC Viewer Role** (`visitor`, `unverified`, `pending_approval`, `approved_business`, `premium_subscriber`) — controls what data the *logged-in viewer* can inspect.
   - **Subscription Plan** (`Standard` vs. `Premium` / `isPremiumSubscriber`) — unlocks verified blue double-tick badge (`CheckCheck`) and Competitor Intelligence Radar panels.
   - **Dossier Review Lifecycle** (`Draft`, `Verification Pending`, `Under Review`, `Verified`, `Renewal Required`, etc.) — workflow state of a vendor application.

---

## 3. How the Composite Trust Score (`0–100`) Is Calculated

### 3.1 Core Mathematical Formula
Defined in `docs/API_AND_DATABASE_REQUIREMENTS.md` (§3):

$$S = \sum_{i=1}^{N} (w_i \times s_i)$$

Where $w_i$ is the percentage weight of dimension $i$ (weights sum to 100%) and $s_i$ is the normalized achievement score (0–100) for that dimension.

### 3.2 Important: Two Weighting Models Exist in the Project

The codebase and planning docs currently contain **two slightly different weighting breakdowns**:

#### Model A — 6-Dimension Statutory Model (Public Website, API Spec & `verificationCheckpoints`)
Used in:
- `docs/API_AND_DATABASE_REQUIREMENTS.md` (§3, lines 335–342)
- `src/data.ts` (`verificationCheckpoints`, lines 422–459)
- `src/components/sections/HomeSections.tsx` (`ScoreExplainer`, lines 584–683)
- `src/app/demo/how-it-works/page.tsx` (lines 115–144)

| # | Dimension | Weight | Evaluation Inputs | Status Tag |
|---|---|---|---|---|
| 1 | **Corporate Legal Identity** | **20%** | MCA active status, CIN consistency, Director DIN validation, registered office proof | Automated |
| 2 | **Tax & Statutory Compliance** | **20%** | Live GSTIN filing continuity (GSTR-3B / GSTR-1 over 24 mo), PAN linkage, MSME/Udyam matching | Automated |
| 3 | **Operational Footprint & Premises / Tenure** | **15%** | Years operational (`age`), factory/office geolocation & lease/title deed, utility bill, EPFO headcount | Audited |
| 4 | **Quality & Industry Certifications** | **15%** | Active, non-expired ISO (9001/27001/14001), IATF 16949, WHO-GMP, CE, lab accreditations | Documented |
| 5 | **Financial Solvency Signals** | **15%** | Audited balance sheets (with UDIN), turnover band consistency, working capital & bank solvency signals | Structured |
| 6 | **Governance & Security / Privacy Safeguards** | **15%** | Statutory auditor remarks, litigation/non-debarment checks, anti-fraud watchlist, NDA/privacy controls | Configurable |
| — | **Total** | **100%** | — | — |

#### Model B — 7-Parameter SRS Model (SRS §5.7 & Vendor Dashboard)
Used in:
- `docs/srs.pdf` (§5.7, page 7)
- `src/app/demo/dashboard/vendor/page.tsx` (lines 408–413, 894–898, 1081–1107)

Notice that the **Vendor Dashboard** splits Model A's 6th dimension (`15%`) into **Statutory Compliance (`10%`)** + **Profile Completeness (`5%`)**, resulting in 7 parameters whose demo numbers sum to **89.0 / 100**:

| # | SRS §5.7 Factor | Weight | Vendor Dashboard Demo Score | Mapping in `SRS_MODULES` (Vendor Dashboard) |
|---|---|---|---|---|
| 1 | Corporate Identity | **20%** | `20.0` | Module A — Company Information (`20.0 / 20%`) |
| 2 | Government Verification | **20%** | `18.5` | Module B — Management & Govt KYC (`18.5 / 20%`) |
| 3 | Business Operations | **15%** | `12.0` | Module C — Operations & Capabilities (`12.0 / 15%`) |
| 4 | Documents & Certs | **15%** | `13.5` | Module D — Customer, Supply & Quality Certs (`13.5 / 15%`) |
| 5 | Financial Standing | **15%** | `11.0` | Module E — Financial Information & Banking (`11.0 / 15%`) |
| 6 | Statutory Compliance | **10%** | `9.0` | Module F — Compliance (`14.0 / 15%` combined with completeness) |
| 7 | Profile Completeness | **5%** | `5.0` | All modules populated & verified |
| — | **Total** | **100%** | **`89.0`** | **`trustScore = 89` (`Strong (75–89)`)** |

*(Note: `SRS_MODULES` in `src/app/demo/dashboard/vendor/page.tsx` lines 66–139 sums `20.0 + 18.5 + 12.0 + 13.5 + 11.0 + 14.0 = 89.0`, grouping the `9.0 + 5.0` under Module F as `14.0 / 15%`.)*

### 3.3 Sub-Checkpoint Subset on Business Records (55-Point Legacy Breakdown)
Each `Business` object in `src/data.ts` (and the `verification_checkpoints` table in `docs/API_AND_DATABASE_REQUIREMENTS.md` line 251) also stores five raw checkpoint scores totaling **55 points**:

| Field (`Business`) | Max Score | Description |
|---|---|---|
| `identity` | `10` | Corporate Legal Identity (e.g., `'10/10'`, `'9/10'`) |
| `documents` | `20` | Statutory Document Dossier (e.g., `'20/20'` down to `'14/20'`) |
| `contact` | `5` | Representative Identity & Contact (`'5/5'`) |
| `address` | `5` | Physical Plant / Office Geolocation (`'5/5'` or `'4/5'`) |
| `profile` | `15` | Public Profile Completeness (`15` down to `12`) |

In the currently hidden (commented-out) Statutory Verification Matrix in `src/components/business/BusinessProfileClient.tsx` (lines 114–120, 365–436), those 5 items are displayed with fixed bar widths (`pct: 100, 95/50, 100/50, 90, 100`) and gated behind visitor login — they are **not** algebraically summed to produce `b.score`.

---

## 4. How Score Tiers, Letter Grades, and Platinum / Gold / Silver Statuses Work

### 4.1 Dynamic Calculation in UI: `getScoreColor(score)`
The **only** live score-to-tier calculation currently running in code is `getScoreColor(score)` in `src/components/business/ScoreRing.tsx` (lines 11–55), which matches `docs/API_AND_DATABASE_REQUIREMENTS.md` (§3, lines 344–350) and `HomeSections.tsx` (lines 615–636):

| Score Range | Calculated `tier` | Calculated `grade` | Risk Description (`HomeSections.tsx`) | Visual Ring Color |
|---|---|---|---|---|
| **95 – 100** | **`Platinum Tier`** | **`A+`** | Negligible Risk | Primary Dark Blue (`--primary-600`) |
| **90 – 94** | **`Platinum Tier`** | **`A`** | Negligible Risk | Primary Dark Blue (`--primary-600`) |
| **85 – 89** | **`Gold Tier`** | **`B+`** | Low Risk | Primary Blue (`--primary-500`) |
| **80 – 84** | **`Gold Tier`** | **`B`** | Low Risk | Primary Blue (`--primary-500`) |
| **75 – 79** | **`Silver Tier`** | **`C+`** | Standard Risk | Amber 600 (`#D97706`) |
| **70 – 74** | **`Silver Tier`** | **`C`** | Standard Risk | Amber 600 (`#D97706`) |
| **50 – 69** | **`Audited`** | **`D`** | Moderate Risk | Orange 600 (`#EA580C`) |
| **0 – 49** | **`Under Review`** | **`F`** | Action Required | Rose 600 (`#E11D48`) |

### 4.2 Competing Threshold Scale in SRS §5.7 & Vendor Dashboard
Inside `src/app/demo/dashboard/vendor/page.tsx` (lines 410–411, 744, 936, 1076) and `docs/srs.pdf` (§5.7, page 7), score bands use **SRS category names and thresholds** instead of Platinum/Gold/Silver:

| Score Range (SRS §5.7) | Category Name | Vendor Dashboard Behavior |
|---|---|---|
| **90 – 100** | **Excellent** | Promotes listing to top of buyer search results |
| **75 – 89** | **Strong** | Hardcoded current demo tier for `trustScore = 89`: `'Strong (75–89)'` |
| **60 – 74** | **Good** | — |
| **40 – 59** | **Moderate** | — |
| **0 – 39** | **Limited / Review** | — |

*(Notice the boundary conflict for scores like `75–79` and `89`: a score of `89` is `Strong` in the Vendor Dashboard, `Gold Tier (B+)` in `<ScoreRing />`, while `75–79` is `Strong` in SRS §5.7 vs. `Silver Tier (C+)` in `<ScoreRing />`.)*

### 4.3 Summary Label Fallback in Profile Headers
In `BusinessProfileClient.tsx` (line 261) and `BuyerHomeSections.tsx` (line 647), the text label directly beside `<ScoreRing />` does **not** call `getScoreColor(b.score).tier`; instead it uses:

```tsx
{b.score >= 90 ? 'Platinum Tier' : 'High Confidence'}
```

Consequently, businesses scoring `70–89` display `'High Confidence'` there rather than `'Gold Tier'` or `'Silver Tier'`.

### 4.4 `badge` (`Platinum` / `Gold` / `Silver` / `Verified`) vs. `ScoreRing` Tier across All 12 Demo Businesses
In `src/data.ts`, each business has a manually assigned `badge: 'Platinum' | 'Gold' | 'Silver' | 'Verified'` that **does not strictly follow `getScoreColor(score)` thresholds**. Looking closely at the 12 sample records:

| Business (`src/data.ts`) | `score` | `level` | Manual `badge` | Sub-Checkpoints (`ID / Doc / Addr / Prof`) | `ScoreRing` Output (`getScoreColor`) | Premium (`isPremiumSubscriber`) | Alignment Note |
|---|---|---|---|---|---|---|---|
| **Zenith Aerospace Alloys** | `98` | `4` | `Platinum` | `10 / 20 / 5 / 15` | `Platinum Tier` (`A+`) | Yes | Matches |
| **Meridian Steel Works** | `96` | `4` | `Platinum` | `10 / 20 / 5 / 15` | `Platinum Tier` (`A+`) | Yes | Matches |
| **Nexora Cloud Systems** | `94` | `4` | `Platinum` | `10 / 19 / 5 / 15` | `Platinum Tier` (`A`) | Yes | Matches |
| **GreenLeaf Bio Extracts** | `93` | `4` | **`Gold`** | `10 / 19 / 4 / 15` | **`Platinum Tier` (`A`)** | No | **Mismatch** (`93` renders Platinum in ring, Gold in badge) |
| **Synapse Biotech Systems** | `92` | `4` | **`Gold`** | `10 / 18 / 4 / 14` | **`Platinum Tier` (`A`)** | No | **Mismatch** |
| **Aurora Clean Energy** | `91` | `4` | **`Gold`** | `10 / 18 / 4 / 14` | **`Platinum Tier` (`A`)** | Yes | **Mismatch** |
| **ProPack Sustainable** | `88` | `3` | `Gold` | `10 / 17 / 4 / 15` | `Gold Tier` (`B+`) | No | Matches |
| **Woven Threads Textile** | `87` | `4` | `Gold` | `10 / 18 / 4 / 14` | `Gold Tier` (`B+`) | No | Matches (`level: 4` can still be `Gold`) |
| **Unimart Global Traders** | `85` | `3` | **`Silver`** | `10 / 16 / 4 / 14` | **`Gold Tier` (`B+`)** | No | **Mismatch** |
| **BluePeak Precision Parts** | `82` | `3` | **`Silver`** | `9 / 16 / 4 / 13` | **`Gold Tier` (`B`)** | No | **Mismatch** |
| **Everbright Supply Chain** | `79` | `2` | `Silver` | `9 / 15 / 4 / 13` | `Silver Tier` (`C+`) | No | Matches |
| **TerraForm Agri Inputs** | `76` | `2` | **`Verified`** | `9 / 14 / 4 / 12` | **`Silver Tier` (`C+`)** | No | **Mismatch** |

**Why this pattern appears in `src/data.ts`:**
- In the mock dataset, **`Platinum`** was assigned only when `score >= 94` (and `address === '5/5'`), **`Gold`** when `score` is `87–93`, **`Silver`** when `score` is `79–85`, and **`Verified`** at `76`.
- However, in `CompareTableClient.tsx` (line 42), the UI renders `{b.badge} Tier` directly beside `<ScoreRing />` (`A`, `B+`, `B`, `C+`), while `BusinessProfileClient.tsx` (line 233 vs. line 261) shows **`Gold Accreditation`** in a badge pill right next to **`Platinum Tier`** under the trust score for entities scoring `91–93` (such as GreenLeaf, Synapse, and Aurora).

---

## 5. How Verification Levels (`Level 1` – `Level 4`) Work

`level` (`1 | 2 | 3 | 4`) represents **how deeply BITAINTEL has audited the entity**, shown in filters and badges as `Tier 1`–`Tier 4` (`DirectoryExplorer.tsx` lines 257–263):

| Level | Directory Filter Label | Intended Qualification Criteria (Codebase & FAQ) | Demo Score & Badge Pattern (`src/data.ts`) |
|---|---|---|---|
| **Tier 1** | `Tier 1 (Identity Basic)` | Account signup + basic entity details, representative contact/OTP identity verified (`Step 1` / initial registration). *(No Tier 1 entities appear in the 12 public verified directory samples.)* | `0` companies in `src/data.ts` |
| **Tier 2** | `Tier 2 (Statutory Cross-Check)` | Automated statutory registry validation (GSTIN, PAN, MCA/CIN active check) plus physical operational footprint check. Per `src/data.ts` FAQ (line 475), *"Inactive or shell entities lacking verifiable operational footprint fail the Level 2 checkpoint."* | Score `76–79`; Badges `Verified`, `Silver` (`TerraForm`, `Everbright`) |
| **Tier 3** | `Tier 3 (Document Verified)` | Uploaded corporate, tax, banking, and regulatory/quality documents reviewed and validated by BITAINTEL compliance analysts. | Score `82–88`; Badges `Silver`, `Gold` (`BluePeak`, `Unimart`, `ProPack`) |
| **Tier 4** | `Tier 4 (Comprehensive Audit)` | Full statutory + documentary + physical plant/office geolocation audit + active international/industry quality certifications (e.g., ISO/IATF/AS9100D/WHO-GMP). | Score `87–98`; Badges `Gold`, `Platinum` (`Woven Threads` at 87 up to `Zenith` at 98) |

*(Important distinction: Filtering in `DirectoryExplorer.tsx` lines 97–98 uses `b.level >= Number(level)`, so filtering for Tier 3 returns Tier 3 and Tier 4 companies.)*

---

## 6. Subscription Badges, Lifecycle Statuses, and RBAC Access Tiers

### 6.1 Verified Premium Subscriber (`isPremiumSubscriber` / `subscriptionPlan`)
- Stored separately from `score`, `level`, and `badge` in `src/data.ts`.
- Currently enabled for 4 sample companies (`Meridian Steel Works`, `Nexora Cloud Systems`, `Aurora Clean Energy`, `Zenith Aerospace Alloys`).
- Renders:
  - The blue circular double-tick checkmark (`<CheckCheck />`) on the bottom-right corner of the company logo in `BusinessCard`, `DirectoryExplorer` (table & drawer), and `BusinessProfileClient`.
  - The `Verified Premium Subscriber` badge pill on the dossier and filterable toggle (`Show Premium Subscribers Only`) in Directory.
  - The Competitor Intelligence & Radar Benchmark panel on the dossier.
- Note: A company does **not** have to be `Platinum` to be Premium (e.g. `Aurora Clean Energy` has `badge: 'Gold'`, `score: 91`, `isPremiumSubscriber: true`), and a `Pending Approval` user or `Approved Business` can be simulated independently.

### 6.2 Vendor Verification & Onboarding Workflow Statuses
Verification is tracked dynamically by **lifecycle status**, though the vocabulary differs slightly across three areas:

- **9 UI Dashboard Statuses** (`VendorRegistrationStatus` in `src/types/vendorRegistration.ts` lines 1–10 & `VendorStatusBanner.tsx`):
  `Draft` → `Submitted` / `Verification Pending` → `Under Review` ↔ `Additional Information Required` → `Verified` (or `Rejected` / `Suspended` / `Renewal Required`).
- **10 SRS Statuses** (`docs/srs.pdf` §5.6):
  `Registered`, `Information Submitted`, `Verification in Progress`, `Action Required`, `Partially Verified`, `BITAINTEL Verified`, `Enhanced Verified`, `Verification Expired`, `Suspended`, `Rejected`.
- **4 Public Lifecycle States** (`src/app/demo/how-it-works/page.tsx` lines 24–45):
  `Active Verified`, `Pending Verification`, `Action Required`, `Suspended / Inactive`.

In addition, `src/app/demo/dashboard/vendor/page.tsx` (lines 756–762, 1067–1077) renders the **Vendor Verification Badge** tied to verification level/tier and audit date (`BITAINTEL Verified — October 2026`), and `VendorStatusBanner.tsx` (lines 39–46, 238–258) dynamically flags any certificate expiring within 90 days.

### 6.3 5-Tier RBAC Access Model (`UserRole`)
Defined in `src/context/AuthContext.tsx` and switchable via `PersonaSwitcher`:

| `UserRole` | Demo Score (`PERSONA_PROFILES`) | Progress | Plan Tier | Platform Visibility Effect |
|---|---|---|---|---|
| `visitor` | `null` | — | — | Public profile only; CIN/GSTIN masked; turnover/headcount, unit prices, and TDS/COA downloads gated |
| `unverified` | `42` (new signup `40`) | `25%` | `Standard` | Logged-in Step 1; registration wizard & dashboard accessible; restricted RFIs |
| `pending_approval` | `68` | `85%` | `Standard` | GST-verified (`Step 2`+); awaits compliance desk sign-off |
| `approved_business` | `89` | `100%` | `Standard` | Full permitted B2B company, product, price, TDS/COA, and RFI access |
| `premium_subscriber` | `96` | `100%` | `Premium` | Unlocks Competitor Intelligence & Radar analytics across dossiers |

---

## 7. Known Gaps & Recommendations for Production Implementation

When wiring this frontend to the Laravel/Node backend and database (`business_entities`, `verification_checkpoints`, `trust_score_snapshots`), address these five items:

1. **Unify the Scoring Formula (6-Dimension vs. 7-Factor)**:
   Decide whether Governance/Compliance (`15%`) stays one dimension (`API_AND_DATABASE_REQUIREMENTS.md` / `ScoreExplainer`) or splits into `Statutory Compliance (10%) + Profile Completeness (5%)` (`srs.pdf` §5.7 / Vendor Dashboard).
2. **Unify Score Tier Labels & Thresholds**:
   Align `ScoreRing.tsx` (`Platinum 90+`, `Gold 80–89`, `Silver 70–79`, `Audited 50–69`, `Under Review <50`) with SRS §5.7 (`Excellent 90+`, `Strong 75–89`, `Good 60–74`, `Moderate 40–59`, `Limited <40`), and replace the hardcoded `{b.score >= 90 ? 'Platinum Tier' : 'High Confidence'}` check in `BusinessProfileClient.tsx` and `BuyerHomeSections.tsx` with `getScoreColor(b.score).tier`.
3. **Define Exact Rules Linking `score`, `level`, and `badge`**:
   Establish an explicit server-side rule so `badge` never contradicts `<ScoreRing />`. Recommended rule:
   - **`Platinum`**: `level === 4` **AND** `score >= 90` **AND** no expired required documents/certifications
   - **`Gold`**: `level >= 3` **AND** `score >= 80`
   - **`Silver`**: `level >= 2` **AND** `score >= 70`
   - **`Verified`**: `verified === true` **AND** `level >= 1` (`score < 70` or pending higher tier checks)
4. **Compute Checkpoint Sub-Scores Dynamically**:
   Replace static `pct` arrays in `BusinessProfileClient.tsx` (`[100, 95, 100, 90, 100]`) and static Vendor Dashboard numbers (`trustScore = 89`, `profileCompletion = 92`) with calculations backed by `verification_checkpoints` and `document_vault` statuses (`VERIFIED` / `EXPIRED` / `PENDING`), triggering recalculation whenever documents expire or renewals are approved.
5. **Keep Paid Subscription Separate from Trust Scoring**:
   Preserve the architectural boundary where `isPremiumSubscriber` / `subscriptionPlan` (double-tick badge + analytics tools) **cannot** artificially inflate `score`, `level`, or `Platinum`/`Gold` accreditation.

