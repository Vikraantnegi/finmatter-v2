# Phase 3 — Card Recommendation API (plan)

**Purpose:** Complete Phase 3 backend by adding a recommendation endpoint that, given a user’s real spend and a catalog of cards with rule sets, suggests cards that would outperform the user’s current baseline — with an auditable “why.”

**Lens:** Product Owner (scope, acceptance criteria) + Finance (no invented logic, traceable numbers). Implementation guide to follow after Finance verification.

---

## 1. Product Owner — Scope

### Problem statement

Users have optimization (“among my cards, which is best?”) but not answers to “which card(s) should I consider adding?” or “how much more would I earn with card X vs my current best?” We need an API that, for a given user and period, runs the same rewards engine over the same transaction set for a set of **candidate** cards (e.g. full catalog or a subset), compares each to a **baseline** (user’s current best), and returns only cards that beat the baseline — with incremental reward and explainable reasons.

### Goals

- **Recommend cards that beat baseline.** For (userId, period, baselineCardIds, optional candidateCardIds), compute rewards for each candidate on the **same** transaction set (all user tx in period). Baseline reward = best total reward among user’s cards (baselineCardIds). Recommend only cards whose total reward > baseline reward; no invented benefits.
- **Explainable “why.”** Every recommendation’s “why” must be traceable to rewards engine output (e.g. byCategory, totalReward, caps/milestones). No marketing copy, no guessed eligibility.
- **Engine-agnostic.** Recommendation layer only: fetch candidates, run existing rewards path (same as optimization), filter by incremental > 0, rank; no new reward logic.
- **Clear exclusions.** Caller sees which cards were skipped and why (e.g. no rule set; optional ineligible when eligibility is defined later).

### Non-goals

- **No invented benefits or eligibility.** If we don’t have a stored eligibility rule (e.g. min income), we do not guess; we do not add an “ineligible” bucket until such data exists.
- **No ML / heuristics.** No scoring model, no cohorts; only deterministic comparison vs baseline.
- **No UI.** Backend API only; Phase 4 consumes it.
- **No “when to get the card” or behavioral nudges.** That is Phase 4+.

### User stories and acceptance criteria

| ID | Story | Acceptance criteria |
|----|--------|---------------------|
| **R1** | As a **backend or app** I can request card recommendations for a user and period and get a list of cards that beat the user’s baseline. | AC1: An API accepts at least: user id, period (type + start/end), baselineCardIds (cards user owns). AC2: Candidates = optional list or full catalog (variant ids); same transaction set for all. AC3: Output includes baseline reward, list of recommendations (cardId, incrementalReward, and explainable reasons); cards without rule sets are excluded and listed. |
| **R2** | As a **user** I can see how much extra reward a recommended card would yield vs my current best. | AC1: “Incremental reward” = card’s total reward (on same tx set) − baseline reward. AC2: Baseline reward = max total reward among baselineCardIds (user’s cards). AC3: Only cards with incrementalReward > 0 are recommended. |
| **R3** | As a **user** I get a short, traceable explanation for each recommendation. | AC1: Explanation strings are derived only from rewards engine output (e.g. byCategory, totalReward). AC2: No invented rates or benefits; if we show “5% vs 1%” we must read that from rule/catalog data, not hardcode. AC3: v1 may use point deltas per category (e.g. “+X pts in shopping”) as in optimization. |
| **R4** | As a **developer** I see which cards were excluded and why. | AC1: Cards with no rule set are excluded and listed (e.g. excluded.noRuleSet). AC2: Optional excluded.ineligible only when we have a defined, stored eligibility notion; v1 can omit. AC3: Recommendations list only cards that have a rule set and beat baseline. |

### Ambiguities (flagged)

- **Candidate source when not provided.** Default: use catalog variant ids from GET /api/catalog (or server-side equivalent). Exclude baselineCardIds from candidates so we don’t “recommend” a card the user already has. **Document in implementation guide.**
- **Baseline when user has no cards.** If baselineCardIds is empty or none have rule sets: baseline reward = 0; all cards with rule sets that earn > 0 are candidates for recommendation. **Document.**
- **Explanation depth.** v1: same style as optimization (byCategory point deltas, “Best: X pts vs baseline Y pts”). Richer “5% on X vs 1%” requires exposing rate from rule set in API or engine output; defer to v2 if needed.
- **Eligibility.** v1 = no eligibility filtering; excluded = noRuleSet only. When catalog/backend gains eligibility fields and caller passes them, we can add excluded.ineligible.

---

## 2. Finance — Validation

### Rules (must hold)

| Rule | Requirement |
|------|-------------|
| Same engine | Recommendations use the same rewards engine and same transaction set as optimization; no duplicate or new reward logic. |
| Only cards with rule sets | Only cards that have a rule set are considered; no default or invented reward for others. Excluded list is explicit. |
| “Why” from engine | Every explanation traces to engine output (periodSummary.byCategory, totalReward, etc.); no invented rates or benefits. |
| No invented eligibility | We do not guess or invent eligibility; ineligible bucket only when we have real eligibility data. |
| Incremental = subtraction | incrementalReward = card total reward − baseline reward; no other formula. |
| Baseline = max of user’s cards | baselineReward = max over baselineCardIds of (total reward on same tx set); if none, baseline = 0. |

### Inconsistencies to avoid

- Do not add a “recommendation score” or weight that is not derived from engine output.
- Do not recommend cards the user already has in baselineCardIds (exclude them from candidate set).
- Do not infer or assume eligibility (income, relationship, etc.) without a defined source.

### Required clarifications before implementation

- **None** if the above rules and the API contract below are accepted. Baseline = max among baselineCardIds; candidates = catalog (or provided list) minus baseline; filter and rank by incremental reward only.

---

## 3. API contract (lock early)

**Endpoint (illustrative):** `POST /api/recommend/cards`

**Request**

- **Headers:** `x-user-id` (optional; default `test-user`).
- **Body:**

```json
{
  "userId": "...",
  "period": { "type": "monthly" | "quarterly" | "yearly", "start": "2025-01-01", "end": "2025-01-31" },
  "baselineCardIds": ["hdfc-millennia"],
  "candidateCardIds": ["amex-mrcc", "axis-ace"]
}
```

- `userId`: optional; overrides header if provided.
- `period`: required; same shape as optimization.
- `baselineCardIds`: required (may be empty). Cards the user owns; baseline reward = max total reward among these (same tx set).
- `candidateCardIds`: optional. If omitted, candidates = all catalog variant ids (from catalog API) minus baselineCardIds. If provided, use this list minus baselineCardIds.

**Response 200**

```json
{
  "baselineReward": 600,
  "baselineCardId": "hdfc-millennia",
  "recommendations": [
    {
      "cardId": "amex-mrcc",
      "totalReward": 720,
      "incrementalReward": 120,
      "bestCategories": ["dining", "shopping"],
      "explanation": [
        "Higher reward in dining vs baseline",
        "Higher reward in shopping vs baseline"
      ]
    }
  ],
  "excluded": {
    "noRuleSet": ["axis-ace"],
    "ineligible": []
  }
}
```

- `baselineReward`: max total reward among baselineCardIds on the same transaction set; 0 if none.
- `baselineCardId`: card id that achieved baseline reward (for display).
- `recommendations`: only cards with rule set and totalReward > baselineReward, ordered by incrementalReward descending.
- `bestCategories`: categories where this card beats baseline (from byCategory comparison); v1 = list of category keys.
- `explanation`: v1 = short strings derived from engine output (e.g. “Higher reward in X vs baseline” from byCategory); no invented rates.
- `excluded.noRuleSet`: candidate card ids that were skipped (no rule set).
- `excluded.ineligible`: optional; v1 may be empty array; future use when eligibility is defined.

**Response 400:** Missing/invalid period or baselineCardIds not an array.

**Response 503:** Supabase not configured.

---

## 4. Comparison with earlier proposal

| Aspect | User proposal | This plan | Notes |
|--------|----------------|-----------|-------|
| Endpoint | POST /api/recommend/cards | Same | Kept. |
| baselineCardIds | Optional | **Required** (may be []) | Clearer: we always need “user’s cards” to define baseline; empty = baseline 0. |
| candidateCardIds | Optional; else full catalog | Same | Kept; default = catalog minus baseline. |
| baselineReward | Yes | Yes; add baselineCardId | So client can show “vs your current best (X)”. |
| incrementalReward | Yes | Yes | Same; = totalReward − baselineReward. |
| bestCategories | Yes | Yes | Same. |
| explanation | Array of strings | Same; v1 from byCategory | No invented “5% vs 1%” unless we expose rate; v1 = point/category deltas. |
| excluded (noRuleSet, ineligible) | Yes | Same; ineligible optional | Kept; ineligible only when we have real eligibility data. |
| Filtering + ranking | Beat baseline; rank by incremental | Same | No ML; pure comparison. |

Refinements made here: baselineCardIds required (can be empty); explicit baselineCardId in response; explanation v1 scoped to engine output only; eligibility excluded only when defined.

---

## 5. Implementation order (for implementation guide)

| Step | What |
|------|------|
| 1 | **Contract** — Lock request/response in API.md; document baseline = max(baselineCardIds), candidates = catalog \ baseline when candidateCardIds omitted. |
| 2 | **Resolve candidates** — If candidateCardIds omitted, fetch catalog variant ids (e.g. from Supabase card_variants or existing catalog API); remove baselineCardIds. |
| 3 | **Same tx set + run engine** — Reuse fetchAllUserTransactionsInPeriod; for each candidate (and each baseline card), load rule set, run computeRewardsCore; skip and add to excluded.noRuleSet if no rule set. |
| 4 | **Baseline** — baselineReward = max of totals for baselineCardIds; baselineCardId = that card. |
| 5 | **Filter + rank** — Keep only cards with totalReward > baselineReward; sort by incrementalReward descending. |
| 6 | **Explain** — For each recommendation, bestCategories = categories where card’s byCategory[cat] > baseline’s; explanation = short strings from byCategory deltas (v1). |
| 7 | **Tests** — Mock rule set loader and engine; assert baseline 0 when no baseline cards; exclude no rule set; only positive incremental in recommendations; ordering. |

---

## 6. Summary

- **PO:** Recommendation API = same tx set, run engine for baseline + candidates, baseline = max(user’s cards), recommend only cards that beat baseline; explainable from engine output; exclusions explicit.
- **Finance:** No new reward logic; no invented benefits or eligibility; incremental = subtraction; “why” traceable to engine.
- **Next:** Finance sign-off on this plan → implementation guide (same style as optimization) → build.
