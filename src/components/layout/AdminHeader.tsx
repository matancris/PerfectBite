import { useAuthStore } from '@/stores/auth.store'
import { HamburgerButton } from '@/components/ui'

interface AdminHeaderProps {
  isMenuOpen: boolean
  onMenuToggle: () => void
}

export function AdminHeader({ isMenuOpen, onMenuToggle }: AdminHeaderProps) {
  const { user, signOut } = useAuthStore()

  return (
    <header className="admin-header">
      <div className="admin-header__container">
        <div className="admin-header__right">
          <HamburgerButton
            isOpen={isMenuOpen}
            onClick={onMenuToggle}
            className="admin-header__menu-btn"
          />
          <h1 className="admin-header__title">ניהול המערכת</h1>
        </div>

        <div className="admin-header__user">
          {user && (
            <>
              <span className="admin-header__user-name">{user.email}</span>
              <button
                onClick={signOut}
                className="admin-header__logout"
              >
                התנתק
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
