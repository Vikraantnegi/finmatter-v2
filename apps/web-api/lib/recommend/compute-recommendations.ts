/**
 * Card recommendation: same transaction set, baseline = max(user's cards),
 * recommend only cards that beat baseline. No reward logic; orchestration only.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  computeRewardsCore,
  type PeriodContext,
  type PeriodRewardSummary,
} from "@finmatter/rewards-engine";
import { loadRuleSet } from "../rewards/rule-set-loader";
import { fetchAllUserTransactionsInPeriod } from "../rewards/fetch-transactions";
import { fetchCatalogVariantIds } from "./fetch-catalog-ids";
import type { RecommendCardsResult, CardRecommendation } from "./types";

export type ComputeRecommendationsParams = {
  userId: string;
  period: PeriodContext;
  baselineCardIds: string[];
  candidateCardIds?: string[];
};

/**
 * Resolve candidates (catalog \ baseline or provided \ baseline), fetch one tx set,
 * compute baseline from baselineCardIds, run engine for each candidate, filter and rank.
 */
export async function computeRecommendations(
  supabase: SupabaseClient,
  params: ComputeRecommendationsParams
): Promise<RecommendCardsResult> {
  const { userId, period, baselineCardIds, candidateCardIds: providedCandidates } = params;

  const baselineSet = new Set(baselineCardIds);
  let candidateIds: string[];
  if (providedCandidates && providedCandidates.length > 0) {
    candidateIds = providedCandidates.filter((id) => !baselineSet.has(id));
  } else {
    const catalogIds = await fetchCatalogVariantIds(supabase);
    candidateIds = catalogIds.filter((id) => !baselineSet.has(id));
  }

  const transactions = await fetchAllUserTransactionsInPeriod(supabase, {
    userId,
    periodStart: period.start,
    periodEnd: period.end,
  });

  const noRuleSet: string[] = [];
  const totalsByCard = new Map<string, number>();
  const summariesByCard = new Map<string, PeriodRewardSummary>();

  const runForCard = (cardId: string): boolean => {
    const ruleSet = loadRuleSet(cardId);
    if (!ruleSet) {
      if (candidateIds.includes(cardId)) noRuleSet.push(cardId);
      return false;
    }
    const result = computeRewardsCore(ruleSet, transactions, period);
    totalsByCard.set(cardId, result.periodSummary.totalReward);
    summariesByCard.set(cardId, result.periodSummary);
    return true;
  };

  for (const cardId of baselineCardIds) {
    runForCard(cardId);
  }
  for (const cardId of candidateIds) {
    runForCard(cardId);
  }

  let baselineReward = 0;
  let baselineCardId: string | null = null;
  for (const cardId of baselineCardIds) {
    const total = totalsByCard.get(cardId);
    if (total !== undefined && total > baselineReward) {
      baselineReward = total;
      baselineCardId = cardId;
    }
  }

  const recommendations: CardRecommendation[] = [];
  for (const cardId of candidateIds) {
    if (noRuleSet.includes(cardId)) continue;
    const totalReward = totalsByCard.get(cardId) ?? 0;
    const incrementalReward = totalReward - baselineReward;
    if (incrementalReward <= 0) continue;

    const baselineSummary = baselineCardId
      ? (summariesByCard.get(baselineCardId)?.byCategory as Record<string, number> | undefined)
      : undefined;
    const cardSummary = summariesByCard.get(cardId)?.byCategory as Record<string, number> | undefined;
    const { bestCategories, explanation } = buildExplanation(
      cardSummary,
      baselineSummary,
      totalReward,
      baselineReward
    );

    recommendations.push({
      cardId,
      totalReward,
      incrementalReward,
      bestCategories,
      explanation,
    });
  }

  recommendations.sort((a, b) => b.incrementalReward - a.incrementalReward);

  return {
    baselineReward,
    baselineCardId,
    recommendations,
    excluded: {
      noRuleSet,
      ineligible: [],
    },
  };
}

function buildExplanation(
  cardByCategory: Record<string, number> | undefined,
  baselineByCategory: Record<string, number> | undefined,
  cardTotal: number,
  baselineTotal: number
): { bestCategories: string[]; explanation: string[] } {
  const bestCategories: string[] = [];
  const explanation: string[] = [];

  const cardCat = cardByCategory ?? {};
  const baseCat = baselineByCategory ?? {};
  const categories = new Set([...Object.keys(cardCat), ...Object.keys(baseCat)]);

  for (const cat of categories) {
    const cardVal = cardCat[cat] ?? 0;
    const baseVal = baseCat[cat] ?? 0;
    if (cardVal > baseVal) {
      bestCategories.push(cat);
      explanation.push(`Higher reward in ${cat} vs baseline`);
    }
  }

  if (explanation.length === 0 && cardTotal > baselineTotal) {
    explanation.push("Higher total reward vs baseline");
  }

  return { bestCategories, explanation };
}
