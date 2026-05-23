-- =============================================================================
-- Feature: Contributor Access Model - Distinguish Account vs External Profile
-- =============================================================================
-- 1. Add partial unique index on contributors.user_id (prevent duplicate linked users)
-- 2. Add access_type computed column to contributors
-- 3. Add comments clarifying contributor vs external profile semantics
-- 4. Prevent duplicate pending applications per user via constraint
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Partial unique index: each user can only be linked to one contributor
-- -----------------------------------------------------------------------------
create unique index if not exists idx_contributors_user_id_unique
on public.contributors (user_id)
where user_id is not null;

comment on index public.idx_contributors_user_id_unique is
  'Ensures each authenticated user is linked to at most one contributor profile. External/manual profiles have user_id = null.';

-- -----------------------------------------------------------------------------
-- 2. Add access_type column to clarify contributor account status
-- -----------------------------------------------------------------------------
alter table public.contributors
add column if not exists access_type text default 'external'
check (access_type in ('account', 'external'));

update public.contributors
set access_type = 'account'
where user_id is not null;

alter table public.contributors
alter column access_type set not null;

comment on column public.contributors.access_type is
  'account = contributor with authenticated user and dashboard access. external = public profile without user account (created manually by admin).';

-- -----------------------------------------------------------------------------
-- 3. Enhance existing column comments for clarity
-- -----------------------------------------------------------------------------
comment on column public.contributors.user_id is
  'Linked authenticated user. NULL for external/manual contributor profiles. Use access_type to distinguish account vs external.';

comment on column public.contributors.is_active is
  'Soft-deactivate: deactivating hides the contributor from public listings but preserves the profile and their resources.';

-- -----------------------------------------------------------------------------
-- 4. Prevent duplicate pending applications per user
-- Existing applications with pending_review status block new submissions
-- (handled in API layer by checking before insert)
-- Add a soft-check: prevent inserting if a pending application exists for same user
-- This is enforced via API check, not DB constraint (to allow rejected applications)
-- -----------------------------------------------------------------------------

comment on table public.contributor_applications is
  'Users submit one application per account. Status flow: pending_review -> approved | rejected. Approved applications create a contributor profile and update profiles.role.';