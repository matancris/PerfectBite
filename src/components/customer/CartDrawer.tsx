import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/stores/cart.store'
import { formatCurrency } from '@/utils/formatters'
import { AppButton, Icon } from '@/components/ui'
import { CartItem } from './CartItem'
import { eventService } from '@/services/event.service'
import { useToast } from '@/hooks/useToast'

interface StockLimit {
  menuItemId: string
  maxQuantity: number
}

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const items = useCartStore((state) => state.items)
  const totalPrice = useCartStore((state) => state.getTotalPrice())
  const clearCart = useCartStore((state) => state.clearCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const eventId = useCartStore((state) => state.eventId)
  const { showError } = useToast()
  
  const [stockLimits, setStockLimits] = useState<StockLimit[]>([])

  // Fetch stock limits for event items
  useEffect(() => {
    async function fetchStockLimits() {
      if (!eventId) {
        setStockLimits([])
        return
      }

      const result = await eventService.getEventMenuItems(eventId)
      if (result.data) {
        setStockLimits(
          result.data.map((item) => ({
            menuItemId: item.id,
            maxQuantity: item.remainingQuantity,
          }))
        )
      }
    }
    
    if (isOpen) {
      fetchStockLimits()
    }
  }, [eventId, isOpen])

  const getMaxQuantity = useCallback(
    (menuItemId: string) => {
      const limit = stockLimits.find((l) => l.menuItemId === menuItemId)
      return limit?.maxQuantity
    },
    [stockLimits]
  )

  const handleQuantityChange = useCallback(
    (itemId: string, menuItemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(itemId)
        return
      }

      // Check stock limit for event items
      const maxQty = getMaxQuantity(menuItemId)
      if (maxQty !== undefined && quantity > maxQty) {
        showError(`לא ניתן להוסיף עוד. נותרו רק ${maxQty} יחידות`)
        return
      }

      updateQuantity(itemId, quantity)
    },
    [updateQuantity, removeItem, getMaxQuantity, showError]
  )

  const handleRemove = useCallback(
    (itemId: string) => {
      removeItem(itemId)
    },
    [removeItem]
  )

  if (!isOpen) return null

  return (
    <>
      <div className="cart-drawer-overlay" onClick={onClose} />
      <aside className="cart-drawer">
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">העגלה שלי</h2>
          <button className="cart-drawer__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="cart-drawer__content">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <Icon name="shopping_cart" size="xl" className="cart-drawer__empty-icon" />
              <p>העגלה ריקה</p>
            </div>
          ) : (
            <>
              <ul className="cart-drawer__items">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                    maxQuantity={getMaxQuantity(item.menuItemId)}
                  />
                ))}
              </ul>

              <button
                className="cart-drawer__clear"
                onClick={clearCart}
              >
                נקה עגלה
              </button>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__total">
              <span>סה״כ:</span>
              <span className="cart-drawer__total-price">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            <Link to="/checkout" onClick={onClose}>
              <AppButton variant="primary" fullWidth>
                להמשך הזמנה
              </AppButton>
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
