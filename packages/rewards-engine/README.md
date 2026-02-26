# @finmatter/rewards-engine

Deterministic rewards engine (Phase 2). Pure TypeScript; no DB, no HTTP.

## API

- **Core (pure):** `computeRewardsCore(ruleSet, transactions, period)` → `{ perTransactionRewards, periodSummary }`
- **Per-tx:** `applyRulesToTransaction(tx, ruleSet)` → `PerTransactionReward` (provisional reward)
- **Aggregation:** `aggregatePeriod(txRewards, ruleSet, period)` → `PeriodRewardSummary` (caps + milestones)

**Eligible spend:** CREDIT type, non-excluded category. REFUND/DEBIT do not earn reward or count toward milestone.

**Period derivation (v1):** Calendar month, quarter, year. Period key from date: `getPeriodKey(dateIso, periodType)`. **Statement cycles ≠ calendar periods** — v1 uses calendar only; when statement boundaries exist, the engine may apply caps per statement cycle in a future version.

## Edge cases (locked in by tests)

- **Cap spillover:** `rewardAmount` = full provisional; `cappedAmount` = allowed portion only. Over-cap is reported in `capsHit[].overCap` (not lost).
- **Multiple caps (category + global):** When both exist, apply **category cap first**, then **global cap** (deterministic order). v1 HDFC Millennia has category caps only.

## Inputs

- `CardRuleSet` + `CategorizedTransaction[]` + `PeriodContext` (start/end ISO dates, type: monthly | quarterly | yearly)

## Outputs

- `PerTransactionReward`: transactionId, cardId, category, appliedRule, baseAmount, rewardAmount, cappedAmount?, excluded, explanation, transactionDate
- `PeriodRewardSummary`: period, totalReward, byCategory, capsHit, milestonesTriggered

## Order

1. Per transaction: exclusions → category rate → provisional reward
2. Per period: apply caps (in-memory running totals); then evaluate milestones (ascending threshold, once per period)

## Tests

- **Unit:** `applyRulesToTransaction` (excluded → 0, category rate, REFUND/DEBIT → 0); `computeRewardsCore` (cap partial/full, milestone not crossed / crossed / two in same period).
- **Integration:** HDFC Millennia — fuel excluded; shopping 5/100 cap 1000; other 1/100 cap 1000; quarterly ≥ ₹1L milestone. Run: `pnpm test`.
