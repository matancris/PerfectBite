import { useCallback } from 'react'
import type { MenuItem } from '@/types'
import { useCartStore } from '@/stores/cart.store'
import { useToast } from '@/hooks/useToast'
import { MenuItemCard } from './MenuItemCard'

interface EventMenuItem extends MenuItem {
  eventItemId?: string
  maxQuantity?: number
  currentQuantity?: number
  remainingQuantity?: number
}

interface MenuGridProps {
  items: EventMenuItem[]
  onCartOpen: () => void
  isEventMenu?: boolean
  isOrderingDisabled?: boolean
}

export function MenuGrid({
  items,
  onCartOpen,
  isEventMenu = false,
  isOrderingDisabled = false,
}: MenuGridProps) {
  const addItem = useCartStore((state) => state.addItem)
  const cartItems = useCartStore((state) => state.items)
  const { showSuccess, showError } = useToast()

  const handleAddToCart = useCallback(
    (item: EventMenuItem) => {
      if (isOrderingDisabled) {
        showError('ההזמנות נסגרו')
        return
      }

      // Check remaining quantity for event items
      if (isEventMenu && item.remainingQuantity !== undefined) {
        const cartItem = cartItems.find((ci) => ci.menuItemId === item.id)
        const currentInCart = cartItem?.quantity ?? 0

        if (currentInCart >= item.remainingQuantity) {
          showError(`לא ניתן להוסיף עוד. נותרו רק ${item.remainingQuantity} יחידות`)
          return
        }
      }

      addItem(item, 1)
      showSuccess(`${item.name} נוסף לעגלה`)
      onCartOpen()
    },
    [addItem, showSuccess, showError, onCartOpen, isEventMenu, isOrderingDisabled, cartItems]
  )

  if (items.length === 0) {
    return (
      <div className="menu-grid menu-grid--empty">
        <p>אין פריטים זמינים כרגע</p>
      </div>
    )
  }

  return (
    <div className="menu-grid">
      {items.map((item) => {
        const cartItem = cartItems.find((ci) => ci.menuItemId === item.id)
        const inCart = cartItem?.quantity ?? 0
        const remaining = item.remainingQuantity !== undefined
          ? item.remainingQuantity - inCart
          : undefined

        return (
          <MenuItemCard
            key={item.id}
            item={item}
            onAddToCart={handleAddToCart}
            remainingQuantity={remaining}
            isDisabled={isOrderingDisabled || (remaining !== undefined && remaining <= 0)}
            isEventItem={isEventMenu}
          />
        )
      })}
    </div>
  )
}
