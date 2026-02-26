/**
 * Per-period reward summary (what UI shows).
 */

import type { PeriodContext } from "./period";
import type { SpendCategory } from "@finmatter/domain";

export type CapHit = {
  scope: "card" | "category";
  category?: SpendCategory;
  periodKey: string;
  periodType: "monthly" | "quarterly" | "yearly";
  totalEarned: number;
  capValue: number;
  cappedValue: number;
  overCap: number;
};

export type MilestoneEvent = {
  threshold: number;
  spendInPeriod: number;
  crossed: boolean;
  declaredReward: string;
  rewardUnits?: number;
  sourceMilestoneIndex?: number;
};

export type PeriodRewardSummary = {
  period: PeriodContext;
  totalReward: number;
  byCategory: Partial<Record<SpendCategory, number>>;
  capsHit: CapHit[];
  milestonesTriggered: MilestoneEvent[];
};
