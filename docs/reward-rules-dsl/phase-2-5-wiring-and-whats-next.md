# Phase 2.5 — Wiring & what’s next

**Purpose:** Confirm the order of work after the rewards engine (Phase 2) is done.

**Plan (PO):** `phase-2-5-plan.md` — problem, goals, user stories, acceptance criteria, steps.  
**Finance verification:** `phase-2-5-plan-finance-verification.md`. Wiring comes before Spend Optimization; it’s a dependency boundary, not just preference.

---

## Why wiring comes before Spend Optimization

### 1. Spend Optimization depends on a Rewards API

The Spend Optimization Engine does **not** calculate rewards. It:

- Compares **actual rewards earned** vs **best possible rewards**
- Needs a callable primitive: `computeRewards(cardId, transactions, period)`

If that primitive exists only as a package function and not as a backend service:

- You can’t compare across cards cleanly
- You can’t persist or cache results
- You can’t attach results to a user, statement, or period

Optimization **consumes** rewards; it does not replace them.

### 2. Backend wiring is the “contract freeze”

Wiring the engine forces real system decisions:

- Where do rule sets live? (FS vs DB)
- How do we resolve cardId → ruleSet?
- What’s the canonical rewards API shape?
- Do we persist results or compute on demand?
- What period boundary does the app use?

Once answered, everything built on top is simpler. Same pattern as: Transaction Foundation → pipeline → storage; Catalog v1 → freeze → DSL → engine.

### 3. Spend Optimization should be engine-agnostic

The optimization layer should say: *“For this same set of transactions, if I swap cardId, what happens?”*

So it:

- Calls the **same rewards API** repeatedly
- Does **not** know about caps, milestones, exclusions
- Reasons only over **outputs**

If you skip wiring and build optimization first, you either duplicate reward logic or couple optimization to engine internals.

---

## Correct order (confirmed)

### ✅ Immediate next step — Backend adapter (Phase 2.5)

- Backend service / API that:
  - Resolves **cardId → ruleSet** (FS or DB)
  - Fetches **canonical transactions** for (user, card, period)
  - Calls **computeRewardsCore(ruleSet, transactions, period)**
  - Returns **perTransactionRewards** and **periodSummary**
  - Optionally **persists** period summary

This is “making the engine real” — Phase 2.5, not Phase 3.

### 🔁 In parallel or next — Statement ingestion

- Optimization without real spend = theoretical
- Rewards API without real spend = demo-only
- Continue or finish statement ingestion in parallel or right after wiring. No conflict.

### 🚀 Then Phase 3 — Spend Optimization Engine

Only after the rewards API exists:

- **Inputs:** Canonical transactions, reward results from Phase 2, multiple card rule sets
- **Questions:** “Which card should I have used?” “How much reward did I miss?” “Best card for groceries/dining/fuel?”
- **Outputs:** Missed rewards per transaction, best-card routing per category, explainable recommendations
- **No new parsing or finance math** — just comparison + explanation

Optimization = run rewards engine N times, compare outputs.

---

## Summary

| Step | What |
|------|------|
| **Next** | Wire rewards engine to backend (API + adapter, rule resolution, transaction fetch, optional persistence) |
| **Then / parallel** | Finish statement ingestion |
| **After that** | Spend Optimization Engine (best-card routing, missed rewards, “why” explanations, what-if) |
