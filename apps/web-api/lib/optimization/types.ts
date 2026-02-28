/**
 * Request/response types for rewards optimization (Phase 3).
 * Same transaction set for all cards; comparison only.
 */

import type { PeriodContext } from "@finmatter/rewards-engine";

export type OptimizeRewardsRequest = {
  userId: string;
  period: PeriodContext;
  cardIds: string[];
  /** If omitted, baseline = first card in comparedCards (documented fallback). */
  baselineCardId?: string;
};

export type ComparedCard = {
  cardId: string;
  totalReward: number;
};

export type ByCategoryInsight = {
  category: string;
  bestCardId: string;
  delta: number;
  explanation: string;
};

export type OptimizeRewardsResult = {
  comparedCards: ComparedCard[];
  bestCardId: string | null;
  baselineCardId: string | null;
  missedReward: number;
  byCategory?: ByCategoryInsight[];
};
