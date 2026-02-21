-- Credit Card Catalog (Milestone 2). Run in Supabase SQL Editor.
-- One row per card variant. Declaration-only; no reward math.
-- Requires: source, source_ref for every record (Finance).

create table if not exists public.card_variants (
  id uuid primary key default gen_random_uuid(),
  bank text not null,
  family text not null,
  variant_name text not null,
  network text not null,
  reward_currency text not null,
  card_type text,
  fees jsonb not null default '{}',
  milestones jsonb default '[]',
  benefits jsonb default '[]',
  caps jsonb default '[]',
  effective_from text not null,
  effective_to text,
  source text not null,
  source_ref text not null,
  verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists card_variants_bank on public.card_variants (bank);
create index if not exists card_variants_family on public.card_variants (family);

comment on table public.card_variants is 'Credit Card Catalog v1: one row per card variant. Declaration-only; source + source_ref required.';
