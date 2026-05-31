# AI Defense Project - SVI Assessment Platform

A full-stack enterprise application designed for conducting the Strategic Viability Index (SVI) assessment, evaluating an organization's AI readiness, and dynamically generating robust executive-ready collateral (PDFs, PPTX, HTML Emails).

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Core Workflows & Features](#core-workflows--features)
3. [Dynamic Branding Engine](#dynamic-branding-engine)
4. [Environment Configuration](#environment-variables)
5. [API Routes](#api-endpoints)
6. [Deployment](#deployment)

---

## System Architecture

- **Frontend**: React 19 + Vite + Recharts (`svi-preview/`)
- **Backend / API**: Node.js + Express (`backend/`)
- **Document Engines**: `pdfkit` (PDF rendering) and `pptxgenjs` (PowerPoint rendering)
- **Database**: Supabase (PostgreSQL + file storage)
- **Deployment Ecosystem**: Docker + Coolify (Backend) & Cloudflare Pages (Frontend)

---

## Core Workflows & Features

### 1. Data Collection & Pre-processing
- **Assessment Engine**: A guided multi-step wizard asking ~30 questions across Operational Readiness, Data Moat, Strategic Defensibility, and Industry Position domains.
- **Enterprise Gatekeeping**: Real-time business email validation. The backend blocks the top 28 free email providers (Gmail, Yahoo) alongside over 5,300 disposable email domains via a self-updating daily blocklist synced down from Github.
- **CRM Integration**: Leads are securely POSTed to Vbout lists with custom mapped fields (scores, industry, pipeline stages).

### 2. Analysis & Document Generation
- **DeepSeek AI Insights**: Orchestrates AI evaluations based on assessment answers for personalized executive summaries and strategic action points.
- **Intelligent Fallback System**: If the AI provider timeouts or fails, the PDF engine gracefully defaults to mathematically-derived visual charts and fallback advice, ensuring the user still instantly receives a usable report.
- The Backend autonomously compiles 3 attached documents entirely in-memory:
  - **SVI Assessment Report (PDF)**: 9 custom pages of scoring and diagnostics.
  - **VTG AI Survival Kit 2026 (PDF)**: Static 7-page appended field guide.
  - **Executive Board Brief (PPTX)**: An editable 2-slide overview layout for leadership meetings.

### 3. Portal & Delivery
- **Email Dispatch**: Sends a beautifully styled HTML email to the user (via SMTP) including a time-sensitive, HMAC-signed JWT URL.
- **Client Portal**: Users who click their personalized link unlock a secure React layout that retrieves their previous scores and generates fresh downloads using the `by-token` authorization flow.
- **Internal Contact Trigger**: A dedicated "Contact Me" API endpoint triggers an internal notification directly to `benny@velocitytechnology.group` including user metadata, company revenue sizes, and all SVI dimension scores, immediately followed by a browser redirect.

---

## Dynamic Branding Engine

The backend relies on the `services/logo.js` architecture to properly swap logo formats based on the environment's container background colors. This guarantees maximum contrast without causing transparent logo bleed or overlapping text lines.

All assets are managed in `backend/assets/` and routed automatically:
- **`velocity_transparent_black.png`**: Loaded defensively for White Background structures (PDFs and Survival Kits).
- **`velocity_transparent1.png`**: Loaded for Dark Background HTML structures (The automated outbound emails).
- **`velocity_transparent_white.png`**: Loaded natively into the Dark-themed `pptx.js` engine templates.

---

## Environment Variables

### Backend (`.env`)

```env
# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Auth
JWT_SECRET=your-secure-jwt-secret

# AI Provider
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your-deepseek-key

# SMTP Dispatcher
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM=noreply@velocitytechnology.group
CONTACT_EMAIL=benny@velocitytechnology.group   # Destination for Contact Me triggers

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Additional Integrations
VBOUT_API_KEY=your-vbout-api-key
VBOUT_LIST_ID=185960
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:3001   # Must point to your Coolify Backend URL in prod
```

---

## API Endpoints

| Endpoint | Method | Security | Description |
|----------|--------|----------|-------------|
| `/api/assessment/submit` | POST | Public | Calculates scoring, orchestrates AI generation, triggers Vbout CRM, generates 3 document arrays, sends customer email, and returns JWT string. |
| `/api/assessment/contact-me`| POST | Public | Assembles lead data into an HTML template and directly emails the Internal `CONTACT_EMAIL` with attached files. |
| `/api/assessment/by-token/:token` | GET | Token | Authorizes and decrypts JWT to rebuild frontend portal dashboard. |
| `/api/health` | GET | Public | Coolify Healthcheck Endpoint |

---

## Deployment 

This application adopts a hybrid-deployment strategy optimized for minimal overhead:

### 1. Frontend (Cloudflare Pages)
Fully serverless edge networking using GitHub integration or Wrangler.
```bash
cd svi-preview
npm install
npm run build
wrangler pages deploy dist --project-name=ai-defense-frontend
```

### 2. Backend (Coolify VPS)
Standard tracked Docker Compose orchestration.
1. Sync `ai-defense-project` on Coolify.
2. Direct the start command against `docker-compose.backend.yml`.
3. Set your production environment variables in the Coolify GUI. 
4. Traffic is routed via Traefik.
