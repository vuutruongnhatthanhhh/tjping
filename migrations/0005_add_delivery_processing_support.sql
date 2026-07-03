alter table public.delivery_logs
  add column if not exists step_type reminder_step_type not null default 'on_time',
  add column if not exists scheduled_at timestamptz not null default now();

create unique index if not exists delivery_logs_unique_delivery_attempt_idx
  on public.delivery_logs(reminder_id, channel, step_type, scheduled_at);

create index if not exists reminder_steps_status_scheduled_at_idx
  on public.reminder_steps(status, scheduled_at);
