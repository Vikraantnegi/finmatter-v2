/**
 * Per-transaction reward (ground truth for audit).
 * rewardAmount = provisional (before cap); cappedAmount = amount that counted after cap.
 */

import type { SpendCategory } from "@finmatter/domain";

export type RuleRef = {
  ruleType: "exclusion" | "category_rate";
  sourceConstraintIndex?: number;
  sourceMilestoneIndex?: number;
};

export type PerTransactionReward = {
  transactionId: string;
  cardId: string;
  category: SpendCategory;
  appliedRule: RuleRef;
  baseAmount: number;
  rewardAmount: number;
  cappedAmount?: number;
  excluded: boolean;
  explanation: string;
  transactionDate: string;
};
