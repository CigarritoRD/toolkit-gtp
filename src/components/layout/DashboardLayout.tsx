import { Outlet } from 'react-router-dom'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import PageTransition from '@/components/ui/PageTransition'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-bg">
      <DashboardSidebar />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </main>
    </div>
  )
}