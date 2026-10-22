-- St Oran's Peer Hub: guard booking updates
-- Run in Supabase SQL Editor after reviewing the change.
-- Prevents browser-authenticated tutors from changing booking details or changing
-- a booking after its initial response. Existing booking/points/notification triggers remain intact.

create or replace function public.guard_booking_update()
returns trigger
language plpgsql
security invoker
set search_path = public
as $guard_booking_update$
begin
  -- Allow trusted database administration/service-role maintenance.
  -- Browser-authenticated updates must pass the checks below.
  if auth.uid() is null then
    return new;
  end if;

  if lower(coalesce(auth.jwt() ->> 'email', '')) not like '%@storans.school.nz' then
    raise exception 'Use your St Oran''s school account to update a booking.';
  end if;

  if auth.uid() is distinct from old.tutor_id then
    raise exception 'Only the assigned tutor can respond to this booking.';
  end if;

  if new.id is distinct from old.id
     or new.requester_id is distinct from old.requester_id
     or new.tutor_id is distinct from old.tutor_id
     or new.subject is distinct from old.subject
     or new.requested_at is distinct from old.requested_at
     or new.notes is distinct from old.notes
     or new.created_at is distinct from old.created_at then
    raise exception 'Booking details cannot be changed when responding to a request.';
  end if;

  if old.status <> 'pending' then
    raise exception 'Only pending bookings can be accepted or declined.';
  end if;

  if new.status not in ('accepted', 'declined') then
    raise exception 'A tutor can only accept or decline a pending booking.';
  end if;

  return new;
end;
$guard_booking_update$;

drop trigger if exists guard_booking_update_fields on public.bookings;
create trigger guard_booking_update_fields
before update on public.bookings
for each row
execute function public.guard_booking_update();
