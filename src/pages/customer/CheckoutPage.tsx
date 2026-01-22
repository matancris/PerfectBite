import { useEffect, useState } from 'react'
import { OrderForm } from '@/components/customer/OrderForm'
import { OrderSummary } from '@/components/customer/OrderSummary'
import { useCartStore } from '@/stores/cart.store'
import { Link } from 'react-router-dom'
import { AppButton, Icon } from '@/components/ui'
import { useDocumentTitle } from '@/hooks'
import { eventService } from '@/services/event.service'

interface StockLimit {
  menuItemId: string
  maxQuantity: number
}

export function CheckoutPage() {
  useDocumentTitle('סיום הזמנה')
  const items = useCartStore((state) => state.items)
  const totalPrice = useCartStore((state) => state.getTotalPrice())
  const eventId = useCartStore((state) => state.eventId)
  const [stockLimits, setStockLimits] = useState<StockLimit[]>([])

  // Fetch stock limits for event items
  useEffect(() => {
    async function fetchStockLimits() {
      if (!eventId) {
        setStockLimits([])
        return
      }

      const result = await eventService.getEventMenuItems(eventId)
      if (result.data) {
        setStockLimits(
          result.data.map((item) => ({
            menuItemId: item.id,
            maxQuantity: item.remainingQuantity,
          }))
        )
      }
    }
    fetchStockLimits()
  }, [eventId])

  if (items.length === 0) {
    return (
      <div className="checkout-page checkout-page--empty">
        <div className="empty-cart">
          <Icon name="shopping_cart" size="2xl" className="empty-cart__icon" />
          <h2 className="empty-cart__title">העגלה ריקה</h2>
          <p className="empty-cart__text">
            הוסיפו פריטים מהתפריט כדי להמשיך להזמנה
          </p>
          <Link to="/menu">
            <AppButton variant="primary">לתפריט</AppButton>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <h1 className="checkout-page__title">סיום הזמנה</h1>
      
      <div className="checkout-page__content">
        <div className="checkout-page__form">
          <OrderForm />
        </div>
        <div className="checkout-page__summary">
          <OrderSummary items={items} total={totalPrice} stockLimits={stockLimits} />
        </div>
      </div>
    </div>
  )
}
