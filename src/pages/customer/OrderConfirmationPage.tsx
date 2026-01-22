import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AppButton, Icon } from '@/components/ui'
import type { Order } from '@/types'
import { orderService } from '@/services/order.service'

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return
      
      setIsLoading(true)
      const result = await orderService.getOrder(orderId)
      if (result.data) {
        setOrder(result.data)
      }
      setIsLoading(false)
    }

    fetchOrder()
  }, [orderId])

  if (isLoading) {
    return (
      <div className="confirmation-page confirmation-page--loading">
        <div className="spinner" />
        <p>טוען פרטי הזמנה...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="confirmation-page confirmation-page--error">
        <Icon name="error" size="2xl" className="confirmation-page__icon" />
        <h2>הזמנה לא נמצאה</h2>
        <Link to="/">
          <AppButton variant="primary">חזרה לדף הבית</AppButton>
        </Link>
      </div>
    )
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <Icon name="check_circle" size="2xl" filled className="confirmation-card__icon" />
        <h1 className="confirmation-card__title">ההזמנה התקבלה!</h1>
        <p className="confirmation-card__order-number">
          מספר הזמנה: <strong>{order.id.slice(0, 8)}</strong>
        </p>

        <div className="confirmation-card__details">
          <div className="confirmation-card__row">
            <span>שם:</span>
            <span>{order.customerName}</span>
          </div>
          <div className="confirmation-card__row">
            <span>טלפון:</span>
            <span>{order.customerPhone}</span>
          </div>
          <div className="confirmation-card__row">
            <span>סוג:</span>
            <span>{order.fulfillmentType === 'pickup' ? 'איסוף' : 'ישיבה במקום'}</span>
          </div>
          {order.pickupSlot && (
            <div className="confirmation-card__row">
              <span>שעת איסוף:</span>
              <span>{order.pickupSlot.time}</span>
            </div>
          )}
          <div className="confirmation-card__row confirmation-card__row--total">
            <span>סה״כ:</span>
            <span>₪{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="confirmation-card__actions">
          <Link to="/">
            <AppButton variant="secondary">חזרה לדף הבית</AppButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
