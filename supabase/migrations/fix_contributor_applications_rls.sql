-- =============================================================================
-- RLS Fix: contributor_applications
-- =============================================================================
-- This script:
--   1. Enables RLS on contributor_applications (if not already enabled)
--   2. Drops existing policies (to avoid conflicts)
--   3. Creates minimal policies:
--      - INSERT: anyone (anon or authenticated) can submit an application
--      - SELECT/UPDATE/DELETE: only admins (via profiles.role = 'admin')
--
-- Run this in Supabase Dashboard > SQL Editor, or via:
--   supabase db execute --file fix_contributor_applications_rls.sql
--
-- Prerequisites:
--   - The `profiles` table must exist with a `role` column ('user' | 'admin')
--   - `auth.uid()` must be available (authenticated users only for admin checks)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Ensure RLS is enabled
-- -----------------------------------------------------------------------------
alter table public.contributor_applications enable row level security;

-- -----------------------------------------------------------------------------
-- 2. Drop all existing policies on contributor_applications
--    (keeps the table clean; re-create only the policies we need below)
-- -----------------------------------------------------------------------------
do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'contributor_applications'
  loop
    execute format(
      'drop policy if exists %I on public.contributor_applications',
      policy_record.policyname
    );
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- 3. Create new policies
-- -----------------------------------------------------------------------------

-- Anyone (anon or authenticated) can INSERT a new application
create policy "Anyone can submit contributor applications"
on public.contributor_applications
for insert
to anon, authenticated
with check (true);

-- Only admins can SELECT (view) applications
create policy "Admins can read contributor applications"
on public.contributor_applications
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

-- Only admins can UPDATE applications
create policy "Admins can update contributor applications"
on public.contributor_applications
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

-- Only admins can DELETE applications
create policy "Admins can delete contributor applications"
on public.contributor_applications
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);