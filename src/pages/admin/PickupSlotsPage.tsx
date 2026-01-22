import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { AppButton, AppInput, AppCard, Icon } from '@/components/ui'
import { usePickupSlotsStore } from '@/stores/pickupSlots.store'
import { useToast } from '@/hooks/useToast'

interface GenerateSlotsFormData {
  startTime: string
  endTime: string
  intervalMinutes: number
  maxOrdersPerSlot: number
}

const generateSlotsSchema = z.object({
  startTime: z.string().min(1, 'שעת התחלה נדרשת'),
  endTime: z.string().min(1, 'שעת סיום נדרשת'),
  intervalMinutes: z.coerce.number().min(5, 'מינימום 5 דקות').max(120, 'מקסימום 120 דקות'),
  maxOrdersPerSlot: z.coerce.number().min(1, 'מינימום הזמנה אחת').max(100, 'מקסימום 100 הזמנות'),
})

interface AddSlotFormData {
  time: string
  maxOrders: number
}

const addSlotSchema = z.object({
  time: z.string().min(1, 'שעה נדרשת'),
  maxOrders: z.coerce.number().min(1, 'מינימום הזמנה אחת'),
})

export function AdminPickupSlotsPage() {
  const { slots, isLoading, fetchSlots, generateSlots, createSlot, deleteSlot } = usePickupSlotsStore()
  const { showSuccess, showError } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)

  const generateForm = useForm<GenerateSlotsFormData>({
    resolver: zodResolver(generateSlotsSchema) as never,
    defaultValues: {
      startTime: '17:00',
      endTime: '19:00',
      intervalMinutes: 15,
      maxOrdersPerSlot: 5,
    },
  })

  const addForm = useForm<AddSlotFormData>({
    resolver: zodResolver(addSlotSchema) as never,
    defaultValues: {
      time: '18:00',
      maxOrders: 5,
    },
  })

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  const onGenerateSubmit = async (data: GenerateSlotsFormData) => {
    try {
      await generateSlots(
        data.startTime,
        data.endTime,
        data.intervalMinutes,
        data.maxOrdersPerSlot
      )
      showSuccess('שעות האיסוף נוצרו בהצלחה!')
    } catch {
      showError('שגיאה ביצירת שעות האיסוף')
    }
  }

  const onAddSubmit = async (data: AddSlotFormData) => {
    try {
      await createSlot(data.time, data.maxOrders)
      showSuccess('שעת האיסוף נוספה בהצלחה!')
      setShowAddForm(false)
      addForm.reset()
    } catch {
      showError('שגיאה בהוספת שעת האיסוף')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את שעת האיסוף?')) return
    
    try {
      await deleteSlot(id)
      showSuccess('שעת האיסוף נמחקה')
    } catch {
      showError('שגיאה במחיקה')
    }
  }

  return (
    <div className="pickup-slots-page">
      <div className="pickup-slots-page__header">
        <h1 className="pickup-slots-page__title">שעות איסוף</h1>
        <AppButton
          variant="primary"
          onClick={() => setShowAddForm(true)}
        >
          <Icon name="add" size="sm" />
          הוסף שעה
        </AppButton>
      </div>

      <div className="pickup-slots-page__content">
        <div className="pickup-slots-page__generator">
          <AppCard>
            <h2 className="pickup-slots-page__section-title">
              <Icon name="auto_fix_high" size="md" />
              יצירה אוטומטית של שעות
            </h2>
            <p className="pickup-slots-page__section-desc">
              הגדר טווח שעות ומרווח זמן ליצירת שעות איסוף אוטומטית
            </p>

            <form onSubmit={generateForm.handleSubmit(onGenerateSubmit)}>
              <div className="pickup-slots-page__form-row">
                <div className="pickup-slots-page__form-field">
                  <label>שעת התחלה</label>
                  <AppInput
                    type="time"
                    {...generateForm.register('startTime')}
                    error={generateForm.formState.errors.startTime?.message}
                  />
                </div>

                <div className="pickup-slots-page__form-field">
                  <label>שעת סיום</label>
                  <AppInput
                    type="time"
                    {...generateForm.register('endTime')}
                    error={generateForm.formState.errors.endTime?.message}
                  />
                </div>
              </div>

              <div className="pickup-slots-page__form-row">
                <div className="pickup-slots-page__form-field">
                  <label>מרווח בין שעות (דקות)</label>
                  <AppInput
                    type="number"
                    min={5}
                    max={120}
                    {...generateForm.register('intervalMinutes')}
                    error={generateForm.formState.errors.intervalMinutes?.message}
                  />
                </div>

                <div className="pickup-slots-page__form-field">
                  <label>מקסימום הזמנות לשעה</label>
                  <AppInput
                    type="number"
                    min={1}
                    max={100}
                    {...generateForm.register('maxOrdersPerSlot')}
                    error={generateForm.formState.errors.maxOrdersPerSlot?.message}
                  />
                </div>
              </div>

              <AppButton
                type="submit"
                variant="secondary"
                isLoading={generateForm.formState.isSubmitting}
              >
                <Icon name="sync" size="sm" />
                צור שעות
              </AppButton>

              <p className="pickup-slots-page__warning">
                <Icon name="warning" size="sm" />
                פעולה זו תחליף את כל שעות האיסוף הקיימות
              </p>
            </form>
          </AppCard>
        </div>

        <div className="pickup-slots-page__list">
          <AppCard>
            <h2 className="pickup-slots-page__section-title">
              <Icon name="schedule" size="md" />
              שעות איסוף פעילות
            </h2>

            {isLoading ? (
              <div className="pickup-slots-page__loading">
                <div className="spinner" />
                <p>טוען שעות...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="pickup-slots-page__empty">
                <Icon name="event_busy" size="xl" />
                <p>אין שעות איסוף מוגדרות</p>
                <span>צור שעות באמצעות הטופס או הוסף ידנית</span>
              </div>
            ) : (
              <div className="pickup-slots-page__slots">
                {slots.map((slot) => {
                  const isFull = slot.maxOrders && slot.currentOrders >= slot.maxOrders
                  const usagePercent = slot.maxOrders
                    ? Math.min((slot.currentOrders / slot.maxOrders) * 100, 100)
                    : 0

                  return (
                    <div
                      key={slot.id}
                      className={`pickup-slot-card ${isFull ? 'pickup-slot-card--full' : ''}`}
                    >
                      <div className="pickup-slot-card__time">
                        <Icon name="schedule" size="md" />
                        <span>{slot.time}</span>
                      </div>

                      <div className="pickup-slot-card__stats">
                        <div className="pickup-slot-card__count">
                          <span className="pickup-slot-card__current">
                            {slot.currentOrders}
                          </span>
                          <span className="pickup-slot-card__separator">/</span>
                          <span className="pickup-slot-card__max">
                            {slot.maxOrders ?? '∞'}
                          </span>
                        </div>
                        <span className="pickup-slot-card__label">הזמנות</span>
                      </div>

                      {slot.maxOrders && (
                        <div className="pickup-slot-card__progress">
                          <div
                            className="pickup-slot-card__progress-bar"
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      )}

                      {isFull && (
                        <span className="pickup-slot-card__badge">מלא</span>
                      )}

                      <button
                        className="pickup-slot-card__delete"
                        onClick={() => handleDelete(slot.id)}
                        title="מחק"
                      >
                        <Icon name="delete" size="sm" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </AppCard>
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddForm && (
        <div className="pickup-slots-page__modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="pickup-slots-page__modal" onClick={(e) => e.stopPropagation()}>
            <h3>הוספת שעת איסוף</h3>
            
            <form onSubmit={addForm.handleSubmit(onAddSubmit)}>
              <div className="pickup-slots-page__form-field">
                <label>שעה</label>
                <AppInput
                  type="time"
                  {...addForm.register('time')}
                  error={addForm.formState.errors.time?.message}
                />
              </div>

              <div className="pickup-slots-page__form-field">
                <label>מקסימום הזמנות</label>
                <AppInput
                  type="number"
                  min={1}
                  {...addForm.register('maxOrders')}
                  error={addForm.formState.errors.maxOrders?.message}
                />
              </div>

              <div className="pickup-slots-page__modal-actions">
                <AppButton
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddForm(false)}
                >
                  ביטול
                </AppButton>
                <AppButton
                  type="submit"
                  variant="primary"
                  isLoading={addForm.formState.isSubmitting}
                >
                  הוסף
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
