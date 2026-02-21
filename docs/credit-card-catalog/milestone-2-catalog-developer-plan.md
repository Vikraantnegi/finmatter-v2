# Milestone 2 — Credit Card Catalog (Developer plan)

**Developer** — Plan for implementing the Credit Card Catalog. No code yet; align with PRD (PO) and Finance verification.

**Inputs:** [milestone-2-catalog-prd.md](milestone-2-catalog-prd.md), [milestone-2-catalog-finance-verification.md](milestone-2-catalog-finance-verification.md), [catalog-content-and-data-model.md](catalog-content-and-data-model.md), [catalog-data-sources-and-phases.md](catalog-data-sources-and-phases.md).

**Rules:** No inventing product or financial rules; follow existing architecture (domain → backend → web-api); simple, testable designs.

---

## Moving forward (plan only — no code yet)

**Single path:** Follow steps 1 → 7 in order. Do not start implementation until this plan (and any open decisions) is confirmed.

**Open decision (before Step 3):** Choose storage: **Supabase** vs **file-based**. Document the decision in this doc or `catalog-storage-decision.md`. See §4 below.

**Constraints (do not relax):**

- **From PRD:** Catalog is declaration-only; no reward math; ~5 cards (HDFC, ICICI, Amex, HSBC); versioned, verifiable.
- **From Finance:** Every entry must have record-level `source` + `sourceRef`; fees support per-field source/sourceRef; add/update must reject missing source or sourceRef.
- **From Data sources:** v1 = Phase 1 only — manual entry; MITC preferred; statements for validation only; no AI or scraping as source of truth.

**Gate:** After Step 6 (load ~5 cards with verifiable data), PO documents “Catalog v1 frozen” (Step 7); then proceed to Reward Rules DSL design (Milestone 3).

---

## 1. Approach in one sentence

Add **domain types** for `CardVariant` and nested structures, **choose storage** (Supabase vs file-based), implement **catalog persistence and read/write** in backend, expose **GET (and optional admin write)** from web-api, **version and audit** every change, then **load ~5 cards** with verifiable data and freeze v1.

---

## 2. Dependency order (steps)

| Step | What | Owner |
|------|------|--------|
| 1 | Define TypeScript types in `packages/domain` (CardVariant with required source, sourceRef; Fees with optional source/sourceRef per fee; Milestone, Benefit, CapDeclaration; enums). No DB yet. | Developer |
| 2 | Choose storage: Supabase table(s) vs JSON/TS in repo. Document decision (this doc or `catalog-storage-decision.md`). | Developer |
| 3a | If Supabase: add migration(s) for catalog table(s) including source, source_ref, verified_at; align with domain types. | Developer |
| 3b | If file-based: add catalog file path(s) and format (JSON/TS); align with domain types. | Developer |
| 4 | Implement catalog read (and write) in backend: get by id, list; add/update with versioning (effectiveFrom, source, sourceRef, verifiedAt). Validate: reject if source or sourceRef missing. | Developer |
| 5 | Expose from web-api: GET catalog (list, by id); optional: admin POST/PATCH for add/update (or manual file edit for v1). | Developer |
| 6 | Load ~5 cards (HDFC, ICICI, Amex, HSBC) with verifiable data; Phase 1 only (manual, source + sourceRef per entry); validate against schema. | PO + Developer |
| 7 | Document “Catalog v1 frozen”; handoff to Reward Rules DSL. | PO |

---

## 3. Files to create or update (by layer)

**packages/domain**

- **Create** `packages/domain/src/card-variant.ts` (or `catalog.ts`): types for `CardVariant`, `Fees`, `Milestone`, `Benefit`, `CapDeclaration`; enums/union for bank, network, reward currency, card type, period (monthly/quarterly/yearly). **Finance:** Record-level `source` + `sourceRef` required; per-field `source`/`sourceRef` on fees (see [catalog-data-sources-and-phases.md](catalog-data-sources-and-phases.md) and Finance verification).
- **Update** `packages/domain/src/index.ts`: export new catalog types.

**apps/backend**

- **Create** `apps/backend/src/db/migration/supabase-card-catalog.sql` (if Supabase): table(s) for card variants with versioning columns (effective_from, effective_to, source, source_ref, verified_at).
- **Create** `apps/backend/src/modules/catalog/` (or equivalent):  
  - Types aligned with domain (if any DTOs needed).  
  - `catalog.service.ts`: getById, list, addOrUpdate (with versioning/audit).  
  - Optional: `catalog.repository.ts` if DB; or file-based loader/writer.  
  - `index.ts` for exports.
- **Update** `apps/backend/src/index.ts`: export catalog module (getCardVariant, listCardVariants, addOrUpdateCardVariant or similar).

**apps/web-api**

- **Create** `apps/web-api/app/api/catalog/route.ts`: GET list (and optionally GET by id via query or segment).
- **Optional** `apps/web-api/app/api/catalog/[id]/route.ts`: GET by id.
- **Optional** admin route for POST/PATCH catalog (or rely on manual file/DB for v1).

**docs**

- **Create/update** `docs/credit-card-catalog/` with storage decision and any schema notes (e.g. `catalog-schema.md` or section in this plan).

---

## 4. Storage choice (plan only — decide before Step 3)

**Option A — Supabase**

- **Pros:** Same as canonical_transactions; consistent auth, backups, future UI over same DB; easy to add/update via API or SQL.
- **Cons:** Need migration and repository layer; more moving parts for v1.
- **Tables:** One main table `card_variants` with columns for identity, fees (jsonb or columns), milestones (jsonb), benefits (jsonb), caps (jsonb), effective_from, effective_to, source, source_ref, verified_at. Or normalized (e.g. card_variants + card_milestones) — recommend single table with JSONB for nested arrays for v1 to keep simple.

**Option B — File-based (JSON or TS in repo)**

- **Pros:** Versioned in git; no migration; easy to review and edit by PO; minimal backend code.
- **Cons:** No built-in multi-user or API-based write from UI; need to deploy/commit to change data.
- **Location:** e.g. `apps/backend/src/data/card-catalog.json` or `packages/domain/data/card-catalog.json`; or TypeScript file exporting array of CardVariant.

**Recommendation**

- Prefer **Supabase** if we want catalog editable from dashboard/API soon and consistent with rest of app.
- Prefer **file-based** for v1 if the goal is “freeze 5 cards and move to DSL” with minimal scope; we can migrate to Supabase before or during Milestone 3.

**Decision (recorded):** **Supabase.** Rationale: use catalog in app UI; consistent with canonical_transactions and rest of app; editable from dashboard/API.

---

## 5. Schema (TypeScript first)

- **CardVariant:** id, bank, family, variantName, network, rewardCurrency, cardType?, fees, milestones?, benefits?, caps?, effectiveFrom, effectiveTo?, **source** (required), **sourceRef** (required: URL or PDF path/fragment), verifiedAt.
- **Fees:** joining { amount, currency, **source?**, **sourceRef?** }, annual { amount, currency, **source?**, **sourceRef?** }, waiverText?, gstDisplay?. (Per-field source/sourceRef required by Finance for auditability.)
- **Milestone:** threshold (number), period (enum), declaredReward (string or structured tag).
- **Benefit:** type (e.g. lounge | insurance | partner | cashback) + fields (e.g. lounge: count, domesticInternational, networkBound); keep simple for v1 (e.g. type + description or key-value).
- **CapDeclaration:** value (number), period (enum); optional unit (points/cashback) if needed.
- **Enums/unions:** Bank, Network, RewardCurrency, CardType, Period (monthly | quarterly | yearly); source (bank_site | mitc | statement). sourceRef is string (URL or path).

Define these in `packages/domain` so backend and web-api stay in sync; no financial or reward logic, only structure.

---

## 6. Versioning and audit (behavior)

- **effectiveFrom:** Set on add; optionally set on “revision” when we support multiple versions (v1 can be single current version per variant).
- **effectiveTo:** Nullable; set when superseded (v1 can leave null).
- **source:** Required on add/update (bank_site | mitc | statement).
- **sourceRef:** Required on add/update (URL or PDF path/fragment) so every record is traceable. Finance: no catalog entry without it.
- **verifiedAt:** Timestamp when data was verified (required on add/update).
- No silent overwrites: either new row (Supabase) or new version field / append-only log (file-based). For v1, “update” can mean replace current variant and bump updated_at; full history can be v1.1.

---

## 7. Add/update flow (high level)

- Input: payload conforming to CardVariant (or minimal create/update DTO).
- Validate: required fields, types, **source + sourceRef present** (reject if missing); no reward math (no computed fields). **v1 = Phase 1 only:** manual entry; no AI or scraping as source of truth (see [catalog-data-sources-and-phases.md](catalog-data-sources-and-phases.md)).
- Persist: insert (Supabase) or overwrite entry in file; set source, sourceRef, and verifiedAt.
- Return: saved CardVariant (or id). No calculation, no inference.

---

## 8. Loading ~5 cards (v1)

- **Phase 1 only:** Manual entry; MITC preferred; statements for validation only, never to infer rules. No AI or scraping as source (see [catalog-data-sources-and-phases.md](catalog-data-sources-and-phases.md)).
- Data entry: PO provides verifiable facts; each entry must have **source** and **sourceRef** (e.g. MITC PDF path or bank page URL).
- Format: Either (a) seed script that reads JSON/TS and calls addOrUpdate, or (b) manual insert into Supabase / edit to file.
- Location of “seed” data: either in repo (e.g. `data/card-catalog-seed.json`) or in DB after one-time load. No inference or guessing; every record and fee traceable to source.

---

## 9. Testing (plan)

- **Domain:** No unit tests required for pure types; optional runtime validation (e.g. Zod) in backend for add/update.
- **Backend:** Unit tests for catalog service: getById returns expected shape; list returns array; addOrUpdate persists and sets versioning fields (source, sourceRef, verifiedAt); **addOrUpdate rejects payload missing source or sourceRef**; no reward logic in module.
- **Integration:** Optional: GET /api/catalog returns 200 and array of card variants after seed.

---

## 10. Out of scope (reminder)

- Reward calculation, cap application, milestone logic (Milestone 3+).
- Parsing card data from PDFs (manual entry for v1).
- Recommendation or optimization logic.
- AI inventing or inferring card benefits.

---

## 11. Summary

| Item | Plan |
|------|------|
| **Types** | `packages/domain`: CardVariant (with required source, sourceRef), Fees (with optional source/sourceRef per fee), Milestone, Benefit, CapDeclaration, enums. |
| **Storage** | Decide Supabase vs file-based before Step 3; document. |
| **Backend** | Catalog module: read (get, list), write (add/update) with versioning; migration if Supabase. |
| **Web-api** | GET catalog (list, by id); optional admin write for v1. |
| **Data** | Load ~5 cards (HDFC, ICICI, Amex, HSBC) with verifiable data; Phase 1 only (manual, source + sourceRef required); freeze v1. |
| **Handoff** | Document “Catalog v1 frozen”; proceed to Reward Rules DSL design. |

No development started until PO/Finance confirm this plan (or requested changes). After confirmation, implement in step order 1 → 2 → 3 → 4 → 5 → 6 → 7.
