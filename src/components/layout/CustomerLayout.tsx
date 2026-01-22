import { Outlet } from 'react-router-dom'
import { CustomerHeader } from './CustomerHeader'
import { CustomerFooter } from './CustomerFooter'

export function CustomerLayout() {
  return (
    <div className="customer-layout">
      <CustomerHeader />
      <main className="customer-layout__main">
        <Outlet />
      </main>
      <CustomerFooter />
    </div>
  )
}
