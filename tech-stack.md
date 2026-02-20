# FinMatter — Recommended Tech Stack (2026-ready)

Breakdown by layer.

---

## 1. Frontend (Mobile-first, trust-centric)

**Choice:** React Native (Expo)

### Why

- One codebase for iOS + Android
- Excellent for fintech UX
- Fast iteration
- Good ecosystem for charts, biometrics, notifications

### Key libs

- **Expo** — managed → bare later if needed
- **React Navigation**
- **Zustand** — simple state
- **React Query / SWR**
- **Reanimated + Gesture Handler**
- **Victory / Recharts** — charts

> **Note:** Avoid Flutter unless you already know it.

### Optional (later)

- **Next.js** — Web Dashboard + Marketing
  - Same design system
  - Share logic
  - SEO-friendly

---

## 2. Backend (speed + AI friendliness)

**Choice:** Next.js (App Router) for Backend APIs

### Why

- You already know it
- Co-located APIs
- Easy auth integration
- Works great with Supabase
- Simple to deploy

### Use

- Route Handlers (`/app/api`)
- Server Actions (internal tools)
- Edge only where needed

### Why not Java first?

Java is great, but:

- Slower iteration
- Heavier infra
- Overkill for MVP

You can add Java later for:

- Rewards engine v2
- Heavy analytics
- Batch jobs

---

## 3. Database & Auth (boring, reliable)

**Choice:** Supabase (Postgres)

### Why

- Managed Postgres
- Auth out of the box
- Row Level Security (huge for fintech)
- Storage (PDFs)
- Realtime if needed
- Great local dev

### Use

- Postgres as source of truth
- SQL for reward rules
- Supabase Auth (OTP + OAuth)

### Optional later

- Redis (caching)
- ClickHouse (analytics)

---

## 4. Data Ingestion Layer (critical)

- Email & SMS ingestion
- Backend cron jobs
- Webhooks (later)
- Regex + LLM-assisted parsing

> **Note:** Keep this non-AI first, then AI-assisted.

---

## 5. Rewards & Optimization Engine (most important)

**Choice:** Pure TypeScript module (initially)

### Why

- Deterministic
- Testable
- Shared across backend
- Easy to refactor later

### Design it as

```
rewards/
  cards/
  rules/
  calculators/
  simulators/
```

### Later migration path

- Java microservice
- Rust for extreme performance

_But not now._

---

## 6. AI Stack (this is where we're careful)

### Local LLMs — Ollama

**Models:**

- Qwen 2.5
- LLaMA 3.x
- Mistral

**Use for:**

- Transaction categorization
- Parsing unstructured text
- Explanation drafts
- Low-risk tasks

### Hosted LLMs

- **Anthropic (Claude)** — primary
- Optional: OpenAI as fallback

**Use for:**

- Deep reasoning
- Portfolio optimization narratives
- Long chats

### Agent Architecture

- Sub-agents per role
- Tool calling only
- No DB access
- Deterministic core

_(We'll design this later.)_

---

## 7. Tool / Agent Security Layer

- **OpenClaw-style pattern** — not necessarily the library, but the idea:
  - Explicit tools
  - Permissioned access
  - Auditable calls

This is **non-negotiable** in fintech.

---

## 8. Notifications & Jobs

- Expo push notifications
- Supabase cron / Vercel cron
- Email (Resend / SES)
- Payment reminders
- Milestones

---

## 9. Dev Tooling (your Mac setup)

- Homebrew
- Node via nvm
- Java via sdkman
- Docker (later)
- Ollama local
- Cursor / Claude Code
- GitHub Actions

---

## 10. Deployment

### MVP

- Vercel (Next.js)
- Supabase Cloud

### Scale

- Dedicated backend
- Job workers
- Regional data localization

---

## Stack Summary (at a glance)

| Layer          | Choice                 |
| -------------- | ---------------------- |
| Mobile         | React Native (Expo)    |
| Web            | Next.js                |
| Backend        | Next.js API            |
| DB             | Supabase (Postgres)    |
| Auth           | Supabase               |
| Rewards Engine | TypeScript             |
| AI Local       | Ollama                 |
| AI Hosted      | Claude                 |
| Agents         | Sub-agent architecture |
| Infra          | Vercel + Supabase      |
