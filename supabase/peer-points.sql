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


-- A read-only shared leaderboard. It exposes only display names and point totals,
-- never school email addresses or private profile details.
create or replace function public.get_peer_points_leaderboard()
returns table (
  profile_id uuid,
  full_name text,
  points bigint
)
language plpgsql
stable
security definer
set search_path = public
as $leaderboard$
begin
  if auth.uid() is null
    or lower(coalesce(auth.jwt() ->> 'email', '')) not like '%@storans.school.nz' then
    raise exception 'Use your St Oran''s school account to view the leaderboard.';
  end if;

  return query
  select p.id as profile_id,
         coalesce(nullif(trim(p.full_name), ''), 'St Oran''s student') as full_name,
         coalesce(sum(pt.points), 0)::bigint as points
  from public.profiles p
  left join public.points_transactions pt on pt.user_id = p.id
  group by p.id, p.full_name
  order by coalesce(sum(pt.points), 0) desc, lower(coalesce(p.full_name, '')) asc
  limit 100;
end;
$leaderboard$;

revoke all on function public.get_peer_points_leaderboard() from public, anon;
grant execute on function public.get_peer_points_leaderboard() to authenticated;

-- Focus sessions are started and completed through database functions so the
-- server, rather than browser storage, controls the award.
create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  duration_seconds integer not null check (duration_seconds between 60 and 7200),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.focus_sessions enable row level security;
drop policy if exists "Students can view their own focus sessions" on public.focus_sessions;
create policy "Students can view their own focus sessions"
  on public.focus_sessions for select to authenticated
  using (auth.uid() = user_id and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@storans.school.nz');

alter table public.points_transactions
  add column if not exists focus_session_id uuid references public.focus_sessions(id) on delete cascade;
create unique index if not exists points_focus_session_award_once_idx
  on public.points_transactions (focus_session_id)
  where focus_session_id is not null;

create or replace function public.start_focus_session(p_duration_seconds integer)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_session_id uuid;
begin
  if auth.uid() is null
    or lower(coalesce(auth.jwt() ->> 'email', '')) not like '%@storans.school.nz' then
    raise exception 'Use your St Oran''s school account to save focus sessions.';
  end if;
  if p_duration_seconds is null or p_duration_seconds < 60 or p_duration_seconds > 7200 then
    raise exception 'Focus duration must be between 1 minute and 2 hours.';
  end if;

  insert into public.focus_sessions (user_id, duration_seconds)
  values (auth.uid(), p_duration_seconds)
  returning id into new_session_id;

  return new_session_id;
end;
$$;

create or replace function public.complete_focus_session(p_session_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  completed_row public.focus_sessions%rowtype;
begin
  if auth.uid() is null
    or lower(coalesce(auth.jwt() ->> 'email', '')) not like '%@storans.school.nz' then
    raise exception 'Use your St Oran''s school account to save focus sessions.';
  end if;

  update public.focus_sessions
    set completed_at = now()
    where id = p_session_id
      and user_id = auth.uid()
      and completed_at is null
      and started_at <= now() - make_interval(secs => duration_seconds);

  if not found then
    if exists (
      select 1 from public.focus_sessions
      where id = p_session_id and user_id = auth.uid() and completed_at is not null
    ) then
      return 0;
    end if;
    raise exception 'This focus session has not run for its full duration or is not yours.';
  end if;

  select * into completed_row from public.focus_sessions where id = p_session_id;

  insert into public.points_transactions (user_id, points, reason, focus_session_id)
  values (auth.uid(), 20, 'Completed a focus session', completed_row.id)
  on conflict (focus_session_id) where focus_session_id is not null do nothing;

  return 20;
end;
$$;

revoke all on function public.start_focus_session(integer) from public, anon;
grant execute on function public.start_focus_session(integer) to authenticated;
revoke all on function public.complete_focus_session(uuid) from public, anon;
grant execute on function public.complete_focus_session(uuid) to authenticated;
