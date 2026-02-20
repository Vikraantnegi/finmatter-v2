/**
 * Dedup strategy (Step 6).
 * Deterministic canonical key from statementId + date + amount + normalized merchant.
 * No fuzzy matching; idempotent: same key → same canonical tx.
 */

import type { CategorizedTransaction } from "@finmatter/domain";

/** Minimal shape needed to compute canonical key (NormalizedTransaction or CategorizedTransaction). */
export type TransactionForKey = {
  statementId: string;
  date: string;
  amount: number;
  merchant: { normalized: string };
};

const KEY_SEP = "\u001E"; // ASCII record separator; unlikely in statementId/date/merchant

/**
 * Deterministic canonical key for a transaction.
 * Key = statementId + SEP + date + SEP + amount + SEP + merchant.normalized.
 * Same logical tx (same statement, date, amount, normalized merchant) → same key.
 * Auditable: key parts are documented and separable.
 */
export function canonicalKey(tx: TransactionForKey): string {
  const a = tx.statementId ?? "";
  const b = tx.date ?? "";
  const c = String(tx.amount ?? "");
  const d = (tx.merchant?.normalized ?? "").trim();
  return [a, b, c, d].join(KEY_SEP);
}

/**
 * Deduplicate by canonical key; first occurrence per key wins.
 * Idempotent: running again on the same list yields the same result.
 */
export function deduplicate(
  transactions: CategorizedTransaction[]
): CategorizedTransaction[] {
  const seen = new Set<string>();
  const out: CategorizedTransaction[] = [];
  for (const tx of transactions) {
    const key = canonicalKey(tx);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tx);
  }
  return out;
}
