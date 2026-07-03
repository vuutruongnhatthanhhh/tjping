create table public.email_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index email_verifications_user_id_idx
  on public.email_verifications(user_id);

create index email_verifications_token_idx
  on public.email_verifications(token);
