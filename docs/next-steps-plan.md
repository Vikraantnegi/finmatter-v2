# Next Steps Plan — Product Owner & Finance Verification

**Authoritative plan:** The single source of truth for product identity, milestones, and scope is **[docs/cumulative-product-milestone-plan.md](cumulative-product-milestone-plan.md)**. It includes the full cumulative product & milestone plan and Finance verification. This doc is a shorter reference; use the cumulative plan for scope decisions and receipts.

---

# Part 1 — Product Owner: Plan Forward

## Current state (truth table)

| Layer | Status | Notes |
|-------|--------|-------|
| **Milestone 1 — Transaction Foundation** | ✅ | Raw → normalized → categorized; canonical_transactions; category taxonomy. |
| **Milestone 2 — Credit Card Catalog** | ✅ | card_variants, variant schema; catalog API. |
| **Milestone 3 — Reward Rules DSL** | ✅ | CardRuleSet, rules (category, rate, caps, milestones); rule-sets per card. |
| **Milestone 4 — Deterministic Engines** | ✅ | Rewards engine (pure TS); caps, milestones in engine; tested. |
| **Milestone 5 — Spend Optimization** | ✅ | Same tx set; compare cards; best card, missed reward, byCategory. |
| **Milestone 6 — Card Recommendation** | ✅ | Same tx set; baseline = max(user’s cards); recommend cards that beat baseline; explainable. |
| **Milestone 7 — Backend APIs** | ✅ | Ingest (upload/parse), rewards, optimize, recommend, catalog, canonical-transactions. |
| **Milestone 8 — Mobile MVP** | ❌ | Not started. |
| **Milestone 9 — AI Assistant** | ❌ | Not started. |

**Conclusion:** Phases 1–3 are complete. The next product milestones are **Milestone 8 (Mobile MVP)** and then **Milestone 9 (AI Assistant)**.

---

## Problem statement (what’s next)

Users have no way to **see** their data or act on it in-app. Backend can ingest transactions, compute rewards, run optimization, and recommend cards—but there is no first-run experience, no transaction list, no rewards view, and no optimization/recommendation UI. We need a **Mobile MVP** that exposes existing APIs so the user can reach the success metric: *“I know which card to use, why, and what I gained.”* After that, we add an **AI Assistant** that explains and answers over the same data without inventing or overriding money logic.

---

## Goals

- **Ship Mobile MVP (Milestone 8).** Deliver the first usable product: user can view transactions, see rewards (per card/period), see optimization insights (best card, missed reward, by category), and see basic card recommendations (cards that beat baseline). All numbers and “why” come from existing APIs; no new reward or eligibility logic in the app.
- **Define and then ship AI Assistant (Milestone 9).** Natural-language layer over real data: explain rewards, spends, optimizations; tool-calling into deterministic engines only; never invent benefits or override calculations.
- **Keep a single source of truth.** All reward math stays in the rewards engine; optimization and recommendation remain comparison/orchestration only; UI and AI consume, they do not compute.

---

## Non-goals (explicit)

- **No new reward logic in mobile or AI.** No new caps, rates, milestones, or eligibility in the client or agent.
- **No “user’s cards” persistence in this plan.** Mobile MVP may pass baseline/card lists from user selection or a simple local/profile store; a full “my cards” backend entity can be a later milestone if needed.
- **No SMS/Account Aggregator ingestion in MVP.** Transaction ingestion for MVP = statement upload + parse only.
- **No investments, loans, BNPL, credit score, or generic budgeting.** Credit cards only (India).
- **No ML/heuristics for recommendations.** Recommendation stays deterministic (beat baseline, explainable from engine); no scoring model or cohorts in this plan.

---

## End goals / features (product view)

| # | Feature / goal | Milestone | Brief |
|---|-----------------|-----------|--------|
| 1 | **View my transactions** | 8 | List canonical transactions (from API); filters/period if needed. |
| 2 | **See my rewards** | 8 | Per card, per period: total reward, by category; from GET /api/rewards. |
| 3 | **Optimization insights** | 8 | Best card, missed reward, by-category best; from POST /api/optimize/rewards. |
| 4 | **Card recommendations** | 8 | Cards that beat my baseline, incremental reward, why; from POST /api/recommend/cards. |
| 5 | **AI explanations** | 9 | Answer questions over my data; explain rewards/optimization/recommendations; tools only. |
| 6 | **Trust & explainability** | 8 & 9 | Every number traceable to engine/API; no invented benefits. |

Billing cycles, due dates, and “predictive milestone reach” (product canon) are **out of scope for MVP**; they can be later enhancements once MVP is live.

---

## User stories and acceptance criteria (next steps)

### Milestone 8 — Mobile MVP

| ID | Story | Acceptance criteria |
|----|--------|---------------------|
| **M8.1** | As a **user** I can see my transactions for a chosen period. | AC1: Screen shows transactions from GET /api/canonical-transactions (or period-filtered). AC2: User can choose period or card if the API supports it (or we add minimal query). AC3: Data is read-only; no edit/delete in MVP. |
| **M8.2** | As a **user** I can see rewards for a card and period. | AC1: User selects card (and period); app calls GET /api/rewards. AC2: UI shows total reward and, if available, by-category breakdown from periodSummary. AC3: No reward calculation in the app; all from API. |
| **M8.3** | As a **user** I can see which card was best and how much I missed. | AC1: User selects period and cards (e.g. my cards); app calls POST /api/optimize/rewards. AC2: UI shows bestCardId, missedReward, and optional byCategory. AC3: baselineCardId and comparison come from API only. |
| **M8.4** | As a **user** I can see card recommendations that beat my current baseline. | AC1: User has a way to set baseline cards (e.g. selection or simple profile); app calls POST /api/recommend/cards. AC2: UI shows recommendations with incrementalReward, bestCategories, explanation. AC3: excluded (e.g. noRuleSet) visible where useful. |
| **M8.5** | As a **user** I have a single entry point to the app. | AC1: App opens to a clear home/dashboard that links to transactions, rewards, optimization, recommendations. AC2: Auth/user identity sufficient to call APIs (e.g. x-user-id or real auth when added). |

### Milestone 9 — AI Assistant

| ID | Story | Acceptance criteria |
|----|--------|---------------------|
| **M9.1** | As a **user** I can ask questions about my rewards and spend. | AC1: Assistant answers using real data (transactions, rewards, optimization, recommendations) via tools. AC2: Answers are explanations only; no invented numbers or benefits. AC3: If data is missing, assistant says so; does not guess. |
| **M9.2** | As a **developer** I can rely on tool-calling only for money data. | AC1: All reward/optimization/recommendation numbers come from existing APIs (or engine) via tools. AC2: AI never overrides or replaces deterministic outputs. AC3: No new financial logic in the assistant. |

---

## Ambiguities (flagged)

- **Auth for Mobile MVP.** Plan assumes x-user-id or equivalent is enough for MVP; real auth (e.g. Supabase Auth) can be added when needed. **Clarify before build:** who provides user id (device, login, etc.). |
- **“User’s cards” for optimization/recommendation.** Today the APIs accept card lists in the request. MVP can use user-selected cards or a simple stored list; a dedicated “my cards” API/entity is not required for MVP but may be needed later for a better UX. **Clarify:** is “selection on each screen” acceptable for MVP? |
- **Period and card list UX.** Optimization and recommendation need period + card ids. **Clarify:** default period (e.g. last month), default cards (e.g. from profile or empty). |
- **AI tool set.** Exact list of tools (e.g. get transactions, get rewards, get optimization, get recommendations) to be defined in an AI-specific design; this plan only constrains that tools call existing APIs and that AI does not invent logic. |

---

## Suggested order of work

| Order | What | Owner |
|-------|------|--------|
| 1 | **Mobile MVP scope freeze** — Confirm M8.1–M8.5 and AC; resolve auth and “my cards” for MVP. | PO |
| 2 | **Mobile implementation** — Home, transactions list, rewards screen, optimization screen, recommendations screen; call existing APIs only. | Developer |
| 3 | **AI Assistant design** — Tools (which APIs), prompts, guardrails; no new money logic. | PO + Developer |
| 4 | **AI Assistant implementation** — Tool-calling client, tools wrapping rewards/optimize/recommend/transactions; explanations only. | Developer |
| 5 | **Later (backlog)** — “My cards” persistence, billing/due dates, predictive milestone, SMS/AA ingestion. | — |

---

# Part 2 — Finance: Verification of the Plan

## Validation findings

| Check | Status | Comment |
|-------|--------|--------|
| **No new reward logic in plan** | ✅ | Mobile and AI only consume APIs; reward math remains in the engine. |
| **Optimization and recommendation unchanged** | ✅ | Plan does not add new comparison rules, eligibility, or scoring; they remain deterministic and explainable. |
| **Explainability preserved** | ✅ | MVP and AI must show “why” from API/engine output; no marketing copy or invented reasons. |
| **Single source of truth** | ✅ | Engine → APIs → UI/AI; no duplicate formulas. |
| **AI does not decide money** | ✅ | Assistant explains and answers via tools; never overrides or invents. |
| **Eligibility / benefits** | ✅ | No new eligibility or benefit invention; recommendation v1 remains as built. |

## Inconsistencies

- **None.** The plan does not introduce new financial or reward logic; it only adds a client (Mobile MVP) and an explanation layer (AI) on top of existing APIs.

## Required clarifications (Finance)

- **None** for sign-off on financial correctness, provided:
  - Mobile and AI **only** call existing APIs (rewards, optimize, recommend, catalog, canonical-transactions) and do not implement their own reward, optimization, or recommendation logic.
  - Any future “user’s cards” or eligibility feature continues to pass structured inputs to existing APIs and does not guess missing data (e.g. eligibility only when we have a defined source).
  - AI tool responses and prompts are designed so the model cannot invent card benefits, rates, or caps; any “why” must be traceable to API/engine output.

---

## Finance verdict

**Approved** for moving forward: the next steps (Mobile MVP, then AI Assistant) are scoped as **consumers** of existing deterministic APIs and engine. No new reward logic, no invented benefits, no override of calculations. Proceed with Milestone 8 scope freeze and implementation; then define and implement Milestone 9 under the same constraints.
