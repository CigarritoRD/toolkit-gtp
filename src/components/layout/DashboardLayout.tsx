import { Outlet } from 'react-router-dom'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import PageTransition from '@/components/ui/PageTransition'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <DashboardSidebar />
      <div className="pl-64">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </div>
    </div>
  )
}