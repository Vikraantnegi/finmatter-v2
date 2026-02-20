/**
 * Transaction model — three stages (Phase 1.1).
 * Raw (immutable) → Normalized (cleaned) → Categorized (+ spend category for rewards).
 */

import type { SpendCategory } from "./spend-category";

export enum TransactionType {
  CREDIT = "credit",
  DEBIT = "debit",
  REFUND = "refund",
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export type TransactionSource = "email" | "sms" | "manual";

export enum ParseMethod {
  RULE = "rule",
  AI = "ai",
  /** No rule matched and no AI was called. Used in v1 when fallback is unmatched/unverified. */
  UNKNOWN = "unknown",
}

export type RawTransaction = {
  id: string;
  source: TransactionSource;
  payload: string;
  userId: string;
  cardId: string;
  statementId: string;
  createdAt: string;
};

export type NormalizedTransaction = {
  id: string;
  rawId: string;
  userId: string;
  cardId: string;
  statementId: string;
  date: string;
  amount: number;
  currency: string;
  merchant: {
    raw: string;
    normalized: string;
    merchantCategory: string;
  };
  type: TransactionType;
  description: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  confidenceScore: number;
  parseMethod: ParseMethod;
};

export type CategorizedTransaction = NormalizedTransaction & {
  spendCategory: SpendCategory;
};

export type Transaction = CategorizedTransaction;
