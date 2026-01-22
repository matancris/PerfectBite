import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MenuGrid } from '@/components/customer/MenuGrid'
import { CartDrawer } from '@/components/customer/CartDrawer'
import { useMenuStore } from '@/stores/menu.store'
import { useCartStore } from '@/stores/cart.store'
import { useDocumentTitle } from '@/hooks'
import { eventService } from '@/services/event.service'
import type { Event, MenuItem } from '@/types'
import { AppButton, Icon } from '@/components/ui'

interface EventMenuItem extends MenuItem {
  eventItemId: string
  maxQuantity: number
  currentQuantity: number
  remainingQuantity: number
}

export function MenuPage() {
  const { eventId } = useParams<{ eventId?: string }>()
  const { items, isLoading: menuLoading, fetchMenu } = useMenuStore()
  const setEventId = useCartStore((state) => state.setEventId)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [eventItems, setEventItems] = useState<EventMenuItem[]>([])
  const [isLoadingEvent, setIsLoadingEvent] = useState(false)

  useDocumentTitle(currentEvent?.title || 'התפריט')

  // Function to load event data - always fetches fresh data
  const loadEventData = useCallback(async (id: string) => {
    setIsLoadingEvent(true)
    setEventId(id)
    
    const [eventResult, itemsResult] = await Promise.all([
      eventService.getEvent(id),
      eventService.getEventMenuItems(id),
    ])
    
    if (eventResult.data) {
      setCurrentEvent(eventResult.data)
    }
    if (itemsResult.data) {
      setEventItems(itemsResult.data as EventMenuItem[])
    }
    setIsLoadingEvent(false)
  }, [setEventId])

  // Load data on mount and when eventId changes
  useEffect(() => {
    if (eventId) {
      loadEventData(eventId)
    } else {
      fetchMenu()
      setCurrentEvent(null)
      setEventItems([])
      setEventId(null)
    }
  }, [eventId, fetchMenu, setEventId, loadEventData])

  // Refresh data when the page becomes visible (user comes back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && eventId) {
        console.log('[MenuPage] Page became visible, refreshing event data...')
        loadEventData(eventId)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [eventId, loadEventData])

  // Also refresh when navigating back to this page
  useEffect(() => {
    const handleFocus = () => {
      if (eventId) {
        console.log('[MenuPage] Window focused, refreshing event data...')
        loadEventData(eventId)
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [eventId, loadEventData])

  const isLoading = menuLoading || isLoadingEvent
  const displayItems = eventId ? eventItems : items

  // Check if order deadline has passed
  const isDeadlinePassed = currentEvent
    ? new Date(currentEvent.orderDeadline) < new Date()
    : false

  return (
    <div className="menu-page">
      <div className="menu-page__header">
        <h1 className="menu-page__title">
          {currentEvent ? currentEvent.title : 'התפריט שלנו'}
        </h1>
        {currentEvent && (
          <>
            {currentEvent.description && (
              <p className="menu-page__description">{currentEvent.description}</p>
            )}
            <div className="menu-page__event-info">
              <span className="menu-page__deadline">
                <Icon name="timer" size="sm" />
                הזמנות עד: {new Date(currentEvent.orderDeadline).toLocaleString('he-IL', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </span>
              {isDeadlinePassed && (
                <span className="menu-page__deadline-passed">
                  <Icon name="warning" size="sm" />
                  ההזמנות נסגרו
                </span>
              )}
            </div>
          </>
        )}
        {eventId && (
          <Link to="/menu" className="menu-page__back-link">
            <Icon name="arrow_forward" size="sm" />
            חזרה לתפריט הקבוע
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="menu-page__loading">
          <div className="spinner" />
          <p>טוען תפריט...</p>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="menu-page__empty">
          <Icon name="inventory_2" size="xl" />
          <h2>אין פריטים זמינים</h2>
          <p>
            {eventId
              ? 'כל הפריטים באירוע זה אזלו או שלא הוגדרו פריטים.'
              : 'התפריט ריק כרגע.'}
          </p>
          <Link to="/">
            <AppButton variant="primary">חזרה לדף הבית</AppButton>
          </Link>
        </div>
      ) : (
        <MenuGrid
          items={displayItems}
          onCartOpen={() => setIsCartOpen(true)}
          isEventMenu={!!eventId}
          isOrderingDisabled={isDeadlinePassed}
        />
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
