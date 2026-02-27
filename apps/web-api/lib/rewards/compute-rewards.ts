/**
 * Rewards API adapter: load rule set, fetch transactions, call engine, return result.
 * No reward logic here; only orchestration.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { computeRewardsCore, type PeriodContext, type RewardComputationResult } from "@finmatter/rewards-engine";
import { loadRuleSet } from "./rule-set-loader";
import { fetchTransactionsForPeriod } from "./fetch-transactions";

export type ComputeRewardsParams = {
  userId: string;
  cardId: string;
  period: PeriodContext;
};

export type ComputeRewardsResult =
  | { ok: true; data: RewardComputationResult }
  | { ok: false; error: "RULE_SET_NOT_FOUND" | "FETCH_FAILED"; message?: string };

/**
 * Load rule set for card, fetch transactions for (user, card, period), call engine, return result.
 * Returns error when rule set is missing or transaction fetch fails.
 */
export async function computeRewards(
  supabase: SupabaseClient,
  params: ComputeRewardsParams
): Promise<ComputeRewardsResult> {
  const ruleSet = loadRuleSet(params.cardId);
  if (!ruleSet) {
    return { ok: false, error: "RULE_SET_NOT_FOUND", message: `No rule set for card: ${params.cardId}` };
  }

  let transactions;
  try {
    transactions = await fetchTransactionsForPeriod(supabase, {
      userId: params.userId,
      cardId: params.cardId,
      periodStart: params.period.start,
      periodEnd: params.period.end,
    });
  } catch (e) {
    return {
      ok: false,
      error: "FETCH_FAILED",
      message: e instanceof Error ? e.message : "Failed to fetch transactions",
    };
  }

  const result = computeRewardsCore(ruleSet, transactions, params.period);
  return { ok: true, data: result };
}
