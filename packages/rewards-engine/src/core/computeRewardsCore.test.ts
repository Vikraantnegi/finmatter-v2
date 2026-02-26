/**
 * Unit tests: full pipeline — cap (partial/full), milestones (not crossed, crossed, two in same period).
 * Asserts: rewardAmount = full provisional; cappedAmount = allowed portion; over-cap in capsHit.
 */

import { describe, it, expect } from "vitest";
import { SpendCategory } from "@finmatter/domain";
import { computeRewardsCore } from "./computeRewardsCore";
import { ruleSet, tx } from "../test-helpers";

describe("computeRewardsCore — caps", () => {
  const period = {
    type: "monthly" as const,
    start: "2025-01-01",
    end: "2025-01-31",
  };

  it("category cap partially hit: rewardAmount full, cappedAmount allowed only, overCap in capsHit", () => {
    const ruleSetWithCap = ruleSet("card-1", [
      { type: "exclusion", category: SpendCategory.FUEL },
      { type: "category_rate", category: SpendCategory.SHOPPING, ratePer100: 5 },
      { type: "cap", category: SpendCategory.SHOPPING, maxUnits: 100, period: "monthly" },
    ]);
    const transactions = [
      tx({ id: "tx-1", cardId: "card-1", date: "2025-01-10", amount: 2000, spendCategory: SpendCategory.SHOPPING }), // 100
      tx({ id: "tx-2", cardId: "card-1", date: "2025-01-15", amount: 2000, spendCategory: SpendCategory.SHOPPING }), // 100, but cap 100 so only 0 allowed for this one
    ];
    const result = computeRewardsCore(ruleSetWithCap, transactions, period);

    const r1 = result.perTransactionRewards.find((r) => r.transactionId === "tx-1")!;
    const r2 = result.perTransactionRewards.find((r) => r.transactionId === "tx-2")!;
    expect(r1.rewardAmount).toBe(100);
    expect(r1.cappedAmount).toBe(100);
    expect(r2.rewardAmount).toBe(100);
    expect(r2.cappedAmount).toBe(0);

    const shoppingCap = result.periodSummary.capsHit.find((c) => c.category === SpendCategory.SHOPPING);
    expect(shoppingCap).toBeDefined();
    expect(shoppingCap!.totalEarned).toBe(200);
    expect(shoppingCap!.capValue).toBe(100);
    expect(shoppingCap!.cappedValue).toBe(100);
    expect(shoppingCap!.overCap).toBe(100);
  });

  it("category cap fully hit: all reward allowed", () => {
    const ruleSetWithCap = ruleSet("card-1", [
      { type: "category_rate", category: SpendCategory.SHOPPING, ratePer100: 5 },
      { type: "cap", category: SpendCategory.SHOPPING, maxUnits: 1000, period: "monthly" },
    ]);
    const transactions = [
      tx({ id: "tx-1", cardId: "card-1", date: "2025-01-10", amount: 2000, spendCategory: SpendCategory.SHOPPING }), // 100
      tx({ id: "tx-2", cardId: "card-1", date: "2025-01-15", amount: 10000, spendCategory: SpendCategory.SHOPPING }), // 500
    ];
    const result = computeRewardsCore(ruleSetWithCap, transactions, period);
    expect(result.periodSummary.totalReward).toBe(600);
    const shoppingCap = result.periodSummary.capsHit.find((c) => c.category === SpendCategory.SHOPPING);
    expect(shoppingCap!.totalEarned).toBe(600);
    expect(shoppingCap!.cappedValue).toBe(600);
    expect(shoppingCap!.overCap).toBe(0);
  });
});

describe("computeRewardsCore — milestones", () => {
  const quarterlyPeriod = {
    type: "quarterly" as const,
    start: "2025-01-01",
    end: "2025-03-31",
  };

  it("milestone not crossed", () => {
    const ruleSetWithMilestone = ruleSet("card-1", [
      { type: "category_rate", category: SpendCategory.SHOPPING, ratePer100: 5 },
      { type: "milestone", threshold: 100000, period: "quarterly", declaredReward: "Bonus 1000" },
    ]);
    const transactions = [
      tx({ id: "tx-1", cardId: "card-1", date: "2025-01-15", amount: 50000, spendCategory: SpendCategory.SHOPPING }),
    ];
    const result = computeRewardsCore(ruleSetWithMilestone, transactions, quarterlyPeriod);
    const m = result.periodSummary.milestonesTriggered[0];
    expect(m.threshold).toBe(100000);
    expect(m.spendInPeriod).toBe(50000);
    expect(m.crossed).toBe(false);
  });

  it("milestone crossed exactly at threshold", () => {
    const ruleSetWithMilestone = ruleSet("card-1", [
      { type: "category_rate", category: SpendCategory.OTHER, ratePer100: 1 },
      { type: "milestone", threshold: 100000, period: "quarterly", declaredReward: "Gift voucher ₹1000" },
    ]);
    const transactions = [
      tx({ id: "tx-1", cardId: "card-1", date: "2025-01-15", amount: 100000, spendCategory: SpendCategory.OTHER }),
    ];
    const result = computeRewardsCore(ruleSetWithMilestone, transactions, quarterlyPeriod);
    const m = result.periodSummary.milestonesTriggered[0];
    expect(m.spendInPeriod).toBe(100000);
    expect(m.crossed).toBe(true);
    expect(m.declaredReward).toBe("Gift voucher ₹1000");
  });

  it("two milestones in same period — both fire in ascending threshold order", () => {
    const ruleSetTwoMilestones = ruleSet("card-1", [
      { type: "category_rate", category: SpendCategory.SHOPPING, ratePer100: 1 },
      { type: "milestone", threshold: 50000, period: "quarterly", declaredReward: "Bonus A", sourceMilestoneIndex: 0 },
      { type: "milestone", threshold: 100000, period: "quarterly", declaredReward: "Bonus B", sourceMilestoneIndex: 1 },
    ]);
    const transactions = [
      tx({ id: "tx-1", cardId: "card-1", date: "2025-01-15", amount: 120000, spendCategory: SpendCategory.SHOPPING }),
    ];
    const result = computeRewardsCore(ruleSetTwoMilestones, transactions, quarterlyPeriod);
    expect(result.periodSummary.milestonesTriggered).toHaveLength(2);
    expect(result.periodSummary.milestonesTriggered[0].threshold).toBe(50000);
    expect(result.periodSummary.milestonesTriggered[0].crossed).toBe(true);
    expect(result.periodSummary.milestonesTriggered[1].threshold).toBe(100000);
    expect(result.periodSummary.milestonesTriggered[1].crossed).toBe(true);
  });
});
