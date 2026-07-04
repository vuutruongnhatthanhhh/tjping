alter table public.notification_channel_settings
  add column if not exists telegram_link_token text,
  add column if not exists telegram_link_token_expires_at timestamptz,
  add column if not exists telegram_connected_at timestamptz;

alter table public.notification_channel_settings
  drop constraint if exists notification_channel_settings_link_token_length;

alter table public.notification_channel_settings
  add constraint notification_channel_settings_link_token_length
  check (
    telegram_link_token is null
    or char_length(telegram_link_token) between 16 and 128
  );

create unique index if not exists notification_channel_settings_telegram_link_token_idx
  on public.notification_channel_settings(telegram_link_token)
  where telegram_link_token is not null;
