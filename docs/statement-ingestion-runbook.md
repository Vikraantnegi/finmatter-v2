# Statement Ingestion — Runbook

Quick reference for running and debugging statement ingestion (upload → extract → parse → canonical transactions).

---

## Prerequisites

1. **Supabase**
   - `statement_files` table (run `apps/backend/src/db/migration/supabase-statement-files.sql`).
   - `statement_files.failure_reason` column (run `apps/backend/src/db/migration/supabase-statement-files-failure-reason.sql`).
   - `canonical_transactions` table (run `apps/backend/src/db/migration/supabase-canonical-transactions.sql`).
   - Storage bucket `statement-files` (private).

2. **Backend build (required for upload)**
   - Upload runs PDF extraction via a **child process** that calls `dist/scripts/extract-stdin.js`.
   - From repo root: `pnpm --filter @finmatter/backend build`.
   - Ensures `apps/backend/dist/scripts/extract-stdin.js` exists. Without it, upload returns: *"Backend extract script not found. Run: pnpm --filter @finmatter/backend build"*.

3. **Environment**
   - `apps/web-api/.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

---

## User identification (v1)

- All statement and canonical-transaction APIs use the **`x-user-id`** request header.
- If omitted, default is `"test-user"` (for local/dev only).
- **Production:** Replace with real auth; set `x-user-id` from the authenticated user (or derive from session). Do not rely on the default in production.

---

## API flow

1. **POST /api/statements/upload**
   - Body: `multipart/form-data` with `file` (PDF) and optional `password`.
   - Header: `x-user-id` (optional; default `test-user`).
   - Query: `?autoParse=true` — after successful extract, run parse and persist in one go; response includes `parsed`, `bank`, `canonicalCount` (or `parseError` / `parseMessage` if parse failed).
   - On extraction failure: `statement_files.status` = FAILED, `failure_reason` = error message.

2. **POST /api/statements/[id]/parse**
   - Header: `x-user-id`.
   - Requires statement status EXTRACTED. Runs parse → pipeline → upsert `canonical_transactions`; sets status to PARSED or FAILED (with `failure_reason`).

3. **GET /api/statements/[id]/parse**
   - Returns detected bank and parse result **without** persisting. Includes `status` and `failure_reason` when present.

4. **GET /api/canonical-transactions**
   - Query: `?lowConfidence=true` to filter by `confidence_score < 1`.
   - Header: `x-user-id`.

---

## Failure reason

- When `statement_files.status` is FAILED, `failure_reason` stores the error message (extraction or parse).
- Use GET `/api/statements/[id]/parse` or the dashboard validation page to inspect `failure_reason` for a given statement.

---

## Pre-production checklist

Before relying on statement ingestion (and rewards that depend on it), verify:

- [ ] All migrations applied: `statement_files`, `statement_files.failure_reason`, `canonical_transactions`. Optional: `canonical_transactions_user_card_date` (rewards index), `reward_period_summaries` (if using period persistence).
- [ ] Storage bucket `statement-files` exists and is private.
- [ ] `pnpm --filter @finmatter/backend build` has been run (extract script at `apps/backend/dist/scripts/extract-stdin.js`).
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] One successful E2E: POST /api/statements/upload with a test PDF (and optional `?autoParse=true`) → status EXTRACTED or PARSED → GET /api/canonical-transactions returns rows for that `x-user-id`.
