/**
 * Credit Card Catalog — domain types (Milestone 2).
 * Declaration-only: no reward math. See docs/credit-card-catalog.
 */

export type CatalogSource = "bank_site" | "mitc" | "statement";

export type Period = "monthly" | "quarterly" | "yearly";

export type Bank =
  | "HDFC"
  | "ICICI"
  | "AMEX"
  | "HSBC"
  | "AXIS"
  | "SBI"
  | "OTHER";

export type Network = "Visa" | "Mastercard" | "Amex" | "RuPay";

/** Machine-friendly for DSL/engines. Use REWARD_CURRENCY_DISPLAY_NAMES for UI. */
export type RewardCurrency =
  | "points"
  | "cashback"
  | "miles"
  | "neucoins"
  | "other";

export const REWARD_CURRENCY_DISPLAY_NAMES: Record<RewardCurrency, string> = {
  points: "Reward Points",
  cashback: "Cashback",
  miles: "Miles",
  neucoins: "NeuCoins",
  other: "Other",
};

export type CardType = "credit" | "charge";

export type FeeAmount = {
  amount: number;
  currency: string;
  source?: CatalogSource;
  sourceRef?: string;
};

export type Fees = {
  joining?: FeeAmount;
  annual?: FeeAmount;
  waiverText?: string;
  gstDisplay?: string;
};

export type Milestone = {
  threshold: number;
  period: Period;
  declaredReward: string;
  source?: CatalogSource;
  sourceRef?: string;
};

/**
 * Customer-facing benefit (UI / explanation). Not a computational reward rule.
 * "cashback" here = declared benefit type; rewardCurrency on CardVariant = card's reward type.
 * Do not use Benefit for rule logic — use declaredConstraints + Reward Rules DSL for that.
 */
export type Benefit = {
  type:
    | "lounge"
    | "golf"
    | "membership"
    | "insurance"
    | "partner"
    | "cashback"
    | "other";
  description?: string;
  count?: number;
  domesticInternational?: "domestic" | "international" | "both";
  /** Lounge/benefit tied to a specific card network (e.g. Visa lounge). */
  networkBound?: Network;
};

/**
 * Verbatim constraint from source (caps, exclusions, eligibility, etc.).
 * No structure — Reward Rules DSL interprets later. Avoids catalog leaking into rules.
 */
export type DeclaredConstraint = {
  description: string;
  source?: CatalogSource;
  sourceRef?: string;
};

export type MinTransactionAmount = {
  amount: number;
  currency: string;
};

/**
 * Issuer-stated eligibility (income, age, employment, etc.). Declaration only — we do not compute or guarantee eligibility; the bank decides.
 * Parallel to DeclaredConstraint; enables "cards you may qualify for" and in-app eligibility display with source attribution.
 */
export type DeclaredEligibility = {
  description: string;
  source?: CatalogSource;
  sourceRef?: string;
};

/**
 * One-time, conditional benefit tied to card issuance (e.g. welcome voucher, complimentary membership on issuance).
 * Not transaction-driven; not part of reward rules. Declaration only — time window, first transaction, activation, etc. stay as text.
 * Enables card comparison ("₹X upfront value"), recommendations ("best first-year value"), and explainability.
 */
export type DeclaredWelcomeBenefit = {
  description: string;
  source?: CatalogSource;
  sourceRef?: string;
};

export type CardVariant = {
  id: string;
  bank: Bank;
  family: string;
  variantName: string;
  network: Network;
  rewardCurrency: RewardCurrency;
  cardType?: CardType;
  fees: Fees;
  milestones?: Milestone[];
  benefits?: Benefit[];
  declaredConstraints?: DeclaredConstraint[];
  declaredEligibility?: DeclaredEligibility[];
  /** One-time welcome benefits (issuance-linked). Declaration only; not executable. */
  declaredWelcomeBenefits?: DeclaredWelcomeBenefit[];
  minTransactionAmount?: MinTransactionAmount;
  /** Optional tags for filtering / discovery / UI (e.g. "co-branded", "travel", "fuel", "lifestyle"). */
  tags?: string[];
  effectiveFrom: string;
  effectiveTo?: string | null;
  source: CatalogSource;
  sourceRef: string;
  verifiedAt: string;
};
