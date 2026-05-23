-- =============================================================================
-- Phase 1: DB Security Fix
-- =============================================================================
-- 1. Enable RLS on tags (was missing)
-- 2. Enable RLS on resource_tags (was missing)
-- 3. Add composite indexes for frequent query patterns
-- 4. Fix redundant duplicate policies on categories (cleanup)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Enable RLS on tags
-- -----------------------------------------------------------------------------
alter table public.tags enable row level security;

-- Public can read active tags
create policy "Anyone can read active tags"
on public.tags
for select
to public
using (is_active = true);

-- Admin can manage tags
create policy "Admins can manage all tags"
on public.tags
for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

-- -----------------------------------------------------------------------------
-- 2. Enable RLS on resource_tags (junction table)
-- -----------------------------------------------------------------------------
alter table public.resource_tags enable row level security;

-- Public can read tag associations for published resources
-- (relies on resources being public-checked via JOIN in queries)
create policy "Anyone can read resource tag associations"
on public.resource_tags
for select
to public
using (
  exists (
    select 1 from public.resources
    where resources.id = resource_tags.resource_id
      and resources.is_public = true
      and resources.is_published = true
      and resources.approval_status = 'approved'
  )
);

-- Contributors can manage tags on their own resources
create policy "Contributors can manage tags on own resources"
on public.resource_tags
for insert
to authenticated
with check (
  exists (
    select 1 from public.resources
    where resources.id = resource_tags.resource_id
      and resources.created_by = auth.uid()
  )
);

create policy "Contributors can delete tags on own resources"
on public.resource_tags
for delete
to authenticated
using (
  exists (
    select 1 from public.resources
    where resources.id = resource_tags.resource_id
      and resources.created_by = auth.uid()
  )
);

-- Admin can manage all tag associations
create policy "Admins can manage all resource tags"
on public.resource_tags
for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

-- -----------------------------------------------------------------------------
-- 3. Add composite indexes for frequent query patterns
-- -----------------------------------------------------------------------------

-- Active contributors lookup (name filter + active status)
create index if not exists idx_contributors_active
on public.contributors (is_active, is_featured, name)
where is_active = true;

-- Published resources by contributor
create index if not exists idx_resources_by_contributor
on public.resources (created_by, is_published, is_public, approval_status);

-- Library by user and kind (for dedup checks)
create index if not exists idx_user_library_user_kind
on public.user_library (user_id, kind, resource_id);

-- Tags by group
create index if not exists idx_tags_group
on public.tags (group_key, is_active)
where group_key is not null;

-- -----------------------------------------------------------------------------
-- 4. Cleanup: Remove duplicate admin policies on categories
--    (some were created twice with different naming conventions)
-- -----------------------------------------------------------------------------
drop policy if exists "categories_delete_admin" on public.categories;
drop policy if exists "categories_insert_admin" on public.categories;
drop policy if exists "categories_select_active_public" on public.categories;
drop policy if exists "categories_update_admin" on public.categories;
drop policy if exists "public can read active categories" on public.categories;

-- -----------------------------------------------------------------------------
-- 5. Verify RLS is now enabled on all user-facing tables
-- -----------------------------------------------------------------------------
-- Expected: all tables should show rowsecurity = true
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';