import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { AppButton, AppInput, AppSelect, AppTextarea } from '@/components/ui'
import { useCartStore } from '@/stores/cart.store'
import { useToast } from '@/hooks/useToast'
import { orderService } from '@/services/order.service'
import { pickupSlotsService } from '@/services/pickupSlots.service'
import { eventService } from '@/services/event.service'
import { PaymentForm } from './PaymentForm'
import type { OrderFormData, Order, PickupSlot, Event } from '@/types'

// Schema for events with specific pickup slots
const orderSchemaWithSlots = z.object({
  customerName: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  customerPhone: z.string().min(9, 'מספר טלפון לא תקין'),
  customerEmail: z.email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  fulfillmentType: z.enum(['pickup', 'dine_in']),
  pickupSlotId: z.string().min(1, 'יש לבחור שעת איסוף'),
  flexiblePickupConfirmed: z.boolean().optional(),
  notes: z.string().optional(),
})

// Schema for events with flexible pickup (no slots required)
const orderSchemaFlexible = z.object({
  customerName: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  customerPhone: z.string().min(9, 'מספר טלפון לא תקין'),
  customerEmail: z.email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  fulfillmentType: z.enum(['pickup', 'dine_in']),
  pickupSlotId: z.string().optional(),
  flexiblePickupConfirmed: z.boolean().refine(val => val === true, 'יש לאשר את שעות האיסוף'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof orderSchemaWithSlots>

type CheckoutStep = 'details' | 'payment'

export function OrderForm() {
  const navigate = useNavigate()
  const { showError, showSuccess } = useToast()
  const items = useCartStore((state) => state.items)
  const totalPrice = useCartStore((state) => state.getTotalPrice())
  const eventId = useCartStore((state) => state.eventId)
  const clearCart = useCartStore((state) => state.clearCart)
  
  const [pickupSlots, setPickupSlots] = useState<PickupSlot[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<CheckoutStep>('details')
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null)
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)

  // Determine if event allows flexible pickup
  const allowsFlexiblePickup = currentEvent?.allowAnyPickupTime ?? false

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(allowsFlexiblePickup ? orderSchemaFlexible : orderSchemaWithSlots) as never,
    defaultValues: {
      fulfillmentType: 'pickup',
      flexiblePickupConfirmed: false,
    },
  })

  useEffect(() => {
    async function fetchEventAndSlots() {
      // Fetch event data if ordering from an event
      if (eventId) {
        const eventResult = await eventService.getEvent(eventId)
        if (eventResult.data) {
          setCurrentEvent(eventResult.data)
          
          // Only fetch pickup slots if event doesn't allow any pickup time
          if (!eventResult.data.allowAnyPickupTime) {
            const result = await pickupSlotsService.getAvailableSlots(eventId)
            if (result.data) {
              setPickupSlots(result.data)
            }
          }
          return
        }
      }
      
      // Fetch general pickup slots (non-event orders)
      const result = await pickupSlotsService.getAvailableSlots(eventId ?? undefined)
      if (result.data) {
        setPickupSlots(result.data)
      }
    }
    fetchEventAndSlots()
  }, [eventId])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    
    const formData: OrderFormData = {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || undefined,
      fulfillmentType: data.fulfillmentType,
      pickupSlotId: allowsFlexiblePickup ? undefined : data.pickupSlotId,
      flexiblePickupConfirmed: data.flexiblePickupConfirmed,
      notes: data.notes,
    }

    // Create order with pending status
    const result = await orderService.createOrder(formData, items, eventId)
    
    setIsSubmitting(false)

    if (result.error) {
      showError('שגיאה ביצירת ההזמנה. אנא נסו שוב.')
      return
    }

    if (result.data) {
      // Move to payment step
      setPendingOrder(result.data)
      setStep('payment')
    }
  }

  const handlePaymentSuccess = useCallback(async (_transactionId: string) => {
    if (!pendingOrder) return

    // Update order status to confirmed
    await orderService.updateOrderStatus(pendingOrder.id, 'confirmed')
    
    showSuccess('התשלום בוצע בהצלחה!')
    clearCart()
    navigate(`/order-confirmation/${pendingOrder.id}`)
  }, [pendingOrder, clearCart, navigate, showSuccess])

  const handlePaymentError = useCallback((error: string) => {
    showError(error)
  }, [showError])

  const handlePaymentCancel = useCallback(() => {
    setStep('details')
    setPendingOrder(null)
  }, [])

  // Payment step
  if (step === 'payment' && pendingOrder) {
    return (
      <PaymentForm
        order={{
          ...pendingOrder,
          totalAmount: totalPrice,
        }}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onCancel={handlePaymentCancel}
      />
    )
  }

  // Details step
  return (
    <form className="order-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="order-form__steps">
        <div className="order-form__step order-form__step--active">
          <span className="order-form__step-number">1</span>
          <span className="order-form__step-label">פרטים</span>
        </div>
        <div className="order-form__step-line" />
        <div className="order-form__step">
          <span className="order-form__step-number">2</span>
          <span className="order-form__step-label">תשלום</span>
        </div>
      </div>

      <div className="order-form__section">
        <h3 className="order-form__section-title">פרטי הלקוח</h3>

        <div className="order-form__field">
          <AppInput
            label="שם מלא"
            placeholder="הכניסו את השם שלכם"
            {...register('customerName')}
            error={errors.customerName?.message}
          />
        </div>

        <div className="order-form__field">
          <AppInput
            label="טלפון"
            type="tel"
            placeholder="05X-XXXXXXX"
            {...register('customerPhone')}
            error={errors.customerPhone?.message}
          />
        </div>

        <div className="order-form__field">
          <AppInput
            label="אימייל (אופציונלי)"
            type="email"
            placeholder="your@email.com"
            {...register('customerEmail')}
            error={errors.customerEmail?.message}
          />
        </div>
      </div>

      <div className="order-form__section">
        <h3 className="order-form__section-title">אופן קבלת ההזמנה</h3>

        <div className="order-form__field">
          <AppSelect
            label="איסוף או ישיבה במקום"
            options={[
              { value: 'pickup', label: 'איסוף' },
              { value: 'dine_in', label: 'ישיבה במקום' },
            ]}
            {...register('fulfillmentType')}
          />
        </div>

        <div className="order-form__field">
          {allowsFlexiblePickup ? (
            <>
              <label className="order-form__checkbox">
                <input type="checkbox" {...register('flexiblePickupConfirmed')} />
                <span>
                  אגיע בשעות האירוע {currentEvent?.startTime} - {currentEvent?.endTime}
                </span>
              </label>
              {errors.flexiblePickupConfirmed && (
                <p className="order-form__error">{errors.flexiblePickupConfirmed.message}</p>
              )}
            </>
          ) : (
            <>
              <AppSelect
                label="שעת איסוף"
                placeholder={pickupSlots.length === 0 ? 'אין שעות זמינות' : 'בחרו שעה'}
                options={pickupSlots.map((slot) => ({
                  value: slot.id,
                  label: `${slot.time}${slot.maxOrders ? ` (נותרו ${slot.maxOrders - slot.currentOrders} מקומות)` : ''}`,
                }))}
                {...register('pickupSlotId')}
                error={errors.pickupSlotId?.message}
                disabled={pickupSlots.length === 0}
              />
              {pickupSlots.length === 0 && (
                <p className="order-form__no-slots">
                  אין שעות איסוף זמינות כרגע. אנא נסו שוב מאוחר יותר.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="order-form__section">
        <h3 className="order-form__section-title">הערות</h3>

        <div className="order-form__field">
          <AppTextarea
            label="הערות להזמנה (רגישויות, אלרגיות וכו׳)"
            placeholder="הוסיפו הערות אם יש..."
            rows={3}
            {...register('notes')}
          />
        </div>
      </div>

      <AppButton
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
      >
        המשך לתשלום
      </AppButton>
    </form>
  )
}
