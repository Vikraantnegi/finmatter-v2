/**
 * Unit tests: per-transaction evaluation (exclusions → category rate → provisional reward).
 */

import { describe, it, expect } from "vitest";
import { SpendCategory, TransactionType } from "@finmatter/domain";
import { applyRulesToTransaction } from "./applyRulesToTransaction";
import { ruleSet, tx } from "../test-helpers";

describe("applyRulesToTransaction", () => {
  const baseRuleSet = ruleSet("card-1", [
    { type: "exclusion", category: SpendCategory.FUEL },
    { type: "category_rate", category: SpendCategory.SHOPPING, ratePer100: 5 },
    { type: "category_rate", category: SpendCategory.OTHER, ratePer100: 1 },
  ]);

  it("excluded category → 0 reward, excluded true", () => {
    const t = tx({
      id: "tx-1",
      cardId: "card-1",
      date: "2025-01-15",
      amount: 2000,
      spendCategory: SpendCategory.FUEL,
    });
    const r = applyRulesToTransaction(t, baseRuleSet);
    expect(r.excluded).toBe(true);
    expect(r.rewardAmount).toBe(0);
    expect(r.explanation).toContain("Excluded category");
  });

  it("category rate without cap → provisional reward", () => {
    const t = tx({
      id: "tx-2",
      cardId: "card-1",
      date: "2025-01-15",
      amount: 2000,
      spendCategory: SpendCategory.SHOPPING,
    });
    const r = applyRulesToTransaction(t, baseRuleSet);
    expect(r.excluded).toBe(false);
    expect(r.rewardAmount).toBe(100); // 2000/100 * 5
    expect(r.baseAmount).toBe(2000);
    expect(r.appliedRule.ruleType).toBe("category_rate");
  });

  it("1% on other → floor(amount/100 * 1)", () => {
    const t = tx({
      id: "tx-3",
      cardId: "card-1",
      date: "2025-01-15",
      amount: 999,
      spendCategory: SpendCategory.OTHER,
    });
    const r = applyRulesToTransaction(t, baseRuleSet);
    expect(r.rewardAmount).toBe(9); // floor(9.99)
  });

  it("REFUND type → excluded, 0 reward", () => {
    const t = tx({
      id: "tx-4",
      cardId: "card-1",
      date: "2025-01-15",
      amount: 1000,
      spendCategory: SpendCategory.SHOPPING,
      type: TransactionType.REFUND,
    });
    const r = applyRulesToTransaction(t, baseRuleSet);
    expect(r.excluded).toBe(true);
    expect(r.rewardAmount).toBe(0);
    expect(r.explanation).toContain("Ineligible transaction type");
  });

  it("DEBIT type → excluded, 0 reward", () => {
    const t = tx({
      id: "tx-5",
      cardId: "card-1",
      date: "2025-01-15",
      amount: 5000,
      spendCategory: SpendCategory.OTHER,
      type: TransactionType.DEBIT,
    });
    const r = applyRulesToTransaction(t, baseRuleSet);
    expect(r.excluded).toBe(true);
    expect(r.rewardAmount).toBe(0);
  });

  it("no rate rule for category → 0 reward, excluded false", () => {
    const t = tx({
      id: "tx-6",
      cardId: "card-1",
      date: "2025-01-15",
      amount: 1000,
      spendCategory: SpendCategory.DINING,
    });
    const r = applyRulesToTransaction(t, baseRuleSet);
    expect(r.excluded).toBe(false);
    expect(r.rewardAmount).toBe(0);
    expect(r.explanation).toContain("No rate rule");
  });
});
