/**
 * Supabase canonical_transactions row shape for mapping to CategorizedTransaction.
 */

export type CanonicalTransactionRow = {
  canonical_key: string;
  id: string;
  raw_id: string;
  user_id: string;
  card_id: string;
  statement_id: string;
  date: string;
  amount: number;
  currency: string;
  merchant: { raw?: string; normalized?: string; merchantCategory?: string };
  type: string;
  description: string;
  status: string;
  confidence_score: number;
  parse_method: string;
  spend_category: string;
  created_at: string;
  updated_at: string;
};
