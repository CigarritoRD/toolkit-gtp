-- =============================================================================
-- Migration: Harden SECURITY DEFINER RPCs and resource/contributor RLS
-- =============================================================================
-- Goals:
--   1. Restrict privileged RPCs to admin role (link_contributor_to_user,
--      approve_contributor_application, set_resource_tags).
--   2. Pin search_path and revoke anon/public grants on these RPCs.
--   3. Prevent contributors from self-publishing or self-approving their own
--      resources via direct Supabase access.
--   4. Prevent non-admin contributors from changing is_active, is_featured, or
--      user_id on contributors.
--   5. Restore secure authenticated-only insert on contributor_applications.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. link_contributor_to_user: admin-only
-- -----------------------------------------------------------------------------
create or replace function public.link_contributor_to_user(
  p_contributor_id uuid,
  p_user_id uuid
)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_contributor record;
  v_caller uuid := auth.uid();
begin
  if v_caller is null
     or not exists (
       select 1 from public.profiles
       where id = v_caller and role = 'admin'
     )
  then
    raise exception 'Admin access required';
  end if;

  select id, user_id, name into v_contributor
  from public.contributors
  where id = p_contributor_id
  for update;

  if not found then
    raise exception 'Contributor not found';
  end if;

  if v_contributor.user_id is not null and v_contributor.user_id != p_user_id then
    raise exception 'Este contributor ya está vinculado a otro usuario.';
  end if;

  if v_contributor.user_id = p_user_id then
    raise exception 'Este contributor ya está vinculado a este usuario.';
  end if;

  update public.contributors
  set user_id = p_user_id, access_type = 'account', updated_at = now()
  where id = p_contributor_id;

  update public.profiles
  set role = 'contributor', updated_at = now()
  where id = p_user_id;

  return json_build_object(
    'id', p_contributor_id,
    'name', v_contributor.name,
    'userId', p_user_id
  );
end;
$$;

revoke all on function public.link_contributor_to_user(uuid, uuid) from public;
revoke all on function public.link_contributor_to_user(uuid, uuid) from anon;
grant execute on function public.link_contributor_to_user(uuid, uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 2. approve_contributor_application: must be called by an admin whose
--    auth.uid() matches p_admin_user_id
-- -----------------------------------------------------------------------------
create or replace function public.approve_contributor_application(
  p_application_id uuid,
  p_admin_user_id uuid,
  p_admin_notes text default null
)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_application record;
  v_existing record;
  v_contributor_name text;
  v_slug text;
  v_contributor_id uuid;
  v_caller uuid := auth.uid();
begin
  if v_caller is null
     or v_caller <> p_admin_user_id
     or not exists (
       select 1 from public.profiles
       where id = v_caller and role = 'admin'
     )
  then
    raise exception 'Admin access required';
  end if;

  select * into v_application
  from public.contributor_applications
  where id = p_application_id
  for update;

  if not found then
    raise exception 'Solicitud no encontrada';
  end if;

  if v_application.status != 'pending_review' then
    raise exception 'Esta solicitud ya fue revisada.';
  end if;

  if v_application.user_id is null then
    raise exception 'La solicitud no tiene usuario asociado.';
  end if;

  select id, user_id into v_existing
  from public.contributors
  where user_id = v_application.user_id
  for update;

  if v_existing is not null then
    raise exception 'Este usuario ya tiene un perfil contributor vinculado.';
  end if;

  v_contributor_name := trim(
    coalesce(nullif(v_application.organization_name, ''), nullif(v_application.full_name, ''), nullif(v_application.contact_name, ''), 'Contributor')
  );

  v_slug := public.generate_unique_contributor_slug(v_contributor_name);

  insert into public.contributors (
    user_id,
    name,
    slug,
    short_bio,
    full_bio,
    specialty,
    is_active,
    access_type,
    avatar_url,
    website_url,
    instagram_url,
    facebook_url,
    linkedin_url,
    youtube_url,
    contact_name,
    contact_role,
    contact_email,
    contact_phone,
    country,
    organization,
    created_at,
    updated_at
  )
  values (
    v_application.user_id,
    v_contributor_name,
    v_slug,
    nullif(v_application.short_bio, ''),
    nullif(v_application.full_bio, ''),
    nullif(v_application.specialty, ''),
    true,
    'account',
    v_application.avatar_url,
    nullif(v_application.website_url, ''),
    nullif(v_application.instagram_url, ''),
    nullif(v_application.facebook_url, ''),
    nullif(v_application.linkedin_url, ''),
    nullif(v_application.youtube_url, ''),
    nullif(v_application.contact_name, ''),
    nullif(v_application.contact_role, ''),
    nullif(v_application.contact_email, ''),
    nullif(v_application.contact_phone, ''),
    nullif(v_application.country, ''),
    nullif(v_application.organization, ''),
    now(),
    now()
  )
  returning id into v_contributor_id;

  update public.contributor_applications
  set status = 'approved', reviewed_at = now(), reviewed_by = p_admin_user_id, admin_notes = p_admin_notes
  where id = p_application_id;

  update public.profiles
  set role = 'contributor', updated_at = now()
  where id = v_application.user_id;

  return json_build_object(
    'contributorId', v_contributor_id,
    'name', v_contributor_name,
    'userId', v_application.user_id
  );
end;
$$;

revoke all on function public.approve_contributor_application(uuid, uuid, text) from public;
revoke all on function public.approve_contributor_application(uuid, uuid, text) from anon;
grant execute on function public.approve_contributor_application(uuid, uuid, text) to authenticated;

-- -----------------------------------------------------------------------------
-- 3. set_resource_tags: admin-only (contributors cannot mass-edit tags)
-- -----------------------------------------------------------------------------
create or replace function public.set_resource_tags(
  p_resource_id uuid,
  p_tag_ids uuid[]
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
begin
  if v_caller is null
     or not exists (
       select 1 from public.profiles
       where id = v_caller and role = 'admin'
     )
  then
    raise exception 'Admin access required';
  end if;

  delete from public.resource_tags where resource_id = p_resource_id;

  if p_tag_ids is not null and array_length(p_tag_ids, 1) > 0 then
    insert into public.resource_tags (resource_id, tag_id)
    select p_resource_id, unnest(p_tag_ids);
  end if;
end;
$$;

revoke all on function public.set_resource_tags(uuid, uuid[]) from public;
revoke all on function public.set_resource_tags(uuid, uuid[]) from anon;
grant execute on function public.set_resource_tags(uuid, uuid[]) to authenticated;

-- -----------------------------------------------------------------------------
-- 4. delete_admin_contributor: add set search_path (was missing)
-- -----------------------------------------------------------------------------
create or replace function public.delete_admin_contributor(
  p_contributor_id uuid
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_name text;
  v_slug text;
  v_resource_count int;
begin
  if auth.uid() is null
     or not exists (
       select 1 from public.profiles
       where id = auth.uid() and role = 'admin'
     )
  then
    raise exception 'Admin access required';
  end if;

  select name, slug into v_name, v_slug
  from public.contributors
  where id = p_contributor_id;

  if not found then
    raise exception 'Contributor not found';
  end if;

  select count(*) into v_resource_count
  from public.resources
  where contributor_id = p_contributor_id;

  if v_resource_count > 0 then
    raise exception 'Contributor has % associated resources. Deactivate or reassign them before deleting.', v_resource_count;
  end if;

  delete from public.contributor_ratings
  where contributor_id = p_contributor_id;

  delete from public.contributor_rating_summary
  where contributor_id = p_contributor_id;

  delete from public.contributor_events
  where contributor_id = p_contributor_id;

  -- profiles.contributor_id is not in the documented Profile type; only clear
  -- it if the column exists to keep the function safe to run on older schemas.
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'contributor_id'
  ) then
    update public.profiles
    set contributor_id = null
    where contributor_id = p_contributor_id;
  end if;

  delete from public.contributors
  where id = p_contributor_id;

  return jsonb_build_object(
    'id', p_contributor_id,
    'name', v_name,
    'slug', v_slug
  );
end;
$$;

revoke all on function public.delete_admin_contributor(uuid) from public;
revoke all on function public.delete_admin_contributor(uuid) from anon;
grant execute on function public.delete_admin_contributor(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 5. RLS hardening on resources:
--    Contributors cannot self-approve or self-publish via direct table writes.
--    They may only insert/update their own resources with is_published=false
--    and approval_status in ('draft','pending_review','rejected').
-- -----------------------------------------------------------------------------
drop policy if exists "Contributors can create resources" on public.resources;
create policy "Contributors can create resources"
on public.resources
for insert
to authenticated
with check (
  created_by = auth.uid()
  and is_published = false
  and is_public = false
  and approval_status in ('draft', 'pending_review')
);

drop policy if exists "Contributors can update their own resources" on public.resources;
create policy "Contributors can update their own resources"
on public.resources
for update
to authenticated
using (created_by = auth.uid())
with check (
  created_by = auth.uid()
  and is_published = false
  and is_public = false
  and approval_status in ('draft', 'pending_review', 'rejected')
);

-- -----------------------------------------------------------------------------
-- 6. Column-level guard: contributors cannot flip is_active / is_featured /
--    user_id on their own row. Triggers are the simplest reliable way to
--    enforce this in RLS-aware fashion.
-- -----------------------------------------------------------------------------
create or replace function public.guard_contributor_self_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_is_admin boolean;
begin
  if tg_op = 'UPDATE' then
    v_is_admin := exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    );

    if not v_is_admin then
      if new.is_active is distinct from old.is_active
         or new.is_featured is distinct from old.is_featured
         or new.user_id is distinct from old.user_id
         or new.access_type is distinct from old.access_type
      then
        raise exception 'Only admins can change is_active, is_featured, user_id or access_type';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_contributor_self_update on public.contributors;
create trigger trg_guard_contributor_self_update
before update on public.contributors
for each row execute function public.guard_contributor_self_update();

-- -----------------------------------------------------------------------------
-- 7. Restore secure authenticated-only insert on contributor_applications.
--    The earlier "fix" opened this to anon which was a regression: the public
--    form requires auth and the API passes user_id = auth.uid().
-- -----------------------------------------------------------------------------
drop policy if exists "Anyone can submit contributor applications" on public.contributor_applications;
drop policy if exists "Authenticated users can submit contributor applications" on public.contributor_applications;
create policy "Authenticated users can submit contributor applications"
on public.contributor_applications
for insert
to authenticated
with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 8. Contributors can also see their own application for status check.
--    (Drop the duplicate "Admins can read" so we have one read policy each.)
-- -----------------------------------------------------------------------------
drop policy if exists "Users can read their own contributor applications" on public.contributor_applications;
create policy "Users can read their own contributor applications"
on public.contributor_applications
for select
to authenticated
using (user_id = auth.uid());
