/**
 * @finmatter/rewards-engine — Deterministic rewards engine (Phase 2).
 * Pure TypeScript; no DB. Core accepts ruleSet + transactions + period.
 */

export { applyRulesToTransaction } from "./core/applyRulesToTransaction";
export { aggregatePeriod } from "./core/aggregatePeriod";
export {
  computeRewardsCore,
  type RewardComputationResult,
} from "./core/computeRewardsCore";

export type { CardRuleSet } from "@finmatter/domain";
export type {
  PeriodContext,
  PerTransactionReward,
  PeriodRewardSummary,
  RuleRef,
  CapHit,
  MilestoneEvent,
} from "./types";
export { getPeriodKey } from "./types";
