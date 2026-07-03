create extension if not exists pgcrypto;

create type reminder_channel as enum ('email', 'telegram');
create type reminder_repeat as enum ('once', 'daily', 'weekly', 'monthly');
create type reminder_status as enum ('pending', 'sent', 'failed', 'canceled');
create type reminder_step_type as enum ('one_day_before', 'one_hour_before', 'on_time');
create type delivery_status as enum ('pending', 'sent', 'failed');

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  content text not null default '',
  remind_at timestamptz not null,
  channels reminder_channel[] not null default array['email']::reminder_channel[],
  repeat_type reminder_repeat not null default 'once',
  status reminder_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reminder_steps (
  id uuid primary key default gen_random_uuid(),
  reminder_id uuid not null references public.reminders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  step_type reminder_step_type not null,
  scheduled_at timestamptz not null,
  status reminder_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (reminder_id, step_type)
);

create table public.delivery_logs (
  id uuid primary key default gen_random_uuid(),
  reminder_id uuid not null references public.reminders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  channel reminder_channel not null,
  status delivery_status not null default 'pending',
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index reminders_user_id_remind_at_idx on public.reminders(user_id, remind_at);
create index reminders_user_id_status_idx on public.reminders(user_id, status);
create index reminder_steps_user_id_scheduled_at_idx on public.reminder_steps(user_id, scheduled_at);
create index delivery_logs_user_id_created_at_idx on public.delivery_logs(user_id, created_at desc);

alter table public.reminders enable row level security;
alter table public.reminder_steps enable row level security;
alter table public.delivery_logs enable row level security;

create policy "Users can read their reminders"
  on public.reminders for select
  using (auth.uid() = user_id);

create policy "Users can create their reminders"
  on public.reminders for insert
  with check (auth.uid() = user_id);

create policy "Users can update their reminders"
  on public.reminders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their reminders"
  on public.reminders for delete
  using (auth.uid() = user_id);

create policy "Users can read their reminder steps"
  on public.reminder_steps for select
  using (auth.uid() = user_id);

create policy "Users can create their reminder steps"
  on public.reminder_steps for insert
  with check (auth.uid() = user_id);

create policy "Users can update their reminder steps"
  on public.reminder_steps for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read their delivery logs"
  on public.delivery_logs for select
  using (auth.uid() = user_id);

create policy "Users can create their delivery logs"
  on public.delivery_logs for insert
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reminders_set_updated_at
before update on public.reminders
for each row
execute function public.set_updated_at();
