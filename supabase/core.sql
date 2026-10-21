-- St Oran's Peer Hub: core shared data tables
-- Run in Supabase SQL Editor after assignments.sql.
-- These tables use Row Level Security so students cannot edit other students' private data.

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null default '',
    year_level text not null default '',
    class_name text not null default '',
    role text not null default 'student' check (role in ('student', 'tutor', 'both')),
    subjects text[] not null default '{}',
    availability text[] not null default '{}',
    bio text not null default '',
    updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "Signed-in students can view profiles" on public.profiles;
create policy "Signed-in students can view profiles"
    on public.profiles for select to authenticated
    using (lower(coalesce(auth.jwt() ->> 'email', '')) like '%@storans.school.nz');
drop policy if exists "Students can create their own profile" on public.profiles;
create policy "Students can create their own profile"
    on public.profiles for insert to authenticated
    with check (
        auth.uid() = id
        and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@storans.school.nz'
    );
drop policy if exists "Students can update their own profile" on public.profiles;
create policy "Students can update their own profile"
    on public.profiles for update to authenticated
    using (
        auth.uid() = id
        and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@storans.school.nz'
    )
    with check (
        auth.uid() = id
        and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@storans.school.nz'
    );

create table if not exists public.tutor_profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    bio text not null default '',
    subjects text[] not null default '{}',
    availability text[] not null default '{}',
    active boolean not null default true,
    updated_at timestamptz not null default now()
);

alter table public.tutor_profiles enable row level security;
drop policy if exists "Students can view active tutor profiles" on public.tutor_profiles;
create policy "Students can view active tutor profiles"
    on public.tutor_profiles for select to authenticated
    using (
        lower(coalesce(auth.jwt() ->> 'email', '')) like '%@storans.school.nz'
        and (active = true or auth.uid() = user_id)
    );
drop policy if exists "Students can create their own tutor profile" on public.tutor_profiles;
create policy "Students can create their own tutor profile"
    on public.tutor_profiles for insert to authenticated
    with check (
        auth.uid() = user_id
        and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@storans.school.nz'
    );
drop policy if exists "Students can update their own tutor profile" on public.tutor_profiles;
create policy "Students can update their own tutor profile"
    on public.tutor_profiles for update to authenticated
    using (
        auth.uid() = user_id
        and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@storans.school.nz'
    )
    with check (
        auth.uid() = user_id
        and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@storans.school.nz'
    );
drop policy if exists "Students can remove their own tutor profile" on public.tutor_profiles;
create policy "Students can remove their own tutor profile"
    on public.tutor_profiles for delete to authenticated
    using (
        auth.uid() = user_id
        and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@storans.school.nz'
    );

create table if not exists public.bookings (
    id uuid primary key default gen_random_uuid(),
    requester_id uuid not null references auth.users(id) on delete cascade,
    tutor_id uuid not null references auth.users(id) on delete cascade,
    subject text not null,
    requested_at timestamptz not null,
    notes text not null default '',
    status text not null default 'pending'
        check (status in ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
    created_at timestamptz not null default now(),
    check (requester_id <> tutor_id)
);

alter table public.bookings enable row level security;
drop policy if exists "Booking participants can view bookings" on public.bookings;
create policy "Booking participants can view bookings"
    on public.bookings for select to authenticated
    using (
        lower(coalesce(auth.jwt() ->> 'email', '')) like '%@storans.school.nz'
        and (auth.uid() = requester_id or auth.uid() = tutor_id)
    );
drop policy if exists "Students can request sessions for themselves" on public.bookings;
create policy "Students can request sessions for themselves"
    on public.bookings for insert to authenticated
    with check (
        auth.uid() = requester_id
        and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@storans.school.nz'
    );
drop policy if exists "Tutors can update their bookings" on public.bookings;
create policy "Tutors can update their bookings"
    on public.bookings for update to authenticated
    using (
        auth.uid() = tutor_id
        and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@storans.school.nz'
    )
    with check (
        auth.uid() = tutor_id
        and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@storans.school.nz'
    );
drop policy if exists "Requesters can cancel their bookings" on public.bookings;
create policy "Requesters can cancel their bookings"
    on public.bookings for delete to authenticated
    using (
        auth.uid() = requester_id
        and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@storans.school.nz'
    );

create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    message text not null,
    booking_id uuid references public.bookings(id) on delete cascade,
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;
drop policy if exists "Students can view their own notifications" on public.notifications;
create policy "Students can view their own notifications"
    on public.notifications for select to authenticated
    using (auth.uid() = user_id);
drop policy if exists "Students can mark their own notifications read" on public.notifications;
create policy "Students can mark their own notifications read"
    on public.notifications for update to authenticated
    using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.points_transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    points integer not null check (points > 0),
    reason text not null,
    created_at timestamptz not null default now()
);

alter table public.points_transactions enable row level security;
drop policy if exists "Students can view their own points history" on public.points_transactions;
create policy "Students can view their own points history"
    on public.points_transactions for select to authenticated
    using (auth.uid() = user_id);

create index if not exists bookings_requester_created_idx
    on public.bookings (requester_id, created_at desc);
create index if not exists bookings_tutor_created_idx
    on public.bookings (tutor_id, created_at desc);
create index if not exists notifications_user_created_idx
    on public.notifications (user_id, created_at desc);
create index if not exists points_transactions_user_created_idx
    on public.points_transactions (user_id, created_at desc);
