# Reward Rules DSL — Interpretation strategy

How we go from catalog to rule set, where rule sets live, and semantics required by Finance. No execution logic here; engine (Phase 2) consumes rule sets + canonical transactions.

---

## Units and semantics (Finance clarifications)

- **Rate denominator:** Category rate is **per ₹100 spend**. All rates use this denominator.
- **Reward unit:** The unit (points, cashback, miles, neucoins) is the card’s **rewardCurrency** from the catalog. Rate and cap are in the same unit.
- **Cap:** Cap is in the same unit as the card’s rewardCurrency and applies **per period** (monthly/quarterly/yearly). Per-category cap: `category` set. Global cap: `category` omitted.
- **Milestone threshold:** Always **INR**. The engine compares against canonical transaction amounts (INR). No currency conversion in v1.
- **Exclusion:** “No reward for this category” = apply no rate and no cap for that category. Excluded category is **not** counted toward any cap unless the rule set explicitly defines a rule that includes it.

---

## How we produce a CardRuleSet

- **Milestones:** Derived from catalog `milestones[]`: each entry becomes a `MilestoneRule` (threshold, period, declaredReward; optional rewardUnits). Optional `sourceMilestoneIndex` for traceability.
- **Category rates, caps, exclusions:** From a **manual rule set** per card (e.g. JSON in `apps/backend/src/db/data/rule-sets/{cardId}.json`). Each rule references catalog via optional `sourceConstraintIndex` / `sourceRef`. No auto-parsing of `declaredConstraints[].description` in v1.
- **Where rule sets live:** Repo file per card: `apps/backend/src/db/data/rule-sets/<cardId>.json`. Alternative: DB table keyed by cardId; decision is implementation. Must be able to resolve a `CardRuleSet` for a given catalog card id.

---

## Rule order and “which rule applies”

- **Order of application (for engine):** (1) Exclusions first — if category is excluded, no rate and no cap for that category. (2) Category rate for the category (if not excluded). (3) Cap for that category (or global) per period. (4) Milestones evaluated per period.
- **One unambiguous answer:** For (card, category, period), the rule set must yield exactly one effective rate and one applicable cap (or “no reward” if excluded). Period-for-rates: we treat rate as **per transaction** (earn N per ₹100 on each txn); caps are **per period**. Documented so engine does not interpret differently.

---

## Adding a new card’s rules

- **Manual only:** From MITC / bank_site + catalog `declaredConstraints` and `milestones`. No AI-invented rules.
- **Sign-off:** Finance (or designated validator) signs off new or changed rule sets. For the **one example card** (M3), Finance signs off that the rule set matches the catalog/MITC and that the (card, category, period) → rule examples are correct before DSL v1 freeze.
- **Traceability:** Every rule should have `sourceConstraintIndex` or `sourceMilestoneIndex` or `sourceRef` where applicable.

---

## Example: HDFC Millennia (cardId: hdfc-millennia)

**Rule set file:** `apps/backend/src/db/data/rule-sets/hdfc-millennia.json`

**Example (card, category, period) → rule outcome:**

| Card            | Category  | Period   | Outcome |
|-----------------|-----------|----------|---------|
| hdfc-millennia  | shopping  | monthly  | Rate 5 per ₹100; cap 1000 cashback points per month. |
| hdfc-millennia  | other     | monthly  | Rate 1 per ₹100; cap 1000 cashback points per month. |
| hdfc-millennia  | fuel      | monthly  | Exclusion: no reward. |
| hdfc-millennia  | (any)     | quarterly| Milestone: if spend ≥ ₹1,00,000 in quarter → voucher/lounge (declaredReward). |

No ambiguity: exclusions apply first; then rate + cap per category; milestone is separate.
