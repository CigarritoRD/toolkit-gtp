import { Outlet } from 'react-router-dom'
import PublicNavbar from '@/components/layout/PublicNavbar'
import PublicFooter from '@/components/layout/PublicFooter'
import PageTransition from '@/components/ui/PageTransition'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <PublicNavbar />
      <main>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <PublicFooter />
    </div>
  )
}