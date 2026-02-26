# Milestone 3 — Reward Rules DSL (Finance verification)

**Finance / Validation** — Verification of the Reward Rules DSL PRD against trust, no invented logic, and sufficiency for a deterministic engine.

---

## Validation findings

- **No invented financial logic.** The PRD states that rule content (rates, caps, thresholds) comes from “human-curated data derived from the catalog (and MITC/bank_site)” and explicitly forbids guessing or inferring rules from prose. This satisfies Finance: we do not hallucinate card benefits or invent rules. **OK.**

- **No hallucinated benefits.** The DSL is a **representation** of rules only. Rule instances are created by manual rule sets that reference the catalog (and optionally constraint/milestone indices). Auto-derivation is limited to milestones from catalog (structured threshold + period + declaredReward), not from free text. No AI or auto-parsing of declaredConstraints prose in v1. **OK.**

- **Traceability.** Every rule can be linked to catalog via optional sourceConstraintIndex, sourceMilestoneIndex, sourceRef. The engine (later) and support can explain “this rule comes from that line.” Required for dispute handling and audit. **OK.**

- **Deterministic and unambiguous.** The PRD requires one unambiguous answer per (card, category, period). Ambiguities (period for rates, order of rate+cap, exclusion scope) are flagged for implementation. Finance view: these must be resolved before the engine runs; the PRD correctly defers resolution to implementation and interpretation policy. **OK.**

- **Catalog unchanged; rules adapt to catalog.** Catalog remains declaration-only. Rules reference catalog by card id and indices; the catalog is not extended to store executable rules. Order preserved: catalog is source of truth; DSL is the bridge. **OK.**

- **Interpretation policy and sign-off.** New cards’ rules are added manually from MITC/bank_site + catalog; no AI-invented rules; finance/product sign-off for new or changed rule sets. This prevents drift and keeps rule sets verifiable. **OK.**

- **One example card before freeze.** Requiring one full rule set and 2–3 (card, category, period) → rule examples with sign-off before “DSL v1 frozen” is sufficient to validate the representation without committing to all cards in M3. **OK.**

---

## Inconsistencies to avoid

- **Do not** allow the DSL or any tool to auto-generate category rates, caps, or exclusions from declaredConstraints prose. Only structured milestones may be derived from catalog; rates/caps/exclusions must come from manual rule sets with traceability.
- **Do not** let the engine (Phase 2) apply a rule when the rule set does not explicitly define it for that (card, category, period). “No rule” must mean zero reward for that combination, not a default or guessed rate.
- **Do not** freeze DSL v1 until the period-for-rates and rate+cap order (or equivalent) are decided and documented; otherwise the engine could interpret the same rule set differently.

---

## Required clarifications

- **Units for rates and caps.** The PRD and plan say “N units per ₹100” and “cap at X units per period.” Clarify that (1) the **unit** (points, cashback, miles, neucoins) is the card’s `rewardCurrency` from the catalog, and (2) “per ₹100” is the standard denominator for rate. Document in interpretation strategy or rule-type spec so the engine does not assume wrong units. **Action:** Add to interpretation strategy or Step 2 deliverable: “Rate denominator is per ₹100 spend; reward unit is card’s rewardCurrency from catalog. Cap is in same unit and applies per period.”

- **Exclusion vs “zero rate”.** The PRD recommends v1 exclusion = “no reward for this category” only. Confirm that an exclusion is treated as “apply no rate and no cap for this category” (i.e. explicit zero), not “skip this category in cap calculation” unless that behavior is explicitly defined. **Action:** In interpretation policy or rule-type spec, state that exclusion means no reward for that category; category is not counted toward any cap unless the rule set explicitly says otherwise.

- **Milestone threshold currency.** Milestones use a spend threshold (e.g. ₹1.9L). Confirm that threshold is always in INR and that the engine will compare against transaction amounts in the same currency (canonical transactions are INR). **Action:** One line in rule-type spec or interpretation strategy: “Milestone threshold is in INR; statement/canonical amounts are INR.”

- **Sign-off ownership for the one example card.** R3 says “The example is signed off before we freeze DSL v1.” Clarify that Finance (or designated validator) signs off that the example rule set (1) matches the catalog and MITC for that card, and (2) the 2–3 (card, category, period) → rule examples are correct. **Action:** In interpretation policy or action items: “Finance (or designated validator) signs off the one example card’s rule set and examples before DSL v1 freeze.”

---

## Cross-check with catalog and plan

- **Catalog as input only.** Catalog provides card id, rewardCurrency, milestones (threshold, period, declaredReward), declaredConstraints (verbatim). DSL does not modify catalog. **OK.**

- **Step-by-step plan alignment.** The PRD references the plan (scope, rule types, interpretation strategy, one example, interpretation policy). Finance does not design architecture; the plan’s hybrid approach (milestones from catalog, rates/caps/exclusions from manual rule set) is consistent with “no invented rules.” **OK.**

- **Ambiguities flagged.** Period for category rates, multiple rules per (category, period), and exclusion scope are called out. Finance requires these to be resolved and documented before engine implementation; the PRD correctly flags them. **OK.**

---

## Summary

**Validation:** The Milestone 3 PRD is **acceptable from a Finance perspective** provided:

1. The four required clarifications above are addressed (units for rates/caps, exclusion semantics, milestone threshold currency, sign-off ownership for the example card).
2. Implementation and interpretation policy explicitly prohibit auto-derived rates/caps/exclusions from prose and require Finance/product sign-off for new or changed rule sets.
3. DSL v1 is not frozen until period-for-rates and rate+cap order (or equivalent) are decided and documented.

**Proceed** to implementation (rule types in code, interpretation strategy, one example card) with the understanding that the clarifications will be reflected in the rule-type spec or interpretation policy before engine work begins.
