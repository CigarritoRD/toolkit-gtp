import { Outlet } from 'react-router-dom'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import PageTransition from '@/components/ui/PageTransition'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-bg">
      <DashboardSidebar />
      <main className="min-w-0 flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  )
}