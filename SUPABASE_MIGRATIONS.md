# Supabase Migrations Guide

## Overview

All database changes to the Supabase project are managed through SQL migration files in `supabase/migrations/` and applied using the Management API via `scripts/apply-migration.ps1`.

**Why this approach:**
- Direct Postgres connections (`db.tixkibcbfimduxjanpjr.supabase.co:5432`) time out from this environment.
- The Supabase Management API (`api.supabase.com/v1/projects/{ref}/database/query`) works reliably.
- Versioned SQL files provide a reproducible history of schema changes.

---

## Prerequisites

1. **Supabase Access Token**
   - Go to: [Supabase Dashboard](https://supabase.com/dashboard) → Account → Access Tokens
   - Generate a new token (e.g., `opencode-local`)
   - Set it locally in PowerShell (never commit this to git):

```powershell
$env:SUPABASE_ACCESS_TOKEN = "your_token_here"
$env:SUPABASE_PROJECT_REF = "tixkibcbfimduxjanpjr"
```

2. **Apply the template** (optional but recommended):
```powershell
copy .env.supabase.local.example .env.supabase.local
# Then edit .env.supabase.local and fill in your values
```

---

## Creating a Migration

1. Create a new `.sql` file in `supabase/migrations/` with a descriptive name:
```text
supabase/migrations/
  20250514_metrics_and_profile_phone.sql   ← already applied
  YYYYMMDD_description.sql                  ← for new changes
```

2. Write the SQL. Example:
```sql
alter table public.profiles
add column if not exists phone text;

create policy "Admins can read profiles"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);
```

---

## Applying a Migration

```powershell
.\scripts\apply-migration.ps1 -File "supabase\migrations\YYYYMMDD_description.sql"
```

The script posts the SQL to:
```
POST https://api.supabase.com/v1/projects/{project_ref}/database/query
```

---

## Verifying a Migration

Run a read-only query to confirm the change:

```powershell
# Example: verify a column exists
$headers = @{
  Authorization = "Bearer $env:SUPABASE_ACCESS_TOKEN"
  apikey = $env:SUPABASE_ACCESS_TOKEN
  "Content-Type" = "application/json"
}
$body = @{ query = "select column_name, data_type from information_schema.columns where table_name = 'profiles' and column_name = 'phone'" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$env:SUPABASE_PROJECT_REF/database/query" -Method Post -Body $body -Headers $headers -TimeoutSec 30
```

---

## Current Schema State

| Table | Columns | Notes |
|-------|---------|-------|
| `profiles` | `phone` | Added 2025-05-14 |
| `resource_events` | `user_id` | Added 2025-05-14, RLS: admin SELECT only |
| `contributor_events` | `user_id` | Added 2025-05-14, RLS: admin SELECT only |
| `resource_downloads` | (existing) | RLS: users see own, admins see all |

---

## Security Notes

- **Never commit** `.env`, `.env.local`, `.env.supabase.local`, or any file containing secrets.
- Access tokens and passwords should be set via environment variables only.
- The Management API bypasses RLS for DDL operations, but regular queries still respect RLS policies.
- When done with bulk changes, **rotate** any passwords that were shared via chat.

---

## Troubleshooting

**"Your account does not have the necessary privileges"**
→ The access token lacks permissions. Regenerate from an account with owner/admin role on the project.

**Connection timeout on port 5432**
→ Expected from this environment. Always use the Management API approach.

**Migration applied but changes not visible**
→ Check RLS policies. The Management API applies DDL, but SELECT queries still respect row-level security.