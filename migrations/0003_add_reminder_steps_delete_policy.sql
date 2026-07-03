create policy "Users can delete their reminder steps"
  on public.reminder_steps for delete
  using (auth.uid() = user_id);
