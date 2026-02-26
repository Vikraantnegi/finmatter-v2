/**
 * Test helpers: minimal CategorizedTransaction and CardRuleSet builders.
 */

import type { CardRuleSet, CategorizedTransaction, RewardRule } from "@finmatter/domain";
import { ParseMethod, SpendCategory, TransactionStatus, TransactionType } from "@finmatter/domain";

export function tx(
  overrides: Partial<CategorizedTransaction> & {
    id: string;
    cardId: string;
    date: string;
    amount: number;
    spendCategory: SpendCategory;
  }
): CategorizedTransaction {
  return {
    id: overrides.id,
    rawId: overrides.rawId ?? overrides.id,
    userId: overrides.userId ?? "user-1",
    cardId: overrides.cardId,
    statementId: overrides.statementId ?? "stmt-1",
    date: overrides.date,
    amount: overrides.amount,
    currency: overrides.currency ?? "INR",
    merchant: overrides.merchant ?? { raw: "", normalized: "", merchantCategory: "" },
    type: overrides.type ?? TransactionType.CREDIT,
    description: overrides.description ?? "",
    status: overrides.status ?? TransactionStatus.COMPLETED,
    createdAt: overrides.createdAt ?? overrides.date,
    updatedAt: overrides.updatedAt ?? overrides.date,
    confidenceScore: overrides.confidenceScore ?? 1,
    parseMethod: overrides.parseMethod ?? ParseMethod.RULE,
    spendCategory: overrides.spendCategory,
  };
}

export function ruleSet(cardId: string, rules: RewardRule[]): CardRuleSet {
  return { cardId, rules };
}
