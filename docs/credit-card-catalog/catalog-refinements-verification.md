# Catalog refinements — Developer & Finance verification

**Refinements (non-blocking):** benefits vs declaredConstraints intent, Benefit.type cashback comment, declaredConstraints ordering, verifiedAt ISO-8601.

---

## 1. Benefits vs declaredConstraints (no schema change)

**Intent:**

- **benefits:** Human-facing descriptions for UI and explanation. Can say e.g. "10% cashback on Swiggy orders (monthly cap applies)" without repeating exact cap wording.
- **declaredConstraints:** Issuer-worded legal constraints verbatim from source (caps, exclusions, eligibility). Reward Rules DSL interprets.

**Developer:** No code or schema change. Editorial discipline only. Schema doc and domain/schema reference updated so data entry keeps exact legal text in declaredConstraints and shorter human-facing text in benefits. **OK.**

**Finance:** Prevents duplication and keeps legal wording traceable in one place (declaredConstraints). Benefits stay non-executable. **OK.**

---

## 2. Benefit.type = "cashback" — document

**Change:** JSDoc on `Benefit` in `packages/domain/src/card-variant.ts`: `cashback` here is a declared customer-facing benefit type, not a computational reward rule; `rewardCurrency` on CardVariant is the card’s reward type. Schema doc updated with same note.

**Developer:** Prevents accidental refactors that treat benefit type as rule logic. **OK.**

**Finance:** Clear separation: benefits = description only; rules = declaredConstraints + DSL. **OK.**

---

## 3. declaredConstraints ordering (UX)

**Change:** Recommended order documented in schema: (1) Earning / caps, (2) Global exclusions, (3) Category-specific exclusions, (4) Eligibility rules. hdfc-swiggy.json already follows this order.

**Developer:** No validation or code; ordering is editorial. **OK.**

**Finance:** Improves readability and audit; no impact on correctness. **OK.**

---

## 4. verifiedAt — ISO-8601 with timezone

**Change:** Schema doc states `verifiedAt` must be **ISO-8601 with timezone** (e.g. `2025-01-01T00:00:00Z`); standardize across catalog and avoid date-only.

**Developer:** No validation change; existing payloads can keep date-only until next edit. Recommendation only. **OK.**

**Finance:** Consistent timestamps support audit and versioning. **OK.**

---

## Sign-off

| Refinement              | Developer | Finance |
|-------------------------|-----------|---------|
| benefits vs declaredConstraints | OK (editorial) | OK |
| Benefit cashback comment        | OK        | OK |
| declaredConstraints order       | OK (doc)  | OK |
| verifiedAt ISO-8601             | OK (doc)  | OK |

No schema or API change; documentation and one seed file (hdfc-swiggy benefits wording) updated.
