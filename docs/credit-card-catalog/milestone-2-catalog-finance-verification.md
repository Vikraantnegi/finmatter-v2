# Milestone 2 — Credit Card Catalog (Finance verification)

**Finance / Validation** — Verification of the Credit Card Catalog PRD against trust and consistency rules.

---

## Validation findings

- **Catalog as declaration only.** The PRD states that the catalog stores “what each card claims” and that “no reward math” is in the catalog. Reward rules (Milestone 3) will consume the catalog and perform calculation. **OK.**
- **Verifiable data only.** PRD requires “fully verifiable” data and “no inferred or guessed benefits.” This avoids hallucinated benefits and keeps the catalog auditable. **OK.**
- **Versioning and audit.** Versioned records and traceability (e.g. source of truth) support reconciliation and dispute handling. **OK.**
- **No reward logic in catalog.** Finance constraint is satisfied: catalog does not encode reward calculation, cap application, or milestone logic; it only exposes declared structure. **OK.**
- **Order preserved.** Catalog before Reward Rules DSL; rules reference the catalog. This matches the required dependency order. **OK.**

---

## Inconsistencies to avoid

- **Do not** allow the catalog to contain computed or inferred “rewards” or “effective rates”; only declared fees, milestones, and benefit eligibility.
- **Do not** let reward logic creep into catalog add/update flows (e.g. “suggested category multiplier”); keep catalog as declaration-only.
- **Do not** skip versioning or source attribution; every material change should be traceable.

---

## Required clarifications

- **Caps scope:** “Caps scope (monthly/quarterly/yearly)” is noted as optional “where applicable.” Finance view: when a card declares a cap (e.g. “5X capped at 500 pts/month”), the catalog should be able to store both the cap value and the period (monthly/quarterly/yearly) as **declaration only** so that the future rules engine can apply it deterministically. **Resolved:** [catalog-content-and-data-model.md](catalog-content-and-data-model.md) includes "Declared caps (value + period, no application)" and `caps?: CapDeclaration[]` in the core model.
- **Milestone definitions:** “Milestone existence” and “milestone declarations (e.g. spend X get Y)”—ensure the schema can represent at least (trigger, reward) in a structured way so the engine does not have to parse prose. **Resolved:** Design doc has milestones as threshold + period + declaredReward (text or structured tag); no prose parsing required.
- **Benefit eligibility:** “Benefit eligibility (e.g. lounge, fuel)”—storing as tags or structured list is enough for v1. **Resolved:** Design doc has structured benefits (lounge count/domestic-international/network-bound, insurance, partner programs, cashback declared); aligns with Finance.

---

## Cross-check with catalog content spec

The catalog content and data model spec (see [catalog-content-and-data-model.md](catalog-content-and-data-model.md)) has been checked against this verification:

- **Facts only, no inference** — Matches design principles (facts over inference, human-verifiable). Non-goals explicitly exclude calculation, category accelerations, applying caps, inferring from statements, guessing rules. **OK.**
- **Versioned truth** — effectiveFrom, effectiveTo, source, verifiedAt in core model. **OK.**
- **Engine-agnostic** — Catalog is passive data; engines interpret. **OK.**
- **Cap declarations** — Spec now includes declared caps (value + period) without application; satisfies Finance clarification. **OK.**
- **Milestones** — Threshold + period + declared reward (text or structured). **OK.**
- **Benefits** — Structured (lounge, insurance, partners, cashback declared). **OK.**
- **v1 target** — ~5 cards (HDFC, ICICI, Amex, HSBC), depth over breadth; success criteria align with PRD C1–C3. **OK.**

---

---

## Verification: Data sources and phases

**Document:** [catalog-data-sources-and-phases.md](catalog-data-sources-and-phases.md)

**Validation findings**

- **Phase 1 (manual + verifiable):** MITC as preferred source, statements for validation only and never to infer rules. No guessing; no hallucinated benefits. **OK.**
- **Phase 2 (AI-assisted):** AI is copilot only; human approves; only approved data enters catalog; no auto-commit. Prevents AI from becoming source of truth. **OK.**
- **Phase 3 (scraping):** Advisory only; MITC overrides. Scraped data must be reviewed. **OK.**
- **Source-aware fields:** Per-field or record-level `source` and `sourceRef` make data auditable and traceable. Stops “where did this number come from?” and supports dispute handling. **OK.**
- **What NOT to over-engineer:** No scraping or AI-only ingestion in v1; 5 cards × 100% confidence. Reduces risk of insufficient or wrong information. **OK.**

**Inconsistencies to avoid**

- **Do not** allow catalog entries in v1 without a recorded source (e.g. MITC, bank_site) and a way to locate it (sourceRef / source_url / source_pdf). Without that, data is not verifiable.
- **Do not** use statement-derived data to infer or create rules; statements validate outcomes only.
- **Do not** auto-commit AI-extracted or scraped data in Phase 1 or 2; human approval is mandatory.

**Required clarifications (for implementation)**

- **Record-level:** Every catalog entry must have at least record-level `source` (e.g. mitc | bank_site | statement) and `sourceRef` (URL or PDF path/fragment) so every record is traceable. Implement in schema and add/update validation.
- **Per-field (v1):** Support `source` and `sourceRef` on fees (joining, annual) so fee amounts are explicitly tied to a document. Optional for milestones/benefits in v1 if record-level is present; prefer per-field where it does not over-engineer.

**Sign-off (data sources and phases)**

- Policy is consistent with Finance rules: no guess, no hallucination, no insufficient information as truth. Source-aware fields and phased approach support auditability and correctness.
- **Developer plan** should be updated to: (1) require record-level `source` + `sourceRef` in schema and add/update validation, (2) support per-field `source`/`sourceRef` for fees in domain and storage, (3) state that v1 data entry follows Phase 1 only (manual; no AI/scraping as source).

---

## Sign-off

- **Milestone 2 PRD:** Verified from a Finance perspective. Catalog is declaration-only, versioned, verifiable; no reward math; order with Reward Rules DSL preserved.
- **Catalog content and data model spec:** Checked; consistent with PRD and Finance constraints; clarifications resolved in design doc.
- **Data sources and phases:** Verified; record-level and fee-level source/sourceRef required for v1; Developer plan updated accordingly.
- **Proceed to schema design and implementation** using the canonical content and data model and data-sources policy. Freeze Catalog v1 before starting Reward Rules DSL.

---

## Post-review updates (catalog tightening)

After external review and Finance verification ([catalog-review-finance-verification.md](catalog-review-finance-verification.md)):

- **Caps/exclusions** → replaced with **declaredConstraints** (verbatim text + source/sourceRef). No executable structure in catalog; Reward Rules DSL interprets later.
- **Milestone** → added optional **source**, **sourceRef** for provenance.
- **RewardCurrency** → machine-friendly: `points` | `cashback` | `miles` | `neucoins` | `other`; use `REWARD_CURRENCY_DISPLAY_NAMES` in domain for UI.
- **CardIdentity / CardDeclaration split** → agreed as target design for versioning; document and consider for v2.
