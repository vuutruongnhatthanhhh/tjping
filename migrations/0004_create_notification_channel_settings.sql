create table public.notification_channel_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email_enabled boolean not null default true,
  email_address text not null default '',
  telegram_enabled boolean not null default false,
  telegram_chat_id text not null default '',
  telegram_username text not null default '',
  telegram_bot_name text not null default 'tjping_bot',
  telegram_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_channel_settings_email_length
    check (char_length(email_address) <= 255),
  constraint notification_channel_settings_chat_id_length
    check (char_length(telegram_chat_id) <= 64),
  constraint notification_channel_settings_username_length
    check (char_length(telegram_username) <= 64),
  constraint notification_channel_settings_bot_name_length
    check (char_length(telegram_bot_name) between 3 and 64),
  constraint notification_channel_settings_notes_length
    check (char_length(telegram_notes) <= 500)
);

create index notification_channel_settings_user_id_idx
  on public.notification_channel_settings(user_id);

alter table public.notification_channel_settings enable row level security;

create policy "Users can read their channel settings"
  on public.notification_channel_settings for select
  using (auth.uid() = user_id);

create policy "Users can create their channel settings"
  on public.notification_channel_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their channel settings"
  on public.notification_channel_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their channel settings"
  on public.notification_channel_settings for delete
  using (auth.uid() = user_id);

create trigger notification_channel_settings_set_updated_at
before update on public.notification_channel_settings
for each row
execute function public.set_updated_at();
