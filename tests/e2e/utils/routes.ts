export const PUBLIC_ROUTES = {
  home: '/',
  resources: '/resources',
  contributors: '/contributors',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  authConfirm: '/auth/confirm',
} as const

export const USER_ROUTES = {
  dashboard: '/dashboard',
  resources: '/dashboard/resources',
  library: '/dashboard/library',
  downloads: '/dashboard/downloads',
  profile: '/dashboard/profile',
} as const

export const CONTRIBUTOR_ROUTES = {
  ...USER_ROUTES,
  contributorHome: '/dashboard/contributor',
  contributorProfile: '/dashboard/contributor/profile',
  contributorResources: '/dashboard/contributor/resources',
  contributorNewResource: '/dashboard/contributor/resources/new',
} as const

export const ADMIN_ROUTES = {
  dashboard: '/admin',
  account: '/admin/account',
  resources: '/admin/resources',
  newResource: '/admin/resources/new',
  contributors: '/admin/contributors',
  newContributor: '/admin/contributors/new',
  categories: '/admin/categories',
  newCategory: '/admin/categories/new',
  tags: '/admin/tags',
  newTag: '/admin/tags/new',
  applications: '/admin/contributor-applications',
  metrics: '/admin/metrics',
} as const
