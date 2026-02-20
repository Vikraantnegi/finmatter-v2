# FinMatter — App Context

**Single source of context for anyone (human or AI) working on this repo.** Read this to understand what we’re building, how we’re building it, and what’s already there.

---

## What We’re Building

**FinMatter** is a **credit-card–first** personal finance platform for **India**. It helps users:

- Ingest and normalize transactions (email statements, SMS; later Account Aggregator)
- Categorize spends and track cards they own
- **Calculate rewards deterministically** (category acceleration, caps, milestones)
- **Optimize which card to use** per spend and surface missed rewards
- **Recommend better cards** from real spend patterns with clear “why”
- Use a **personal financial AI assistant** that answers questions over real data—explaining, not deciding

**Success metric:** _“I know which card to use, why, and what I gained.”_

**Target user:** Urban Indian credit card user, 2–6 cards, wants clarity and optimization, not gamification noise.

---

## Non-Negotiable Focus

- **Credit cards only** (India)
- **Rewards, milestones, benefits** — optimization and explainability
- **Accuracy > creativity** — every recommendation explainable
- **Deterministic money math** — AI explains and assists; it never invents rules or overrides calculations

---

## What We Explicitly Do NOT Do

- Investments (stocks, MF, crypto)
- Loans or BNPL
- Credit score coaching (initially)
- Generic budgeting for non-card spends
- Financial advice beyond credit cards

---

## Tech Stack (at a glance)

| Layer           | Choice                                           |
| --------------- | ------------------------------------------------ |
| Mobile          | React Native (Expo)                              |
| Backend / Web   | Next.js (App Router, API routes, server actions) |
| Database & Auth | Supabase (Postgres)                              |
| Rewards engine  | Pure TypeScript (deterministic, versioned)       |
| AI local        | Ollama (Qwen, LLaMA, Mistral)                    |
| AI hosted       | Claude (primary)                                 |
| Repo            | pnpm workspaces (apps/_, packages/_)             |

Rewards engine lives as a **TypeScript module** (e.g. `packages/rewards` or similar): deterministic, testable, no DB access from engines. AI is used for categorization fallback, parsing, and explanations—**never** for reward calculation or card benefit invention.

---

## AI Philosophy (Critical)

- **AI assists; it never decides money.** All reward math is deterministic.
- **AI may:** explain, categorize (with fallback), summarize, validate.
- **AI must never:** invent card benefits, guess reward rules, override calculations.
- Tool-calling / agent layer: explicit tools, permissioned access, auditable—OpenClaw-style thinking.

---

## How We Work: Phases & Milestones

Build order is **dependency-first**. See [phase.md](../phase.md) and [milestones.md](../milestones.md) for full detail.

1. **Phase 1 — Domain modeling**  
   Transaction schema, Credit Card catalog schema, **Reward Rules DSL**. Everything else depends on this.

2. **Phase 2 — Deterministic engines**  
   Rewards calculation, cap tracking, milestone tracker, what-if simulation. No UI, no AI—correctness only.

3. **Phase 3 — Backend APIs**  
   Ingest, rewards, optimization, recommendations. Expose engines cleanly.

4. **Phase 4 — Mobile MVP**  
   Transactions, rewards dashboard, optimization insights, basic recommendations.

5. **Phase 5 — AI Assistant (last)**  
   Natural language over real data; tool-calling only; never override deterministic logic.

**Principle:** AI comes **after** correctness. Domain and engines first.

---

## Agent Workflow (Design & Validation)

We use **sub-agents** for design and validation, not for greenfield design:

1. **Human** writes a short design brief (goals, non-goals, constraints, open questions).
2. **Product-owner agent** refines requirements and flags ambiguity.
3. **Developer agent** proposes data models, APIs, module structure—does not invent business rules.
4. **Tester agent** breaks the design (edge cases, failure modes, fintech risks).
5. **Finance agent** validates reward/financial logic; never guesses missing values.

Agents live in `packages/ai/agents/` (product-owner, developer, tester, finance); runner: `packages/ai/run-agent.ts` (Ollama). See [sub-agents-flow.md](../sub-agents-flow.md).

---

## Repo Layout & Current State

- **apps/backend** — Business logic (parsing, normalization, categorization). No HTTP server; consumed by web-api. See [statement-ingestion-plan.md](statement-ingestion-plan.md).
- **apps/web-api** — Next.js (App Router); API routes and server actions; delegates to `@finmatter/backend`. Currently default scaffold (no APIs or Supabase yet).
- **apps/mobile** — Expo app; currently a single “FinMatter” screen.
- **packages/ai** — Agent runner + role prompts (product-owner, developer, tester, finance).
- **packages/domain** — Shared types: transaction (raw → normalized → categorized), spend category. Used by backend and web-api.
- **packages/** — No `rewards` package yet; Phase 1/2 will add it.

**Next:** Statement ingestion Step 1 (PDF text extraction), then bank-specific detection + parsing (Step 2). Then Credit Card catalog, Reward Rules DSL, Phase 2 engines.

---

## Key Docs Index

| Doc                                                        | Purpose                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------- |
| [docs/product-canon.md](product-canon.md)                  | Vision, scope, non-goals, AI philosophy, trust                      |
| [phase.md](../phase.md)                                    | Phase-by-phase roadmap and deliverables                             |
| [milestones.md](../milestones.md)                          | Product milestones and phase mapping                                |
| [tech-stack.md](../tech-stack.md)                          | Full stack breakdown and rationale                                  |
| [product-list.md](../product-list.md)                      | Backend vs frontend responsibilities per product                    |
| [sub-agents-flow.md](../sub-agents-flow.md)                | How to use sub-agents for design and validation                     |
| [statement-ingestion-plan.md](statement-ingestion-plan.md) | Statement upload, text extraction, bank detection, parsing pipeline |

---

_Last updated to reflect product canon, phase roadmap, milestones, tech stack, and current repo state._
