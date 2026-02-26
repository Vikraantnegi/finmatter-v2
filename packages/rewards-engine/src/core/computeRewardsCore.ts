/**
 * Core rewards computation: pure (ruleSet + transactions + period) → per-tx rewards + period summary.
 * No DB, no cardId resolution. Caller filters transactions to period if needed.
 */

import type { CardRuleSet, CategorizedTransaction } from "@finmatter/domain";
import type { PeriodContext } from "../types";
import type { PerTransactionReward, PeriodRewardSummary } from "../types";
import { applyRulesToTransaction } from "./applyRulesToTransaction";
import { aggregatePeriod } from "./aggregatePeriod";

export type RewardComputationResult = {
  perTransactionRewards: PerTransactionReward[];
  periodSummary: PeriodRewardSummary;
};

/**
 * Compute rewards for the given rule set and transactions over the given period.
 * Transactions are filtered to period.start ≤ tx.date ≤ period.end; then per-tx evaluation and aggregation.
 */
export function computeRewardsCore(
  ruleSet: CardRuleSet,
  transactions: CategorizedTransaction[],
  period: PeriodContext
): RewardComputationResult {
  const inPeriod = transactions.filter(
    (tx) => tx.date >= period.start && tx.date <= period.end
  );
  const txRewards = inPeriod.map((tx) => applyRulesToTransaction(tx, ruleSet));
  const periodSummary = aggregatePeriod(txRewards, ruleSet, period);
  return {
    perTransactionRewards: txRewards,
    periodSummary,
  };
}
