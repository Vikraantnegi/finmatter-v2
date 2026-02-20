# FinMatter — Product / App Milestones

High-level milestones aligned with the [phase roadmap](phase.md). Order is dependency-first: each milestone unlocks the next.

---

## Milestone 1 — Transaction Foundation

Define how user spending enters the system.

- Raw → normalized → categorized transaction model
- Immutable transaction ledger
- Category taxonomy

👉 Without this, nothing else exists.

---

## Milestone 2 — Credit Card Catalog

Create a single source of truth for Indian credit cards.

- Card metadata (bank, variant, network)
- Fees, milestones, benefits
- Versioned & verifiable data

👉 Without this, rewards & recommendations are impossible.

---

## Milestone 3 — Reward Rules DSL (Core IP)

Define how rewards are represented and calculated.

- Category acceleration
- Caps & limits (monthly / annual)
- Milestone tracking
- Recomputable history

👉 This is the heart of FinMatter.

---

## Milestone 4 — Deterministic Engines

Turn rules + transactions into correct, explainable outputs.

- Rewards calculation engine
- Cap tracking engine
- Milestone tracker
- What-if simulation

👉 Money correctness must be bulletproof. No UI, no AI—just correctness.

---

## Milestone 5 — Spend Optimization Engine

Decide which card should be used for which spend.

- Suboptimal spend detection
- Best-card routing per category
- Missed reward insights
- Predictive milestone reach

👉 This creates daily user value.

---

## Milestone 6 — Card Recommendation Engine

Improve the user’s card stack from real spend data.

- Spend-based eligibility scoring
- Upgrade vs new card logic
- ROI-driven recommendations
- Explainable “why this card”

👉 This is growth + retention.

---

## Milestone 7 — Backend APIs

Expose all engines cleanly to clients.

- Ingest transactions
- Query rewards
- Fetch optimization insights
- Card recommendation endpoints

👉 Now the product is usable by clients.

---

## Milestone 8 — Mobile MVP

Make FinMatter visible and usable.

- Transaction view
- Rewards dashboard
- Optimization insights
- Basic card recommendations

👉 First real user experience.

---

## Milestone 9 — AI Assistant (Last)

Explain, summarize, and assist—safely.

- Natural language queries over real data
- Reward & spend explanations
- Tool-calling only (no financial decisions)
- Never override deterministic logic

👉 AI enhances trust, not logic.

---

## Phase ↔ Milestone Mapping

| Phase                     | Milestones                                |
| ------------------------- | ----------------------------------------- |
| 1 — Domain Modeling       | 1, 2, 3 (Transaction, Catalog, Rules DSL) |
| 2 — Deterministic Engines | 4 (Rewards, caps, milestones, what-if)    |
| 3 — Backend APIs          | 7                                         |
| 4 — Mobile MVP            | 8                                         |
| 5 — AI Assistant          | 9                                         |

_Spend optimization (5) and card recommendation (6) are designed in Phase 2 and exposed via Phase 3._
