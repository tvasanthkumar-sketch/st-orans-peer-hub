-- St Oran's Peer Hub: per-student assignments
-- Run once in Supabase Dashboard -> SQL Editor -> New query.
-- Row Level Security ensures students can only access their own assignments.

create table if not exists public.assignments (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null check (char_length(trim(title)) > 0),
    subject text not null check (char_length(trim(subject)) > 0),
    due_date date not null,
    importance text not null default 'medium'
        check (importance in ('low', 'medium', 'high')),
    completed boolean not null default false,
    created_at timestamptz not null default now()
);

alter table public.assignments enable row level security;

drop policy if exists "Students can view their own assignments" on public.assignments;
create policy "Students can view their own assignments"
    on public.assignments for select to authenticated
    using (auth.uid() = user_id);

drop policy if exists "Students can create their own assignments" on public.assignments;
create policy "Students can create their own assignments"
    on public.assignments for insert to authenticated
    with check (auth.uid() = user_id);

drop policy if exists "Students can update their own assignments" on public.assignments;
create policy "Students can update their own assignments"
    on public.assignments for update to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "Students can delete their own assignments" on public.assignments;
create policy "Students can delete their own assignments"
    on public.assignments for delete to authenticated
    using (auth.uid() = user_id);

create index if not exists assignments_user_id_created_at_idx
    on public.assignments (user_id, created_at desc);
