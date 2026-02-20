/**
 * Unit tests for dedup (Step 6).
 * Run: pnpm exec ts-node src/modules/transactions/dedup.test.ts
 */

import * as assert from "node:assert";
import { SpendCategory } from "@finmatter/domain";
import { TransactionType, TransactionStatus, ParseMethod } from "@finmatter/domain";
import { canonicalKey, deduplicate } from "./dedup";
import type { CategorizedTransaction } from "@finmatter/domain";

function makeTx(
  overrides: Partial<CategorizedTransaction> & {
    statementId: string;
    date: string;
    amount: number;
    merchant: { raw: string; normalized: string; merchantCategory: string };
  }
): CategorizedTransaction {
  const {
    statementId,
    date,
    amount,
    merchant,
    id = "id-1",
    ...rest
  } = overrides;
  return {
    id,
    rawId: "raw-1",
    userId: "u1",
    cardId: "c1",
    statementId,
    date,
    amount,
    currency: "INR",
    merchant,
    type: TransactionType.DEBIT,
    description: "",
    status: TransactionStatus.COMPLETED,
    createdAt: "",
    updatedAt: "",
    confidenceScore: 1,
    parseMethod: ParseMethod.RULE,
    spendCategory: SpendCategory.DINING,
    ...rest,
  };
}

function runTests(): void {
  // canonicalKey: same fields → same key
  const tx1 = makeTx({
    statementId: "st-1",
    date: "2025-01-15",
    amount: 500,
    merchant: { raw: "ZOMATO", normalized: "Zomato", merchantCategory: "dining" },
  });
  const tx2 = makeTx({
    statementId: "st-1",
    date: "2025-01-15",
    amount: 500,
    merchant: { raw: "ZOMATO", normalized: "Zomato", merchantCategory: "dining" },
  });
  assert.strictEqual(canonicalKey(tx1), canonicalKey(tx2));

  // Different field → different key
  const tx3 = makeTx({
    statementId: "st-1",
    date: "2025-01-15",
    amount: 600,
    merchant: { raw: "ZOMATO", normalized: "Zomato", merchantCategory: "dining" },
  });
  assert.notStrictEqual(canonicalKey(tx1), canonicalKey(tx3));

  const tx4 = makeTx({
    statementId: "st-1",
    date: "2025-01-16",
    amount: 500,
    merchant: { raw: "ZOMATO", normalized: "Zomato", merchantCategory: "dining" },
  });
  assert.notStrictEqual(canonicalKey(tx1), canonicalKey(tx4));

  // deduplicate: two same key → one kept (first wins)
  const list = [tx1, tx2];
  const out = deduplicate(list);
  assert.strictEqual(out.length, 1);
  assert.strictEqual(out[0].id, tx1.id);

  // Three tx, two same key → two in output
  const list2 = [
    tx1,
    tx3,
    tx2, // same key as tx1
  ];
  const out2 = deduplicate(list2);
  assert.strictEqual(out2.length, 2);
  assert.strictEqual(out2[0].amount, 500);
  assert.strictEqual(out2[1].amount, 600);

  console.log("dedup: all tests passed");
}

runTests();
