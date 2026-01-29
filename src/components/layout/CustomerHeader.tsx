import { Link } from 'react-router-dom'
import { useCartStore } from '@/stores/cart.store'
import { useBusinessStore } from '@/stores/business.store'
import { useAuthStore } from '@/stores/auth.store'
import { Icon, BusinessLogo } from '@/components/ui'

export function CustomerHeader() {
  const itemCount = useCartStore((state) => state.getTotalItems())
  const business = useBusinessStore((state) => state.business)
  const user = useAuthStore((state) => state.user)

  const businessName = business?.name || 'המאפייה שלנו'
  const logoUrl = business?.settings?.logoUrl

  return (
    <header className="customer-header">
      <div className="customer-header__container">
        <Link to="/" className="customer-header__logo">
          <BusinessLogo logoUrl={logoUrl} size="lg" className="customer-header__logo-icon" />
          <span className="customer-header__logo-text">{businessName}</span>
        </Link>

        <nav className="customer-header__nav">
          <Link to="/menu" className="customer-header__link">
            התפריט
          </Link>
          <Link to="/checkout" className="customer-header__cart">
            <Icon name="shopping_cart" size="md" className="customer-header__cart-icon" />
            {itemCount > 0 && (
              <span className="customer-header__cart-badge">{itemCount}</span>
            )}
          </Link>
          {user ? (
            <Link to="/admin" className="customer-header__admin-button">
              <Icon name="dashboard" size="sm" />
              <span>מעבר לניהול</span>
            </Link>
          ) : (
            <Link to="/login" className="customer-header__login-link">
              <Icon name="lock" size="sm" />
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
