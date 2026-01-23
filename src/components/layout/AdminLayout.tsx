import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'

export function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  return (
    <div className="admin-layout">
      <AdminSidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
      <div className="admin-layout__main">
        <AdminHeader isMenuOpen={isMobileMenuOpen} onMenuToggle={toggleMobileMenu} />
        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="admin-layout__overlay"
          onClick={closeMobileMenu}
        />
      )}
    </div>
  )
}
