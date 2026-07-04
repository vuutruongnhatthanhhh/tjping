alter type public.reminder_repeat add value if not exists 'custom_weekly';

alter table public.reminders
  add column if not exists weekly_days smallint[];
