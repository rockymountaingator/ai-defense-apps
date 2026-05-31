# AGENTS.md — AI Defense Business Assessment

> **Purpose:** Orientation file for AI coding agents. Read this *before* modifying any code in this repo.

---

## Overview

**AI Defense Project — Business Assessment** is a full-stack SaaS tool that delivers a **Strategic Viability Index (SVI)** assessment to business leaders. Users complete ~30 questions across four dimensions, receive AI-powered executive summaries (DeepSeek with multi-provider fallback), and get three downloadable deliverables via email: a PDF report, a PPTX board brief, and a survival-kit PDF.

**Target audience:** C-suite and senior leaders at mid-market and enterprise companies. Leads are piped into **Vbout CRM** for nurture campaigns, tagged with archetype, quadrant, and dimension scores.

**Product URL:** `https://aidefenseproject.com/business`

**Business owner:** Benny Carreon, Managing Partner, Velocity Technology Group

---

## Quick Reference

| Item | Value |
|------|-------|
| **Stack** | Express 4 + Node 20 (backend), Vite + React 19 (frontend) |
| **Database** | Supabase (Postgres), project `yueabqstuafuwqrzuaod` |
| **AI providers** | DeepSeek (primary), OpenRouter, Claude, ZAI (fallback chain) |
| **Doc engines** | PDFKit (PDF), PptxGenJS (PPTX) |
| **CRM** | Vbout (List ID `185960`) |
| **Email** | Nodemailer SMTP |
| **Payments** | Stripe PaymentIntent (routes built, account pending) |
| **Repo** | `github.com/rockymountaingator/-ai-defense-project-business` (private, note leading dash) |
| **Local source** | `/home/benny/ai-defense-project-repo/` |
| **Production** | Coolify 4 on Hostinger VPS, auto-deploys from `main` |
| **Frontend base path** | `/business` (Vite builds with `VITE_BASE_PATH=/business`) |

---

## Architecture

```
aidefenseproject.com
  └─ /business     → frontend container (Nginx serves SPA, proxies /api to backend)
  └─ /api/*        → backend container (Express on port 3001)
```

### Directory Layout

```
ai-defense-project-repo/
├── backend/                    # Express API server
│   ├── server.js               # App entry — CORS, rate limiting, route mounting
│   ├── routes/
│   │   ├── assessment.js       # POST /submit, POST /contact-me, GET /by-token/:token, GET /:id
│   │   ├── download.js         # GET /:assessmentId/:fileType (signed Supabase URLs)
│   │   ├── affiliates.js       # CRUD + click tracking for affiliates
│   │   ├── promos.js           # Promo code management + validation
│   │   └── payments.js         # Stripe PaymentIntent creation + webhook handling
│   ├── services/
│   │   ├── ai.js               # Multi-provider AI with fallback (DeepSeek → OpenRouter → Claude → ZAI)
│   │   ├── pdf.js              # PDFKit — 9-page SVI assessment report
│   │   ├── survivalKit.js      # PDFKit — 7-page VTG AI Survival Kit 2026
│   │   ├── pptx.js             # PptxGenJS — 2-slide board brief
│   │   ├── supabase.js         # Supabase client, saveAssessment, getAssessment, getSignedUrl
│   │   ├── vbout.js            # Vbout CRM upsert (addcontact → editcontact fallback)
│   │   ├── email.js            # Nodemailer dispatch with embedded logo CID
│   │   └── logo.js             # Dynamic branding engine (black/white/transparent logo variants)
│   ├── middleware/
│   │   ├── auth.js             # HMAC-signed access tokens (not JWT), requireAuth, requireAssessmentOwnership
│   │   └── rateLimit.js        # Per-endpoint rate limits (api, assessment, download, retrieval)
│   ├── utils/
│   │   ├── sanitize.js         # Input sanitization (company name, email, answers, strings)
│   │   ├── emailValidation.js  # Business-email enforcement (28 free domains + 5,300 disposable, auto-updated daily)
│   │   └── archetype.js        # Maps quadrant × size → one of 11 buyer archetypes for CRM routing
│   ├── assets/                 # Logo PNGs (black, white, transparent variants)
│   ├── data/                   # disposable-email-domains.txt (fallback blocklist)
│   ├── Dockerfile              # Dev Dockerfile
│   ├── Dockerfile.prod         # Production — node:20-alpine, npm mirror
│   └── supabase-schema.sql     # Full DDL for all four tables
├── svi-preview/                # Frontend — React 19 + Vite + Recharts
│   ├── src/
│   │   ├── App.jsx             # Single-file app (~2000 lines): wizard, scoring, results, portal
│   │   ├── config.js           # BACKEND_URL from VITE_API_URL env var
│   │   └── ...
│   ├── nginx.conf              # Proxies /api/ to backend:3001, SPA fallback
│   ├── Dockerfile              # Dev Dockerfile
│   ├── Dockerfile.prod         # Multi-stage: node build → nginx serve
│   └── ...
├── docker-compose.yml          # Dev: both containers, hot reload
├── docker-compose.prod.yml     # Production: health checks, no volume mounts
├── docker-compose.coolify.yml  # Coolify deployment (no ports, Traefik handles routing)
└── plans/                      # Historical deployment plans
```

### Request Flow (Assessment Submission)

1. Frontend collects ~30 answers + company info, computes scores client-side (vAI, Ro, Dp, Ms, Di + quadrant)
2. `POST /api/assessment/submit` — validates with express-validator, enforces business-email gate
3. Backend calls DeepSeek AI for executive summary (with multi-provider fallback)
4. Generates 3 documents in-memory: PDF report, PPTX board brief, survival-kit PDF
5. Saves assessment to Supabase
6. Upserts contact to Vbout CRM with scores, archetype, and all custom fields
7. Sends email via Nodemailer SMTP with all 3 attachments + HMAC-signed portal link
8. Returns `{ success, report, emailSent, filesGenerated, assessmentId, accessToken }`

### Portal Access

- After submission, user receives a portal URL: `/business/portal/<token>`
- Token is `base64url(assessmentId:email:hmacSignature)` — NOT a JWT
- `GET /api/assessment/by-token/:token` validates HMAC and returns assessment data
- Frontend renders a dashboard with score recap and download options

---

## Database

**Supabase project:** `yueabqstuafuwqrzuaod`

### Tables

**`assessments`** — Core assessment data
- `id` (UUID PK), `company_name`, `industry`, `company_size`, `revenue`
- `lead_name`, `lead_email`, `lead_title`
- `answers` (JSONB), `scores` (JSONB — vAI, ro, dp, ms, di, quadrant), `report` (text)
- Indexes on `lead_email`, `created_at DESC`

**`affiliates`** — Partner/affiliate accounts
- `code` (unique slug), `name`, `email`, `company`, `status` (active/paused/banned)
- `commission_pct` (default 20%), `click_count`, `signup_count`, `revenue_cents`, `paid_cents`
- `stripe_account_id` for Stripe Connect payouts
- Indexes on `code`, `email`, `status`

**`promo_codes`** — Discount codes
- `code` (unique), `discount_pct` or `discount_flat` (cents), `max_uses`, `use_count`
- `valid_from` / `valid_until`, `affiliate_id` FK, `active` flag
- RLS policy: active codes are publicly readable (for frontend validation)

**`payments`** — Order/payment records
- `assessment_id` FK, `stripe_payment_intent`, `stripe_customer_id`
- `affiliate_id` FK, `promo_code_id` FK
- `amount_cents`, `discount_cents`, `net_cents`, `commission_cents`
- `status` (pending/paid/failed/refunded)
- Indexes on status, assessment, affiliate, stripe intent, created_at

### Schema Migrations

- `backend/supabase-schema.sql` is the source of truth — idempotent (`IF NOT EXISTS`)
- Auto-updating `updated_at` via trigger (`set_updated_at()` function)
- RLS enabled on affiliates, promo_codes, payments (service key bypasses)

---

## Deployment

### Coolify (Production)

- **Compose file:** `docker-compose.coolify.yml`
- **Two containers:** `frontend` (Nginx on :80) + `backend` (Node on :3001)
- **Routing:** Traefik handles `aidefenseproject.com/business` path → frontend container; Nginx proxies `/api/` to backend
- **Build args:** `VITE_API_URL=""` (empty = relative paths, same domain), `VITE_BASE_PATH=/business`
- **Env file:** `backend/.env` loaded via `env_file` directive
- **Auto-deploy:** Push to `main` triggers Coolify rebuild
- **Health checks:** Frontend `curl localhost:80`, Backend `wget localhost:3001/api/health`
- **npm mirror:** Dockerfiles use `registry.npmmirror.com` for reliable installs

### Local Development

```bash
# Option 1: Docker Compose (both services)
docker compose up

# Option 2: Run backend directly
cd backend && npm run dev    # nodemon on :3001

# Option 3: Run frontend directly
cd svi-preview && npm run dev  # Vite on :5173
```

### Key Environment Variables (`backend/.env`)

```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://aidefenseproject.com/business
JWT_SECRET=<random-32-chars>

# AI (primary + fallbacks)
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...
CLAUDE_API_KEY=sk-ant-...     # optional
ZAI_API_KEY=...                # optional

# Database
SUPABASE_URL=https://yueabqstuafuwqrzuaod.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# CRM
VBOUT_API_KEY=...
VBOUT_LIST_ID=185960

# Email
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=noreply@velocitytechnology.group
EMAIL_FROM_NAME=Velocity Technology Group
CONTACT_EMAIL=benny@velocitytechnology.group

# Payments (pending Stripe account)
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
ADMIN_SECRET=...
```

---

## Conventions & Gotchas

### Code Style

- **Backend:** CommonJS (`require`/`module.exports`), no TypeScript in production (there's an unused `src/index.ts`)
- **Frontend:** Single-file `App.jsx` (~2000 lines) with all components, logic, and questions inline
- **No test suite** exists yet
- Each route file creates its own Supabase client via `getSupabase()` (not shared from a central module — don't ask why)

### Scoring

- Scores are computed **client-side** in the frontend and sent to the backend
- Five dimensions: `vAI` (AI Viability), `ro` (Readiness), `dp` (Data Moat), `ms` (Defense), `di` (Industry Displacement)
- Four quadrants: `vanguard`, `experimentalist`, `fortress`, `sitting_duck`
- Archetype is derived server-side from quadrant × company_size × industry (see `utils/archetype.js`)

### Vbout Integration

- Uses **hardcoded field IDs** in `services/vbout.js` (discovered via browser inspection of Vbout contact form)
- Addcontact → if "already exists" → getContact → editContact (upsert pattern)
- Field param format: `fields[<numeric_id>]` (singular `field`, not `fields`)

### Email System

- Business emails only — frontend blocks 28 free providers, backend blocks those plus 5,300 disposable domains
- Disposable domain list auto-refreshes every 24 hours from GitHub, falls back to bundled file
- Logo CID embedding: `velocitylogo` is referenced in HTML templates and attached from `assets/`

### Auth System

- **NOT JWT.** Uses HMAC-SHA256 signed tokens: `base64url(assessmentId:email:signature)`
- Secret is `JWT_SECRET` env var (despite the name, it's HMAC not JWT)
- `verifyAccessToken()` returns `{ assessmentId, email }` or null

### Admin Protection

- Affiliate, promo, and payment write endpoints are guarded by `x-admin-secret` header or `admin_secret` query param
- Default fallback: `'changeme-admin-secret'` — **must be overridden in production** via `ADMIN_SECRET` env var

### Docker / Build

- Frontend is a **multi-stage build**: Node builds → Nginx serves
- Frontend Nginx config proxies `/api/` to `http://backend:3001` (container DNS)
- `VITE_API_URL` is empty string in production (relative API paths, same origin)
- `VITE_BASE_PATH=/business` sets the Vite base for correct asset paths

### Security Features

- Rate limiting: 5 submissions/15min, 100 API calls/15min, 20 downloads/hour, 30 retrievals/hour
- Input sanitization on all fields (length limits, HTML stripping)
- CORS configured with origin allowlist
- Redirect URL validation on download signed URLs
- Error messages suppressed in production responses

---

## Known Issues

1. **Stripe not live.** Payment routes are built (`payments.js`, 300 lines) but Stripe account hasn't been created yet. Benny needs to set up `dashboard.stripe.com`, then provide test mode API keys.

2. **Frontend monolith.** `App.jsx` is ~2000 lines with all components, questions, scoring, and UI inline. Makes targeted edits risky — use search carefully.

3. **Duplicate Supabase client creation.** Each of `affiliates.js`, `promos.js`, and `payments.js` creates its own Supabase client via a local `getSupabase()` function instead of importing from `services/supabase.js`.

4. **Admin secret default.** If `ADMIN_SECRET` env var is not set, routes fall back to `'changeme-admin-secret'`. Ensure it's set in production.

5. **Debug endpoint in production.** `GET /api/debug/vbout` exists in `server.js` — probes Vbout API and returns raw responses. Should be removed or guarded before public launch.

6. **Legacy Cloudflare files.** `svi-preview/wrangler.toml`, `backend/wrangler.toml`, and `backend/package.workers.json` are artifacts from a previous Cloudflare Workers deployment. Not used in current Coolify setup.

7. **No test suite.** Zero automated tests exist.

---

## Recent Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05 | Added Umami analytics tracking | Privacy-focused analytics for user behavior insights |
| 2026-05 | Added affiliate, promo, and payment backend routes with Supabase schema | Complete monetization infrastructure with tracking, discounts, and commission management |
| 2026-04 | Migrated from Cloudflare Pages to Coolify single-domain deployment | Simpler architecture, shared Traefik SSL, both containers in one compose |
| 2026-04 | Added affiliate + promo + payment system | Monetization infrastructure for partner-driven sales |
| 2026-04 | Built archetype classifier (`utils/archetype.js`) | Route leads into targeted Vbout nurture campaigns based on buyer profile |
| 2026-03 | Switched auth from JWT to HMAC-signed tokens | Simpler, no library dependency, sufficient for portal access use case |
| 2026-03 | Added multi-provider AI fallback chain | DeepSeek reliability concerns; OpenRouter, Claude, ZAI as fallbacks |
| 2026-03 | Implemented email validation with auto-updating blocklist | Prevent junk leads from free/disposable email domains |

---

## Pending Actions

- **Stripe account creation** — Benny needs to sign up at `dashboard.stripe.com`, then provide test mode API keys to Hermes for integration testing
- **Remove or guard `/api/debug/vbout`** before public launch
- **Clean up legacy Cloudflare Workers files** (`wrangler.toml`, `package.workers.json`)
- **Consider splitting `App.jsx`** into component files for maintainability
