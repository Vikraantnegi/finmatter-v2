# Eligibility in catalog — Finance & Developer verification

**Question:** Add eligibility (e.g. min income, age, employment) to the card catalog. Does it benefit in the long run?

---

## Finance verification

**Validation findings**

- Eligibility is **issuer-stated** (MITC, bank page). Storing it in the catalog is **declaration only** — we do not invent or guess; we record what the card/bank states. **OK.**
- **We do not compute or guarantee eligibility.** The bank decides approval. Catalog only exposes "what the issuer says"; no rule that says "user is eligible if X." **OK.**
- **Source attribution** (source, sourceRef) on each eligibility line keeps it auditable and avoids hallucination. **OK.**

**Inconsistencies to avoid**

- **Do not** use eligibility data to decide or imply "user is approved" or "user qualifies." Only for display and for future "cards you may qualify for" (informational).
- **Do not** add structured fields (e.g. minIncome as a number) without keeping them clearly "as stated by issuer" and source-attributed. Verbatim descriptions with optional source/sourceRef are the safest start.

**Verdict**

- **Add eligibility as declaration-only, verbatim + source.** Benefits: user trust ("what does the issuer say?"), in-app display, future recommendation use ("cards you might be eligible for") without us deciding eligibility. **Verified.**

---

## Developer verification

**Findings**

- **Eligibility** fits existing pattern: optional array of `{ description, source?, sourceRef? }` (same shape as DeclaredConstraint but semantic for eligibility). No new concepts; reuse mapping and storage (jsonb). **OK.**
- **Long-term benefit:** Recommendation engine can filter or rank cards by "stated eligibility" (e.g. show cards where issuer states "min income ₹X" and user declares income). UI can show "Eligibility: as per MITC" with link. Discovery and UX improve without encoding rules. **OK.**
- **Implementation:** Add `DeclaredEligibility` type (parallel to DeclaredConstraint), `CardVariant.declaredEligibility`, backend mapping, migration `declared_eligibility jsonb default '[]'`. Simple, testable. **OK.**

**Verdict**

- **Add eligibility.** Low cost, clear semantics, future-proof for discovery and recommendations. **Verified.**

---

## Summary

| Aspect | Finance | Developer |
|--------|---------|-----------|
| Declaration-only | Yes; issuer-stated only | Yes; verbatim + source |
| We compute eligibility? | No; bank decides | No |
| Long-term benefit | User trust, audit, no hallucination | Discovery, "cards you may qualify for", UI |
| Schema | DeclaredEligibility[] with source/sourceRef | Implemented |

**Implemented:** `declaredEligibility?: DeclaredEligibility[]` on CardVariant (parallel to DeclaredConstraint); backend and migration use `declared_eligibility`; schema doc and template updated; hdfc-swiggy example with Salaried / Self-Employed criteria added.
