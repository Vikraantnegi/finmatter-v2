/**
 * Unit tests for category assignment rules (Step 4).
 * Uses Node.js built-in assert. Run: pnpm exec ts-node src/modules/transactions/category-rules.test.ts
 */

import * as assert from "node:assert";
import { SpendCategory } from "@finmatter/domain";
import { assignCategory, getCategoryRulesVersion } from "./category-rules";

function runTests(): void {
  // merchantCategory from Step 2 → SpendCategory
  assert.deepStrictEqual(assignCategory("Zomato", "dining"), {
    spendCategory: SpendCategory.DINING,
    matched: true,
  });
  assert.deepStrictEqual(assignCategory("Swiggy", "dining"), {
    spendCategory: SpendCategory.DINING,
    matched: true,
  });
  assert.deepStrictEqual(assignCategory("Instamart", "groceries"), {
    spendCategory: SpendCategory.GROCERIES,
    matched: true,
  });
  assert.deepStrictEqual(assignCategory("Croma", "shopping"), {
    spendCategory: SpendCategory.SHOPPING,
    matched: true,
  });
  assert.deepStrictEqual(assignCategory("Amazon Pay", "wallet_load"), {
    spendCategory: SpendCategory.WALLET_LOAD,
    matched: true,
  });
  assert.deepStrictEqual(assignCategory("Game Redemption", "entertainment"), {
    spendCategory: SpendCategory.ENTERTAINMENT,
    matched: true,
  });
  assert.deepStrictEqual(assignCategory("Payment", "other"), {
    spendCategory: SpendCategory.OTHER,
    matched: true,
  });
  assert.deepStrictEqual(assignCategory("UPI Transfer", "other"), {
    spendCategory: SpendCategory.OTHER,
    matched: true,
  });

  // Case-insensitive merchantCategory
  assert.deepStrictEqual(assignCategory("X", "DINING"), {
    spendCategory: SpendCategory.DINING,
    matched: true,
  });
  assert.deepStrictEqual(assignCategory("X", "  groceries  "), {
    spendCategory: SpendCategory.GROCERIES,
    matched: true,
  });

  // Empty or unknown merchantCategory → OTHER, matched = false
  assert.deepStrictEqual(assignCategory("Unknown Merchant", ""), {
    spendCategory: SpendCategory.OTHER,
    matched: false,
  });
  assert.deepStrictEqual(assignCategory("Unknown", "   "), {
    spendCategory: SpendCategory.OTHER,
    matched: false,
  });
  assert.deepStrictEqual(assignCategory("X", "unknown_cat"), {
    spendCategory: SpendCategory.OTHER,
    matched: false,
  });

  // Version
  assert.strictEqual(getCategoryRulesVersion(), "1.0.0");

  console.log("category-rules: all tests passed");
}

runTests();
