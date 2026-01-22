import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { AppButton, AppInput, Icon } from '@/components/ui'
import { getPaymentProvider } from '@/lib/payment'
import type { Order } from '@/types'

const paymentSchema = z.object({
  cardNumber: z
    .string()
    .min(16, 'מספר כרטיס לא תקין')
    .max(19, 'מספר כרטיס לא תקין'),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'פורמט לא תקין (MM/YY)'),
  cvv: z.string().min(3, 'CVV לא תקין').max(4, 'CVV לא תקין'),
  cardholderName: z.string().min(2, 'שם בעל הכרטיס נדרש'),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface PaymentFormProps {
  order: Order
  onSuccess: (transactionId: string) => void
  onError: (error: string) => void
  onCancel: () => void
}

export function PaymentForm({ order, onSuccess, onError, onCancel }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  })

  // Format card number with spaces
  const formatCardNumber = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const groups = cleaned.match(/.{1,4}/g)
    return groups ? groups.join(' ').slice(0, 19) : ''
  }, [])

  // Format expiry date
  const formatExpiryDate = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
    }
    return cleaned
  }, [])

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setValue('cardNumber', formatted)
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    setValue('expiryDate', formatted)
  }

  const onSubmit = async (_data: PaymentFormData) => {
    setIsProcessing(true)

    try {
      const provider = getPaymentProvider()
      
      // Step 1: Create payment intent
      setProcessingStep('מאמת פרטי כרטיס...')
      await provider.createPaymentIntent(order)
      await new Promise(r => setTimeout(r, 800))

      // Step 2: Process payment
      setProcessingStep('מעבד תשלום...')
      const result = await provider.processPayment({
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'ILS',
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
      })

      if (!result.success) {
        setIsProcessing(false)
        onError(result.error || 'התשלום נכשל')
        return
      }

      // Step 3: Verify payment
      setProcessingStep('מאשר תשלום...')
      await provider.verifyPayment(result.transactionId!)
      await new Promise(r => setTimeout(r, 500))

      setIsProcessing(false)
      onSuccess(result.transactionId!)
    } catch (err) {
      setIsProcessing(false)
      onError('שגיאה בעיבוד התשלום')
    }
  }

  const cardNumber = watch('cardNumber') || ''
  const cardType = getCardType(cardNumber.replace(/\s/g, ''))

  return (
    <div className="payment-form">
      <div className="payment-form__header">
        <Icon name="lock" size="md" filled />
        <h3>תשלום מאובטח</h3>
        <span className="payment-form__demo-badge">מצב הדגמה</span>
      </div>

      <div className="payment-form__card-preview">
        <div className="credit-card">
          <div className="credit-card__top">
            <Icon name="contactless" size="lg" />
            <span className="credit-card__type">{cardType.icon}</span>
          </div>
          <div className="credit-card__number">
            {cardNumber || '•••• •••• •••• ••••'}
          </div>
          <div className="credit-card__bottom">
            <div className="credit-card__holder">
              <span className="credit-card__label">שם בעל הכרטיס</span>
              <span>{watch('cardholderName') || 'YOUR NAME'}</span>
            </div>
            <div className="credit-card__expiry">
              <span className="credit-card__label">תוקף</span>
              <span>{watch('expiryDate') || 'MM/YY'}</span>
            </div>
          </div>
        </div>
      </div>

      {isProcessing ? (
        <div className="payment-form__processing">
          <div className="spinner" />
          <p>{processingStep}</p>
          <div className="payment-form__progress">
            <div className="payment-form__progress-bar" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="payment-form__field">
            <label>מספר כרטיס</label>
            <div className="payment-form__card-input">
              <AppInput
                placeholder="1234 5678 9012 3456"
                {...register('cardNumber')}
                onChange={handleCardNumberChange}
                error={errors.cardNumber?.message}
                maxLength={19}
              />
              <span className="payment-form__card-icon">{cardType.icon}</span>
            </div>
          </div>

          <div className="payment-form__row">
            <div className="payment-form__field">
              <label>תוקף</label>
              <AppInput
                placeholder="MM/YY"
                {...register('expiryDate')}
                onChange={handleExpiryChange}
                error={errors.expiryDate?.message}
                maxLength={5}
              />
            </div>

            <div className="payment-form__field">
              <label>CVV</label>
              <AppInput
                type="password"
                placeholder="•••"
                {...register('cvv')}
                error={errors.cvv?.message}
                maxLength={4}
              />
            </div>
          </div>

          <div className="payment-form__field">
            <label>שם בעל הכרטיס</label>
            <AppInput
              placeholder="ישראל ישראלי"
              {...register('cardholderName')}
              error={errors.cardholderName?.message}
            />
          </div>

          <div className="payment-form__amount">
            <span>סכום לתשלום:</span>
            <strong>₪{order.totalAmount.toFixed(2)}</strong>
          </div>

          <div className="payment-form__actions">
            <AppButton
              type="button"
              variant="ghost"
              onClick={onCancel}
            >
              חזרה
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              size="lg"
            >
              <Icon name="lock" size="sm" />
              שלם ₪{order.totalAmount.toFixed(2)}
            </AppButton>
          </div>

          <div className="payment-form__security">
            <Icon name="verified_user" size="sm" />
            <span>התשלום מאובטח ומוצפן בתקן SSL</span>
          </div>

          <div className="payment-form__demo-notice">
            <Icon name="info" size="sm" />
            <span>
              מצב הדגמה - לא יתבצע חיוב אמיתי. 
              השתמש בכרטיס 4242 4242 4242 4242 לבדיקה.
            </span>
          </div>
        </form>
      )}
    </div>
  )
}

function getCardType(number: string): { name: string; icon: string } {
  if (number.startsWith('4')) {
    return { name: 'Visa', icon: '💳 Visa' }
  }
  if (number.startsWith('5') || number.startsWith('2')) {
    return { name: 'Mastercard', icon: '💳 MC' }
  }
  if (number.startsWith('3')) {
    return { name: 'Amex', icon: '💳 Amex' }
  }
  return { name: 'Card', icon: '💳' }
}
