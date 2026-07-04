alter table public.reminders
  drop constraint if exists reminders_custom_weekly_days_check;

alter table public.reminders
  add constraint reminders_custom_weekly_days_check
  check (
    (
      repeat_type = 'custom_weekly'
      and weekly_days is not null
      and cardinality(weekly_days) > 0
    )
    or (
      repeat_type <> 'custom_weekly'
      and weekly_days is null
    )
  );
