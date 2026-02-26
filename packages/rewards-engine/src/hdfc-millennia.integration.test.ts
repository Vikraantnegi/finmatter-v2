/**
 * HDFC Millennia integration test.
 * Asserts: fuel excluded; shopping 5/100 cap ₹1000; other 1/100 cap ₹1000; quarterly milestone ≥ ₹1L triggers once.
 * Rule set mirrors apps/backend/src/db/data/rule-sets/hdfc-millennia.json (signed off).
 */

import { describe, it, expect } from "vitest";
import type { CardRuleSet } from "@finmatter/domain";
import { SpendCategory } from "@finmatter/domain";
import { computeRewardsCore } from "./core/computeRewardsCore";
import { tx } from "./test-helpers";

// Mirrors signed-off rule set; keep in sync with apps/backend/src/db/data/rule-sets/hdfc-millennia.json
const hdfcRuleSet = require("./fixtures/hdfc-millennia-rule-set.json") as CardRuleSet;

describe("HDFC Millennia integration", () => {
  it("fuel → excluded, 0 reward", () => {
    const transactions = [
      tx({
        id: "tx-fuel",
        cardId: "hdfc-millennia",
        date: "2025-01-15",
        amount: 3000,
        spendCategory: SpendCategory.FUEL,
      }),
    ];
    const period = { type: "monthly" as const, start: "2025-01-01", end: "2025-01-31" };
    const result = computeRewardsCore(hdfcRuleSet, transactions, period);
    const r = result.perTransactionRewards[0];
    expect(r.excluded).toBe(true);
    expect(r.rewardAmount).toBe(0);
    expect(r.cappedAmount).toBe(0);
  });

  it("shopping → 5% with ₹1000 monthly cap", () => {
    const transactions = [
      tx({
        id: "tx-shop-1",
        cardId: "hdfc-millennia",
        date: "2025-01-10",
        amount: 10000,
        spendCategory: SpendCategory.SHOPPING,
      }),
    ];
    const period = { type: "monthly" as const, start: "2025-01-01", end: "2025-01-31" };
    const result = computeRewardsCore(hdfcRuleSet, transactions, period);
    const r = result.perTransactionRewards[0];
    expect(r.excluded).toBe(false);
    expect(r.rewardAmount).toBe(500); // 5% of 10000
    expect(r.cappedAmount).toBe(500);
    expect(result.periodSummary.byCategory?.shopping).toBe(500);
  });

  it("shopping cap hit at 1000", () => {
    const transactions = [
      tx({ id: "tx-1", cardId: "hdfc-millennia", date: "2025-01-05", amount: 20000, spendCategory: SpendCategory.SHOPPING }), // 1000
      tx({ id: "tx-2", cardId: "hdfc-millennia", date: "2025-01-15", amount: 10000, spendCategory: SpendCategory.SHOPPING }), // 500, over cap
    ];
    const period = { type: "monthly" as const, start: "2025-01-01", end: "2025-01-31" };
    const result = computeRewardsCore(hdfcRuleSet, transactions, period);
    const cap = result.periodSummary.capsHit.find((c) => c.category === SpendCategory.SHOPPING);
    expect(cap).toBeDefined();
    expect(cap!.totalEarned).toBe(1500);
    expect(cap!.capValue).toBe(1000);
    expect(cap!.cappedValue).toBe(1000);
    expect(cap!.overCap).toBe(500);
  });

  it("other → 1% with ₹1000 monthly cap", () => {
    const transactions = [
      tx({
        id: "tx-other",
        cardId: "hdfc-millennia",
        date: "2025-01-12",
        amount: 50000,
        spendCategory: SpendCategory.OTHER,
      }),
    ];
    const period = { type: "monthly" as const, start: "2025-01-01", end: "2025-01-31" };
    const result = computeRewardsCore(hdfcRuleSet, transactions, period);
    const r = result.perTransactionRewards[0];
    expect(r.rewardAmount).toBe(500);
    expect(r.cappedAmount).toBe(500);
  });

  it("quarterly milestone ≥ ₹1L triggers once", () => {
    const transactions = [
      tx({ id: "tx-1", cardId: "hdfc-millennia", date: "2025-01-10", amount: 60000, spendCategory: SpendCategory.SHOPPING }),
      tx({ id: "tx-2", cardId: "hdfc-millennia", date: "2025-02-15", amount: 50000, spendCategory: SpendCategory.OTHER }),
    ];
    const period = { type: "quarterly" as const, start: "2025-01-01", end: "2025-03-31" };
    const result = computeRewardsCore(hdfcRuleSet, transactions, period);
    const milestone = result.periodSummary.milestonesTriggered.find((m) => m.threshold === 100000);
    expect(milestone).toBeDefined();
    expect(milestone!.spendInPeriod).toBe(110000);
    expect(milestone!.crossed).toBe(true);
    expect(milestone!.declaredReward).toContain("Gift voucher");
  });

  it("no extra or invented rewards", () => {
    const transactions = [
      tx({ id: "tx-1", cardId: "hdfc-millennia", date: "2025-01-10", amount: 5000, spendCategory: SpendCategory.SHOPPING }),
      tx({ id: "tx-2", cardId: "hdfc-millennia", date: "2025-01-15", amount: 10000, spendCategory: SpendCategory.FUEL }),
    ];
    const period = { type: "monthly" as const, start: "2025-01-01", end: "2025-01-31" };
    const result = computeRewardsCore(hdfcRuleSet, transactions, period);
    expect(result.perTransactionRewards).toHaveLength(2);
    const shop = result.perTransactionRewards.find((r) => r.transactionId === "tx-1")!;
    const fuel = result.perTransactionRewards.find((r) => r.transactionId === "tx-2")!;
    expect(shop.rewardAmount).toBe(250);
    expect(fuel.rewardAmount).toBe(0);
    expect(fuel.excluded).toBe(true);
    expect(result.periodSummary.totalReward).toBe(250);
  });
});
