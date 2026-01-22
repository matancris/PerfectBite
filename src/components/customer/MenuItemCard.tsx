import type { MenuItem } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { AppButton, AppCard } from '@/components/ui'

interface MenuItemCardProps {
  item: MenuItem
  onAddToCart: (item: MenuItem) => void
}

export function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  return (
    <AppCard
      className="menu-item-card"
      image={item.imageUrl}
      imageAlt={item.name}
      variant="elevated"
    >
      <div className="menu-item-card__content">
        <h3 className="menu-item-card__name">{item.name}</h3>
        {item.description && (
          <p className="menu-item-card__description">{item.description}</p>
        )}
        <div className="menu-item-card__footer">
          <span className="menu-item-card__price">
            {formatCurrency(item.price)}
          </span>
          <AppButton
            variant="primary"
            size="sm"
            onClick={() => onAddToCart(item)}
          >
            הוסף לעגלה
          </AppButton>
        </div>
      </div>
    </AppCard>
  )
}
