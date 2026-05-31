# AGENTS.md — AI Defense Personal Assessment

> Reference doc for AI agents (and humans) working on this project.
> Last updated: 2026-05-04

---

## Overview

Career AI-readiness assessment app. Users answer 20 psychometric-style questions across 5 formats; the engine calculates hidden scores, maps them to public-facing metrics, and assigns one of 8 behavioral profiles. Results are saved to Supabase and downloadable as a branded 5-page PDF.

- **Live URL:** `aidefenseproject.com/personal`
- **Repo:** `github.com/rockymountaingator/ai-defense-project-personal` (private)
- **Local source:** `/home/benny/ai-defense-personal/`

---

## Quick Reference

| Item | Value |
|---|---|
| Framework | Next.js 15 + TypeScript + React 19 |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Animation | Framer Motion 11 |
| PDF | PDFKit 0.18 (server-side) |
| Database | Supabase (`yueabqstuafuwqrzuaod.supabase.co`) |
| Deploy | Coolify 4 / Nixpacks on Hostinger VPS |
| Payments | Stripe (pending) |
| Node scripts | `dev`, `build`, `start`, `lint` (standard Next.js) |

---

## Architecture

### Pages & Routes

```
src/app/
├── page.tsx                  — Main assessment flow (welcome → questions → complete)
├── layout.tsx                — Root layout
├── globals.css               — Tailwind v4 imports
├── results/page.tsx          — Results dashboard + download button
├── admin/page.tsx            — Admin data upload (PDF-only, client-side)
└── api/
    ├── save-assessment/route.ts  — POST → Supabase insert
    └── generate-pdf/route.ts     — POST → PDFKit 5-page PDF download
```

### Components

```
src/components/
├── WelcomeScreen.tsx        — Landing page, promo code input, admin link (red button)
├── QuestionCard.tsx          — Single question renderer (5 formats)
├── ProgressBar.tsx           — Section/progress indicator
├── LoadingResults.tsx        — Animated loading between completion and results
├── ResultsDashboard.tsx      — Full results display
├── ScoreGauge.tsx             — Visual score gauge component
└── DownloadReportButton.tsx  — Triggers /api/generate-pdf
```

### Library Modules

```
src/lib/
├── types.ts          — All TypeScript interfaces (Question, Answer, HiddenScores, AssessmentResults, etc.)
├── questions.ts      — 20 questions across 5 formats, each option carries hidden scoring vectors
├── scoring.ts        — Calculation engine: weighted averages → hidden scores → public scores → insights
├── pathways.ts       — 8 behavioral profiles + score-space matching via getProfile()
├── affiliate.ts      — ?ref=CODE capture, promo code validation, localStorage persistence
├── supabase.ts       — Supabase client init (anon key)
└── pdf-generator.ts  — 5-page LETTER PDF: cover, score deep dive, profile + insights, action plan, about + CTA
```

### Data Flow

1. **Welcome** (`WelcomeScreen`) — optional promo code, optional `?ref=CODE` affiliate capture
2. **Questions** (`page.tsx` orchestrates) — 20 questions, state persisted to `localStorage` (`ai-defense-assessment-state`)
3. **Scoring** (`calculateResults()`) — answers → hidden scores → public scores → profile + 4 narrative insights + next steps + resources
4. **Save** (`POST /api/save-assessment`) — writes to `personal_assessments` table in Supabase
5. **Results** (`results/page.tsx`) — displays profile, scores, insights, recommendations
6. **PDF** (`POST /api/generate-pdf`) — PDFKit generates 5-page branded report, returns as download

---

## Scoring

### Hidden Scores (never shown to user)

Derived via weighted averages of option vectors across all 20 questions:

- **routineIndex** (0–100) — behavioral evidence of routine/repeatable work
- **humanAdvantage** (0–100) — genuine human-dependent value
- **adaptQuotient** (0–100) — adaptability based on behavior, not aspiration
- **selfPerceptionGap** (0–100) — overestimation vs behavioral data (cross-validation of behavioral vs claimed answers)
- **depthIndex** (0–100) — self-awareness depth

### Public Scores (mapped from hidden)

- **Exposure** — how exposed their work is to AI. Formula: `routine × 0.6 + (100 − human) × 0.3 + (100 − adapt) × 0.1`
- **Resilience** — genuine human advantage. Formula: `human × 0.6 + (100 − routine) × 0.25 + depth × 0.15`
- **Readiness** — behavioral readiness for change. Formula: `adapt × 0.5 + depth × 0.25 + (100 − perceptionGap) × 0.25`

All scores clamped 0–100 and rounded.

### Profile Assignment

8 profiles assigned via **score-space matching** (not threshold buckets). Each profile has weighted score coefficients; the highest-matching profile wins.

- The Hidden Expert, The Unaware Automator, The Calculated Adapter, The Sleeping Giant
- The Bridge Builder, The Steady Hand, The Reluctant Skeptic, The Dark Horse

Fallback: `calculated-adaptor` if no match.

### Narrative Insights (4 per result)

- **Surprising Insight** — cross-references behavioral vs stated orientation
- **Uncomfortable Truth** — where self-perception diverges from evidence
- **Real Moat** — genuine human advantage
- **Blind Spot** — what they're not seeing

### Question Formats

| Format | Purpose |
|---|---|
| `word-snap` | Quick word/phrase choice — gut reaction |
| `behavioral` | "What did you actually do" — memory-based |
| `impossible` | Forced trade-off between two desirable things |
| `fill-blank` | Sentence completion — brain fills before PR filter |
| `honest-mirror` | Self-reflection — all answers have dignity + hidden trap |

Each option carries 5 hidden vectors: `routine`, `human`, `adapt`, `selfPerception`, `depth` (all 0–100).

---

## Database

**Supabase project:** `yueabqstuafuwqrzuaod.supabase.co` (shared with business track)

### Table: `personal_assessments`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key, auto-generated |
| `email` | text | Optional |
| `pathway_title` | text | Profile title (e.g. "The Hidden Expert") |
| `jvs_score` | integer | Maps to `results.exposure` in current code |
| `ars_score` | integer | Maps to `results.resilience` in current code |
| `results` | JSONB | Full `AssessmentResults` object |
| `affiliate_code` | text | From `?ref=CODE` |
| `promo_code` | text | From promo code input |
| `created_at` | timestamptz | Auto-generated |

**RLS:** Anonymous inserts allowed. Reads require `service_role` key.

**Client init:** `src/lib/supabase.ts` — uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars. Gracefully falls back to `console.log` when unconfigured.

---

## Deployment

**Platform:** Coolify 4 on Hostinger VPS, Nixpacks builder.

### Build Configuration

- **Install:** `npm install`
- **Build:** `npm run build`
- **Start:** `npx next start`

### Current `next.config.ts`

```ts
basePath: '/personal',
images: { unoptimized: true },
```

⚠️ **The `basePath: '/personal'` is currently set in `next.config.ts`.** This means the app internally expects all routes under `/personal/*`. The Traefik reverse proxy at Coolify may or may not also strip the `/personal` prefix before forwarding — this is the source of the known routing issue (see below).

### Deployment Notes

- Deploy key configured for private repo access
- Auto-deploys from `main` branch
- **NO `output: 'standalone'`** — conflicts with Nixpacks
- **PDF buffer must be wrapped in `new Uint8Array()`** before passing to `NextResponse` — standard `Buffer` causes issues

---

## Conventions & Gotchas

### Code Style

- Question/section headers use Unicode box-drawing separators (`──`, `══`)
- Hidden scoring vectors are intentionally NOT exposed to the UI
- Cross-validation groups (`crossValidate` field on questions) triangulate the same dimension from different angles
- All score clamping uses a local `clamp()` helper (no external utility)

### State Management

- No global state library — React `useState` + `useEffect` in `page.tsx`
- Assessment state persisted to `localStorage` under key `ai-defense-assessment-state`
- Affiliate code stored separately under `ai-defense-ref`
- Promo code stored under `ai-defense-promo`

### Affiliate & Promo System

- `?ref=CODE` captured on mount via `initAffiliateTracking()` → stored in localStorage with timestamp
- Promo codes validated against external API (`api.aidefenseproject.com/api/promo/validate`)
- Both codes attached to Supabase insert on save

### PDF Generation

- Server-side only (PDFKit doesn't work in browser)
- 5 pages: cover, score deep dive, profile + insights, action plan, about + CTA
- Uses brand colors: VTG orange `#E8950A`, per-profile accent colors
- LETTER page size

### Admin Page

- Client-side PDF upload only (no server persistence yet)
- Audio/video upload noted as "coming soon"
- Public-facing version would need: API-based upload → object storage → job queue

---

## Known Issues

### ⚠️ CRITICAL: Traefik Path Stripping + basePath Conflict

The `/personal` prefix routing is fragile. If Traefik strips `/personal` before forwarding to the Next.js app, but `next.config.ts` has `basePath: '/personal'`, internal links and API routes break. Two possible fixes:

1. **Remove Traefik's `stripprefix` labels** in Coolify config — let the app handle its own basePath
2. **Switch to a subdomain** (`personal.aidefenseproject.com`) and remove `basePath` from `next.config.ts` entirely

This is the #1 deployment gotcha. Test all routes after any config change.

### JVS/ARS Column Naming

The Supabase columns `jvs_score` and `ars_score` are mapped from `results.exposure` and `results.resilience` respectively in the save endpoint. The naming is a legacy from an earlier scoring model. The current public-facing scores are Exposure, Resilience, and Readiness.

### Dark Horse Profile Scoring

The `dark-horse` profile in `pathways.ts` has a scoring formula using ternary expressions that may behave unexpectedly due to operator precedence with `+`. The `Math.abs() < 20 ? 60 : 20` expression is combined with `+ depth * 0.2` in a way that may not match intent. Worth reviewing if Dark Horse assignment seems off.

---

## Recent Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05 | Premium PDF report + viral share system | Enhanced user experience and social sharing capabilities |
| 2026-05 | Added Umami analytics tracking | Privacy-focused analytics for user behavior insights |
| 2026-05 | Added Stripe payment integration | Monetization infrastructure |
| 2026-05 | Implemented affiliate tracking + promo codes | Partner-driven sales and promotions |
| 2026-05 | Wired up Supabase for assessment result persistence | Database-backed results, no localStorage dependency |
| 2026-05 | Built 5-page PDF report generation | Branded, comprehensive results deliverable |
| 2026-05 | Fixed Coolify Traefik routing with basePath `/personal` | Subpath deployment compatibility |
| 2026-04 | Tailwind v4 chosen over v3 | Uses `@tailwindcss/postcss` plugin, no `tailwind.config.js` |
| 2026-04 | No standalone output | Nixpacks incompatibility |
| 2026-04 | Score-space matching over threshold buckets | Avoids hard cutoff artifacts, produces more nuanced profile assignment |
| 2026-04 | Hidden scoring vectors on options | Users never see the raw dimensions, only the mapped public scores and narrative insights |
| 2026-04 | Cross-validation groups on questions | Behavioral answers checked against claimed orientations to detect perception gaps |
| 2026-04 | Client-side state persistence via localStorage | Simple, no backend session needed |
| 2026-04 | PDF generation server-side | PDFKit requires Node.js filesystem APIs; browser alternatives were deemed insufficient for the branded layout quality needed |

---

## Pending

- **Stripe integration** for payments (not yet started)
- **Audio/video upload** on admin page (UI placeholder exists)
- **Public-facing admin** with API-based upload + object storage + job queue
- **Subdomain migration** or Traefik config fix for `/personal` routing
