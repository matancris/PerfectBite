import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import type { Event, MenuItem, EventPickupSlot } from '@/types'
import { AppDialog, AppButton, AppInput, AppTextarea, Icon } from '@/components/ui'
import { useEventsStore } from '@/stores/events.store'
import { eventService } from '@/services/event.service'
import { menuService } from '@/services/menu.service'
import { useToast } from '@/hooks/useToast'

interface EventDialogProps {
  event: Event | null
  onClose: () => void
}

interface EventFormData {
  title: string
  description: string
  eventDate: string
  startTime: string
  endTime: string
  orderDeadline: string
  isActive: boolean
  allowAnyPickupTime: boolean
}

interface PickupSlotInput {
  id?: string // For existing slots
  time: string
  maxOrders: number
}

const eventSchema = z.object({
  title: z.string().min(1, 'כותרת האירוע חובה'),
  description: z.string().optional(),
  eventDate: z.string().min(1, 'תאריך האירוע חובה'),
  startTime: z.string().min(1, 'שעת התחלה חובה'),
  endTime: z.string().min(1, 'שעת סיום חובה'),
  orderDeadline: z.string().min(1, 'מועד אחרון להזמנה חובה'),
  isActive: z.boolean(),
  allowAnyPickupTime: z.boolean(),
})

interface SelectedItem {
  menuItemId: string
  menuItem: MenuItem
  maxQuantity: number
  existingId?: string // For items already in the event
}

export function EventDialog({ event, onClose }: EventDialogProps) {
  const fetchEvents = useEventsStore((state) => state.fetchEvents)
  const updateEvent = useEventsStore((state) => state.updateEvent)
  const { showSuccess, showError } = useToast()

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  
  // Pickup slots state
  const [pickupSlots, setPickupSlots] = useState<PickupSlotInput[]>([])
  const [slotInterval, setSlotInterval] = useState(15) // Default 15 minutes interval
  const [defaultMaxOrders, setDefaultMaxOrders] = useState(10)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as never,
    defaultValues: {
      title: event?.title ?? '',
      description: event?.description ?? '',
      eventDate: event?.eventDate ?? '',
      startTime: event?.startTime ?? '17:00',
      endTime: event?.endTime ?? '19:00',
      orderDeadline: event?.orderDeadline ?? '',
      isActive: event?.isActive ?? true,
      allowAnyPickupTime: event?.allowAnyPickupTime ?? false,
    },
  })

  const allowAnyPickupTime = watch('allowAnyPickupTime')

  // Load menu items and existing event data
  useEffect(() => {
    async function loadData() {
      setIsLoadingItems(true)
      const menuResult = await menuService.getMenuItems()
      if (menuResult.data) {
        setMenuItems(menuResult.data)
      }

      // If editing, load existing event items and pickup slots
      if (event) {
        const eventItemsResult = await eventService.getEventItems(event.id)
        if (eventItemsResult.data) {
          setSelectedItems(
            eventItemsResult.data.map((ei) => ({
              menuItemId: ei.menuItemId,
              menuItem: ei.menuItem!,
              maxQuantity: ei.maxQuantity ?? 10,
              existingId: ei.id,
            }))
          )
        }

        // Load existing pickup slots
        const pickupSlotsResult = await eventService.getEventPickupSlots(event.id)
        if (pickupSlotsResult.data) {
          setPickupSlots(
            pickupSlotsResult.data.map((slot: EventPickupSlot) => ({
              id: slot.id,
              time: slot.time,
              maxOrders: slot.maxOrders,
            }))
          )
        }
      }
      setIsLoadingItems(false)
    }
    loadData()
  }, [event])

  const handleAddItem = useCallback((menuItem: MenuItem) => {
    setSelectedItems((prev) => {
      if (prev.some((si) => si.menuItemId === menuItem.id)) {
        return prev // Already added
      }
      return [...prev, { menuItemId: menuItem.id, menuItem, maxQuantity: 10 }]
    })
  }, [])

  const handleRemoveItem = useCallback((menuItemId: string) => {
    setSelectedItems((prev) => prev.filter((si) => si.menuItemId !== menuItemId))
  }, [])

  const handleQuantityChange = useCallback((menuItemId: string, quantity: number) => {
    setSelectedItems((prev) =>
      prev.map((si) =>
        si.menuItemId === menuItemId ? { ...si, maxQuantity: quantity } : si
      )
    )
  }, [])

  // Generate pickup slots from start/end time
  const generatePickupSlots = useCallback((startTime: string, endTime: string) => {
    const slots: PickupSlotInput[] = []
    
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    let currentMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    while (currentMinutes < endMinutes) {
      const hour = Math.floor(currentMinutes / 60)
      const min = currentMinutes % 60
      const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
      
      slots.push({
        time: timeStr,
        maxOrders: defaultMaxOrders,
      })
      
      currentMinutes += slotInterval
    }
    
    setPickupSlots(slots)
  }, [slotInterval, defaultMaxOrders])

  const handleAddSlot = useCallback(() => {
    setPickupSlots((prev) => [...prev, { time: '', maxOrders: defaultMaxOrders }])
  }, [defaultMaxOrders])

  const handleRemoveSlot = useCallback((index: number) => {
    setPickupSlots((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSlotChange = useCallback((index: number, field: 'time' | 'maxOrders', value: string | number) => {
    setPickupSlots((prev) =>
      prev.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    )
  }, [])

  const onSubmit = async (data: EventFormData) => {
    try {
      let eventId: string

      if (event) {
        // Update existing event
        await updateEvent(event.id, {
          title: data.title,
          description: data.description,
          eventDate: data.eventDate,
          startTime: data.startTime,
          endTime: data.endTime,
          orderDeadline: data.orderDeadline,
          isActive: data.isActive,
          allowAnyPickupTime: data.allowAnyPickupTime,
        })
        eventId = event.id

        // Update event items
        // First, remove items that were removed
        const existingIds = selectedItems.filter((si) => si.existingId).map((si) => si.existingId!)
        const eventItemsResult = await eventService.getEventItems(eventId)
        if (eventItemsResult.data) {
          for (const ei of eventItemsResult.data) {
            if (!existingIds.includes(ei.id)) {
              await eventService.removeEventItem(ei.id)
            }
          }
        }

        // Add new items and update existing
        for (const item of selectedItems) {
          if (item.existingId) {
            await eventService.updateEventItem(item.existingId, {
              maxQuantity: item.maxQuantity,
            })
          } else {
            await eventService.addEventItem(eventId, item.menuItemId, item.maxQuantity)
          }
        }

        // Update pickup slots
        // Remove slots that were removed
        const existingSlotIds = pickupSlots.filter((s) => s.id).map((s) => s.id!)
        const existingSlotsResult = await eventService.getEventPickupSlots(eventId)
        if (existingSlotsResult.data) {
          for (const slot of existingSlotsResult.data) {
            if (!existingSlotIds.includes(slot.id)) {
              await eventService.removeEventPickupSlot(slot.id)
            }
          }
        }

        // Add new slots and update existing
        for (const slot of pickupSlots) {
          if (slot.id) {
            await eventService.updateEventPickupSlot(slot.id, {
              time: slot.time,
              maxOrders: slot.maxOrders,
            })
          } else if (slot.time) {
            await eventService.addEventPickupSlot(eventId, slot.time, slot.maxOrders)
          }
        }

        showSuccess('האירוע עודכן בהצלחה')
      } else {
        // Create new event
        const result = await eventService.createEvent({
          businessId: import.meta.env.VITE_BUSINESS_ID || 'default',
          title: data.title,
          description: data.description,
          eventDate: data.eventDate,
          startTime: data.startTime,
          endTime: data.endTime,
          orderDeadline: data.orderDeadline,
          isActive: data.isActive,
          allowAnyPickupTime: data.allowAnyPickupTime,
        })

        if (result.error) {
          showError('שגיאה ביצירת האירוע')
          return
        }

        eventId = result.data!.id

        // Add event items
        for (const item of selectedItems) {
          await eventService.addEventItem(eventId, item.menuItemId, item.maxQuantity)
        }

        // Add pickup slots
        for (const slot of pickupSlots) {
          if (slot.time) {
            await eventService.addEventPickupSlot(eventId, slot.time, slot.maxOrders)
          }
        }

        // Refresh the events list in the store
        await fetchEvents()

        showSuccess('האירוע נוסף בהצלחה')
      }

      onClose()
    } catch {
      showError('שגיאה בשמירת האירוע')
    }
  }

  // Filter out already selected items
  const availableItems = menuItems.filter(
    (mi) => !selectedItems.some((si) => si.menuItemId === mi.id)
  )

  return (
    <AppDialog
      isOpen={true}
      onClose={onClose}
      title={event ? 'עריכת אירוע' : 'יצירת אירוע חדש'}
      size="lg"
      footer={
        <div className="event-dialog__footer">
          <AppButton variant="secondary" onClick={onClose}>
            ביטול
          </AppButton>
          <AppButton
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          >
            {event ? 'שמור שינויים' : 'צור אירוע'}
          </AppButton>
        </div>
      }
    >
      <form className="event-dialog__form">
        {/* Basic Details Section */}
        <div className="event-dialog__section">
          <h4 className="event-dialog__section-title">
            <Icon name="info" size="sm" />
            פרטי האירוע
          </h4>

          <div className="event-dialog__field">
            <AppInput
              label="כותרת האירוע"
              placeholder="לדוגמא: הזמנת מאפים - יום חמישי"
              {...register('title')}
              error={errors.title?.message}
            />
          </div>

          <div className="event-dialog__field">
            <AppTextarea
              label="תיאור (אופציונלי)"
              placeholder="הוסף תיאור קצר..."
              rows={2}
              {...register('description')}
            />
          </div>
        </div>

        {/* Date & Time Section */}
        <div className="event-dialog__section">
          <h4 className="event-dialog__section-title">
            <Icon name="schedule" size="sm" />
            תאריך ושעות
          </h4>

          <div className="event-dialog__field">
            <AppInput
              label="תאריך האירוע"
              type="date"
              {...register('eventDate')}
              error={errors.eventDate?.message}
            />
          </div>

          <div className="event-dialog__row">
            <div className="event-dialog__field">
              <AppInput
                label="שעת התחלה"
                type="time"
                {...register('startTime')}
                error={errors.startTime?.message}
              />
            </div>

            <div className="event-dialog__field">
              <AppInput
                label="שעת סיום"
                type="time"
                {...register('endTime')}
                error={errors.endTime?.message}
              />
            </div>
          </div>

          <div className="event-dialog__field">
            <AppInput
              label="מועד אחרון להזמנה"
              type="datetime-local"
              {...register('orderDeadline')}
              error={errors.orderDeadline?.message}
            />
          </div>
        </div>

        {/* Pickup Slots Section */}
        <div className="event-dialog__section">
          <h4 className="event-dialog__section-title">
            <Icon name="schedule" size="sm" />
            שעות איסוף
          </h4>
          
          {/* Flexible pickup toggle */}
          <div className="event-dialog__field">
            <label className="event-dialog__checkbox">
              <input type="checkbox" {...register('allowAnyPickupTime')} />
              <span>אפשר איסוף בכל שעה (ללא הגבלה)</span>
            </label>
            <p className="event-dialog__hint">
              כאשר מסומן, הלקוחות יכולים להגיע בכל שעה בין שעות האירוע
            </p>
          </div>

          {!allowAnyPickupTime && (
            <>
              <p className="event-dialog__section-hint">
                הגדר שעות איסוף וכמה הזמנות מקסימום לכל שעה
              </p>

              {/* Auto-generate controls */}
              <div className="event-dialog__slot-generator">
                <div className="event-dialog__slot-generator-row">
                  <div className="event-dialog__slot-generator-field">
                    <label>מרווח (דקות)</label>
                    <input
                      type="number"
                      min={5}
                      step={5}
                      value={slotInterval}
                      onChange={(e) => setSlotInterval(Number(e.target.value))}
                    />
                  </div>
                  <div className="event-dialog__slot-generator-field">
                    <label>מקס׳ הזמנות</label>
                    <input
                      type="number"
                      min={1}
                      value={defaultMaxOrders}
                      onChange={(e) => setDefaultMaxOrders(Number(e.target.value))}
                    />
                  </div>
                  <AppButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const startTime = (document.querySelector('input[name="startTime"]') as HTMLInputElement)?.value
                      const endTime = (document.querySelector('input[name="endTime"]') as HTMLInputElement)?.value
                      if (startTime && endTime) {
                        generatePickupSlots(startTime, endTime)
                      }
                    }}
                  >
                    <Icon name="auto_fix_high" size="sm" />
                    יצירה אוטומטית
                  </AppButton>
                </div>
              </div>

              {/* Pickup slots list */}
              {pickupSlots.length === 0 ? (
                <div className="event-dialog__empty-slots">
                  <Icon name="schedule" size="lg" />
                  <p>לא הוגדרו שעות איסוף</p>
                  <span>לחץ על "יצירה אוטומטית" או הוסף ידנית</span>
                </div>
              ) : (
                <div className="event-dialog__slots-list">
                  {pickupSlots.map((slot, index) => (
                    <div key={index} className="event-dialog__slot">
                      <div className="event-dialog__slot-time">
                        <input
                          type="time"
                          value={slot.time}
                          onChange={(e) => handleSlotChange(index, 'time', e.target.value)}
                        />
                      </div>
                      <div className="event-dialog__slot-max">
                        <label>מקס׳:</label>
                        <input
                          type="number"
                          min={1}
                          value={slot.maxOrders}
                          onChange={(e) => handleSlotChange(index, 'maxOrders', Number(e.target.value))}
                        />
                      </div>
                      <button
                        type="button"
                        className="event-dialog__slot-remove"
                        onClick={() => handleRemoveSlot(index)}
                      >
                        <Icon name="close" size="sm" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <AppButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddSlot}
              >
                <Icon name="add" size="sm" />
                הוסף שעה ידנית
              </AppButton>
            </>
          )}
        </div>

        {/* Items Section */}
        <div className="event-dialog__section">
          <h4 className="event-dialog__section-title">
            <Icon name="restaurant_menu" size="sm" />
            פריטים לאירוע
          </h4>

          {/* Item Selector */}
          <div className="event-dialog__item-selector">
            <select
              className="app-select"
              value=""
              onChange={(e) => {
                const item = menuItems.find((mi) => mi.id === e.target.value)
                if (item) handleAddItem(item)
              }}
              disabled={isLoadingItems || availableItems.length === 0}
            >
              <option value="">
                {isLoadingItems
                  ? 'טוען פריטים...'
                  : availableItems.length === 0
                    ? 'כל הפריטים נבחרו'
                    : 'בחר פריט להוספה...'}
              </option>
              {availableItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - ₪{item.price}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Items */}
          {selectedItems.length === 0 ? (
            <div className="event-dialog__empty-items">
              <Icon name="inventory_2" size="lg" />
              <p>לא נבחרו פריטים</p>
              <span>בחר פריטים מהתפריט למכירה באירוע</span>
            </div>
          ) : (
            <div className="event-dialog__items-list">
              {selectedItems.map((item) => (
                <div key={item.menuItemId} className="event-dialog__item">
                  {item.menuItem.imageUrl && (
                    <img
                      src={item.menuItem.imageUrl}
                      alt={item.menuItem.name}
                      className="event-dialog__item-image"
                    />
                  )}
                  <div className="event-dialog__item-info">
                    <span className="event-dialog__item-name">{item.menuItem.name}</span>
                    <span className="event-dialog__item-price">₪{item.menuItem.price}</span>
                  </div>
                  <div className="event-dialog__item-quantity">
                    <label>כמות:</label>
                    <input
                      type="number"
                      min={1}
                      value={item.maxQuantity}
                      onChange={(e) =>
                        handleQuantityChange(item.menuItemId, Number(e.target.value))
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="event-dialog__item-remove"
                    onClick={() => handleRemoveItem(item.menuItemId)}
                  >
                    <Icon name="close" size="sm" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="event-dialog__field">
          <label className="event-dialog__checkbox">
            <input type="checkbox" {...register('isActive')} />
            <span>אירוע פעיל (יוצג ללקוחות)</span>
          </label>
        </div>
      </form>
    </AppDialog>
  )
}
