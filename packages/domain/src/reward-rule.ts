/**
 * Reward Rules DSL — domain types (Milestone 3).
 * Representation only: no execution. Engine consumes CardRuleSet + canonical transactions (Phase 2).
 *
 * Units (Finance): Rate denominator is per ₹100 spend. Reward unit is the card's rewardCurrency
 * from the catalog. Cap is in the same unit and applies per period. Milestone threshold is in INR.
 * Exclusion = no reward for that category; category is not counted toward any cap unless rule set says otherwise.
 */

import type { Period } from "./card-variant";
import type { SpendCategory } from "./spend-category";

export type RuleTraceability = {
  sourceConstraintIndex?: number;
  sourceMilestoneIndex?: number;
  sourceRef?: string;
};

export type CategoryRateRule = RuleTraceability & {
  type: "category_rate";
  category: SpendCategory;
  ratePer100: number;
};

export type CapRule = RuleTraceability & {
  type: "cap";
  category?: SpendCategory;
  maxUnits: number;
  period: Period;
};

export type ExclusionRule = RuleTraceability & {
  type: "exclusion";
  category: SpendCategory;
};

export type MilestoneRule = RuleTraceability & {
  type: "milestone";
  threshold: number;
  period: Period;
  declaredReward: string;
  rewardUnits?: number;
};

export type RewardRule =
  | CategoryRateRule
  | CapRule
  | ExclusionRule
  | MilestoneRule;

export type CardRuleSet = {
  cardId: string;
  rules: RewardRule[];
};
