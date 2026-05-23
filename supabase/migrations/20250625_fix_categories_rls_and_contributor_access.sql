-- =============================================================================
-- Fix: Restore RLS on categories + normalize contributors access_type
-- =============================================================================
-- 1. Categories RLS was dropped in 20250623 migration without replacement
--    ResourcesPage fails to load categories → page blank
-- 2. Contributors access_type may be inconsistent with user_id state
--    Normalize: user_id IS NULL → external, user_id IS NOT NULL → account
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Restore RLS on categories
-- -----------------------------------------------------------------------------
alter table public.categories enable row level security;

-- Public can read active categories
drop policy if exists "public can read active categories" on public.categories;
create policy "public_can_read_active_categories"
on public.categories
for select
to public
using (is_active = true);

-- Admin can manage all categories
drop policy if exists "admins_can_manage_all_categories" on public.categories;
create policy "admins_can_manage_all_categories"
on public.categories
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
-- 2. Normalize contributors access_type based on user_id
-- -----------------------------------------------------------------------------
update public.contributors
set access_type = 'external'
where user_id is null
  and (access_type is null or access_type != 'external');

update public.contributors
set access_type = 'account'
where user_id is not null
  and (access_type is null or access_type != 'account');

alter table public.contributors
alter column access_type set not null;