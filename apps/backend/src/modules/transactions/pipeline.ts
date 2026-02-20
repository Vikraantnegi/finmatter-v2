/**
 * Transaction pipeline (Step 7): raw → normalize → categorize → deduplicate.
 * Single entry point for wiring after parse.
 */

import type { RawTransaction, CategorizedTransaction } from "@finmatter/domain";
import { normalize } from "./normalization.service";
import { categorize } from "./categorization.service";
import { deduplicate } from "./dedup";

/**
 * Run full pipeline: normalize each raw tx, categorize each, then deduplicate.
 * Order is fixed; no step skipped. Returns canonical CategorizedTransaction[].
 */
export function runPipeline(rawTransactions: RawTransaction[]): CategorizedTransaction[] {
  const normalized = rawTransactions.map(normalize);
  const categorized = normalized.map(categorize);
  return deduplicate(categorized);
}
