/**
 * Merchant normalization rules (Step 2).
 * Input: raw description from parsed transaction.
 * Output: { normalized, merchantCategory? }.
 * Deterministic; no reward logic. Versioned via code.
 */

export type MerchantRuleResult = {
  normalized: string;
  merchantCategory?: string;
  /** True when a rule matched; false when fallback (raw) was returned. Used by normalization for confidence/parseMethod. */
  matched: boolean;
};

/** Rule: pattern (substring, case-insensitive) → normalized name and optional category hint for Step 4. */
type MerchantRule = {
  pattern: string;
  normalized: string;
  merchantCategory?: string;
};

/**
 * Ordered rules; first match wins. Patterns are matched case-insensitively (description includes pattern).
 * This list is intentionally expandable: add rules as we encounter new merchants (Social, Croma, etc.).
 * For hundreds of rules, consider loading from JSON/DB so ops can update without code deploy; same logic.
 */
const MERCHANT_RULES: MerchantRule[] = [
  // Food / dining
  { pattern: "ZOMATO", normalized: "Zomato", merchantCategory: "dining" },
  { pattern: "PYU*Swiggy", normalized: "Swiggy", merchantCategory: "dining" },
  { pattern: "Payu*Swiggy", normalized: "Swiggy", merchantCategory: "dining" },
  { pattern: "PTM*SWIGGY", normalized: "Swiggy", merchantCategory: "dining" },
  { pattern: "Swiggy", normalized: "Swiggy", merchantCategory: "dining" },
  { pattern: "SOCIAL ", normalized: "Social", merchantCategory: "dining" },
  { pattern: "Social ", normalized: "Social", merchantCategory: "dining" },
  { pattern: "Dominos", normalized: "Domino's", merchantCategory: "dining" },
  { pattern: "Domino's", normalized: "Domino's", merchantCategory: "dining" },
  { pattern: "Munchmart", normalized: "Munchmart", merchantCategory: "dining" },
  { pattern: "MUNCHMART", normalized: "Munchmart", merchantCategory: "dining" },
  // Groceries
  { pattern: "RSP*INSTAMART", normalized: "Instamart", merchantCategory: "groceries" },
  { pattern: "PYU*Instamart", normalized: "Instamart", merchantCategory: "groceries" },
  { pattern: "Instamart", normalized: "Instamart", merchantCategory: "groceries" },
  // Shopping / electronics
  { pattern: "CROMA", normalized: "Croma", merchantCategory: "shopping" },
  { pattern: "Croma", normalized: "Croma", merchantCategory: "shopping" },
  { pattern: "AMAZON PAY", normalized: "Amazon Pay", merchantCategory: "wallet_load" },
  { pattern: "AMAZON", normalized: "Amazon", merchantCategory: "shopping" },
  // Utilities
  { pattern: "Airtel", normalized: "Airtel", merchantCategory: "utilities" },
  { pattern: "AIRTEL", normalized: "Airtel", merchantCategory: "utilities" },
  // Entertainment
  { pattern: "Netflix", normalized: "Netflix", merchantCategory: "entertainment" },
  { pattern: "NETFLIX", normalized: "Netflix", merchantCategory: "entertainment" },
  { pattern: "BookMyShow", normalized: "BookMyShow", merchantCategory: "entertainment" },
  { pattern: "BOOKMYSHOW", normalized: "BookMyShow", merchantCategory: "entertainment" },
  { pattern: "Game Redemption", normalized: "Game Redemption", merchantCategory: "entertainment" },
  { pattern: "GAME REDEMPTION", normalized: "Game Redemption", merchantCategory: "entertainment" },
  // Payments / other
  { pattern: "BBPS Payment received", normalized: "BBPS Payment", merchantCategory: "other" },
  { pattern: "BBPS Payment", normalized: "BBPS Payment", merchantCategory: "other" },
  { pattern: "BPPY CC PAYMENT", normalized: "Payment", merchantCategory: "other" },
  { pattern: "BBPS PMT", normalized: "Payment", merchantCategory: "other" },
  { pattern: "UPI-", normalized: "UPI Transfer", merchantCategory: "other" },
];

const RULES_VERSION = "1.1.0";

/**
 * Normalize merchant from raw transaction description.
 * First matching rule wins; if no match, returns { normalized: raw description, merchantCategory: "" }.
 * Deterministic; no AI; no reward logic.
 */
export function normalizeMerchant(description: string): MerchantRuleResult {
  const raw = description.trim();
  if (!raw) {
    return { normalized: "", merchantCategory: "", matched: false };
  }
  const lower = raw.toLowerCase();
  for (const rule of MERCHANT_RULES) {
    if (lower.includes(rule.pattern.toLowerCase())) {
      return {
        normalized: rule.normalized,
        merchantCategory: rule.merchantCategory ?? "",
        matched: true,
      };
    }
  }
  return { normalized: raw, merchantCategory: "", matched: false };
}

/** Rules version for audit; no reward logic. */
export function getMerchantRulesVersion(): string {
  return RULES_VERSION;
}
