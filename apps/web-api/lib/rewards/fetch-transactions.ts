/**
 * Fetch canonical transactions for (userId, cardId, period) and map to CategorizedTransaction.
 * Engine receives only categorized transactions; no synthetic data.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategorizedTransaction } from "@finmatter/backend";
import type { CanonicalTransactionRow } from "./canonical-transaction-row";

function rowToCategorizedTransaction(row: CanonicalTransactionRow): CategorizedTransaction {
  const merchant = row.merchant ?? {};
  return {
    id: String(row.id),
    rawId: String(row.raw_id),
    userId: row.user_id,
    cardId: row.card_id,
    statementId: String(row.statement_id),
    date: row.date,
    amount: Number(row.amount),
    currency: row.currency ?? "INR",
    merchant: {
      raw: merchant.raw ?? "",
      normalized: merchant.normalized ?? "",
      merchantCategory: merchant.merchantCategory ?? "",
    },
    type: row.type as CategorizedTransaction["type"],
    description: row.description ?? "",
    status: row.status as CategorizedTransaction["status"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    confidenceScore: Number(row.confidence_score),
    parseMethod: row.parse_method as CategorizedTransaction["parseMethod"],
    spendCategory: row.spend_category as CategorizedTransaction["spendCategory"],
  };
}

export type FetchTransactionsParams = {
  userId: string;
  cardId: string;
  periodStart: string;
  periodEnd: string;
};

export type FetchAllUserTransactionsParams = {
  userId: string;
  periodStart: string;
  periodEnd: string;
};

/**
 * Fetch transactions for user and card where date is in [periodStart, periodEnd].
 * Returns array suitable for computeRewardsCore. No data alteration.
 */
export async function fetchTransactionsForPeriod(
  supabase: SupabaseClient,
  params: FetchTransactionsParams
): Promise<CategorizedTransaction[]> {
  const { data, error } = await supabase
    .from("canonical_transactions")
    .select("*")
    .eq("user_id", params.userId)
    .eq("card_id", params.cardId)
    .gte("date", params.periodStart)
    .lte("date", params.periodEnd)
    .order("date", { ascending: true });

  if (error) throw error;
  const rows = (data ?? []) as CanonicalTransactionRow[];
  return rows.map(rowToCategorizedTransaction);
}

/**
 * Fetch all transactions for user in [periodStart, periodEnd] (no card filter).
 * Used by optimization to run the same transaction set across multiple cards.
 */
export async function fetchAllUserTransactionsInPeriod(
  supabase: SupabaseClient,
  params: FetchAllUserTransactionsParams
): Promise<CategorizedTransaction[]> {
  const { data, error } = await supabase
    .from("canonical_transactions")
    .select("*")
    .eq("user_id", params.userId)
    .gte("date", params.periodStart)
    .lte("date", params.periodEnd)
    .order("date", { ascending: true });

  if (error) throw error;
  const rows = (data ?? []) as CanonicalTransactionRow[];
  return rows.map(rowToCategorizedTransaction);
}
