-- Allow string ids (slugs) for card_variants so seed JSON can use e.g. "icici-coral-visa".
-- Run after supabase-card-catalog.sql. Safe if table is empty or already has uuid ids (they become text).

alter table public.card_variants alter column id drop default;
alter table public.card_variants alter column id type text using id::text;
