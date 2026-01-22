import type { CartItem as CartItemType } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { Icon } from '@/components/ui'

interface CartItemProps {
  item: CartItemType
  onQuantityChange: (itemId: string, menuItemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
  maxQuantity?: number
}

export function CartItem({ item, onQuantityChange, onRemove, maxQuantity }: CartItemProps) {
  const isAtMax = maxQuantity !== undefined && item.quantity >= maxQuantity

  return (
    <li className="cart-item">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="cart-item__image"
        />
      )}
      <div className="cart-item__details">
        <h4 className="cart-item__name">{item.name}</h4>
        <p className="cart-item__price">{formatCurrency(item.price)}</p>
        {maxQuantity !== undefined && (
          <p className="cart-item__stock-limit">מקסימום: {maxQuantity}</p>
        )}
      </div>
      <div className="cart-item__quantity">
        <button
          className="cart-item__qty-btn"
          onClick={() => onQuantityChange(item.id, item.menuItemId, item.quantity - 1)}
          aria-label="הפחת כמות"
        >
          <Icon name="remove" size="sm" />
        </button>
        <span className="cart-item__qty-value">{item.quantity}</span>
        <button
          className="cart-item__qty-btn"
          onClick={() => onQuantityChange(item.id, item.menuItemId, item.quantity + 1)}
          disabled={isAtMax}
          aria-label="הוסף כמות"
          title={isAtMax ? 'הגעת לכמות המקסימלית' : undefined}
        >
          <Icon name="add" size="sm" />
        </button>
      </div>
      <button
        className="cart-item__remove"
        onClick={() => onRemove(item.id)}
        aria-label="הסר פריט"
      >
        <Icon name="delete" size="md" />
      </button>
    </li>
  )
}
