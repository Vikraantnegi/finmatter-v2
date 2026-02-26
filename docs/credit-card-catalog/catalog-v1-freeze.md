# Catalog v1 — Freeze

**Status:** Catalog v1 is frozen. This doc is the checkpoint for handoff to Reward Rules DSL (Milestone 3) and downstream engines.

---

## What is frozen

- **Schema:** `CardVariant` and nested types in `packages/domain/src/card-variant.ts` (and persisted shape in Supabase `card_variants`). No change to required/optional fields or enums without a versioned migration or explicit v2 decision.
- **Cards:** The current set of cards in the catalog is **v1 truth** for reward rules and product behaviour. As of freeze:
  - Cards seeded from `apps/backend/src/db/data/*.json`: amex-platinum-travel, hsbc-travelone, icici-amazon-pay, icici-coral-visa, icici-sapphiro-visa, hdfc-millennia, hdfc-regalia-gold, hdfc-swiggy, hdfc-tata-neu-infinity, hdfc-tata-neu-plus (ids may include network suffix e.g. hdfc-tata-neu-plus-rupay).
  - Count: ~10 card variants.
- **Versioning:** Future changes (new cards, fee changes, benefit updates) are versioned via `effectiveFrom` / `effectiveTo` and new rows or updated rows with traceability (`source`, `sourceRef`, `verifiedAt`). No silent overwrites.

---

## Handoff

- **To:** Reward Rules DSL (Milestone 3). Rules reference catalog by `cardId`; rules adapt to catalog, not the other way around.
- **To:** Deterministic Rewards Engine (Phase 2). Engine reads catalog (e.g. rewardCurrency) and rule sets; catalog is not extended to store executable rules.

---

## Out of scope for this freeze

- Adding or editing card content (allowed with versioning and source attribution).
- Changing the **schema** (that would be a v2 decision and documented separately).
