import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MenuGrid } from '@/components/customer/MenuGrid'
import { CartDrawer } from '@/components/customer/CartDrawer'
import { useMenuStore } from '@/stores/menu.store'
import { useDocumentTitle } from '@/hooks'

export function MenuPage() {
  useDocumentTitle('התפריט')
  const { eventId } = useParams<{ eventId?: string }>()
  const { items, events, isLoading, fetchMenu, fetchEvents } = useMenuStore()
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    fetchMenu(eventId)
    fetchEvents()
  }, [eventId, fetchMenu, fetchEvents])

  const currentEvent = events.find((e) => e.id === eventId)

  return (
    <div className="menu-page">
      <div className="menu-page__header">
        <h1 className="menu-page__title">
          {currentEvent ? currentEvent.title : 'התפריט שלנו'}
        </h1>
        {currentEvent && (
          <p className="menu-page__subtitle">
            הזמנות עד: {new Date(currentEvent.orderDeadline).toLocaleString('he-IL')}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="menu-page__loading">
          <div className="spinner" />
          <p>טוען תפריט...</p>
        </div>
      ) : (
        <MenuGrid items={items} onCartOpen={() => setIsCartOpen(true)} />
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
