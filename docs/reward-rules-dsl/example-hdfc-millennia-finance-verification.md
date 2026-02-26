# HDFC Millennia rule set — Finance verification

**Finance** — Cross-check of the example rule set against the card catalog. No guessing; stop where information is insufficient.

**Catalog:** `apps/backend/src/db/data/hdfc-millennia.json`  
**Rule set:** `apps/backend/src/db/data/rule-sets/hdfc-millennia.json`  
**Example doc:** `docs/reward-rules-dsl/example-hdfc-millennia.md`

---

## Validation findings

- **Milestone (rule set ↔ catalog).** Catalog `milestones[0]`: threshold 100000, period "quarterly", declaredReward "Gift voucher worth ₹1,000 or one domestic lounge visit". Rule set: threshold 100000, period quarterly, same declaredReward, sourceMilestoneIndex 0. **Agree.**

- **5% rate and cap (constraint [0]).** Catalog: "5% cashback capped at 1,000 cashback points per statement cycle". Rule set: category_rate shopping 5 per ₹100, cap shopping 1000/month. Rate and cap value match. Category "shopping" is an interpretation of "select online merchants" (benefits list Amazon, Flipkart, Myntra, Swiggy, etc.). **Agree** with the caveat that shopping = select online for this card is a mapping choice; document it.

- **1% rate and cap (constraint [1]).** Catalog: "1% cashback capped at 1,000 cashback points per statement cycle". Rule set: category_rate other 1 per ₹100, cap other 1000/month. **Agree.**

- **Exclusions (constraint [2]).** Catalog: "Cashback is not applicable on fuel, rent, government transactions and certain wallet loads". Rule set: exclusions for fuel, rent, wallet_load only. **Partial:** fuel, rent, wallet_load are correct. **Government transactions** are excluded in the catalog but not represented in the rule set — there is no "government" in SpendCategory; only OTHER. Adding an exclusion for OTHER would wrongly remove 1% from all other spends. So either we document "government excluded per MITC but not modeled as a category in v1" or we introduce a category later. **Inconsistency below.**

- **Reward unit.** Catalog rewardCurrency = "cashback". Rule set uses same unit for rate and cap. **Agree.**

- **Traceability.** Rules point to correct declaredConstraint and milestone indices. **Agree.**

---

## Inconsistencies

1. **Government transactions.** Constraint [2] explicitly excludes "government transactions". The rule set has no exclusion that captures this (no GOVERNMENT in SpendCategory; using OTHER would be overbroad). So the rule set is **weaker** than the catalog: we do not enforce "no reward on government" in the DSL. **Required:** Document in the example or interpretation strategy that "government transactions" remain excluded per MITC but are not modeled as a separate category in v1; the engine or categorization layer may map some transactions to a government-related bucket later.

2. **Statement cycle vs monthly.** Catalog says "per statement cycle"; rule set uses period "monthly". Statement cycle is often ~one month but can be 20th–19th or similar. Treating "statement cycle" as "monthly" is a **proxy**. **Required:** Document that cap period is interpreted as calendar month for v1; when statement boundaries are available, the engine may apply caps per statement cycle instead.

---

## Required clarifications

- **Sign-off condition.** For Finance to sign off the example: (1) The two items above (government, statement cycle) must be documented as known limitations or mapping choices. (2) Confirm that "shopping" is the intended mapping for "select online merchants" for this card (and that no other category is used for 5% elsewhere). Once documented, the rule set is **acceptable** as the one-card example for DSL v1; no invented rates or caps; only category and period interpretations are clarified.

- **No other rules.** Catalog has no other constraints that define reward rates or caps. Lounge, fuel surcharge waiver, and redemption value (constraints [3], [4], [5]) are not reward-earning rules; they are correctly omitted from the rule set. **OK.**

---

## Verdict

**Agree with the reward rules as stated**, subject to:

1. Documenting that **government transactions** are excluded per MITC but not modeled in the rule set (v1 category taxonomy has no government category; do not use OTHER as a proxy for government).
2. Documenting that **statement cycle** is interpreted as **calendar month** for cap period in v1; engine may refine when statement dates exist.
3. Explicitly stating that **shopping** = "select online merchants" for HDFC Millennia in this example.

After these are added to the example doc or interpretation strategy, Finance (or designated validator) can sign off the example for DSL v1 freeze.
