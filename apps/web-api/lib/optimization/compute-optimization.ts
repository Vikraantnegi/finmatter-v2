/**
 * Rewards optimization: same transaction set for all cards, compare outputs.
 * No reward logic; orchestration only. Cards without a rule set are skipped.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { computeRewardsCore, type PeriodContext, type PeriodRewardSummary } from "@finmatter/rewards-engine";
import { loadRuleSet } from "../rewards/rule-set-loader";
import { fetchAllUserTransactionsInPeriod } from "../rewards/fetch-transactions";
import type { OptimizeRewardsResult, ComparedCard, ByCategoryInsight } from "./types";

export type ComputeOptimizationParams = {
  userId: string;
  period: PeriodContext;
  cardIds: string[];
  baselineCardId?: string;
};

/**
 * Fetch one transaction set (all user tx in period), run engine per card with that set,
 * skip cards with no rule set, then compare and optionally build byCategory.
 */
export async function computeOptimization(
  supabase: SupabaseClient,
  params: ComputeOptimizationParams
): Promise<OptimizeRewardsResult> {
  const { userId, period, cardIds, baselineCardId: requestedBaseline } = params;

  const transactions = await fetchAllUserTransactionsInPeriod(supabase, {
    userId,
    periodStart: period.start,
    periodEnd: period.end,
  });

  const comparedCards: ComparedCard[] = [];
  const summariesByCard = new Map<string, PeriodRewardSummary>();

  for (const cardId of cardIds) {
    const ruleSet = loadRuleSet(cardId);
    if (!ruleSet) continue;

    const result = computeRewardsCore(ruleSet, transactions, period);
    comparedCards.push({ cardId, totalReward: result.periodSummary.totalReward });
    summariesByCard.set(cardId, result.periodSummary);
  }

  if (comparedCards.length === 0) {
    return {
      comparedCards: [],
      bestCardId: null,
      baselineCardId: null,
      missedReward: 0,
      byCategory: [],
    };
  }

  const best = comparedCards.reduce((a, b) => (a.totalReward >= b.totalReward ? a : b));
  const bestCardId = best.cardId;
  const maxReward = best.totalReward;

  const baselineCardId =
    requestedBaseline && comparedCards.some((c) => c.cardId === requestedBaseline)
      ? requestedBaseline
      : comparedCards[0].cardId;
  const baselineEntry = comparedCards.find((c) => c.cardId === baselineCardId);
  const baselineReward = baselineEntry?.totalReward ?? 0;
  const missedReward = Math.max(0, maxReward - baselineReward);

  const byCategory = buildByCategory(comparedCards, summariesByCard, baselineCardId);

  return {
    comparedCards,
    bestCardId,
    baselineCardId,
    missedReward,
    byCategory,
  };
}

function buildByCategory(
  comparedCards: ComparedCard[],
  summariesByCard: Map<string, PeriodRewardSummary>,
  baselineCardId: string
): ByCategoryInsight[] {
  const categories = new Set<string>();
  for (const summary of summariesByCard.values()) {
    if (summary.byCategory) {
      for (const cat of Object.keys(summary.byCategory)) {
        categories.add(cat);
      }
    }
  }

  const insights: ByCategoryInsight[] = [];
  const baselineSummary = summariesByCard.get(baselineCardId)?.byCategory;

  for (const category of categories) {
    let bestCardId = baselineCardId;
    let bestValue = 0;

    for (const { cardId } of comparedCards) {
      const byCat = summariesByCard.get(cardId)?.byCategory as Record<string, number> | undefined;
      const value = byCat?.[category] ?? 0;
      if (value > bestValue) {
        bestValue = value;
        bestCardId = cardId;
      }
    }

    const baselineValue = (baselineSummary as Record<string, number> | undefined)?.[category] ?? 0;
    const delta = Math.max(0, bestValue - baselineValue);
    const explanation =
      delta === 0
        ? "Same as baseline"
        : `Best: ${bestValue} pts vs baseline ${baselineValue} pts`;

    insights.push({
      category,
      bestCardId,
      delta,
      explanation,
    });
  }

  return insights.sort((a, b) => b.delta - a.delta);
}
