-- =============================================================================
-- Verification: Contributor Applications + Resource Moderation
-- Migration: 20250601_contributor_applications_and_resource_moderation.sql
-- Run this after applying the migration to confirm all changes are in place.
-- =============================================================================

-- 1. Check resources columns
SELECT 'resources: approval_status'    AS check_name,
       count(*) AS count,
       bool_and(approval_status IS NOT NULL) AS not_null
FROM public.resources;

SELECT 'resources: rejection_reason'    AS check_name, count(*) AS count
FROM public.resources WHERE rejection_reason IS NOT NULL;

SELECT 'resources: submitted_at'        AS check_name, count(*) AS count
FROM public.resources WHERE submitted_at IS NOT NULL;

SELECT 'resources: reviewed_by'         AS check_name, count(*) AS count
FROM public.resources WHERE reviewed_by IS NOT NULL;

SELECT 'resources: reviewed_at'          AS check_name, count(*) AS count
FROM public.resources WHERE reviewed_at IS NOT NULL;

SELECT 'resources: created_by'           AS check_name, count(*) AS count
FROM public.resources WHERE created_by IS NOT NULL;

-- 2. Check contributors columns
SELECT 'contributors: contact_name'  AS check_name, count(*) AS count
FROM public.contributors WHERE contact_name IS NOT NULL;

SELECT 'contributors: contact_role'  AS check_name, count(*) AS count
FROM public.contributors WHERE contact_role IS NOT NULL;

SELECT 'contributors: contact_email' AS check_name, count(*) AS count
FROM public.contributors WHERE contact_email IS NOT NULL;

SELECT 'contributors: contact_phone' AS check_name, count(*) AS count
FROM public.contributors WHERE contact_phone IS NOT NULL;

-- 3. Contributors without user_id (legacy - expected to be > 0)
SELECT 'contributors: user_id IS NULL (legacy)' AS check_name, count(*) AS count
FROM public.contributors WHERE user_id IS NULL;

SELECT 'contributors: user_id IS NOT NULL (new)' AS check_name, count(*) AS count
FROM public.contributors WHERE user_id IS NOT NULL;

-- 4. Check approval_status values in resources
SELECT approval_status, count(*) AS count
FROM public.resources
GROUP BY approval_status
ORDER BY count DESC;

-- 5. Check RLS is enabled
SELECT
    tablename,
    relrowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('contributor_applications', 'contributors', 'resources')
ORDER BY tablename;

-- 6. Check policies on contributor_applications
SELECT
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'contributor_applications'
ORDER BY policyname;

-- 7. Check policies on resources
SELECT
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'resources'
ORDER BY policyname;

-- 8. Check indexes
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'resources'
  AND indexname LIKE 'idx_%'
ORDER BY indexname;

-- 9. profiles.role values
SELECT role, count(*) AS count
FROM public.profiles
GROUP BY role
ORDER BY count DESC;

-- 10. Quick sanity: total resources by approval_status
SELECT
    approval_status,
    count(*) AS total,
    count(*) FILTER (WHERE is_published = true) AS published,
    count(*) FILTER (WHERE is_public = true) AS public_visible
FROM public.resources
GROUP BY approval_status
ORDER BY approval_status;