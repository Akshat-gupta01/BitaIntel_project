# BITAINTEL Website — Project Analysis

*How the project is built, how it works, and where it stands.*

---

## 1. What this project is

**BITAINTEL** is a B2B business verification and trust-intelligence platform with the tagline **"Verify Before You Trust."** It is not meant to be a plain business directory. Each company gets a structured trust profile with:

- statutory identifiers (GSTIN, CIN, PAN),
- a verification tier (Level 1–4),
- a 0–100 composite trust score,
- a badge (Verified / Silver / Gold / Platinum).

Buyers and procurement teams can search, filter and compare vendors. Vendors register, complete a multi-step profile and get verified.

**What is in the zip is a front-end demonstration, not the production platform.** The README says so directly. All data is sample data, forms validate in the browser only, and there is no database, no real login, and no live government API calls (GST, MCA and so on). The pages work as a clickable reference for what the real product will look like.

The company behind the planned build is **Softfix** (Lucknow). The SRS is dated September 2026, v1.0.

---

## 2. Technology stack

| Area | Choice |
|---|---|
| Framework | **Next.js 16** (App Router), **React 19** |
| Language | **TypeScript** (strict mode) |
| Styling | **Tailwind CSS v4** (via `@tailwindcss/postcss`) plus a custom CSS design-token layer |
| Icons | `lucide-react` |
| Toasts | `sonner` |
| Validation | `zod` (4.x) plus HTML5 form handling |
| Linting | ESLint 9 with `eslint-config-next` |
| State | React Context (`AuthContext`) plus `localStorage` for the demo session |
| Data | Static TypeScript files, no backend |

Scripts in `package.json`: `dev` (binds to `0.0.0.0` so it can be tested from a phone or LAN), `build`, `start`, `lint`, `typecheck`.

The codebase is about **21,000 lines** of TypeScript/TSX.

---

## 3. Folder structure

```
bitaintel-website/
├── docs/                       Planning documents (not code)
│   ├── srs.pdf                 Software Requirements Specification (12 pages)
│   ├── API_AND_DATABASE_REQUIREMENTS.md   Target DB schema + API design
│   └── *.png                   Design/screenshot references
├── public/                     Logos (svg/png/webp/jpg), favicons, app icons
├── scripts/make-full-res-logo.js   Helper to generate a full-resolution logo
├── src/
│   ├── app/                    Routes (Next.js App Router)
│   │   ├── page.tsx            "/" shows the Coming Soon page
│   │   ├── layout.tsx          Root layout
│   │   ├── robots.ts, sitemap.ts
│   │   ├── loading.tsx, error.tsx, not-found.tsx
│   │   └── demo/               The whole working demo site lives under /demo
│   ├── components/
│   │   ├── ui/                 Design-system primitives
│   │   ├── layout/             Header, Footer, Container
│   │   ├── sections/           Large page sections (home pages)
│   │   ├── business/           Directory, cards, profile, score ring
│   │   ├── compare/            Comparison table
│   │   ├── auth/               Login, forgot-password, RoleGuard
│   │   ├── dashboard/vendor/   Vendor dashboard tabs and onboarding
│   │   └── shared/             Registration wizard, contact form, persona switcher
│   ├── config/                 site.ts, theme.ts, theme.css, vendor master data
│   ├── context/AuthContext.tsx Demo auth and role system
│   ├── data.ts                 Sample businesses, steps, FAQs
│   ├── lib/                    SEO helpers (metadata, JSON-LD), utils
│   └── types/vendorRegistration.ts   Types for the vendor registration data
└── package.json, next.config.ts, tsconfig.json, eslint.config.mjs, ...
```

---

## 4. How the routing works

The project was deliberately restructured (see the git log: *"move the project to /demo with coming-soon page in the /"*):

- **`/`** shows a **Coming Soon** page (`ComingSoon` component, `noIndex`). This is the public face while the real product is being built.
- **`/demo/*`** holds the full interactive site:

| Route | Purpose |
|---|---|
| `/demo` | Main landing page (hero, trust strip, benefits, how it works, featured businesses, score explainer, FAQ preview) |
| `/demo/home` | Alternate home page (a buyer-focused variant) |
| `/demo/directory` | Searchable, filterable business directory |
| `/demo/business/[slug]` | Individual business "trust dossier" (statically generated) |
| `/demo/compare` | Side-by-side vendor comparison |
| `/demo/how-it-works` | The verification pipeline explained |
| `/demo/about`, `/faq`, `/contact`, `/privacy`, `/terms` | Content pages |
| `/demo/register` | Vendor registration (quick signup plus the multi-step wizard) |
| `/demo/login`, `/forgot-password` | Auth screens |
| `/demo/dashboard/vendor` | Vendor dashboard (the largest file, about 95 KB) |
| `/demo/coming-soon` | Coming-soon page |

`src/app/demo/layout.tsx` wraps all of these. It supplies the `<Header>`, `<Footer>`, `AuthProvider`, a "skip to main content" accessibility link, site-wide JSON-LD structured data and the toast container.

---

## 5. Key design decisions

### 5.1 Server Components first, small client islands
Pages are server components by default. `'use client'` is used only where interaction is needed: directory filters, modals, the registration wizard, dashboards, the auth context. The business dossier route uses `generateStaticParams()` so each business page is **pre-rendered at build time**, with a thin client component (`BusinessProfileClient`) layered on top for role-based content.

### 5.2 Centralised theming
Colour is controlled from one place:

- `src/config/theme.ts` defines typed palettes (including the custom **`bitaintel`** palette taken from the logo, with `#223671` as the primary blue) and a `themeConfig.primaryColor` switch.
- `getThemeCssString()` turns the chosen palette into CSS variables, injected into `<head>` as a `<style id="theme-tokens">` tag in the layout.
- `src/config/theme.css` and `globals.css` hold the semantic tokens, glass-style utilities, pastel colours and so on.

Changing one value re-themes the whole site. Git history shows this was done on purpose ("global theming", "color theme change to match the logo").

### 5.3 Reusable UI primitives
`components/ui/` contains a small design system: `Button` (many variants), `Card`, `Badge`, `Input`, `Select`/`CustomDropdown`, `Checkbox`, `Radio`, `Slider`, `Tabs`, `Accordion`, `Dialog`, `Sheet`, `DropdownMenu`, `Skeleton`, `Separator` and `Logo`. These are hand-written, not shadcn/Radix.

### 5.4 SEO and structured data
- `lib/metadata.ts` provides `createPageMetadata()`, which builds the title, description, canonical URL, OpenGraph and Twitter cards, and robots rules.
- `lib/schema.ts` and `JsonLd.tsx` generate **JSON-LD** (Organization, WebSite with SearchAction, WebPage with breadcrumbs, FAQ, per-business schema).
- `sitemap.ts` and `robots.ts` are generated by Next.

### 5.5 Mock data as the "backend"
`src/data.ts` holds **12 sample businesses** (typed as `Business`) plus the industries list, verification steps, checkpoints, trust metrics and FAQs. Editing this one file updates the directory, search, business profiles, comparison and sitemap. Vendor-registration data shapes are defined in `types/vendorRegistration.ts`, and master/initial dossier data lives in `config/vendorMasterData.ts` and `config/initialVendorDossier.ts`.

---

## 6. The role-based access model (the most important feature)

The latest commit work implements a **5-tier RBAC** ("5-tier RBAC and frictionless progressive vendor onboarding"). It is defined in `context/AuthContext.tsx`:

| Role | Meaning | What they see |
|---|---|---|
| `visitor` | Not signed in | Minimal public business info |
| `unverified` | Signed up (Step 1 done) | Limited info and their own registration dashboard |
| `pending_approval` | GST-verified, awaiting review | Limited access until BITAINTEL reviews |
| `approved_business` | Approved B2B business | Detailed permitted company and product info |
| `premium_subscriber` | Paid tier | Extra analytics, comparison and "competitor radar" intelligence |

**How it works in the demo:**

1. `AuthProvider` holds `user` and `role`. Five **persona profiles** (for example Kavita Rao, Vikram Shah, Rajesh Mehta of Meridian Steel, Anita Desai of Apex Logistics) are hard-coded.
2. The state is persisted to `localStorage` (`bitaintel_vendor_auth_v2`, `bitaintel_active_role_v2`).
3. A **`PersonaSwitcher`** component lets a reviewer switch between the five roles instantly, and a toast confirms each switch. This is a demo aid for showing stakeholders how each tier experiences the product.
4. Components such as `BusinessProfileClient` branch on the role (`isVisitor`, `isApproved`, `isPremium`, and so on) to show or hide data, for example locked sections and premium panels.
5. `RoleGuard` protects the vendor dashboard and shows a friendly sign-in prompt for unauthenticated users.

---

## 7. Main feature walkthrough

**Landing pages.** Built from large composed sections (`HomeSections.tsx`, about 38 KB; `BuyerHomeSections.tsx`, about 78 KB): hero, trust strip, benefits bento grid, how-it-works pipeline, featured businesses, score explainer and bottom CTA.

**Directory.** `DirectoryExplorer` is a client component with real-time search, filter pills, a view switcher and a **comparison dock**, so users select businesses and jump to `/demo/compare`. `BusinessCard` renders each result, with `ScoreRing` (an SVG trust-score gauge) and tier badges.

**Business dossier.** Shows identity, statutory IDs, certifications, score breakdown (identity, documents, contact, address, profile completeness), contact/enquiry via `EnquiryModal`, and gated content by role.

**Compare.** `CompareTableClient` shows a due-diligence matrix for multiple vendors.

**Vendor registration.** Two paths:
- *Quick register* (`Step1QuickRegisterForm`): a fast first step to create an account.
- *Full wizard* (`RegistrationWizard` with `Step1`–`Step6`): Account, Company, Business, Products, Commercial, Review.

**Vendor dashboard.** Tabbed: Company Profile, Business Capabilities, Catalog/Products, Certifications & Quality, Commercial/Trade, plus an onboarding banner, onboarding wizard modal, status banner and a registration summary modal. This supports "progressive onboarding", where vendors fill in their profile over time rather than all at once.

**Verification vocabulary.** Registration statuses are modelled as: Draft, Verification Pending, Submitted, Under Review, Additional Information Required, Verified, Rejected, Suspended, Renewal Required.

---

## 8. Planning documents in `/docs`

### SRS (`srs.pdf`, Phase 1)
Defines scope, stack, modules, security, effort and cost. Highlights:

- **Phase 1 scope:** landing site, registration, OTP login, multi-module business profile (Modules A–F: Company, Management, Operations, Customer/Supply, Financial, Compliance), GSTIN verification via GSP/ASP, document upload with versioning, verification workflow (an 11-step flow, 10 status states), weighted 0–100 scoring, directory search, profile pages, comparison of 2–4 businesses, vendor/admin/verification-team dashboards, audit logs, 6-role RBAC, notifications, complaints, reports.
- **Phase 2 (out of scope):** AI risk reports, financial analysis, international/sanctions checks, public API, subscriptions, mobile apps, WhatsApp, blockchain certificates.
- **Proposed production stack:** **Laravel 11 (PHP 8.3)**, Sanctum, Spatie permissions and activity log, Redis queues, MySQL 8, Blade + Livewire (or Vue + Inertia), Chart.js, S3-compatible storage, Nginx, GitHub Actions. It is a *modular monolith* with a pluggable integration layer so government API providers can be swapped.

### API & Database spec (`API_AND_DATABASE_REQUIREMENTS.md`)
A more detailed technical design: an architecture diagram (gateway, auth, directory, verification worker, scoring engine), an ER diagram, PostgreSQL DDL (enterprise accounts, users, business entities, products, statutory identifiers, certifications, verification checkpoints, document vault, trust-score snapshots, audit logs, comparison lists), and REST API plus external registry integrations (MCA, GSTN, Udyam, ISO, EPFO).

---

## 9. Observations worth knowing

These came from reading the code and are not blockers, but they are worth tracking:

1. **Stack mismatch between plan and prototype.** The SRS specifies Laravel/MySQL, the API doc specifies PostgreSQL, and the prototype is Next.js with no backend. Decide on the production stack and treat the Next.js app as a UI/UX reference, or as the real front end calling a Laravel API.
2. **No real authentication.** Roles are simulated client-side with `localStorage`. Anyone can switch persona. Real RBAC must be enforced on a server.
3. **Sitemap paths are out of date.** `sitemap.ts` lists `/directory`, `/about` and so on without the `/demo` prefix, and `generateMetadata`/JSON-LD URLs for some pages (for example `/for-vendors`, `/directory?q=`) don't match the actual `/demo/...` routes. Since `/` is now Coming Soon, these should be revisited before launch.
4. **Two `<html>` layouts.** Both `src/app/layout.tsx` and `src/app/demo/layout.tsx` render `<html>` and `<body>`. In Next.js, nested layouts should not repeat these tags. This can cause hydration/markup warnings, so the demo layout should likely render only a wrapper.
5. **Very large files.** `dashboard/vendor/page.tsx` (about 95 KB) and `BuyerHomeSections.tsx` (about 78 KB) would be easier to maintain if split into smaller components.
6. **Leftover repo artefacts in the zip.** The zip contains `.git`, `tsconfig.tsbuildinfo` and a LibreOffice lock file (`docs/.~lock.srs.pdf#`). These can be removed from a shared or deployed copy. `next.config.ts` also contains a hard-coded LAN IP (`192.168.1.112`) in `allowedDevOrigins`, which is a dev-only setting.
7. **Duplicated assets.** `public/` holds several near-identical logo variants (`logo.png` and `logo-2.png` are the same size), which could be cleaned up.
8. **The README is partly outdated.** It describes the earlier structure (routes at the top level, a 3-step wizard, Iris/indigo theme). The code has since moved to `/demo`, a 6-step wizard, the logo-blue palette and the RBAC system.

---

## 10. How to run it

```bash
npm install
npm run dev          # http://localhost:3000  (Coming Soon)
                     # http://localhost:3000/demo  (the full demo site)
npm run typecheck
npm run lint
npm run build && npm start
```

Optional env var (see `.env.example`): `NEXT_PUBLIC_SITE_URL`, used for canonical URLs, OpenGraph and JSON-LD.

To explore the role system, open any `/demo` page and use the **Persona Switcher** to move between visitor, unverified, pending, approved and premium views.

---

## 11. Project history (from git)

About 20 commits, progressing roughly as: initial project and UI structure → requirements docs → logo and footer → metadata and JSON-LD → vendor auth and dashboard → vendor registration flow → move to `/demo` with Coming Soon at `/` → global theming and logo-matched colours → **5-tier RBAC and progressive onboarding** → final header and footer refinements.

---

## 12. Summary

BITAINTEL is a polished, well-structured **Next.js 16 / React 19 / Tailwind 4 front-end prototype** of a B2B verification and trust-scoring platform. Its strengths are a centralised theme system, reusable UI primitives, strong SEO and structured-data groundwork, statically generated business dossiers, and a clear 5-tier access-control model that makes the product's value tiers easy to demo. The main work ahead is the real backend (auth, database, GST/MCA integrations, scoring engine and admin/verification-team tools) described in the SRS and API spec, along with the cleanup items in section 9.