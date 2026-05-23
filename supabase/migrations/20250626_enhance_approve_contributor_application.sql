-- =============================================================================
-- Phase 2: Enhance Contributor Application Approval
-- =============================================================================
-- Extends approve_contributor_application RPC to copy all profile fields
-- from the application to the new contributor profile, including:
-- avatar_url, website_url, instagram_url, facebook_url, linkedin_url,
-- youtube_url, contact_name, contact_role, contact_email, contact_phone,
-- country, organization
-- =============================================================================

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

  -- Create contributor (atomic insert) with ALL fields from application
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