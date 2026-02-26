/**
 * Period aggregation: apply caps (in order, running totals), then evaluate milestones.
 * Caps are applied per (periodType, periodKey, category or global). When both category and global
 * caps exist, apply category cap first, then global cap (v1 rule sets use category caps only).
 * Milestones: ascending threshold, fire-on-crossing, once per period.
 */

import type {
  CapRule,
  CardRuleSet,
  MilestoneRule,
  RewardRule,
  SpendCategory,
} from "@finmatter/domain";
import type { PeriodContext } from "../types";
import { getPeriodKey } from "../types";
import type {
  CapHit,
  MilestoneEvent,
  PerTransactionReward,
  PeriodRewardSummary,
} from "../types";

function getCapRules(rules: RewardRule[]): CapRule[] {
  return rules.filter((r): r is CapRule => r.type === "cap");
}

function getMilestoneRules(rules: RewardRule[]): MilestoneRule[] {
  const list = rules.filter((r): r is MilestoneRule => r.type === "milestone");
  list.sort((a, b) => a.threshold - b.threshold);
  return list;
}

function isInPeriod(dateIso: string, period: PeriodContext): boolean {
  return dateIso >= period.start && dateIso <= period.end;
}

/**
 * Apply caps to per-tx rewards (mutates cappedAmount on each reward), then build period summary.
 */
export function aggregatePeriod(
  txRewards: PerTransactionReward[],
  ruleSet: CardRuleSet,
  period: PeriodContext
): PeriodRewardSummary {
  const inPeriod = txRewards.filter((r) => isInPeriod(r.transactionDate, period));
  const capRules = getCapRules(ruleSet.rules);

  // Build cap key -> list of rewards (category caps and global caps)
  type CapBucketKey = string;
  const bucketKeys = new Set<CapBucketKey>();
  const rewardsByBucket = new Map<CapBucketKey, PerTransactionReward[]>();

  for (const cap of capRules) {
    const periodType = cap.period;
    for (const r of inPeriod) {
      if (r.excluded || r.rewardAmount <= 0) continue;
      const categoryForCap = cap.category ?? "global";
      const matchesCategory = cap.category ? r.category === cap.category : true;
      if (!matchesCategory) continue;
      const periodKey = getPeriodKey(r.transactionDate, periodType);
      const key: CapBucketKey = `${periodType}:${periodKey}:${categoryForCap}`;
      bucketKeys.add(key);
      if (!rewardsByBucket.has(key)) rewardsByBucket.set(key, []);
      rewardsByBucket.get(key)!.push(r);
    }
  }

  // Cap value per bucket: each bucket key is periodType:periodKey:category; match cap rule by period and category.
  const capValueByKey = new Map<CapBucketKey, number>();
  for (const key of bucketKeys) {
    const [periodType, , categoryPart] = key.split(":");
    const cap = capRules.find(
      (c) =>
        c.period === periodType &&
        (c.category ?? "global") === categoryPart
    );
    if (cap) capValueByKey.set(key, cap.maxUnits);
  }

  // Sort rewards in each bucket by date, then assign cappedAmount in order
  for (const key of bucketKeys) {
    const list = rewardsByBucket.get(key)!;
    list.sort((a, b) => a.transactionDate.localeCompare(b.transactionDate));
    const capValue = capValueByKey.get(key) ?? Infinity;
    let running = 0;
    for (const r of list) {
      const allow = Math.min(r.rewardAmount, Math.max(0, capValue - running));
      r.cappedAmount = allow;
      running += allow;
    }
  }

  // Rewards not in any cap bucket: cappedAmount = rewardAmount
  for (const r of inPeriod) {
    if (r.cappedAmount === undefined) r.cappedAmount = r.rewardAmount;
  }

  // Build capsHit
  const capsHit: CapHit[] = [];
  for (const key of bucketKeys) {
    const list = rewardsByBucket.get(key)!;
    const totalEarned = list.reduce((s, r) => s + r.rewardAmount, 0);
    const capValue = capValueByKey.get(key) ?? Infinity;
    const cappedValue = list.reduce((s, r) => s + (r.cappedAmount ?? 0), 0);
    const overCap = totalEarned > capValue ? totalEarned - capValue : 0;
    const [periodType, periodKey, cat] = key.split(":");
    const category = cat === "global" ? undefined : (cat as SpendCategory);
    capsHit.push({
      scope: category ? "category" : "card",
      category,
      periodKey,
      periodType: periodType as "monthly" | "quarterly" | "yearly",
      totalEarned,
      capValue: capValue === Infinity ? totalEarned : capValue,
      cappedValue,
      overCap,
    });
  }

  // totalReward and byCategory from capped amounts
  let totalReward = 0;
  const byCategory: Partial<Record<SpendCategory, number>> = {};
  for (const r of inPeriod) {
    const amount = r.cappedAmount ?? r.rewardAmount;
    totalReward += amount;
    byCategory[r.category] = (byCategory[r.category] ?? 0) + amount;
  }

  // Milestones: spend in period = sum baseAmount of non-excluded
  const spendInPeriod = inPeriod
    .filter((r) => !r.excluded)
    .reduce((s, r) => s + r.baseAmount, 0);

  const milestoneRules = getMilestoneRules(ruleSet.rules);
  const milestonesTriggered: MilestoneEvent[] = [];
  for (const m of milestoneRules) {
    if (m.period !== period.type) continue;
    const crossed = spendInPeriod >= m.threshold;
    milestonesTriggered.push({
      threshold: m.threshold,
      spendInPeriod,
      crossed,
      declaredReward: m.declaredReward,
      rewardUnits: m.rewardUnits,
      sourceMilestoneIndex: m.sourceMilestoneIndex,
    });
  }

  return {
    period,
    totalReward,
    byCategory,
    capsHit,
    milestonesTriggered,
  };
}
