-- =============================================================================
-- Phase 1b: Race Condition Fixes
-- =============================================================================
-- Replace client-side check-then-update patterns with atomic DB functions
-- to prevent TOCTOU race conditions
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Atomic: Link contributor to user
--    Replaces: contributors.ts::linkContributorToUser()
--    Issue: Check user_id then update is not atomic - concurrent call could link
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
begin
  -- Fetch current state (within transaction)
  select id, user_id, name into v_contributor
  from public.contributors
  where id = p_contributor_id
  for update;

  if not found then
    raise exception 'Contributor not found';
  end if;

  -- Atomic check-and-update: throws if state changed
  if v_contributor.user_id is not null and v_contributor.user_id != p_user_id then
    raise exception 'Este contributor ya está vinculado a otro usuario.';
  end if;

  if v_contributor.user_id = p_user_id then
    raise exception 'Este contributor ya está vinculado a este usuario.';
  end if;

  -- Update contributor
  update public.contributors
  set user_id = p_user_id, access_type = 'account', updated_at = now()
  where id = p_contributor_id;

  -- Update profile role
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
grant execute on function public.link_contributor_to_user(uuid, uuid) to authenticated;

-- Helper: Generate unique slug for contributor (used by approve_contributor_application)
create or replace function public.generate_unique_contributor_slug(p_name text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  v_base_slug text;
  v_existing_slugs text[];
  v_counter int;
begin
  v_base_slug := lower(regexp_replace(trim(p_name), '[^a-zA-Z0-9\s-]', '', 'g'));
  v_base_slug := trim(regexp_replace(v_base_slug, '\s+', '-', 'g'));
  v_base_slug := substring(v_base_slug from 1 for 50);

  if v_base_slug = '' or v_base_slug is null then
    v_base_slug := 'contributor';
  end if;

  -- Get existing slugs that match pattern
  select array_agg(slug) into v_existing_slugs
  from public.contributors
  where slug ~ (v_base_slug || '(-[0-9]+)?$');

  if v_existing_slugs is null or not (v_base_slug = any(v_existing_slugs)) then
    return v_base_slug;
  end if;

  -- Find highest counter
  v_counter := 1;
  while v_base_slug || '-' || v_counter = any(v_existing_slugs) loop
    v_counter := v_counter + 1;
  end loop;

  return v_base_slug || '-' || v_counter;
end;
$$;

revoke all on function public.generate_unique_contributor_slug(text) from public;
grant execute on function public.generate_unique_contributor_slug(text) to authenticated;

-- -----------------------------------------------------------------------------
-- 2. Atomic: Approve contributor application
--    Replaces: contributor-applications-admin.ts::approveContributorApplication()
--    Issue: Multiple checks + inserts not atomic - concurrent approval possible
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
begin
  -- Fetch application (within transaction, fail if not pending)
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

  -- Check for existing contributor (within same transaction)
  select id, user_id into v_existing
  from public.contributors
  where user_id = v_application.user_id
  for update;

  if v_existing is not null then
    raise exception 'Este usuario ya tiene un perfil contributor vinculado.';
  end if;

  -- Generate name and slug
  v_contributor_name := trim(
    coalesce(nullif(v_application.organization_name, ''), nullif(v_application.full_name, ''), nullif(v_application.contact_name, ''), 'Contributor')
  );

  v_slug := public.generate_unique_contributor_slug(v_contributor_name);

  -- Create contributor (atomic insert)
  insert into public.contributors (user_id, name, slug, short_bio, full_bio, specialty, is_active, access_type, created_at, updated_at)
  values (
    v_application.user_id,
    v_contributor_name,
    v_slug,
    nullif(v_application.short_bio, ''),
    nullif(v_application.full_bio, ''),
    nullif(v_application.specialty, ''),
    true,
    'account',
    now(),
    now()
  )
  returning id into v_contributor_id;

  -- Update application status
  update public.contributor_applications
  set status = 'approved', reviewed_at = now(), reviewed_by = p_admin_user_id, admin_notes = p_admin_notes
  where id = p_application_id;

  -- Update profile role
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
grant execute on function public.approve_contributor_application(uuid, uuid, text) to authenticated;

-- -----------------------------------------------------------------------------
-- 3. Atomic: Set resource tags
--    Replaces: tags.ts::setResourceTags()
--    Issue: Delete then insert not atomic - concurrent call could remove new tags
-- -----------------------------------------------------------------------------
create or replace function public.set_resource_tags(
  p_resource_id uuid,
  p_tag_ids uuid[]
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  -- Delete existing tags for this resource
  delete from public.resource_tags where resource_id = p_resource_id;

  -- Insert new tags (if any)
  if array_length(p_tag_ids, 1) > 0 then
    insert into public.resource_tags (resource_id, tag_id)
    select p_resource_id, unnest(p_tag_ids);
  end if;
end;
$$;

revoke all on function public.set_resource_tags(uuid, uuid[]) from public;
grant execute on function public.set_resource_tags(uuid, uuid[]) to authenticated;