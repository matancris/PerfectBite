import { NavLink } from 'react-router-dom'
import { useBusinessStore } from '@/stores/business.store'
import { Icon, BusinessLogo } from '@/components/ui'

const navItems = [
  { path: '/admin', label: 'דשבורד', icon: 'dashboard', end: true },
  { path: '/admin/orders', label: 'הזמנות', icon: 'receipt_long' },
  { path: '/admin/menu', label: 'תפריט', icon: 'restaurant_menu' },
  { path: '/admin/events', label: 'אירועים', icon: 'event' },
  { path: '/admin/pickup-slots', label: 'שעות איסוף', icon: 'schedule' },
  { path: '/admin/settings', label: 'הגדרות', icon: 'settings' },
]

export function AdminSidebar() {
  const business = useBusinessStore((state) => state.business)
  const businessName = business?.name || 'ניהול'
  const logoUrl = business?.settings?.logoUrl

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__logo">
        <BusinessLogo logoUrl={logoUrl} size="lg" className="admin-sidebar__logo-icon" />
        <span className="admin-sidebar__logo-text">{businessName}</span>
      </div>

      <nav className="admin-sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
            }
          >
            <Icon name={item.icon} size="md" className="admin-sidebar__link-icon" />
            <span className="admin-sidebar__link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
