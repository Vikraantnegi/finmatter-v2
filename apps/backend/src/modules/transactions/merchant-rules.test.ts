/**
 * Unit tests for merchant normalization rules (Step 2).
 * No external test library: uses Node.js built-in `assert` (node:assert).
 * Run: pnpm exec ts-node src/modules/transactions/merchant-rules.test.ts
 * Optional: add Vitest or Jest later for describe/it, coverage, and CI.
 */

import * as assert from "node:assert";
import { normalizeMerchant, getMerchantRulesVersion } from "./merchant-rules";

function runTests(): void {
  // Zomato
  assert.deepStrictEqual(normalizeMerchant("ZOMATO NEW DELHI IN"), {
    normalized: "Zomato",
    merchantCategory: "dining",
    matched: true,
  });

  // Swiggy variants
  assert.deepStrictEqual(normalizeMerchant("PYU*Swiggy FoodBangalore"), {
    normalized: "Swiggy",
    merchantCategory: "dining",
    matched: true,
  });
  assert.deepStrictEqual(normalizeMerchant("Payu*Swiggy FoodBangalore"), {
    normalized: "Swiggy",
    merchantCategory: "dining",
    matched: true,
  });
  assert.deepStrictEqual(normalizeMerchant("PTM*SWIGGY INBANGALORE"), {
    normalized: "Swiggy",
    merchantCategory: "dining",
    matched: true,
  });

  // Instamart
  assert.deepStrictEqual(normalizeMerchant("RSP*INSTAMARTBANGALORE"), {
    normalized: "Instamart",
    merchantCategory: "groceries",
    matched: true,
  });
  assert.deepStrictEqual(normalizeMerchant("PYU*Instamart GroceryBangalore"), {
    normalized: "Instamart",
    merchantCategory: "groceries",
    matched: true,
  });

  // Amazon
  assert.deepStrictEqual(normalizeMerchant("AMAZON PAY IN E COMMERC BANGALORE IN"), {
    normalized: "Amazon Pay",
    merchantCategory: "wallet_load",
    matched: true,
  });

  // Payment
  assert.deepStrictEqual(
    normalizeMerchant("BPPY CC PAYMENT DP016002110700liIbu (Ref# ST260030083000010393273)"),
    { normalized: "Payment", merchantCategory: "other", matched: true }
  );
  assert.deepStrictEqual(normalizeMerchant("BBPS PMT BBPSDP016002110233c1SNIG"), {
    normalized: "Payment",
    merchantCategory: "other",
    matched: true,
  });

  // UPI
  assert.deepStrictEqual(normalizeMerchant("UPI-GAYATHRI P"), {
    normalized: "UPI Transfer",
    merchantCategory: "other",
    matched: true,
  });

  // Social, Croma, Game Redemption
  assert.deepStrictEqual(normalizeMerchant("SOCIAL BELLANDUR 037325 BANGALORE"), {
    normalized: "Social",
    merchantCategory: "dining",
    matched: true,
  });
  assert.deepStrictEqual(normalizeMerchant("CROMA RETAIL"), {
    normalized: "Croma",
    merchantCategory: "shopping",
    matched: true,
  });
  assert.deepStrictEqual(normalizeMerchant("Game Redemption XYZ"), {
    normalized: "Game Redemption",
    merchantCategory: "entertainment",
    matched: true,
  });

  // No match: fallback to raw
  assert.deepStrictEqual(normalizeMerchant("UNKNOWN MERCHANT XYZ"), {
    normalized: "UNKNOWN MERCHANT XYZ",
    merchantCategory: "",
    matched: false,
  });

  // Empty
  assert.deepStrictEqual(normalizeMerchant(""), { normalized: "", merchantCategory: "", matched: false });
  assert.deepStrictEqual(normalizeMerchant("   "), { normalized: "", merchantCategory: "", matched: false });

  // New rules (Netflix, Munchmart, Airtel, BookMyShow, BBPS Payment)
  assert.deepStrictEqual(normalizeMerchant("NETFLIX DI SI MUMBAI IN"), {
    normalized: "Netflix",
    merchantCategory: "entertainment",
    matched: true,
  });
  assert.deepStrictEqual(normalizeMerchant("MUNCHMART TECHNOLOGIES BANGALORE IN"), {
    normalized: "Munchmart",
    merchantCategory: "dining",
    matched: true,
  });
  assert.deepStrictEqual(normalizeMerchant("WWW AIRTEL IN SI NEW DELHI IN"), {
    normalized: "Airtel",
    merchantCategory: "utilities",
    matched: true,
  });
  assert.deepStrictEqual(normalizeMerchant("BOOKMYSHOW MUMBAI IN"), {
    normalized: "BookMyShow",
    merchantCategory: "entertainment",
    matched: true,
  });
  assert.deepStrictEqual(normalizeMerchant("BBPS Payment received"), {
    normalized: "BBPS Payment",
    merchantCategory: "other",
    matched: true,
  });

  // Version
  assert.strictEqual(getMerchantRulesVersion(), "1.1.0");

  console.log("merchant-rules: all tests passed");
}

runTests();
