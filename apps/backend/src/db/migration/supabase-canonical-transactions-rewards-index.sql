-- Speed up rewards API and period filters: (user_id, card_id, date).
-- Run after supabase-canonical-transactions.sql.
create index if not exists canonical_transactions_user_card_date
  on public.canonical_transactions (user_id, card_id, date);
