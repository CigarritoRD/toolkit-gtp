---
name: gtp-toolkit
description: GTP Toolkit project-specific guidelines. Use when working on this React + TypeScript + Vite educational resources platform (cell-proyect). Covers project conventions, patterns, API shapes, type definitions, and component architecture.
---

# GTP Toolkit - Project Skill

Instructions for working on the GTP Toolkit (cell-proyect) application.

## When to use

Activate this skill when:
- Building or modifying any page, component, or feature
- Working on API functions, hooks, or utility functions
- Making design decisions about UI, animations, or accessibility
- Adding or updating translations

## Tech Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4 with custom theme variables
- Supabase (authentication + database)
- React Router v7
- react-i18next for internationalization
- pnpm as package manager

## Project Conventions

### File Structure

```
src/
├── app/router/routes.tsx        # React Router v7 routes
├── auth/                         # Auth context + useAuth hook
├── components/
│   ├── admin/                    # Admin-specific components
│   ├── layout/                   # Layout components (PublicLayout, DashboardLayout, AdminLayout)
│   ├── resources/               # ResourceCard, resource-related components
│   ├── ui/                       # Reusable UI (SectionCard, AppInput, AppSelect, etc.)
│   └── ratings/                  # Rating components
├── lib/api/                      # API functions (resources, contributors, categories, tags)
├── hooks/                        # Custom hooks (useContributorStatus, etc.)
├── pages/
│   ├── admin/                    # Admin pages (AdminResourcesPage, etc.)
│   ├── dashboard/                # User dashboard pages
│   │   └── contributor/          # Contributor-specific pages
│   └── public/                   # Public pages (Home, ResourceDetail, etc.)
├── types/                        # TypeScript type definitions
└── locales/                      # Translation files (es, en, zh, zh-TW)
```

### API Patterns

**Supabase query patterns:**
- Always use `.select()` with explicit columns (avoid `select('*')`)
- Use relationships via foreign key joins: `contributor:contributors (...)`
- Return `data ?? []` to ensure arrays (even on empty results)
- Throw `new Error(error.message)` on errors

**Resource API shape** (from `getPublishedResources`):
```typescript
{
  id, title, slug, description, short_description,
  thumbnail_url, resource_type, contributor_id, category_id,
  is_featured, is_public, is_published, created_at,
  contributor: { id, name, slug, avatar_url } | null,
  category: { id, name, slug } | null,
  resource_tags: [{ tag: { id, name, slug } | null }] | null
}
```

### Type Safety

**Never use unsafe casts like `as unknown as`.** Normalize the data shape in the API layer or define proper intermediary types.

**Correct approach:**
```typescript
// Define the exact shape returned by Supabase
type PublishedResource = {
  id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  thumbnail_url: string | null
  resource_type: string
  contributor_id: string
  category_id: string | null
  is_featured: boolean
  is_public: boolean
  is_published: boolean
  created_at: string
  contributor: { id: string; name: string; slug: string; avatar_url?: string } | null
  category: { id: string; name: string; slug: string } | null
  resource_tags: Array<{ tag: { id: string; name: string; slug: string } | null }> | null
}

// API returns the exact shape — no cast needed
const data = await getPublishedResources()
setResources(data)
```

### React Patterns

**useEffect with cleanup:**
```typescript
useEffect(() => {
  let active = true
  async function load() {
    try {
      setLoading(true)
      const data = await fetchSomething()
      if (!active) return
      setData(data)
    } catch (err) {
      if (!active) return
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      if (active) setLoading(false)
    }
  }
  void load()
  return () => { active = false }
}, [])
```

**Dependency arrays — avoid the ESLint warning:**
```typescript
// ❌ user used without regard in dependency array
useEffect(() => {
  if (!id || !user?.id) return
  async function load() {
    const data = await getMyContributorResourceById(user!.id, id!)
    // ...
  }
  void load()
}, [id, user]) // eslint warns: user used but not in deps

// ✅ Extract the stable dependency
useEffect(() => {
  if (!id || !userId) return
  async function load() {
    const data = await getMyContributorResourceById(userId, id)
    // ...
  }
  void load()
}, [id, userId, t]) // userId is stable
```

### Component Patterns

**Logo usage:** Import `gtpLogo from '@/assets/gtp-logo.png'` — do not use Sparkles or emoji as logos.
```typescript
import gtpLogo from '@/assets/gtp-logo.png'
<img src={gtpLogo} alt="GTP" />
```

**Icons:** Use lucide-react. Decorative icons should have `aria-hidden="true"`.

**Accessibility:**
- All images need `alt` text (empty string `""` for decorative)
- Icon buttons need `aria-label`
- Focus states must be visible (`:focus-visible`)
- Respect `prefers-reduced-motion`

### Translation Keys

Follow the pattern: `section.subsection.key`

Examples:
- `dashboard.title`
- `admin.contributorForm.specialty`
- `contributorDashboard.newResource`

Key files:
- `src/locales/es.json` (Spanish — default)
- `src/locales/en.json` (English)
- `src/locales/zh.json` (Chinese Simplified)
- `src/locales/zh-TW.json` (Chinese Traditional)
- `src/locales/zh-TW-TW.json` (Chinese Traditional Taiwan)

### CSS / Tailwind

Custom theme tokens (defined via Tailwind v4 CSS variables):
- `--color-brand-primary` — primary brand color
- `--color-brand-accent` — accent/secondary brand color
- `--color-surface` — card/panel backgrounds
- `--color-surface-hover` — hover states
- `--color-surface-border` — borders
- `--color-bg` — page background
- `--color-bg-soft` — soft backgrounds
- `--color-text-primary` — primary text
- `--color-text-secondary` — secondary text
- `--shadow-soft` — soft shadow

Use `font-heading` for headings, `font-body` for body text.

### Testing Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm test -- --run # Run tests (Vitest)
```

## Design Principles

### Branding

- GTP logo (`gtp-logo.png`) is the official brand mark
- Use brand colors via CSS variables: `text-brand-primary`, `bg-brand-accent`, etc.
- Consistent heading style via `font-heading` class

### Animation

- Keep animations subtle — avoid "jumpy" or aggressive transitions
- Respect `prefers-reduced-motion`
- Prefer CSS transitions over JS animation libraries

### Skeleton Loaders

- Use for loading states instead of spinner text
- Created in `src/components/ui/Skeleton.tsx`:
  - `AdminTableSkeleton` — for table loading
  - `AdminPageSkeleton` — for full-page loading