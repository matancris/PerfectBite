import { useCallback } from 'react'
import type { CartItem } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { useCartStore } from '@/stores/cart.store'
import { useToast } from '@/hooks/useToast'
import { Icon } from '@/components/ui'

interface StockLimit {
  menuItemId: string
  maxQuantity: number
}

interface OrderSummaryProps {
  items: CartItem[]
  total: number
  stockLimits?: StockLimit[] // For event items with limited stock
}

export function OrderSummary({ items, total, stockLimits = [] }: OrderSummaryProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const { showError } = useToast()

  const getMaxQuantity = useCallback(
    (menuItemId: string) => {
      const limit = stockLimits.find((l) => l.menuItemId === menuItemId)
      return limit?.maxQuantity
    },
    [stockLimits]
  )

  const handleQuantityChange = useCallback(
    (itemId: string, menuItemId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        removeItem(itemId)
        return
      }

      // Check stock limit for event items
      const maxQty = getMaxQuantity(menuItemId)
      if (maxQty !== undefined && newQuantity > maxQty) {
        showError(`לא ניתן להוסיף עוד. נותרו רק ${maxQty} יחידות`)
        return
      }

      updateQuantity(itemId, newQuantity)
    },
    [updateQuantity, removeItem, getMaxQuantity, showError]
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
        {items.map((item) => {
          const maxQty = getMaxQuantity(item.menuItemId)
          const isAtMax = maxQty !== undefined && item.quantity >= maxQty

          return (
            <li key={item.id} className="order-summary__item">
              <div className="order-summary__item-info">
                <span className="order-summary__item-name">{item.name}</span>
                <div className="order-summary__item-controls">
                  <button
                    className="order-summary__qty-btn"
                    onClick={() => handleQuantityChange(item.id, item.menuItemId, item.quantity - 1)}
                    aria-label="הפחת כמות"
                  >
                    −
                  </button>
                  <span className="order-summary__item-qty">{item.quantity}</span>
                  <button
                    className="order-summary__qty-btn"
                    onClick={() => handleQuantityChange(item.id, item.menuItemId, item.quantity + 1)}
                    disabled={isAtMax}
                    aria-label="הוסף כמות"
                    title={isAtMax ? 'הגעת לכמות המקסימלית' : undefined}
                  >
                    +
                  </button>
                </div>
                {maxQty !== undefined && (
                  <span className="order-summary__stock-info">
                    (מקסימום: {maxQty})
                  </span>
                )}
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
          )
        })}
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
