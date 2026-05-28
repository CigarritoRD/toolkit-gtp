-- =============================================================================
-- Feature: Optimized Metrics RPC Functions & Country Tracking
-- =============================================================================
-- 1. Add country column to resource_downloads
-- 2. Add optimized indexes for metrics queries
-- 3. Create RPC functions for metrics (move aggregation to Postgres)
-- 4. Create RPC function for Excel export
-- 5. RLS policies for new columns and functions
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Add country column to resource_downloads
-- -----------------------------------------------------------------------------
alter table public.resource_downloads
add column if not exists country text;

comment on column public.resource_downloads.country is 'ISO country code of user at time of download.';

-- -----------------------------------------------------------------------------
-- 2. Add optimized indexes for metrics queries
-- -----------------------------------------------------------------------------
create index if not exists idx_resource_events_type_created
  on public.resource_events (event_type, created_at desc);

create index if not exists idx_resource_events_resource_type_created
  on public.resource_events (resource_id, event_type, created_at desc)
  where event_type = 'open';

create index if not exists idx_resource_downloads_country_created
  on public.resource_downloads (country, created_at desc);

create index if not exists idx_resource_downloads_resource_created
  on public.resource_downloads (resource_id, created_at desc);

-- Partial index for resource_downloads with country
create index if not exists idx_resource_downloads_with_country
  on public.resource_downloads (created_at desc)
  where country is not null;

-- -----------------------------------------------------------------------------
-- 3. Drop existing RLS policies on resource_downloads and re-create
-- -----------------------------------------------------------------------------
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'resource_downloads'
  loop
    execute format('drop policy if exists %I on public.resource_downloads', pol.policyname);
  end loop;
end $$;

alter table public.resource_downloads enable row level security;

-- INSERT: authenticated user must match their own user_id
create policy "Users can insert their own downloads"
on public.resource_downloads
for insert
to authenticated
with check (user_id = auth.uid());

-- SELECT: user sees own downloads, admin sees all
create policy "Users can read their own downloads"
on public.resource_downloads
for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can read all downloads"
on public.resource_downloads
for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

-- UPDATE: user can update own, admin can update all
create policy "Users can update their own downloads"
on public.resource_downloads
for update
using (user_id = auth.uid());

create policy "Admins can update all downloads"
on public.resource_downloads
for update
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

-- DELETE: user can delete own, admin can delete all
create policy "Users can delete their own downloads"
on public.resource_downloads
for delete
using (user_id = auth.uid());

create policy "Admins can delete all downloads"
on public.resource_downloads
for delete
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

-- -----------------------------------------------------------------------------
-- 4. RPC Functions for Metrics (aggregated in Postgres for performance)
-- -----------------------------------------------------------------------------

-- Function: get_admin_metric_summary
-- Returns summary KPIs for a given period (views, downloads, unique users, etc.)
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
  -- Calculate start date from period
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

  -- Execute aggregation in Postgres (much faster than fetching raw rows)
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

-- Function: get_admin_resource_metrics
-- Returns per-resource metrics (views, downloads, unique users, conversion) for a period
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
  -- Calculate start date from period
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

  -- Execute the aggregated query in Postgres
  -- This avoids fetching thousands of raw rows to the client
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

-- Function: get_admin_resource_metric_events
-- Returns timeline events for a specific resource and period
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

-- Function: get_admin_metric_export
-- Returns full export data for Excel generation
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
begin
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

  -- Get country breakdown from both tables
  select jsonb_agg(row_to_json(t) order by t.total desc)
  into v_countries
  from (
    select
      country,
      count(*) as total,
      count(distinct user_id) as unique_users
    from (
      select user_id, country from public.resource_events
      where created_at >= v_start_date and country is not null
      union all
      select user_id, country from public.resource_downloads
      where created_at >= v_start_date and country is not null
    ) combined
    group by country
    order by total desc
    limit 20
  ) t;

  return jsonb_build_object(
    'summary', v_summary,
    'resources', v_resources,
    'countries', v_countries,
    'generated_at', now()::text,
    'period', p_period
  );
end;
$$;

-- Grant execute on functions to authenticated users (admins only via RLS on profiles)
grant execute on function public.get_admin_metric_summary to authenticated;
grant execute on function public.get_admin_resource_metrics to authenticated;
grant execute on function public.get_admin_resource_metric_events to authenticated;
grant execute on function public.get_admin_metric_export to authenticated;