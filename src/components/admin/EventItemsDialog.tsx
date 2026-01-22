import { useState, useEffect, useCallback } from 'react'
import { AppDialog, AppButton, AppInput, Icon } from '@/components/ui'
import { eventService } from '@/services/event.service'
import { menuService } from '@/services/menu.service'
import { useToast } from '@/hooks/useToast'
import type { Event, EventItem, MenuItem } from '@/types'

interface EventItemsDialogProps {
  event: Event
  onClose: () => void
}

export function EventItemsDialog({ event, onClose }: EventItemsDialogProps) {
  const { showSuccess, showError } = useToast()
  const [eventItems, setEventItems] = useState<EventItem[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(10)
  const [isAdding, setIsAdding] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    const [eventItemsResult, menuItemsResult] = await Promise.all([
      eventService.getEventItems(event.id),
      menuService.getMenuItems(), // Get all menu items
    ])

    if (eventItemsResult.data) {
      setEventItems(eventItemsResult.data)
    }
    if (menuItemsResult.data) {
      setMenuItems(menuItemsResult.data)
    }
    setIsLoading(false)
  }, [event.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter out items that are already added to the event
  const availableItems = menuItems.filter(
    (mi) => !eventItems.some((ei) => ei.menuItemId === mi.id)
  )

  const handleAddItem = async () => {
    if (!selectedItemId || quantity < 1) return

    setIsAdding(true)
    const result = await eventService.addEventItem(event.id, selectedItemId, quantity)
    setIsAdding(false)

    if (result.error) {
      showError('שגיאה בהוספת הפריט')
      return
    }

    if (result.data) {
      setEventItems((prev) => [...prev, result.data!])
      setSelectedItemId('')
      setQuantity(10)
      showSuccess('הפריט נוסף לאירוע')
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    const result = await eventService.removeEventItem(itemId)

    if (result.error) {
      showError('שגיאה בהסרת הפריט')
      return
    }

    setEventItems((prev) => prev.filter((item) => item.id !== itemId))
    showSuccess('הפריט הוסר מהאירוע')
  }

  const handleUpdateQuantity = async (itemId: string, newMax: number) => {
    const result = await eventService.updateEventItem(itemId, { maxQuantity: newMax })

    if (result.error) {
      showError('שגיאה בעדכון הכמות')
      return
    }

    if (result.data) {
      setEventItems((prev) =>
        prev.map((item) => (item.id === itemId ? result.data! : item))
      )
    }
  }

  return (
    <AppDialog
      isOpen={true}
      onClose={onClose}
      title={`ניהול פריטים - ${event.title}`}
      size="lg"
    >
      {isLoading ? (
        <div className="event-items-dialog__loading">
          <div className="spinner" />
          <p>טוען פריטים...</p>
        </div>
      ) : (
        <div className="event-items-dialog">
          {/* Add Item Section */}
          <div className="event-items-dialog__add-section">
            <h4>הוספת פריט לאירוע</h4>
            <div className="event-items-dialog__add-form">
              <select
                className="app-select"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
              >
                <option value="">בחר פריט מהתפריט...</option>
                {availableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - ₪{item.price}
                  </option>
                ))}
              </select>

              <AppInput
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="כמות מקסימלית"
              />

              <AppButton
                variant="primary"
                onClick={handleAddItem}
                disabled={!selectedItemId || isAdding}
                isLoading={isAdding}
              >
                <Icon name="add" size="sm" />
                הוסף
              </AppButton>
            </div>
          </div>

          {/* Items List */}
          <div className="event-items-dialog__list">
            <h4>פריטים באירוע ({eventItems.length})</h4>
            
            {eventItems.length === 0 ? (
              <div className="event-items-dialog__empty">
                <Icon name="inventory_2" size="xl" />
                <p>אין פריטים באירוע</p>
                <span>הוסף פריטים מהתפריט כדי שלקוחות יוכלו להזמין</span>
              </div>
            ) : (
              <div className="event-items-dialog__items">
                {eventItems.map((item) => {
                  const remaining = (item.maxQuantity ?? 0) - item.currentQuantity
                  const usagePercent = item.maxQuantity
                    ? (item.currentQuantity / item.maxQuantity) * 100
                    : 0

                  return (
                    <div key={item.id} className="event-item-card">
                      {item.menuItem?.imageUrl && (
                        <img
                          src={item.menuItem.imageUrl}
                          alt={item.menuItem.name}
                          className="event-item-card__image"
                        />
                      )}
                      
                      <div className="event-item-card__info">
                        <h5 className="event-item-card__name">
                          {item.menuItem?.name ?? 'פריט לא ידוע'}
                        </h5>
                        <p className="event-item-card__price">
                          ₪{item.customPrice ?? item.menuItem?.price ?? 0}
                        </p>
                      </div>

                      <div className="event-item-card__quantity">
                        <label>כמות מקסימלית:</label>
                        <AppInput
                          type="number"
                          min={item.currentQuantity}
                          value={item.maxQuantity ?? 0}
                          onChange={(e) =>
                            handleUpdateQuantity(item.id, Number(e.target.value))
                          }
                        />
                      </div>

                      <div className="event-item-card__stats">
                        <div className="event-item-card__count">
                          <span className="event-item-card__sold">
                            {item.currentQuantity}
                          </span>
                          <span>/</span>
                          <span className="event-item-card__max">
                            {item.maxQuantity ?? '∞'}
                          </span>
                        </div>
                        <span className="event-item-card__remaining">
                          נותרו: {remaining}
                        </span>
                        <div className="event-item-card__progress">
                          <div
                            className="event-item-card__progress-bar"
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>

                      <button
                        className="event-item-card__remove"
                        onClick={() => handleRemoveItem(item.id)}
                        title="הסר מהאירוע"
                      >
                        <Icon name="delete" size="md" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </AppDialog>
  )
}
