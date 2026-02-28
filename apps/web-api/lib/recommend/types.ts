/**
 * Request/response types for card recommendation (Phase 3).
 * Same transaction set; baseline = max(user's cards); recommend only cards that beat baseline.
 */

import type { PeriodContext } from "@finmatter/rewards-engine";

export type RecommendCardsRequest = {
  userId?: string;
  period: PeriodContext;
  /** Cards user owns; baseline reward = max total among these. Required but may be empty. */
  baselineCardIds: string[];
  /** Optional. If omitted, candidates = catalog variant ids minus baselineCardIds. */
  candidateCardIds?: string[];
};

export type CardRecommendation = {
  cardId: string;
  totalReward: number;
  incrementalReward: number;
  bestCategories: string[];
  explanation: string[];
};

export type RecommendCardsResult = {
  baselineReward: number;
  /** Null when no baseline cards or none have rule sets. */
  baselineCardId: string | null;
  recommendations: CardRecommendation[];
  excluded: {
    noRuleSet: string[];
    ineligible: string[];
  };
};
