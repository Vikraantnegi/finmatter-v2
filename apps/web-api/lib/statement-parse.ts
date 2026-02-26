/**
 * Shared parse-and-persist logic for statement ingestion.
 * Used by POST /api/statements/upload (auto-parse) and POST /api/statements/[id]/parse.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  parseStatement,
  parsedLinesToRawTransactions,
  runPipeline,
  canonicalKey,
  type CategorizedTransaction,
} from "@finmatter/backend";

export type ParseAndPersistResult =
  | {
      success: true;
      bank: string;
      metadata: Record<string, unknown>;
      transactions: unknown[];
      rawTransactions: unknown[];
      canonicalCount: number;
    }
  | { success: false; error: string; message: string };

/**
 * Parse extracted text for a statement, run pipeline, persist to canonical_transactions,
 * and update statement_files status to PARSED or FAILED (with failure_reason).
 * Caller must ensure row exists, status is EXTRACTED, and extracted_text is present.
 */
export async function parseAndPersistStatement(
  db: SupabaseClient,
  statementId: string,
  userId: string,
  extractedText: string
): Promise<ParseAndPersistResult> {
  try {
    const parsed = parseStatement(extractedText);
    const cardId = parsed.metadata.cardLast4
      ? `statement-${parsed.metadata.cardLast4}`
      : "unknown-card";
    const rawTransactions = parsedLinesToRawTransactions(parsed.transactions, {
      statementId,
      userId,
      cardId,
    });

    const canonical = runPipeline(rawTransactions);

    const canonicalRows = canonical.map((tx: CategorizedTransaction) => ({
      canonical_key: canonicalKey(tx),
      id: tx.id,
      raw_id: tx.rawId,
      user_id: tx.userId,
      card_id: tx.cardId,
      statement_id: tx.statementId,
      date: tx.date,
      amount: tx.amount,
      currency: tx.currency,
      merchant: tx.merchant,
      type: tx.type,
      description: tx.description ?? "",
      status: tx.status,
      confidence_score: tx.confidenceScore,
      parse_method: tx.parseMethod,
      spend_category: tx.spendCategory,
      created_at: tx.createdAt,
      updated_at: tx.updatedAt,
    }));

    if (canonicalRows.length > 0) {
      const { error: upsertError } = await db
        .from("canonical_transactions")
        .upsert(canonicalRows, { onConflict: "canonical_key" });
      if (upsertError) {
        const message = `Failed to persist canonical transactions: ${upsertError.message}`;
        await db
          .from("statement_files")
          .update({
            status: "FAILED",
            failure_reason: message,
            updated_at: new Date().toISOString(),
          })
          .eq("id", statementId)
          .eq("user_id", userId);
        return { success: false, error: "Persist failed.", message: upsertError.message };
      }
    }

    await db
      .from("statement_files")
      .update({
        status: "PARSED",
        failure_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", statementId)
      .eq("user_id", userId);

    return {
      success: true,
      bank: parsed.bank,
      metadata: parsed.metadata as Record<string, unknown>,
      transactions: parsed.transactions,
      rawTransactions,
      canonicalCount: canonical.length,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .from("statement_files")
      .update({
        status: "FAILED",
        failure_reason: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", statementId)
      .eq("user_id", userId);

    return {
      success: false,
      error: "Parse failed.",
      message,
    };
  }
}
