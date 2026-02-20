/**
 * Transaction foundation: normalization, categorization, dedup, pipeline.
 * Step 3: normalize(raw). Step 4: category rules. Step 5: categorize(normalized). Step 6: dedup. Step 7: runPipeline.
 */

export { normalize } from "./normalization.service";
export { categorize } from "./categorization.service";
export { runPipeline } from "./pipeline";
export { normalizeMerchant } from "./merchant-rules";
export type { MerchantRuleResult } from "./merchant-rules";
export { assignCategory, getCategoryRulesVersion } from "./category-rules";
export type { CategoryRuleResult } from "./category-rules";
export { canonicalKey, deduplicate } from "./dedup";
export type { TransactionForKey } from "./dedup";
