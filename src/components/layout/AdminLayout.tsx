import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'

export function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-layout__main">
        <AdminHeader />
        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
