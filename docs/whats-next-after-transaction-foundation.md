# What’s Next After Transaction Foundation

**Transaction Foundation (v1) is done.** Canonical transactions are produced, persisted, and inspectable. Here’s where to go from here.

---

## Next: Milestone 2 — Credit Card Catalog

**Goal:** A single source of truth for Indian credit cards that the rewards engine and recommendations will use.

**Scope (from milestones.md):**

- Card metadata (bank, variant, network)
- Fees, milestones, benefits
- Versioned, verifiable data

**Why next:**  
Rewards and recommendations depend on “which card has what rules.” Without a catalog, you can’t compute rewards or suggest cards. Transaction Foundation gives you **spend data**; the catalog gives you **card + benefit data**.

**Order:**  
Do **Credit Card Catalog** before **Reward Rules DSL**. Rules reference cards and categories; the catalog defines the cards (and optionally high-level benefit shape). Then you can design the Reward Rules DSL (category acceleration, caps, milestones) on top of both transactions and catalog.

---

## After That (from milestones.md)

| Order | Milestone | What |
|-------|-----------|------|
| 2 | **Credit Card Catalog** | Cards, variants, fees, milestones, benefits (versioned). |
| 3 | **Reward Rules DSL** | How rewards are represented and calculated (category acceleration, caps, milestones). |
| 4 | **Deterministic Engines** | Rewards calc, cap tracking, milestone tracker, what-if simulation. |
| 5 | **Spend Optimization Engine** | Best-card routing, missed rewards, suboptimal spend detection. |
| 6 | **Card Recommendation Engine** | Spend-based recommendations, upgrade vs new card, explainable “why.” |

---

## References

- **Milestones:** `milestones.md`
- **Phases:** `phase.md`
- **App context:** `docs/app-context.md`
- **Transaction Foundation summary:** `docs/transaction-foundation-summary.md`
- **Transaction Foundation v1 freeze:** `docs/transaction-foundation-v1-freeze.md`

---

**TL;DR:** Next step is **Milestone 2 — Credit Card Catalog**. Design card + variant + benefit schema, version it, then move to Reward Rules DSL (Milestone 3).

---

## Milestone 2 — PRD and verification

- **PRD (Product Owner):** [docs/credit-card-catalog/milestone-2-catalog-prd.md](credit-card-catalog/milestone-2-catalog-prd.md) — Problem, goals, non-goals, user stories, acceptance criteria, scope for Catalog v1.
- **Finance verification:** [docs/credit-card-catalog/milestone-2-catalog-finance-verification.md](credit-card-catalog/milestone-2-catalog-finance-verification.md) — Validation findings, inconsistencies to avoid, required clarifications (caps scope, milestone definitions, benefit eligibility).
- **Developer plan:** [docs/credit-card-catalog/milestone-2-catalog-developer-plan.md](credit-card-catalog/milestone-2-catalog-developer-plan.md) — Steps, files, storage choice, schema, versioning, testing; no implementation until confirmed.
- **Process:** PO wrote PRD → Finance verified → Developer planned; proceed to implementation when confirmed; freeze Catalog v1 before designing Reward Rules DSL.
