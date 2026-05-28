-- =============================================================================
-- Feature: Metric Countries RPC & Admin Security Hardening
-- =============================================================================
-- 1. get_admin_metric_countries – country breakdown with views/downloads
-- 2. get_admin_metric_export – now includes events and enhanced countries
-- 3. All 5 admin RPC functions: add explicit admin role check
-- =============================================================================

-- =============================================================================
-- Helper: admin check snippet (reused in every function)
-- =============================================================================
-- Each function starts with:
--   if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
--     raise exception 'Admin access required';
--   end if;
-- This ensures only admins can call these, even though they are granted to authenticated.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. get_admin_metric_summary (re-create with admin check)
-- -----------------------------------------------------------------------------
create or replace function public.get_admin_metric_summary(
  p_period text default '30d'
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_start_date timestamptz;
  v_result jsonb;
begin
  -- Admin-only check
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Admin access required';
  end if;

  if p_period = 'all' then
    v_start_date := '1970-01-01'::timestamptz;
  elsif p_period = '7d' then
    v_start_date := now() - interval '7 days';
  elsif p_period = '30d' then
    v_start_date := now() - interval '30 days';
  elsif p_period = '90d' then
    v_start_date := now() - interval '90 days';
  else
    v_start_date := now() - interval '30 days';
  end if;

  select jsonb_build_object(
    'total_views', coalesce(views_cnt.count, 0),
    'total_downloads', coalesce(downloads_cnt.count, 0),
    'unique_users', coalesce(unique_users.user_count, 0),
    'active_resources', coalesce(active_resources.resource_count, 0),
    'conversion_rate', case
      when views_cnt.count > 0
      then round((downloads_cnt.count::numeric / views_cnt.count::numeric) * 100)::int
      else 0
    end
  )
  into v_result
  from
    (select count(*) as count from public.resource_events
     where event_type = 'open' and created_at >= v_start_date) views_cnt,
    (select count(*) as count from public.resource_downloads
     where created_at >= v_start_date) downloads_cnt,
    (select count(distinct user_id) as user_count
     from (
       select user_id from public.resource_events where user_id is not null and created_at >= v_start_date
       union
       select user_id from public.resource_downloads where user_id is not null and created_at >= v_start_date
     ) combined_users) unique_users,
    (select count(distinct resource_id) as resource_count
     from (
       select resource_id from public.resource_events where created_at >= v_start_date
       union
       select resource_id from public.resource_downloads where created_at >= v_start_date
     ) combined_resources) active_resources;

  return v_result;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2. get_admin_resource_metrics (re-create with admin check)
-- -----------------------------------------------------------------------------
create or replace function public.get_admin_resource_metrics(
  p_period text default '30d',
  p_sort_key text default 'views',
  p_sort_dir text default 'desc',
  p_search text default ''
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_start_date timestamptz;
  v_result jsonb;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Admin access required';
  end if;

  if p_period = 'all' then
    v_start_date := '1970-01-01'::timestamptz;
  elsif p_period = '7d' then
    v_start_date := now() - interval '7 days';
  elsif p_period = '30d' then
    v_start_date := now() - interval '30 days';
  elsif p_period = '90d' then
    v_start_date := now() - interval '90 days';
  else
    v_start_date := now() - interval '30 days';
  end if;

  select jsonb_agg(row_to_json(t))
  into v_result
  from (
    select
      r.id,
      r.title,
      r.slug,
      r.thumbnail_url,
      coalesce(vw.cnt, 0) as total_views,
      coalesce(dl.cnt, 0) as total_downloads,
      coalesce(vw.unique_users, 0) as unique_users,
      case
        when coalesce(vw.cnt, 0) > 0
        then round((coalesce(dl.cnt, 0)::numeric / vw.cnt::numeric) * 100)::int
        else 0
      end as conversion_rate,
      vw.last_view_at,
      dl.last_download_at
    from public.resources r
    left join lateral (
      select
        resource_id,
        count(*) as cnt,
        count(distinct user_id) as unique_users,
        max(created_at) as last_view_at
      from public.resource_events
      where event_type = 'open'
        and resource_id = r.id
        and created_at >= v_start_date
      group by resource_id
    ) vw on true
    left join lateral (
      select
        resource_id,
        count(*) as cnt,
        max(created_at) as last_download_at
      from public.resource_downloads
      where resource_id = r.id
        and created_at >= v_start_date
      group by resource_id
    ) dl on true
    where
      (coalesce(vw.cnt, 0) > 0 or coalesce(dl.cnt, 0) > 0)
      and (p_search = '' or r.title ilike '%' || p_search || '%' or r.slug ilike '%' || p_search || '%')
    order by
      case when p_sort_key = 'views' and p_sort_dir = 'desc' then coalesce(vw.cnt, 0) end desc,
      case when p_sort_key = 'views' and p_sort_dir = 'asc' then coalesce(vw.cnt, 0) end asc,
      case when p_sort_key = 'downloads' and p_sort_dir = 'desc' then coalesce(dl.cnt, 0) end desc,
      case when p_sort_key = 'downloads' and p_sort_dir = 'asc' then coalesce(dl.cnt, 0) end asc,
      case when p_sort_key = 'conversion' and p_sort_dir = 'desc'
        then case when coalesce(vw.cnt, 0) > 0 then (coalesce(dl.cnt, 0)::numeric / vw.cnt::numeric) * 100 else 0 end
      end desc,
      case when p_sort_key = 'conversion' and p_sort_dir = 'asc'
        then case when coalesce(vw.cnt, 0) > 0 then (coalesce(dl.cnt, 0)::numeric / vw.cnt::numeric) * 100 else 0 end
      end asc,
      case when p_sort_key = 'last_activity' and p_sort_dir = 'desc'
        then greatest(coalesce(vw.last_view_at, '1970-01-01'::timestamptz), coalesce(dl.last_download_at, '1970-01-01'::timestamptz))
      end desc,
      case when p_sort_key = 'last_activity' and p_sort_dir = 'asc'
        then greatest(coalesce(vw.last_view_at, '1970-01-01'::timestamptz), coalesce(dl.last_download_at, '1970-01-01'::timestamptz))
      end asc
  ) t;

  return coalesce(v_result, '[]'::jsonb);
end;
$$;

-- -----------------------------------------------------------------------------
-- 3. get_admin_resource_metric_events (re-create with admin check)
-- -----------------------------------------------------------------------------
create or replace function public.get_admin_resource_metric_events(
  p_resource_id uuid,
  p_period text default '30d'
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_start_date timestamptz;
  v_result jsonb;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Admin access required';
  end if;

  if p_period = 'all' then
    v_start_date := '1970-01-01'::timestamptz;
  elsif p_period = '7d' then
    v_start_date := now() - interval '7 days';
  elsif p_period = '30d' then
    v_start_date := now() - interval '30 days';
  elsif p_period = '90d' then
    v_start_date := now() - interval '90 days';
  else
    v_start_date := now() - interval '30 days';
  end if;

  select jsonb_agg(row_to_json(t) order by t.created_at desc)
  into v_result
  from (
    select
      e.id,
      e.event_type,
      e.created_at,
      e.user_id,
      p.full_name as user_full_name,
      p.email as user_email,
      e.country
    from (
      select id, 'open' as event_type, created_at, user_id, resource_id, country
      from public.resource_events
      where resource_id = p_resource_id
        and event_type = 'open'
        and created_at >= v_start_date
      union all
      select id, coalesce(action_type, 'download') as event_type, created_at, user_id, resource_id, country
      from public.resource_downloads
      where resource_id = p_resource_id
        and created_at >= v_start_date
    ) e
    left join public.profiles p on p.id = e.user_id
    order by e.created_at desc
    limit 200
  ) t;

  return coalesce(v_result, '[]'::jsonb);
end;
$$;

-- -----------------------------------------------------------------------------
-- 4. get_admin_metric_countries (with admin check + views/downloads)
-- -----------------------------------------------------------------------------
create or replace function public.get_admin_metric_countries(
  p_period text default '30d'
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_start_date timestamptz;
  v_result jsonb;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Admin access required';
  end if;

  if p_period = 'all' then
    v_start_date := '1970-01-01'::timestamptz;
  elsif p_period = '7d' then
    v_start_date := now() - interval '7 days';
  elsif p_period = '30d' then
    v_start_date := now() - interval '30 days';
  elsif p_period = '90d' then
    v_start_date := now() - interval '90 days';
  else
    v_start_date := now() - interval '30 days';
  end if;

  select jsonb_agg(row_to_json(t) order by t.total desc)
  into v_result
  from (
    select
      combined.country,
      count(*) as total,
      count(distinct combined.user_id) as unique_users,
      sum(case when combined.source = 'view' then 1 else 0 end) as views,
      sum(case when combined.source = 'download' then 1 else 0 end) as downloads
    from (
      select user_id, country, 'view' as source
      from public.resource_events
      where created_at >= v_start_date
        and country is not null
      union all
      select user_id, country, 'download' as source
      from public.resource_downloads
      where created_at >= v_start_date
        and country is not null
    ) combined
    group by combined.country
    order by count(*) desc
    limit 20
  ) t;

  return coalesce(v_result, '[]'::jsonb);
end;
$$;

-- -----------------------------------------------------------------------------
-- 5. get_admin_metric_export (re-create with admin check + events + enhanced countries)
-- -----------------------------------------------------------------------------
create or replace function public.get_admin_metric_export(
  p_period text default '30d'
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_start_date timestamptz;
  v_summary jsonb;
  v_resources jsonb;
  v_countries jsonb;
  v_events jsonb;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Admin access required';
  end if;

  if p_period = 'all' then
    v_start_date := '1970-01-01'::timestamptz;
  elsif p_period = '7d' then
    v_start_date := now() - interval '7 days';
  elsif p_period = '30d' then
    v_start_date := now() - interval '30 days';
  elsif p_period = '90d' then
    v_start_date := now() - interval '90 days';
  else
    v_start_date := now() - interval '30 days';
  end if;

  -- Get summary
  select public.get_admin_metric_summary(p_period) into v_summary;

  -- Get per-resource metrics (no search filter for export)
  select public.get_admin_resource_metrics(p_period, 'views', 'desc', '') into v_resources;

  -- Get country breakdown with views and downloads
  select jsonb_agg(row_to_json(t) order by t.total desc)
  into v_countries
  from (
    select
      combined.country,
      count(*) as total,
      count(distinct combined.user_id) as unique_users,
      sum(case when combined.source = 'view' then 1 else 0 end) as views,
      sum(case when combined.source = 'download' then 1 else 0 end) as downloads
    from (
      select user_id, country, 'view' as source
      from public.resource_events
      where created_at >= v_start_date
        and country is not null
      union all
      select user_id, country, 'download' as source
      from public.resource_downloads
      where created_at >= v_start_date
        and country is not null
    ) combined
    group by combined.country
    order by count(*) desc
    limit 20
  ) t;

  -- Get event details for export
  select jsonb_agg(row_to_json(t) order by t.created_at desc)
  into v_events
  from (
    select
      e.id,
      e.event_type,
      e.created_at,
      e.user_id,
      p.full_name as user_full_name,
      p.email as user_email,
      e.country,
      e.resource_id,
      r.title as resource_title
    from (
      select id, 'open' as event_type, created_at, user_id, resource_id, country
      from public.resource_events
      where created_at >= v_start_date
      union all
      select id, coalesce(action_type, 'download') as event_type, created_at, user_id, resource_id, country
      from public.resource_downloads
      where created_at >= v_start_date
    ) e
    left join public.profiles p on p.id = e.user_id
    left join public.resources r on r.id = e.resource_id
    order by e.created_at desc
    limit 5000
  ) t;

  return jsonb_build_object(
    'summary', v_summary,
    'resources', v_resources,
    'countries', coalesce(v_countries, '[]'::jsonb),
    'events', coalesce(v_events, '[]'::jsonb),
    'generated_at', now()::text,
    'period', p_period
  );
end;
$$;

-- Grant execute to authenticated (admin check is inside each function)
grant execute on function public.get_admin_metric_summary to authenticated;
grant execute on function public.get_admin_resource_metrics to authenticated;
grant execute on function public.get_admin_resource_metric_events to authenticated;
grant execute on function public.get_admin_metric_countries to authenticated;
grant execute on function public.get_admin_metric_export to authenticated;