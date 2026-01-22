import { useCallback } from 'react'
import type { CartItem } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { useCartStore } from '@/stores/cart.store'
import { Icon } from '@/components/ui'

interface OrderSummaryProps {
  items: CartItem[]
  total: number
}

export function OrderSummary({ items, total }: OrderSummaryProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  const handleQuantityChange = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(itemId)
      } else {
        updateQuantity(itemId, quantity)
      }
    },
    [updateQuantity, removeItem]
  )

  const handleRemove = useCallback(
    (itemId: string) => {
      removeItem(itemId)
    },
    [removeItem]
  )

  return (
    <div className="order-summary">
      <h3 className="order-summary__title">סיכום הזמנה</h3>

      <ul className="order-summary__items">
        {items.map((item) => (
          <li key={item.id} className="order-summary__item">
            <div className="order-summary__item-info">
              <span className="order-summary__item-name">{item.name}</span>
              <div className="order-summary__item-controls">
                <button
                  className="order-summary__qty-btn"
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  aria-label="הפחת כמות"
                >
                  −
                </button>
                <span className="order-summary__item-qty">{item.quantity}</span>
                <button
                  className="order-summary__qty-btn"
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  aria-label="הוסף כמות"
                >
                  +
                </button>
              </div>
            </div>
            <div className="order-summary__item-actions">
              <span className="order-summary__item-price">
                {formatCurrency(item.price * item.quantity)}
              </span>
              <button
                className="order-summary__remove-btn"
                onClick={() => handleRemove(item.id)}
                aria-label="הסר פריט"
              >
                <Icon name="delete" size="sm" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="order-summary__divider" />

      <div className="order-summary__total">
        <span className="order-summary__total-label">סה״כ לתשלום:</span>
        <span className="order-summary__total-price">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  )
}
