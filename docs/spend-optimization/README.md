# Spend Optimization (Phase 3)

**Purpose:** Compare rewards across cards so we can answer “which card should I have used?” and “how much reward did I miss?” — without adding any new reward logic.

**Plan (PO):** [phase-3-plan.md](phase-3-plan.md) — problem, goals, user stories, acceptance criteria, steps.  
**Finance verification:** [phase-3-plan-finance-verification.md](phase-3-plan-finance-verification.md).  
**Implementation guide:** [phase-3-implementation-guide.md](phase-3-implementation-guide.md) — approved verdict, API contract, step-by-step build order.

**Prerequisite:** Phase 2.5 (Rewards API) done. Optimization calls the rewards API N times and compares outputs.

---

## Phase 3 completion — Card Recommendation API

**Plan (PO + Finance):** [phase-3-card-recommendation-plan.md](phase-3-card-recommendation-plan.md) — problem, goals, non-goals, user stories, acceptance criteria, Finance validation rules, API contract, implementation order.

**Purpose:** Given a user’s real spend and a catalog (or subset) of cards with rule sets, recommend cards that would outperform the user’s current baseline, with an auditable “why.” Recommendation = same transaction set + run engine for baseline and candidates + filter (beat baseline) + rank by incremental reward. No invented benefits or eligibility in v1.
