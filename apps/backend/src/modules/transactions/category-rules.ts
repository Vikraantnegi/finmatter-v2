/**
 * Category assignment rules (Step 4).
 * Input: normalized merchant name and merchantCategory from Step 2/3.
 * Output: SpendCategory from taxonomy. Deterministic; no reward logic.
 */

import { SpendCategory } from "@finmatter/domain";

export type CategoryRuleResult = {
  spendCategory: SpendCategory;
  /** True when a rule matched; false when fallback (OTHER) was returned. Used by categorization for confidence. */
  matched: boolean;
};

/** Map merchantCategory (from Step 2) to SpendCategory. Lowercase keys. */
const MERCHANT_CATEGORY_TO_SPEND: Record<string, SpendCategory> = {
  dining: SpendCategory.DINING,
  groceries: SpendCategory.GROCERIES,
  fuel: SpendCategory.FUEL,
  travel: SpendCategory.TRAVEL,
  shopping: SpendCategory.SHOPPING,
  utilities: SpendCategory.UTILITIES,
  entertainment: SpendCategory.ENTERTAINMENT,
  healthcare: SpendCategory.HEALTHCARE,
  education: SpendCategory.EDUCATION,
  rent: SpendCategory.RENT,
  wallet_load: SpendCategory.WALLET_LOAD,
  other: SpendCategory.OTHER,
};

const RULES_VERSION = "1.0.0";

/**
 * Assign spend category from normalized merchant and merchantCategory.
 * Uses merchantCategory first (from Step 2); if empty or unknown, returns OTHER and matched = false.
 * Deterministic; no AI; no reward logic.
 */
export function assignCategory(
  _normalizedMerchant: string,
  merchantCategory: string
): CategoryRuleResult {
  const key = merchantCategory.trim().toLowerCase();
  if (!key) {
    return { spendCategory: SpendCategory.OTHER, matched: false };
  }
  const spendCategory = MERCHANT_CATEGORY_TO_SPEND[key];
  if (spendCategory !== undefined) {
    return { spendCategory, matched: true };
  }
  return { spendCategory: SpendCategory.OTHER, matched: false };
}

/** Rules version for audit; no reward logic. */
export function getCategoryRulesVersion(): string {
  return RULES_VERSION;
}
