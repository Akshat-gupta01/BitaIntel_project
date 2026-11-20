# BITAINTEL — Enterprise B2B Trust Intelligence Website

A modern, high-performance, Apple-glass-inspired website for **BITAINTEL** built with the **latest Next.js App Router, React 19, TypeScript, and Tailwind CSS**.

The design language incorporates a modern **Iris / Electric Indigo primary brand color** with a rich, complementary **multi-color pastel palette** (Lavender, Mint, Sky, Peach, Amber, Rose, Violet), paired with translucent frosted glass surfaces, Bento grid layouts, and smooth micro-interactions.

> **Notice:** This is an interactive frontend reference demonstration. Corporate entities, GSTIN identifiers, CIN numbers, and trust scores are realistic sample datasets. Contact and registration workflows validate fields locally within the browser session without external database persistence or live government API calls.

---

## Technology Stack

- **Framework:** Next.js (App Router, Turbopack, React Server Components by default)
- **UI & Styling:** Tailwind CSS v4 with custom CSS design tokens & Apple glass utilities
- **Language:** TypeScript with strict type checking (`tsc --noEmit` verified)
- **Icons:** Lucide React
- **Validation:** Zod & standard HTML5/TypeScript form handling

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Static Generation

```bash
npm run typecheck   # Typecheck all TypeScript modules
npm run lint        # ESLint validation (0 errors, 0 warnings)
npm run build       # Next.js optimized production build (all static & dynamic routes)
npm run start       # Start production server
```

---

## Project Architecture

```text
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Home / Landing page with Hero Bento & Benefits
│   ├── directory/            # Searchable business directory with filters & preview drawer
│   ├── business/[slug]/      # Statically generated business dossiers
│   ├── compare/              # Side-by-side corporate due-diligence matrix
│   ├── how-it-works/         # 5-step pipeline & statutory checkpoint methodology
│   ├── about/                # Corporate mission, vision, & architectural principles
│   ├── contact/              # Interactive contact preview with category selector
│   ├── register/             # 3-step interactive onboarding registration wizard
│   ├── faq/                  # Knowledge base with expandable glass accordion
│   ├── privacy/              # Data governance & confidentiality framework
│   ├── terms/                # Terms of use & regulatory limitations
│   ├── layout.tsx            # Global root layout with metadata & fonts
│   ├── globals.css           # Glassmorphism, pastel utilities, & Tailwind setup
│   ├── loading.tsx           # Skeleton loading placeholders
│   ├── error.tsx             # Accessible error boundary
│   └── not-found.tsx         # Modern 404 page
│
├── components/
│   ├── ui/                   # Reusable UI Primitives
│   │   ├── Button.tsx        # Variants: primary, secondary, dark, glass, pastel, ghost, outline
│   │   ├── Card.tsx          # Variants: glass, bento, dark, interactive, default
│   │   ├── Badge.tsx         # Multi-color pastel variants: lavender, mint, sky, peach, amber, rose, etc.
│   │   ├── Dialog.tsx        # Accessible modal dialog with Apple frosted glass backdrop
│   │   ├── Sheet.tsx         # Responsive slide-over drawer (left/right) with backdrop blur
│   │   ├── DropdownMenu.tsx  # Accessible click-outside glass dropdown
│   │   ├── Input.tsx         # Floating/labeled input & textarea with validation feedback
│   │   ├── Select.tsx        # Styled glass select with chevron
│   │   ├── Tabs.tsx          # Apple-style pill tabs
│   │   ├── Accordion.tsx     # Smooth expandable FAQ accordion
│   │   ├── Skeleton.tsx      # Shimmer loading placeholder
│   │   └── Separator.tsx     # Subtle divider
│   │
│   ├── layout/               # Global Layout Components
│   │   ├── Header.tsx        # Floating Apple glass navigation bar with live registry strip
│   │   ├── Footer.tsx        # Modern footer with briefing newsletter & navigation
│   │   └── Container.tsx     # Responsive max-width container
│   │
│   ├── business/             # Feature Components
│   │   ├── BusinessCard.tsx  # Bento business card with industry pastel themes
│   │   ├── DirectoryExplorer.tsx # Real-time search, pastel pills, view switcher, & comparison dock
│   │   ├── EnquiryModal.tsx  # Client-side enquiry dialog with confirmation state
│   │   └── ScoreRing.tsx     # SVG trust score gauge with dynamic color stroke
│   │
│   ├── sections/             # Page Sections
│   │   └── HomeSections.tsx  # Hero, Trust Strip, Benefits Bento, How It Works, Directory Bento, Scoring Matrix
│   │
│   └── shared/               # Shared Application Forms
│       ├── ContactForm.tsx   # Client-validated contact form
│       └── RegistrationWizard.tsx # Multi-step onboarding registration wizard
│
├── config/
│   ├── theme.css             # Authoritative single source of truth for all color tokens
│   ├── theme.ts              # Typed TypeScript theme exports
│   └── site.ts               # Global site configuration
│
├── data.ts                   # 12+ realistic B2B enterprise entities & verification checkpoints
└── lib/
    └── utils.ts              # Utility functions (cn / clsx merge)
```

---

## Centralized Theme System

The entire website theme is driven by **one single file**:

👉 **`src/config/theme.css`**

Changing the tokens in this file immediately re-themes the entire website (all buttons, links, active navigation pills, score rings, glowing cards, and borders):

```css
:root {
  /* Brand Primary - Change this to any brand color */
  --brand: #4F46E5;         /* Iris / Indigo */
  --brand-strong: #4338CA;
  --brand-light: #6366F1;
  --brand-soft: #EEF2FF;
  --brand-glow: rgba(79, 70, 229, 0.28);

  /* Rich Complementary Pastel Tokens */
  --pastel-lavender: #EEF2FF;
  --pastel-mint: #ECFDF5;
  --pastel-peach: #FFF7ED;
  --pastel-sky: #F0F9FF;
  --pastel-rose: #FFF1F2;
  --pastel-amber: #FFFBEB;
  --pastel-violet: #F5F3FF;
}
```

Components use semantic CSS variables (`var(--brand)`, `var(--pastel-mint)`, etc.) rather than hardcoded Tailwind colors.

---

## Editing Mock Data

All corporate records, verification milestones, and FAQs reside in:

👉 **`src/data.ts`**

Each business entry contains:
- `id`: Unique URL slug
- `name`: Trading business name
- `legalName`: Full registered corporate entity name
- `industry`: Sector classification (Manufacturing, IT Services, Healthcare & Pharma, etc.)
- `location`, `city`, `state`: Geographic coordinates
- `gstin`, `cin`: Statutory registration identifiers
- `isoCertified`: Industry quality standards
- `level`: Verification Tier (1 to 4)
- `score`: Composite trust score (0–100)
- `age`: Operational tenure in years
- `turnover`, `employees`: Size metrics
- `products`: Array of capability and product tags

Updating this file automatically updates the **directory**, **search indexing**, **business profiles**, **side-by-side comparisons**, and **sitemap**.

---

## Core Web Vitals & Performance Strategy

1. **Server Components by Default:** Pages are pre-rendered server-side or statically generated (`SSG` via `generateStaticParams`) to ensure zero-JS initial render and instant LCP.
2. **Minimal Client Islands:** Client Components (`'use client'`) are strictly isolated to interactive controls (search filters, modals, drawers, tabs, and form submissions).
3. **Optimized Layout & CLS:** Explicit aspect ratios, SVG score gauges, and reserved card layouts prevent layout shifts.
4. **CSS-Driven Glassmorphism:** Uses native hardware-accelerated CSS `backdrop-filter: blur(...)` rather than heavy JavaScript animation libraries.

---

## License

Created for BITAINTEL Technologies Inc. Frontend Demonstration Project.