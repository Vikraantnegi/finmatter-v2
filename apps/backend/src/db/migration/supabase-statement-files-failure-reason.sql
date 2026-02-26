-- Store parse/extraction failure reason so users can see why a statement failed.
-- Run in Supabase SQL Editor after supabase-statement-files.sql.

alter table public.statement_files
  add column if not exists failure_reason text;

comment on column public.statement_files.failure_reason is 'Error message when status is FAILED (extraction or parse).';
