import type { MenuItem } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { AppButton, AppCard, Icon } from '@/components/ui'

interface MenuItemCardProps {
  item: MenuItem
  onAddToCart: (item: MenuItem) => void
  remainingQuantity?: number
  isDisabled?: boolean
  isEventItem?: boolean // true if this item is from an event menu
}

export function MenuItemCard({
  item,
  onAddToCart,
  remainingQuantity,
  isDisabled = false,
  isEventItem = false,
}: MenuItemCardProps) {
  const isOutOfStock = remainingQuantity !== undefined && remainingQuantity <= 0
  
  // Item can be ordered if:
  // 1. It's an event item (always orderable when event is active)
  // 2. It's a regular menu item with availableAnytime = true
  const canOrder = isEventItem || item.availableAnytime
  const isButtonDisabled = isDisabled || isOutOfStock || !canOrder

  const getButtonText = () => {
    if (isOutOfStock) return 'אזל'
    if (!canOrder) return 'זמין באירועים'
    return 'הוסף לעגלה'
  }

  return (
    <AppCard
      className={`menu-item-card ${isOutOfStock ? 'menu-item-card--out-of-stock' : ''} ${!canOrder ? 'menu-item-card--view-only' : ''}`}
      image={item.imageUrl}
      imageAlt={item.name}
      variant="elevated"
    >
      <div className="menu-item-card__content">
        <h3 className="menu-item-card__name">{item.name}</h3>
        {item.description && (
          <p className="menu-item-card__description">{item.description}</p>
        )}

        {remainingQuantity !== undefined && (
          <div className="menu-item-card__stock">
            <Icon name="inventory" size="sm" />
            <span>
              {isOutOfStock ? 'אזל מהמלאי' : `נותרו ${remainingQuantity} יחידות`}
            </span>
          </div>
        )}

        {!canOrder && !isEventItem && (
          <div className="menu-item-card__availability-note">
            <Icon name="event" size="sm" />
            <span>פריט זה זמין להזמנה רק דרך אירועים</span>
          </div>
        )}

        <div className="menu-item-card__footer">
          <span className="menu-item-card__price">
            {formatCurrency(item.price)}
          </span>
          <AppButton
            variant={canOrder ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onAddToCart(item)}
            disabled={isButtonDisabled}
          >
            {getButtonText()}
          </AppButton>
        </div>
      </div>
    </AppCard>
  )
}
