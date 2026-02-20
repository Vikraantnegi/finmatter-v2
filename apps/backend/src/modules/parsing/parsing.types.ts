/**
 * Types for statement parsing pipeline.
 * Used by parsing.service (PDF text extraction, bank detection, line parsing).
 *
 * Reconciliation rule (encode everywhere reconciliation is used):
 * Reconciliation failures are findings, never corrections. Do not "fix" totals,
 * do not backfill missing numbers. Emit a validation finding and move on.
 * This preserves auditability.
 */

export type ExtractionMethod = "pdfjs" | "pdf-parse";

export type ExtractedText = {
  fullText: string;
  pages?: string[];
  pageCount: number;
  extractionMethod: ExtractionMethod;
};

export enum ExtractionErrorCode {
  WRONG_PASSWORD = "WRONG_PASSWORD",
  CORRUPT_PDF = "CORRUPT_PDF",
  UNSUPPORTED_ENCRYPTION = "UNSUPPORTED_ENCRYPTION",
}

export type ExtractionFailure = {
  success: false;
  error: ExtractionErrorCode;
  /** Underlying message from the extractor (e.g. pdfjs); never includes password. */
  message?: string;
};

export type ExtractionResult =
  | ({ success: true } & ExtractedText)
  | ExtractionFailure;

/** Lifecycle status for statement_files. Enables re-run Step 2, async pipelines, debugging. */
export type StatementStatus = "UPLOADED" | "EXTRACTED" | "PARSED" | "FAILED";

/** Minimal shape for stored statement file metadata (e.g. statement_files table). */
export type StatementFileRecord = {
  id: string;
  userId: string;
  filePath: string;
  fileHash: string;
  status: StatementStatus;
  extractedTextRef?: string;
  pageCount?: number;
  extractionMethod?: ExtractionMethod;
  createdAt: string;
};

export enum Bank {
  HDFC = "HDFC",
  AMEX = "AMEX",
  ICICI = "ICICI",
  HSBC = "HSBC",
  AXIS = "AXIS",
  UNKNOWN = "UNKNOWN",
}

export type SpendCategory = {
  category: string;
  percentage?: number;
  amount?: number;
};

export type RewardPointsSummary = {
  total?: number;
  opening?: number;
  earned?: number;
  transferred?: number;
  closing?: number;
  unitLabel?: string;
};

/** Optional: value from statement with explicit source and confidence (for discrepancy explanation). */
export type VerifiedNumber = {
  value: number;
  source: "statement";
  confidence: 1;
};

export function toVerifiedNumber(n: number): VerifiedNumber {
  return { value: n, source: "statement", confidence: 1 };
}

export function toNumber(n: number | VerifiedNumber | undefined): number | undefined {
  if (n == null) return undefined;
  return typeof n === "number" ? n : n.value;
}

export type StatementSummary = {
  previousBalance?: number | VerifiedNumber;
  paymentsCredits?: number | VerifiedNumber;
  purchasesDebit?: number | VerifiedNumber;
  financeCharges?: number | VerifiedNumber;
};

export type DuesSummary = {
  pastDuesOverLimit?: number;
  currentDues?: number;
  minimumDues?: number;
};

export type CashbackOrRewardLine = {
  description: string;
  amount: number | VerifiedNumber;
};

export type InterestRatesDisplay =
  | string
  | { goodsAndServices?: number; cash?: number };

export type StatementMetadata = {
  issuer: string;
  productName?: string;
  cardName?: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  statementDate?: string;
  cardLast4?: string;
  cardLast4List?: string[];
  totalAmountDue?: number;
  minimumAmountDue?: number;
  paymentDueDate?: string;
  creditLimit?: number;
  availableCreditLimit?: number;
  cashLimit?: number;
  availableCash?: number;
  spendCategories?: SpendCategory[];
  rewardPoints?: number;
  rewardPointsDetail?: RewardPointsSummary;
  insights?: string[];
  statementSummary?: StatementSummary;
  duesSummary?: DuesSummary;
  interestRatesDisplay?: InterestRatesDisplay;
  cashbackOrRewardLines?: CashbackOrRewardLine[];
  pointsExpiringIn30Days?: number;
  pointsExpiringIn60Days?: number;
  invoiceNo?: string;
};

export type ParsedTransactionLine = {
  date: string;
  amount: number;
  description: string;
  type?: "debit" | "credit";
  serialNo?: string;
  rewardPoints?: number;
  countryOrRegionCode?: string;
  paymentRef?: string;
};

export type ParsedStatement = {
  bank: Bank;
  metadata: StatementMetadata;
  transactions: ParsedTransactionLine[];
};
