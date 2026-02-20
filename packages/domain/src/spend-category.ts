/**
 * Spend category taxonomy (Milestone 1).
 * Used for transaction categorization and reward rules.
 */

export enum SpendCategory {
  DINING = "dining",
  GROCERIES = "groceries",
  FUEL = "fuel",
  TRAVEL = "travel",
  SHOPPING = "shopping",
  UTILITIES = "utilities",
  ENTERTAINMENT = "entertainment",
  HEALTHCARE = "healthcare",
  EDUCATION = "education",
  RENT = "rent",
  WALLET_LOAD = "wallet_load",
  OTHER = "other",
}

export const SPEND_CATEGORIES: readonly SpendCategory[] =
  Object.values(SpendCategory);
