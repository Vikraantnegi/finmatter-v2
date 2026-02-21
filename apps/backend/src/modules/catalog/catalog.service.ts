/**
 * Catalog service — validation and row ↔ domain mapping.
 * No I/O; web-api uses Supabase and calls these helpers.
 */

import type {
  CardVariant,
  Fees,
  Milestone,
  Benefit,
  DeclaredConstraint,
  DeclaredEligibility,
  DeclaredWelcomeBenefit,
  CatalogSource,
  RewardCurrency,
} from "@finmatter/domain";
import type { CatalogRow } from "./catalog.types";

const VALID_SOURCES: CatalogSource[] = ["bank_site", "mitc", "statement"];
const VALID_REWARD_CURRENCIES: RewardCurrency[] = ["points", "cashback", "miles", "neucoins", "other"];

/**
 * Validate payload for add/update. Finance: source + sourceRef required.
 * Returns list of error messages; empty if valid.
 */
export function validateCardVariantPayload(
  payload: Record<string, unknown>
): string[] {
  const errors: string[] = [];
  if (
    payload.source === undefined ||
    payload.source === null ||
    String(payload.source).trim() === ""
  ) {
    errors.push("source is required");
  } else if (!VALID_SOURCES.includes(payload.source as CatalogSource)) {
    errors.push(
      `source must be one of: ${VALID_SOURCES.join(", ")}`
    );
  }
  if (
    payload.sourceRef === undefined ||
    payload.sourceRef === null ||
    String(payload.sourceRef).trim() === ""
  ) {
    errors.push("sourceRef is required");
  }
  if (
    payload.effectiveFrom === undefined ||
    payload.effectiveFrom === null ||
    String(payload.effectiveFrom).trim() === ""
  ) {
    errors.push("effectiveFrom is required");
  }
  if (
    payload.verifiedAt === undefined ||
    payload.verifiedAt === null ||
    String(payload.verifiedAt).trim() === ""
  ) {
    errors.push("verifiedAt is required");
  }
  if (!payload.bank || String(payload.bank).trim() === "") {
    errors.push("bank is required");
  }
  if (!payload.family || String(payload.family).trim() === "") {
    errors.push("family is required");
  }
  if (!payload.variantName || String(payload.variantName).trim() === "") {
    errors.push("variantName is required");
  }
  if (!payload.network || String(payload.network).trim() === "") {
    errors.push("network is required");
  }
  if (!payload.rewardCurrency || String(payload.rewardCurrency).trim() === "") {
    errors.push("rewardCurrency is required");
  } else if (!VALID_REWARD_CURRENCIES.includes(payload.rewardCurrency as RewardCurrency)) {
    errors.push(`rewardCurrency must be one of: ${VALID_REWARD_CURRENCIES.join(", ")}`);
  }
  if (!payload.fees || typeof payload.fees !== "object") {
    errors.push("fees is required and must be an object");
  }
  return errors;
}

/** Map DB row to domain CardVariant. */
export function rowToCardVariant(row: CatalogRow): CardVariant {
  const fees = (row.fees ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    bank: row.bank as CardVariant["bank"],
    family: row.family,
    variantName: row.variant_name,
    network: row.network as CardVariant["network"],
    rewardCurrency: row.reward_currency as CardVariant["rewardCurrency"],
    cardType: row.card_type as CardVariant["cardType"] | undefined,
    fees: {
      joining: fees.joining as Fees["joining"],
      annual: fees.annual as Fees["annual"],
      waiverText: fees.waiverText as string | undefined,
      gstDisplay: fees.gstDisplay as string | undefined,
    },
    milestones: (row.milestones ?? []) as Milestone[],
    benefits: (row.benefits ?? []) as Benefit[],
    declaredConstraints: (row.declared_constraints ?? []) as DeclaredConstraint[],
    declaredEligibility: (row.declared_eligibility ?? []) as DeclaredEligibility[],
    declaredWelcomeBenefits: (row.declared_welcome_benefits ?? []) as DeclaredWelcomeBenefit[],
    minTransactionAmount: row.min_transaction_amount
      ? { amount: row.min_transaction_amount.amount, currency: row.min_transaction_amount.currency }
      : undefined,
    tags: row.tags ?? undefined,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to ?? undefined,
    source: row.source as CatalogSource,
    sourceRef: row.source_ref,
    verifiedAt: row.verified_at,
  };
}

/** Map domain CardVariant to DB row (for insert/update). */
export function cardVariantToRow(v: CardVariant): Omit<CatalogRow, "created_at" | "updated_at"> {
  return {
    id: v.id,
    bank: v.bank,
    family: v.family,
    variant_name: v.variantName,
    network: v.network,
    reward_currency: v.rewardCurrency,
    card_type: v.cardType ?? null,
    fees: v.fees as Record<string, unknown>,
    milestones: (v.milestones ?? []) as unknown[],
    benefits: (v.benefits ?? []) as unknown[],
    declared_constraints: (v.declaredConstraints ?? []) as unknown[],
    declared_eligibility: (v.declaredEligibility ?? []) as unknown[],
    declared_welcome_benefits: (v.declaredWelcomeBenefits ?? []) as unknown[],
    min_transaction_amount: v.minTransactionAmount
      ? { amount: v.minTransactionAmount.amount, currency: v.minTransactionAmount.currency }
      : null,
    tags: v.tags ?? undefined,
    effective_from: v.effectiveFrom,
    effective_to: v.effectiveTo ?? null,
    source: v.source,
    source_ref: v.sourceRef,
    verified_at: v.verifiedAt,
  };
}
