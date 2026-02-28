/**
 * Fetch all card variant ids from the catalog (for recommendation candidates).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns all variant ids from card_variants, ordered by family.
 * Used when candidateCardIds is omitted: candidates = these ids minus baseline.
 */
export async function fetchCatalogVariantIds(
  supabase: SupabaseClient
): Promise<string[]> {
  const { data, error } = await supabase
    .from("card_variants")
    .select("id")
    .order("family", { ascending: true });

  if (error) throw error;
  const rows = (data ?? []) as { id: string }[];
  return rows.map((r) => r.id);
}
