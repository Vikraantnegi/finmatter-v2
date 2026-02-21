/**
 * Unit tests for catalog service (validation).
 * Run: pnpm exec ts-node src/modules/catalog/catalog.service.test.ts
 */

import * as assert from "node:assert";
import {
  validateCardVariantPayload,
  rowToCardVariant,
  cardVariantToRow,
} from "./catalog.service";
import type { CatalogRow } from "./catalog.types";

function runTests(): void {
  // Reject missing source
  const noSource = validateCardVariantPayload({
    sourceRef: "https://example.com/mitc.pdf",
    effectiveFrom: "2024-01-01",
    verifiedAt: "2024-01-15T00:00:00Z",
    bank: "HDFC",
    family: "Regalia",
    variantName: "Regalia",
    network: "Visa",
    rewardCurrency: "points",
    fees: {},
  });
  assert.ok(noSource.length > 0 && noSource.some((e) => e.includes("source")));

  // Reject missing sourceRef
  const noSourceRef = validateCardVariantPayload({
    source: "mitc",
    effectiveFrom: "2024-01-01",
    verifiedAt: "2024-01-15T00:00:00Z",
    bank: "HDFC",
    family: "Regalia",
    variantName: "Regalia",
    network: "Visa",
    rewardCurrency: "points",
    fees: {},
  });
  assert.ok(
    noSourceRef.length > 0 && noSourceRef.some((e) => e.includes("sourceRef"))
  );

  // Reject invalid rewardCurrency
  const badCurrency = validateCardVariantPayload({
    source: "mitc",
    sourceRef: "x.pdf",
    effectiveFrom: "2024-01-01",
    verifiedAt: "2024-01-15T00:00:00Z",
    bank: "HDFC",
    family: "Regalia",
    variantName: "Regalia",
    network: "Visa",
    rewardCurrency: "Reward Points",
    fees: {},
  });
  assert.ok(badCurrency.length > 0 && badCurrency.some((e) => e.includes("rewardCurrency")));

  // Accept valid payload (minimal)
  const valid = validateCardVariantPayload({
    source: "mitc",
    sourceRef: "hdfc_regalia_mitc_2024.pdf",
    effectiveFrom: "2024-01-01",
    verifiedAt: "2024-01-15T00:00:00Z",
    bank: "HDFC",
    family: "Regalia",
    variantName: "Regalia",
    network: "Visa",
    rewardCurrency: "points",
    fees: {},
  });
  assert.strictEqual(valid.length, 0);

  // rowToCardVariant / cardVariantToRow roundtrip
  const row: CatalogRow = {
    id: "test-id",
    bank: "HDFC",
    family: "Regalia",
    variant_name: "Regalia",
    network: "Visa",
    reward_currency: "points",
    card_type: "credit",
    fees: { annual: { amount: 2500, currency: "INR" } },
    milestones: [],
    benefits: [],
    declared_constraints: [],
    declared_eligibility: [],
    declared_welcome_benefits: [],
    effective_from: "2024-01-01",
    effective_to: null,
    source: "mitc",
    source_ref: "https://example.com/mitc.pdf",
    verified_at: "2024-01-15T00:00:00Z",
  };
  const variant = rowToCardVariant(row);
  assert.strictEqual(variant.id, "test-id");
  assert.strictEqual(variant.bank, "HDFC");
  assert.strictEqual(variant.rewardCurrency, "points");
  assert.strictEqual(variant.sourceRef, "https://example.com/mitc.pdf");
  const back = cardVariantToRow(variant);
  assert.strictEqual(back.id, row.id);
  assert.strictEqual(back.source_ref, row.source_ref);
  assert.deepStrictEqual(back.declared_constraints, []);

  console.log("Catalog service tests passed.");
}

runTests();
