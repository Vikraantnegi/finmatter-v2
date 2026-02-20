-- Canonical transactions table (Step 7). Run in Supabase SQL Editor after statement_files.
-- Stores one row per logical transaction (after normalize → categorize → dedup). Upsert by canonical_key.

create table if not exists public.canonical_transactions (
  canonical_key text primary key,
  id uuid not null,
  raw_id uuid not null,
  user_id text not null,
  card_id text not null,
  statement_id uuid not null,
  date text not null,
  amount numeric not null,
  currency text not null default 'INR',
  merchant jsonb not null default '{}',
  type text not null,
  description text not null default '',
  status text not null default 'completed',
  confidence_score numeric not null,
  parse_method text not null,
  spend_category text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists canonical_transactions_user_id on public.canonical_transactions (user_id);
create index if not exists canonical_transactions_statement_id on public.canonical_transactions (statement_id);
create index if not exists canonical_transactions_spend_category on public.canonical_transactions (spend_category);
create index if not exists canonical_transactions_confidence_score on public.canonical_transactions (confidence_score);

comment on table public.canonical_transactions is 'One row per logical transaction (Step 7 pipeline: normalize → categorize → dedup). Upsert by canonical_key.';
