-- St Oran's Peer Hub: secure booking notifications
-- Run once in the Supabase SQL Editor after core.sql.
-- Notifications are written by a database trigger, not by the browser.

create or replace function public.notify_booking_participants()
returns trigger
language plpgsql
security definer
set search_path = public
as $booking_notifications$
declare
  requester_name text;
  tutor_name text;
begin
  if tg_op = 'INSERT' then
    select nullif(trim(full_name), '') into requester_name
      from public.profiles where id = new.requester_id;
    insert into public.notifications (user_id, title, message, booking_id)
    values (
      new.tutor_id,
      'New session request',
      coalesce(requester_name, 'A student') || ' requested ' || new.subject ||
        ' on ' || to_char(new.requested_at at time zone 'Pacific/Auckland', 'Dy, DD Mon at HH24:MI') || '.',
      new.id
    );
    return new;
  end if;

  if tg_op = 'UPDATE' and new.status is distinct from old.status
     and new.status in ('accepted', 'declined') then
    select nullif(trim(full_name), '') into tutor_name
      from public.profiles where id = new.tutor_id;
    insert into public.notifications (user_id, title, message, booking_id)
    values (
      new.requester_id,
      case when new.status = 'accepted' then 'Session request accepted' else 'Session request declined' end,
      coalesce(tutor_name, 'Your tutor') || ' ' ||
        case when new.status = 'accepted' then 'accepted' else 'declined' end ||
        ' your ' || new.subject || ' session request.',
      new.id
    );
  end if;

  return new;
end;
$booking_notifications$;

revoke all on function public.notify_booking_participants() from public, anon, authenticated;

drop trigger if exists booking_notification_created on public.bookings;
create trigger booking_notification_created
after insert on public.bookings
for each row execute function public.notify_booking_participants();

drop trigger if exists booking_notification_status_changed on public.bookings;
create trigger booking_notification_status_changed
after update of status on public.bookings
for each row
when (old.status is distinct from new.status)
execute function public.notify_booking_participants();
