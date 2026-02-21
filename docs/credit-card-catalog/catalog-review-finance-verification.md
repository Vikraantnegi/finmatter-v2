# Catalog design review — Finance verification

**Finance / Validation** — Opinion and validation on the external catalog review (declaration-only, caps/exclusions, provenance, RewardCurrency, CardIdentity/CardDeclaration).

---

## Validation findings (Finance agrees)

- **Declaration-only philosophy.** Catalog describes what exists, not how it’s computed. No reward math, no inference, no category acceleration in catalog. **Correct.** Prevents guessing and hallucination; engines interpret later.
- **Source attribution everywhere.** source, sourceRef, verifiedAt. **Correct.** Enables audits, user trust (“why do you say this?”), rule validation vs MITC. Keep.
- **Versioning (effectiveFrom / effectiveTo).** **Correct.** Do not replace with isActive. Allows historical recomputation and “what rules applied in March 2024?”.
- **Benefits as descriptive blocks.** type + description + count; UI and explanation, not engines. **Correct.**

---

## Inconsistencies Finance agrees must be fixed

### 1. Caps and exclusions are leaking into rules territory

- Structured caps (value, period, unit, description) and exclusions (category, appliesTo) imply category/rate/condition/scope — that is **half a rule**, not catalog-pure.
- **Rule of thumb:** If it needs `appliesTo`, it’s not catalog-pure.
- **Finance view:** Catalog must not encode executable constraints. Reward Rules DSL should interpret verbatim text later. No false precision.

**Required change:** Replace structured caps and exclusions with a single **declaredConstraints** bucket: verbatim text from source, with optional source/sourceRef per constraint. Reward Rules DSL interprets later.

### 2. Milestone provenance

- Milestones change and are disputed. **Required:** Add optional source and sourceRef to Milestone for traceability.

### 3. RewardCurrency machine-friendly

- Values like "Reward Points", "NeuCoins", "Cashback" (with spaces) are brittle for DSL and engines. **Required:** Use machine-friendly codes (e.g. points, cashback, miles, neucoins, other); keep display names separately if needed.

### 4. Bank enum

- Finance agrees: fine for v1; plan for growth (string or extended enum). Not a blocker.

---

## Structural recommendation (CardIdentity / CardDeclaration split)

- **Finance view:** One card → many declarations over time is the correct model for versioning and audits. Splitting CardVariant into CardIdentity (id, bank, family, variantName, network, rewardCurrency, cardType) and CardDeclaration (cardId, fees, milestones, benefits, declaredConstraints, effectiveFrom, effectiveTo, source, sourceRef, verifiedAt) aligns with how financial systems version product terms.
- **Recommendation:** Document as the target design; implement when doing a catalog v2 or when versioning pressure appears. Not a blocker for v1 if we have effectiveFrom/effectiveTo and source attribution.

---

## Verdict on HDFC Swiggy–style entry

- **Good:** Fees, benefits (descriptive), versioning, source-backed.
- **Risky:** Caps and exclusions with category/appliesTo look executable; category names inside catalog drift into rule territory.
- **Fix:** Move caps/exclusions into declaredConstraints as verbatim text; let Reward Rules DSL interpret.

---

## Sign-off

- **Declarative philosophy, source attribution, versioning, benefits:** Verified; keep as-is.
- **Caps/exclusions:** Must be replaced with declaredConstraints (verbatim + source/sourceRef). Implement.
- **Milestone:** Add provenance (source?, sourceRef?). Implement.
- **RewardCurrency:** Make machine-friendly. Implement.
- **CardIdentity / CardDeclaration split:** Agreed as target; document; implement when appropriate for v2 or versioning need.
