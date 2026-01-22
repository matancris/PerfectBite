import { useCallback } from 'react'
import type { MenuItem } from '@/types'
import { useCartStore } from '@/stores/cart.store'
import { useToast } from '@/hooks/useToast'
import { MenuItemCard } from './MenuItemCard'

interface MenuGridProps {
  items: MenuItem[]
  onCartOpen: () => void
}

export function MenuGrid({ items, onCartOpen }: MenuGridProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { showSuccess } = useToast()

  const handleAddToCart = useCallback(
    (item: MenuItem) => {
      addItem(item, 1)
      showSuccess(`${item.name} נוסף לעגלה`)
      onCartOpen()
    },
    [addItem, showSuccess, onCartOpen]
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
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  )
}
