# GTP Toolkit - Project Context

## Project Overview

- **Name**: GTP Toolkit (cell-proyect)
- **Type**: React + TypeScript + Vite web application
- **Purpose**: Educational resources platform with public, dashboard, and admin sections
- **Tech Stack**: React 19, Vite 8, TypeScript, Tailwind CSS 4, Supabase, pnpm

## Key Fixes Applied

### 1. Translation Fixes
- Fixed typo `ccontributorForm` → `contributorForm` in all 5 language files (es, en, zh, zh-TW, zh-TW-TW)
- Added missing translations:
  - `admin.contributorForm.specialty`
  - `admin.contributorForm.specialtyPlaceholder`

### 2. Animation Fix
- Simplified `PageTransition` component to smooth fade-only animation
- File: `src/components/ui/PageTransition.tsx`
- Changed from Y-axis movement to simple opacity fade to fix "jumpy" transitions in admin panel

### 3. Skeleton Loaders
- Created new skeleton components in `src/components/ui/Skeleton.tsx`:
  - `AdminTableSkeleton` - For table loading states
  - `AdminPageSkeleton` - For full page loading states
- Applied to admin pages:
  - `AdminContributorsPage.tsx`
  - `AdminResourcesPage.tsx`
  - `AdminCategoriesPage.tsx`
  - `AdminTagsPage.tsx`

### 4. Counter Animation Fix (Earlier)
- Fixed `react-countup` compatibility issue with React 19
- Replaced with custom counter component in `src/pages/public/Home.tsx`

### 5. Skills & OpenCode Integration (This Session)
- Created `opencode.json` to register `.agents/skills` for OpenCode skill loading
- Converted root `SKILL.md` into `gtp-toolkit` project skill with conventions, API patterns, and accessibility guidelines
- Fixed `DashboardSidebar` logo: replaced `Sparkles` icon with proper `gtp-logo.png` import + `alt="GTP"`
- Fixed type safety in `DashboardResourcesPage`: removed `as unknown as` cast, added `normalizeApiResource()` helper and `ApiResource` type
- Fixed `useEffect` dependency warning in `ContributorResourceEditPage`: extracted `userId` as stable variable to avoid ESLint hook dependency warning

## Project Structure

```
src/
├── app/router/routes.tsx       # Main routing config
├── auth/
│   ├── AuthProvider.tsx        # Auth context provider
│   └── useAuth.tsx             # Auth hook
├── components/
│   ├── admin/                  # Admin-specific components
│   ├── layout/                 # Layout components (PublicLayout, DashboardLayout, AdminLayout)
│   ├── resources/              # Resource components
│   ├── ui/                     # Reusable UI components
│   └── ratings/                # Rating components
├── lib/
│   ├── api/                    # API functions (resources, contributors, categories, etc.)
│   ├── i18n.ts                 # Internationalization setup
│   └── supabaseClient.ts       # Supabase client
├── locales/                    # Translation files (es, en, zh, zh-TW, zh-TW-TW)
├── pages/
│   ├── admin/                  # Admin pages
│   ├── dashboard/              # User dashboard pages
│   └── public/                 # Public pages
└── types/                      # TypeScript type definitions
```

## Key Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests

## Known Issues (Previously Fixed)

1. ✅ `react-countup` not working with React 19 - Fixed with custom counter
2. ✅ Page transitions showing double animation - Fixed with simplified fade
3. ✅ Loading states showing "Cargando..." text - Fixed with skeleton loaders
4. ✅ Missing translations in admin forms - Fixed with proper keys

## Notes

- Default language is Spanish (es)
- Uses React Router v7
- Supabase for authentication and database
- PWA support via vite-plugin-pwa
- Tailwind CSS v4 with custom theme variables

## Branching Strategy

**Always use branches for new features and fixes, then merge via Pull Request:**

```bash
# 1. Create branch from main
git checkout -b fix/translations-animations

# 2. Work and commit changes
git add .
git commit -m "fix: description of changes"

# 3. Push branch to remote
git push -u origin fix/translations-animations

# 4. Create Pull Request on GitHub to merge to main
```

**Branch naming convention:**
- `fix/` - For bug fixes (e.g., `fix/translation-keys`)
- `feat/` - For new features (e.g., `feat/new-dashboard`)
- `chore/` - For maintenance tasks (e.g., `chore/update-deps`)