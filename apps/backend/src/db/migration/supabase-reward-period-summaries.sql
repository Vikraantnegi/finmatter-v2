-- Cached period reward summary from rewards engine; keyed by user, card, period.
-- Run when adding period persistence (Phase 2.5 optional).
create table if not exists public.reward_period_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  card_id text not null,
  period_type text not null check (period_type in ('monthly', 'quarterly', 'yearly')),
  period_start text not null,
  period_end text not null,
  total_reward numeric not null,
  by_category jsonb not null default '{}',
  caps_hit jsonb not null default '[]',
  milestones_triggered jsonb not null default '[]',
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, card_id, period_type, period_start, period_end)
);

create index if not exists reward_period_summaries_user_card
  on public.reward_period_summaries (user_id, card_id);

comment on table public.reward_period_summaries is 'Cached period reward summary from rewards engine; keyed by user, card, period.';
