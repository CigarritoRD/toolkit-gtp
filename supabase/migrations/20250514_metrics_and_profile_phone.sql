-- =============================================================================
-- Feature: Metrics & Profile Updates
-- =============================================================================
-- 1. Add phone column to profiles
-- 2. Add user_id column to resource_events (for authenticated tracking only)
-- 3. Add user_id column to contributor_events
-- 4. Add indexes for metrics queries
-- 5. RLS: resource_events - INSERT only authenticated, SELECT only admin
-- 6. RLS: contributor_events - INSERT only authenticated, SELECT only admin
-- 7. RLS: resource_downloads - SELECT: users see own, admins see all
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Profiles: add phone column
-- -----------------------------------------------------------------------------
alter table public.profiles
add column if not exists phone text;

comment on column public.profiles.phone is 'Optional phone number for user contact.';

-- -----------------------------------------------------------------------------
-- 2. Resource events: add user_id column
-- -----------------------------------------------------------------------------
alter table public.resource_events
add column if not exists user_id uuid references auth.users(id) on delete set null;

comment on column public.resource_events.user_id is 'User who triggered the event. Null for legacy anonymous events.';

-- -----------------------------------------------------------------------------
-- 3. Contributor events: add user_id column
-- -----------------------------------------------------------------------------
alter table public.contributor_events
add column if not exists user_id uuid references auth.users(id) on delete set null;

comment on column public.contributor_events.user_id is 'User who triggered the event. Null for legacy anonymous events.';

-- -----------------------------------------------------------------------------
-- 4. Indexes for metrics performance
-- -----------------------------------------------------------------------------
create index if not exists idx_resource_events_resource_created
on public.resource_events (resource_id, created_at desc);

create index if not exists idx_resource_events_user_created
on public.resource_events (user_id, created_at desc)
where user_id is not null;

create index if not exists idx_contributor_events_contributor_created
on public.contributor_events (contributor_id, created_at desc);

create index if not exists idx_contributor_events_user_created
on public.contributor_events (user_id, created_at desc)
where user_id is not null;

create index if not exists idx_resource_downloads_resource_created
on public.resource_downloads (resource_id, created_at desc);

create index if not exists idx_resource_downloads_user_created
on public.resource_downloads (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- 5. Drop existing RLS policies on resource_events
-- -----------------------------------------------------------------------------
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'resource_events'
  loop
    execute format('drop policy if exists %I on public.resource_events', pol.policyname);
  end loop;
end $$;

-- Enable RLS
alter table public.resource_events enable row level security;

-- INSERT: only authenticated users (user_id must match current user or be null for anonymous-compatible inserts)
create policy "Authenticated users can insert resource events"
on public.resource_events
for insert
to authenticated
with check (
  user_id = auth.uid()
  or user_id is null
);

-- SELECT: only admins
create policy "Admins can read resource events"
on public.resource_events
for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

-- UPDATE/DELETE: only admins
create policy "Admins can update resource events"
on public.resource_events
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can delete resource events"
on public.resource_events
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

-- -----------------------------------------------------------------------------
-- 6. Drop existing RLS policies on contributor_events
-- -----------------------------------------------------------------------------
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'contributor_events'
  loop
    execute format('drop policy if exists %I on public.contributor_events', pol.policyname);
  end loop;
end $$;

alter table public.contributor_events enable row level security;

create policy "Authenticated users can insert contributor events"
on public.contributor_events
for insert
to authenticated
with check (
  user_id = auth.uid()
  or user_id is null
);

create policy "Admins can read contributor events"
on public.contributor_events
for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can update contributor events"
on public.contributor_events
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

create policy "Admins can delete contributor events"
on public.contributor_events
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

-- -----------------------------------------------------------------------------
-- 7. Drop existing RLS policies on resource_downloads and re-create
-- -----------------------------------------------------------------------------
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'resource_downloads'
  loop
    execute format('drop policy if exists %I on public.resource_downloads', pol.policyname);
  end loop;
end $$;

-- INSERT: authenticated user must match their own user_id
create policy "Users can insert their own downloads"
on public.resource_downloads
for insert
to authenticated
with check (user_id = auth.uid());

-- SELECT: user sees own downloads, admin sees all
create policy "Users can read their own downloads"
on public.resource_downloads
for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can read all downloads"
on public.resource_downloads
for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

-- UPDATE: user can update own, admin can update all
create policy "Users can update their own downloads"
on public.resource_downloads
for update
to authenticated
using (user_id = auth.uid());

create policy "Admins can update all downloads"
on public.resource_downloads
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

-- DELETE: user can delete own, admin can delete all
create policy "Users can delete their own downloads"
on public.resource_downloads
for delete
to authenticated
using (user_id = auth.uid());

create policy "Admins can delete all downloads"
on public.resource_downloads
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);