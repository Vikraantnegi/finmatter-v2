-- Statement files table (Step 1). Run in Supabase SQL Editor.
--
-- 1. Create a Storage bucket: Dashboard > Storage > New bucket > name "statement-files", private.
-- 2. Run this SQL in SQL Editor.

create table if not exists public.statement_files (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  file_path text not null,
  file_hash text not null,
  status text not null check (status in ('UPLOADED', 'EXTRACTED', 'PARSED', 'FAILED')),
  extracted_text text,
  page_count int,
  extraction_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, file_hash)
);

create index if not exists statement_files_user_id on public.statement_files (user_id);
create index if not exists statement_files_file_hash on public.statement_files (file_hash);
create index if not exists statement_files_status on public.statement_files (status);

comment on table public.statement_files is 'Uploaded statement PDFs and extraction results (Step 1).';
