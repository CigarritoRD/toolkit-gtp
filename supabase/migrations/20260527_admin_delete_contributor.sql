-- =============================================================================
-- Feature: Admin Delete Contributor RPC
-- =============================================================================
-- Protected deletion: only allowed when contributor has NO associated resources.
-- Checks admin role, checks for resources, cleans up related data, then deletes.
-- =============================================================================

create or replace function public.delete_admin_contributor(
  p_contributor_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_name text;
  v_slug text;
  v_resource_count int;
begin
  -- Admin-only check
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Admin access required';
  end if;

  -- Verify contributor exists and get info
  select name, slug into v_name, v_slug
  from public.contributors
  where id = p_contributor_id;

  if not found then
    raise exception 'Contributor not found';
  end if;

  -- Check for associated resources
  select count(*) into v_resource_count
  from public.resources
  where contributor_id = p_contributor_id;

  if v_resource_count > 0 then
    raise exception 'Contributor has % associated resources. Deactivate or reassign them before deleting.', v_resource_count;
  end if;

  -- Clean up related data (no resources, but may have ratings/events)
  delete from public.contributor_ratings
  where contributor_id = p_contributor_id;

  delete from public.contributor_rating_summary
  where contributor_id = p_contributor_id;

  delete from public.contributor_events
  where contributor_id = p_contributor_id;

  -- Nullify user_id reference on the profile (unlink, don't delete user)
  update public.profiles
  set contributor_id = null
  where contributor_id = p_contributor_id;

  -- Delete the contributor
  delete from public.contributors
  where id = p_contributor_id;

  return jsonb_build_object(
    'id', p_contributor_id,
    'name', v_name,
    'slug', v_slug
  );
end;
$$;

-- Grant execute to authenticated (admin check is inside the function)
grant execute on function public.delete_admin_contributor to authenticated;