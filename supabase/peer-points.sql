-- St Oran's Peer Hub: persistent Peer Points awards for accepted bookings
-- Run this in Supabase SQL Editor after core.sql.
-- Awards are created by a database trigger, not trusted to browser JavaScript.

alter table public.points_transactions
  add column if not exists booking_id uuid references public.bookings(id) on delete cascade;

create unique index if not exists points_booking_award_once_idx
  on public.points_transactions (booking_id, user_id, reason);

create or replace function public.award_booking_peer_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    insert into public.points_transactions (user_id, points, reason, booking_id)
    values
      (new.tutor_id, 10, 'Accepted a tutoring request', new.id),
      (new.requester_id, 5, 'Booked a peer study session', new.id)
    on conflict (booking_id, user_id, reason) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists booking_accepted_awards_peer_points on public.bookings;
create trigger booking_accepted_awards_peer_points
after update of status on public.bookings
for each row
when (new.status = 'accepted')
execute function public.award_booking_peer_points();
