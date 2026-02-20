/**
 * Transaction categorization: normalized → categorized (Step 5).
 * Applies category rules (Step 4), builds CategorizedTransaction.
 * Rules-first; when no rule matches: OTHER, low confidence, parseMethod = UNKNOWN (no AI in v1).
 */

import type { NormalizedTransaction, CategorizedTransaction } from "@finmatter/domain";
import { ParseMethod } from "@finmatter/domain";
import { assignCategory } from "./category-rules";

const NO_MATCH_CONFIDENCE = 0.5;

/**
 * Categorize a normalized transaction into CategorizedTransaction.
 * Uses category rules (Step 4); when no rule matches: spendCategory = OTHER,
 * confidenceScore = min(normalized.confidenceScore, 0.5), parseMethod = UNKNOWN (no AI in v1).
 */
export function categorize(normalized: NormalizedTransaction): CategorizedTransaction {
  const categoryResult = assignCategory(
    normalized.merchant.normalized,
    normalized.merchant.merchantCategory
  );
  const ruleMatched = categoryResult.matched;

  const confidenceScore = ruleMatched
    ? normalized.confidenceScore
    : Math.min(normalized.confidenceScore, NO_MATCH_CONFIDENCE);
  const parseMethod = ruleMatched ? normalized.parseMethod : ParseMethod.UNKNOWN;

  return {
    ...normalized,
    spendCategory: categoryResult.spendCategory,
    confidenceScore,
    parseMethod,
  };
}
