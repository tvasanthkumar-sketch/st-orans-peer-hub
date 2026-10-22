-- Allow signed-in users to delete only their own notifications.
-- Safe to rerun: replaces this policy if it already exists.
drop policy if exists "Users can delete their own notifications" on public.notifications;

create policy "Users can delete their own notifications"
on public.notifications
for delete
to authenticated
using (auth.uid() = user_id);
