/**
 * Per-transaction evaluation: exclusions → category rate → provisional reward.
 * Eligible spend = CREDIT type, non-excluded category. REFUND/DEBIT do not earn reward.
 */

import type {
  CardRuleSet,
  CategorizedTransaction,
  CategoryRateRule,
  ExclusionRule,
  RewardRule,
} from "@finmatter/domain";
import { TransactionType } from "@finmatter/domain";
import type { PerTransactionReward, RuleRef } from "../types";

function getExclusionCategories(rules: RewardRule[]): Set<string> {
  const set = new Set<string>();
  for (const r of rules) {
    if (r.type === "exclusion") set.add((r as ExclusionRule).category);
  }
  return set;
}

function getCategoryRate(
  rules: RewardRule[],
  category: string
): CategoryRateRule | undefined {
  return rules.find(
    (r): r is CategoryRateRule =>
      r.type === "category_rate" && r.category === category
  ) as CategoryRateRule | undefined;
}

/**
 * Apply rules to a single transaction. Returns provisional reward (no cap applied).
 */
export function applyRulesToTransaction(
  tx: CategorizedTransaction,
  ruleSet: CardRuleSet
): PerTransactionReward {
  const category = tx.spendCategory;
  const excludedCategories = getExclusionCategories(ruleSet.rules);
  const isExcludedCategory = excludedCategories.has(category);
  const isEligibleType = tx.type === TransactionType.CREDIT;
  const excluded = !isEligibleType || isExcludedCategory;

  if (excluded) {
    const reason = !isEligibleType
      ? "Ineligible transaction type (not CREDIT)"
      : `Excluded category: ${category}`;
    return {
      transactionId: tx.id,
      cardId: tx.cardId,
      category,
      appliedRule: { ruleType: "exclusion" },
      baseAmount: tx.amount,
      rewardAmount: 0,
      excluded: true,
      explanation: reason,
      transactionDate: tx.date,
    };
  }

  const rateRule = getCategoryRate(ruleSet.rules, category);
  if (!rateRule) {
    return {
      transactionId: tx.id,
      cardId: tx.cardId,
      category,
      appliedRule: { ruleType: "category_rate" },
      baseAmount: tx.amount,
      rewardAmount: 0,
      excluded: false,
      explanation: `No rate rule for category: ${category}`,
      transactionDate: tx.date,
    };
  }

  const units = Math.floor((tx.amount / 100) * rateRule.ratePer100);
  const appliedRule: RuleRef = {
    ruleType: "category_rate",
    sourceConstraintIndex: rateRule.sourceConstraintIndex,
  };

  return {
    transactionId: tx.id,
    cardId: tx.cardId,
    category,
    appliedRule,
    baseAmount: tx.amount,
    rewardAmount: units,
    excluded: false,
    explanation: `${rateRule.ratePer100}% on ${category}: ${units} units from ₹${tx.amount}`,
    transactionDate: tx.date,
  };
}
