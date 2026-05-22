-- =============================================================================
-- Feature: Contributor Applications + Resource Moderation
-- =============================================================================
-- 1. Extend profiles.role to include 'contributor'
-- 2. contributors: add missing contact fields + ensure user_id is NOT NULL when created from approval
-- 3. Add approval_status / review fields to resources
-- 4. Add rejection_reason / reviewed_by / reviewed_at to resources
-- 5. contributors: make user_id NOT NULL (contributors are always tied to a user)
-- 6. RLS updates for contributor_applications (authenticated-only insert)
-- 7. RLS updates for resources (contributor can manage their own)
-- 8. RLS updates for contributors (contributor can update their own profile)
-- 9. Create indexes for approval queries
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. profiles: role is already text and used by existing RLS policies
-- Do NOT alter its type here because policies depend on it.
-- -----------------------------------------------------------------------------
comment on column public.profiles.role is 'User role: user | contributor | admin';

-- -----------------------------------------------------------------------------
-- 2. contributors: add contact fields (user_id stays nullable for existing contributors)
-- New contributors created via approved applications will always have user_id set.
-- -----------------------------------------------------------------------------
alter table public.contributors
add column if not exists contact_name text,
add column if not exists contact_role text,
add column if not exists contact_email text,
add column if not exists contact_phone text;

-- NOTE: user_id NOT NULL is intentionally deferred. Some existing contributors
-- may not have a linked user account yet. After migrating those manually, run:
--   alter table public.contributors alter column user_id set not null;

comment on column public.contributors.user_id is 'The authenticated user who owns this contributor profile. Nullable for legacy contributors.';

-- -----------------------------------------------------------------------------
-- 3. Add approval / review fields to resources
-- -----------------------------------------------------------------------------
alter table public.resources
add column if not exists approval_status text default 'approved',
add column if not exists rejection_reason text,
add column if not exists submitted_at timestamptz,
add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
add column if not exists reviewed_at timestamptz,
add column if not exists created_by uuid references auth.users(id) on delete set null;

-- Set default: existing resources are approved
update public.resources set approval_status = 'approved' where approval_status is null;

alter table public.resources
alter column approval_status set not null,
alter column approval_status set default 'draft';

comment on column public.resources.approval_status is 'Resource moderation: draft | pending_review | approved | rejected';
comment on column public.resources.rejection_reason is 'Reason provided when resource is rejected';
comment on column public.resources.submitted_at is 'When the contributor submitted the resource for review';
comment on column public.resources.reviewed_by is 'Admin who reviewed this resource';
comment on column public.resources.reviewed_at is 'When admin reviewed this resource';
comment on column public.resources.created_by is 'User who created this resource (the contributor or an admin)';

-- -----------------------------------------------------------------------------
-- 4. Indexes for moderation queries
-- -----------------------------------------------------------------------------
create index if not exists idx_resources_approval_status on public.resources (approval_status);
create index if not exists idx_resources_created_by on public.resources (created_by);
create index if not exists idx_resources_pending_review on public.resources (approval_status, created_at desc) where approval_status = 'pending_review';
create index if not exists idx_contributor_applications_user_status on public.contributor_applications (user_id, status);

-- -----------------------------------------------------------------------------
-- 5. Drop all existing RLS policies on contributor_applications and re-create
-- -----------------------------------------------------------------------------
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'contributor_applications'
  loop
    execute format('drop policy if exists %I on public.contributor_applications', pol.policyname);
  end loop;
end $$;

alter table public.contributor_applications enable row level security;

-- INSERT: only authenticated users (must supply user_id matching their auth.uid)
create policy "Authenticated users can submit contributor applications"
on public.contributor_applications
for insert
to authenticated
with check (user_id = auth.uid());

-- SELECT: user sees their own applications; admin sees all
create policy "Users can read their own contributor applications"
on public.contributor_applications
for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can read all contributor applications"
on public.contributor_applications
for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

-- UPDATE: only admins can update (review)
create policy "Admins can update contributor applications"
on public.contributor_applications
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

-- DELETE: only admins can delete
create policy "Admins can delete contributor applications"
on public.contributor_applications
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
-- 6. RLS on contributors: contributor manages own profile; admin manages all
-- -----------------------------------------------------------------------------
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'contributors'
  loop
    execute format('drop policy if exists %I on public.contributors', pol.policyname);
  end loop;
end $$;

alter table public.contributors enable row level security;

-- Public read (active contributors)
create policy "Anyone can read active contributors"
on public.contributors
for select
to public
using (is_active = true);

-- Contributor can read their own contributor profile
create policy "Contributors can read their own profile"
on public.contributors
for select
to authenticated
using (user_id = auth.uid());

-- Contributor can update their own profile (but not is_active, is_featured, user_id)
create policy "Contributors can update their own profile"
on public.contributors
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Admin can do everything
create policy "Admins can manage all contributors"
on public.contributors
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
-- 7. RLS on resources: contributor manages their own; admin manages all
-- -----------------------------------------------------------------------------
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'resources'
  loop
    execute format('drop policy if exists %I on public.resources', pol.policyname);
  end loop;
end $$;

alter table public.resources enable row level security;

-- Public read: is_public + is_published + approved
create policy "Anyone can read published and approved resources"
on public.resources
for select
to public
using (
  is_public = true
  and is_published = true
  and approval_status = 'approved'
);

-- Contributor can read their own resources
create policy "Contributors can read their own resources"
on public.resources
for select
to authenticated
using (created_by = auth.uid());

-- Contributor can insert their own resources
create policy "Contributors can create resources"
on public.resources
for insert
to authenticated
with check (created_by = auth.uid());

-- Contributor can update their own resources (as long as not yet approved)
create policy "Contributors can update their own resources"
on public.resources
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

-- Admin can do everything
create policy "Admins can manage all resources"
on public.resources
for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);