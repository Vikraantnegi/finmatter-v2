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

export type RewardCurrency =
  | "Reward Points"
  | "NeuCoins"
  | "Cashback"
  | "Miles"
  | "OTHER";

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
};

export type Benefit = {
  type: "lounge" | "insurance" | "partner" | "cashback" | "other";
  description?: string;
  count?: number;
  domesticInternational?: "domestic" | "international" | "both";
  networkBound?: string;
};

export type CapDeclaration = {
  value: number;
  period: Period;
  unit?: "points" | "cashback" | "other";
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
  caps?: CapDeclaration[];
  effectiveFrom: string;
  effectiveTo?: string | null;
  source: CatalogSource;
  sourceRef: string;
  verifiedAt: string;
};
