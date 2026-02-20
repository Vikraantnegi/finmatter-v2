/**
 * Transaction normalization: raw → normalized (Step 3).
 * Parses payload, applies merchant rules (Step 2), builds NormalizedTransaction.
 * Rules-first; when no rule matches: low confidence, parseMethod = UNKNOWN (no AI called in v1).
 */

import type { RawTransaction, NormalizedTransaction } from "@finmatter/domain";
import { TransactionType, TransactionStatus, ParseMethod } from "@finmatter/domain";
import { normalizeMerchant } from "./merchant-rules";

/** Payload shape from parsed statement (JSON of ParsedTransactionLine). */
type ParsedPayload = {
  date: string;
  amount: number;
  description: string;
  type?: "debit" | "credit";
  serialNo?: string;
  rewardPoints?: number;
  countryOrRegionCode?: string;
  paymentRef?: string;
};

const DEFAULT_CURRENCY = "INR";
const NO_MATCH_CONFIDENCE = 0.5;

/**
 * Normalize a raw transaction into NormalizedTransaction.
 * Uses merchant rules (Step 2); when no rule matches, sets normalized = raw description,
 * confidenceScore = 0.5 (unmatched, unverified), parseMethod = UNKNOWN (no AI in v1).
 */
export function normalize(raw: RawTransaction): NormalizedTransaction {
  let payload: ParsedPayload;
  try {
    payload = JSON.parse(raw.payload) as ParsedPayload;
  } catch {
    payload = { date: "", amount: 0, description: raw.payload || "", type: "debit" };
  }

  const description = (payload.description ?? "").trim();
  const merchantResult = normalizeMerchant(description);
  const ruleMatched = merchantResult.matched;

  const now = new Date().toISOString();
  const type =
    payload.type === "credit"
      ? TransactionType.CREDIT
      : TransactionType.DEBIT;

  return {
    id: crypto.randomUUID(),
    rawId: raw.id,
    userId: raw.userId,
    cardId: raw.cardId,
    statementId: raw.statementId,
    date: payload.date ?? "",
    amount: typeof payload.amount === "number" ? payload.amount : 0,
    currency: DEFAULT_CURRENCY,
    merchant: {
      raw: description || raw.payload,
      normalized: merchantResult.normalized || description,
      merchantCategory: merchantResult.merchantCategory ?? "",
    },
    type,
    description: description || raw.payload,
    status: TransactionStatus.COMPLETED,
    createdAt: now,
    updatedAt: now,
    confidenceScore: ruleMatched ? 1 : NO_MATCH_CONFIDENCE,
    parseMethod: ruleMatched ? ParseMethod.RULE : ParseMethod.UNKNOWN,
  };
}
