/**
 * Catalog module — DB row shape for card_variants (Supabase).
 * Domain types live in @finmatter/domain (CardVariant, etc.).
 */

export type CatalogRow = {
  id: string;
  bank: string;
  family: string;
  variant_name: string;
  network: string;
  reward_currency: string;
  card_type: string | null;
  fees: Record<string, unknown>;
  milestones: unknown[];
  benefits: unknown[];
  caps: unknown[];
  effective_from: string;
  effective_to: string | null;
  source: string;
  source_ref: string;
  verified_at: string;
  created_at?: string;
  updated_at?: string;
};
