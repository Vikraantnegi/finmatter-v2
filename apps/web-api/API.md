# Web API — API reference

All APIs are under the app base URL (e.g. `http://localhost:3000`). Common requirements:

- **Supabase:** Most routes need `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. If missing → **503**.
- **User scope:** Many routes use header `x-user-id` (default `test-user`) to scope data.

---

## Catalog

### GET /api/catalog

List all card variants from the catalog.

| | |
|--|--|
| **Method** | GET |
| **Headers** | None required |
| **Query** | None |
| **Response 200** | `{ variants: CardVariant[] }` — ordered by `family` |
| **Response 500** | `{ error, message? }` — DB error |
| **Response 503** | Supabase not configured |

---

### GET /api/catalog/[id]

Fetch a single card variant by id (slug).

| | |
|--|--|
| **Method** | GET |
| **Path params** | `id` (required) — card slug, e.g. `hdfc-millennia` |
| **Headers** | None required |
| **Response 200** | `{ variant: CardVariant }` |
| **Response 400** | `{ error: "Missing id." }` |
| **Response 404** | `{ error: "Card variant not found." }` |
| **Response 500** | `{ error, message? }` |
| **Response 503** | Supabase not configured |

---

## Canonical transactions

### GET /api/canonical-transactions

List canonical (normalized + categorized) transactions for the current user.

| | |
|--|--|
| **Method** | GET |
| **Headers** | `x-user-id` (optional; default `test-user`) |
| **Query** | `lowConfidence` (optional) — `"true"` to return only rows with `confidence_score < 1` |
| **Response 200** | `{ transactions: CanonicalTransactionRow[] }` — ordered by `date` descending |
| **Response 500** | `{ error, message? }` |
| **Response 503** | Supabase not configured |

---

## Statements (upload & parse)

### POST /api/statements/upload

Upload a statement PDF, extract text, optionally parse and persist to `canonical_transactions`.

| | |
|--|--|
| **Method** | POST |
| **Headers** | `x-user-id` (optional; default `test-user`) |
| **Body** | `multipart/form-data`: `file` (required, PDF), `password` (optional, for protected PDFs) |
| **Query** | `autoParse=true` (optional) — run parse + persist after extraction |
| **Response 200** | On success: `{ id, success: true, fullText?, pageCount?, extractionMethod?, parsed?, bank?, canonicalCount?, transactions?, rawTransactions?, metadata?, parseError?, parseMessage? }`. If duplicate hash and already extracted: `{ duplicate: true, id, success: true, fullText, pageCount, extractionMethod }`. |
| **Response 400** | `{ error }` — missing/empty file, not PDF; or extraction failed `{ success: false, error?, message? }` |
| **Response 500** | `{ error, message? }` — storage/DB/extraction script error |
| **Response 503** | Supabase not configured |

**Requirements:** Backend extract script must exist: run `pnpm --filter @finmatter/backend build` so `apps/backend/dist/scripts/extract-stdin.js` is available.

---

### POST /api/statements/[id]/parse

Parse an already-extracted statement and persist to `canonical_transactions`.

| | |
|--|--|
| **Method** | POST |
| **Path params** | `id` (required) — statement file UUID |
| **Headers** | `x-user-id` (optional; default `test-user`) |
| **Response 200** | `{ success: true, bank?, metadata?, transactions?, rawTransactions?, canonicalCount? }` |
| **Response 400** | `{ success: false, error?, message? }` — parse failed; or statement not EXTRACTED / no extracted text |
| **Response 404** | `{ error: "Statement not found." }` |
| **Response 500** | `{ error, message? }` |
| **Response 503** | Supabase not configured |

**Requirement:** Statement must be in status `EXTRACTED` (upload + extract first).

---

### GET /api/statements/[id]/parse

Return detected bank and parse result for an extracted statement **without** persisting.

| | |
|--|--|
| **Method** | GET |
| **Path params** | `id` (required) — statement file UUID |
| **Headers** | `x-user-id` (optional; default `test-user`) |
| **Response 200** | `{ bank?, metadata?, transactions?, status?, failure_reason? }` |
| **Response 400** | `{ error: "No extracted text. Extract first." }` |
| **Response 404** | `{ error: "Statement not found." }` |
| **Response 503** | Supabase not configured |

---

## Rewards

### GET /api/rewards

Compute rewards for a card and period using the deterministic rewards engine. Loads rule set, fetches canonical transactions for (user, card, period), returns engine output unchanged.

| | |
|--|--|
| **Method** | GET |
| **Headers** | `x-user-id` (optional; default `test-user`) |
| **Query** | `cardId` (required), `periodType` (required: `monthly` \| `quarterly` \| `yearly`), `periodStart` (required, ISO date), `periodEnd` (required, ISO date) |
| **Response 200** | `{ perTransactionRewards: PerTransactionReward[], periodSummary: PeriodRewardSummary }` — see [rewards README](app/api/rewards/README.md) for shape |
| **Response 400** | `{ error }` — missing/invalid `cardId`, `periodType`, `periodStart`, or `periodEnd` |
| **Response 404** | `{ error }` — no rule set for this `cardId` |
| **Response 500** | `{ error, message? }` — transaction fetch or engine error |
| **Response 503** | Supabase not configured |

**Requirements:** Rule sets in `apps/backend/src/db/data/rule-sets/<cardId>.json` (or set `RULE_SETS_PATH`). Example: `hdfc-millennia`.

---

## Summary table

| Method | Path | Purpose |
|--------|------|--------|
| GET | /api/catalog | List all card variants |
| GET | /api/catalog/[id] | Get one card variant by id |
| GET | /api/canonical-transactions | List user’s canonical transactions |
| POST | /api/statements/upload | Upload PDF, extract text, optional parse+persist |
| POST | /api/statements/[id]/parse | Parse extracted statement and persist |
| GET | /api/statements/[id]/parse | Parse preview (no persist) |
| GET | /api/rewards | Compute rewards for card + period |
