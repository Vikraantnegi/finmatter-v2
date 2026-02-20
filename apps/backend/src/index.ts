/**
 * @finmatter/backend — business logic for statement ingestion, parsing, and transactions.
 * Consumed by apps/web-api (Next.js API routes). No HTTP server here.
 */

export * from "./models";
export { extractTextFromPdf, detectBank, parseStatement, parsedLinesToRawTransactions } from "./modules/parsing/parsing.service";
export type {
  ExtractionResult,
  ExtractedText,
  ExtractionFailure,
  ParsedStatement,
  ParsedTransactionLine,
  StatementMetadata,
  VerifiedNumber,
} from "./modules/parsing/parsing.types";
export { Bank, toNumber, toVerifiedNumber } from "./modules/parsing/parsing.types";
export {
  normalize,
  categorize,
  runPipeline,
  normalizeMerchant,
  assignCategory,
  getCategoryRulesVersion,
  canonicalKey,
  deduplicate,
} from "./modules/transactions";
export type {
  MerchantRuleResult,
  CategoryRuleResult,
  TransactionForKey,
} from "./modules/transactions";
export type { CategorizedTransaction } from "@finmatter/domain";
