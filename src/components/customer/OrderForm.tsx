import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { AppButton, AppInput, AppSelect, AppTextarea } from '@/components/ui'
import { useCartStore } from '@/stores/cart.store'
import { useToast } from '@/hooks/useToast'
import { orderService } from '@/services/order.service'
import { PaymentForm } from './PaymentForm'
import type { OrderFormData, Order } from '@/types'

const orderSchema = z.object({
  customerName: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  customerPhone: z.string().min(9, 'מספר טלפון לא תקין'),
  customerEmail: z.email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  fulfillmentType: z.enum(['pickup', 'dine_in']),
  pickupSlotId: z.string().min(1, 'יש לבחור שעת איסוף'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof orderSchema>

type CheckoutStep = 'details' | 'payment'

export function OrderForm() {
  const navigate = useNavigate()
  const { showError, showSuccess } = useToast()
  const items = useCartStore((state) => state.items)
  const totalPrice = useCartStore((state) => state.getTotalPrice())
  const eventId = useCartStore((state) => state.eventId)
  const clearCart = useCartStore((state) => state.clearCart)
  
  const [pickupSlots, setPickupSlots] = useState<{ id: string; time: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<CheckoutStep>('details')
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      fulfillmentType: 'pickup',
    },
  })

  useEffect(() => {
    async function fetchPickupSlots() {
      const result = await orderService.getPickupSlots(eventId ?? undefined)
      if (result.data) {
        setPickupSlots(result.data)
      }
    }
    fetchPickupSlots()
  }, [eventId])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    
    const formData: OrderFormData = {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || undefined,
      fulfillmentType: data.fulfillmentType,
      pickupSlotId: data.pickupSlotId,
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
          <AppSelect
            label="שעת איסוף"
            placeholder="בחרו שעה"
            options={pickupSlots.map((slot) => ({
              value: slot.id,
              label: slot.time,
            }))}
            {...register('pickupSlotId')}
            error={errors.pickupSlotId?.message}
          />
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
