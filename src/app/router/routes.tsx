import { createBrowserRouter, Navigate } from 'react-router-dom'

import GuestRoute from '@/app/router/GuestRoute'
import ProtectedRoute from '@/app/router/ProtectedRoute'
import AdminRoute from '@/app/router/AdminRoute'

import PublicLayout from '@/components/layout/PublicLayout'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminLayout from '@/components/layout/AdminLayout'

import HomePage from '@/pages/public/Home'
import ResourcesPage from '@/pages/public/ResourcesPage'
import ResourceDetailPage from '@/pages/public/ResourceDetailPage'
import ContributorsPage from '@/pages/public/ContributorsPage'
import ContributorDetailPage from '@/pages/public/ContributorDetailPage'
import BecomeContributorPage from '@/pages/public/BecomeContributorPage'
import LoginPage from '@/pages/public/LoginPage'
import RegisterPage from '@/pages/public/RegisterPage'
import NotFoundPage from '@/pages/public/NotFoundPage'

import DashboardHomePage from '@/pages/dashboard/DashboardHomePage'
import DashboardResourcesPage from '@/pages/dashboard/DashboardResourcesPage'
import DashboardLibraryPage from '@/pages/dashboard/DashboardLibraryPage'
import DashboardDownloadsPage from '@/pages/dashboard/DashboardDownloadsPage'
import DashboardProfilePage from '@/pages/dashboard/DashboardProfilePage'

import ContributorHomePage from '@/pages/dashboard/contributor/ContributorHomePage'
import ContributorProfilePage from '@/pages/dashboard/contributor/ContributorProfilePage'
import ContributorResourcesPage from '@/pages/dashboard/contributor/ContributorResourcesPage'
import ContributorResourceEditPage from '@/pages/dashboard/contributor/ContributorResourceEditPage'

import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminAccountPage from '@/pages/admin/AdminAccountPage'
import AdminResourcesPage from '@/pages/admin/AdminResourcesPage'
import AdminResourceCreatePage from '@/pages/admin/AdminResourceCreatePage'
import AdminResourceEditPage from '@/pages/admin/AdminResourceEditPage'
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage'
import AdminCategoryCreatePage from '@/pages/admin/AdminCreateCategoryPage'
import AdminCategoryEditPage from '@/pages/admin/AdminCategoryEditPage'
import AdminContributorsPage from '@/pages/admin/AdminContributorsPage'
import AdminContributorEditPage from '@/pages/admin/AdminContributorEditPage'
import AdminContributorCreatePage from '@/pages/admin/AdminContributorCreatePage'
import AdminContributorApplicationsPage from '@/pages/admin/AdminContributorApplicationsPage'
import AdminContributorApplicationDetailPage from '@/pages/admin/AdminContributorApplicationDetailPage'
import AdminTagCreatePage from '@/pages/admin/AdminTagCreatePage'
import AdminTagEditPage from '@/pages/admin/AdminTagEditPage'
import AdminTagsPage from '@/pages/admin/AdminTagsPage'
import AdminMetricsPage from '@/pages/admin/AdminMetricsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },

      { path: 'resources', element: <ResourcesPage /> },
      { path: 'resources/:slug', element: <ResourceDetailPage /> },

      { path: 'contributors', element: <ContributorsPage /> },
      { path: 'contributors/:slug', element: <ContributorDetailPage /> },
      { path: 'become-a-contributor', element: <BecomeContributorPage /> },

      {
        element: <GuestRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
    ],
  },

  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardHomePage /> },
      { path: 'resources', element: <DashboardResourcesPage /> },
      { path: 'library', element: <DashboardLibraryPage /> },
      { path: 'downloads', element: <DashboardDownloadsPage /> },
      { path: 'profile', element: <DashboardProfilePage /> },

      { path: 'contributor', element: <ContributorHomePage /> },
      { path: 'contributor/profile', element: <ContributorProfilePage /> },
      { path: 'contributor/resources', element: <ContributorResourcesPage /> },
      { path: 'contributor/resources/new', element: <ContributorResourceEditPage /> },
      { path: 'contributor/resources/:id/edit', element: <ContributorResourceEditPage /> },
    ],
  },

  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'account', element: <AdminAccountPage /> },

      { path: 'resources', element: <AdminResourcesPage /> },
      { path: 'resources/new', element: <AdminResourceCreatePage /> },
      { path: 'resources/:id/edit', element: <AdminResourceEditPage /> },

      { path: 'contributors', element: <AdminContributorsPage /> },
      { path: 'contributors/new', element: <AdminContributorCreatePage /> },
      { path: 'contributors/:id/edit', element: <AdminContributorEditPage /> },

      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'categories/new', element: <AdminCategoryCreatePage /> },
      { path: 'categories/:id/edit', element: <AdminCategoryEditPage /> },

      { path: 'contributor-applications', element: <AdminContributorApplicationsPage /> },
      { path: 'contributor-applications/:id', element: <AdminContributorApplicationDetailPage /> },

      { path: 'tags', element: <AdminTagsPage /> },
      { path: 'tags/new', element: <AdminTagCreatePage /> },
      { path: 'tags/:id/edit', element: <AdminTagEditPage /> },

      { path: 'metrics', element: <AdminMetricsPage /> }
    ],
  },

  {
    path: '/home',
    element: <Navigate to="/" replace />,
  },

  {
    path: '*',
    element: <NotFoundPage />,
  },
])