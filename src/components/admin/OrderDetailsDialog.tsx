import { useState } from 'react'
import type { Order, OrderStatus } from '@/types'
import { formatDateTime, formatCurrency, getStatusLabel } from '@/utils/formatters'
import { AppDialog, AppButton, AppSelect } from '@/components/ui'
import { useOrdersStore } from '@/stores/orders.store'
import { useToast } from '@/hooks/useToast'

interface OrderDetailsDialogProps {
  order: Order
  onClose: () => void
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'ממתין' },
  { value: 'confirmed', label: 'אושר' },
  { value: 'preparing', label: 'בהכנה' },
  { value: 'ready', label: 'מוכן' },
  { value: 'completed', label: 'הושלם' },
  { value: 'cancelled', label: 'בוטל' },
]

export function OrderDetailsDialog({ order, onClose }: OrderDetailsDialogProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [isUpdating, setIsUpdating] = useState(false)
  const updateOrderStatus = useOrdersStore((state) => state.updateOrderStatus)
  const { showSuccess, showError } = useToast()

  const handleStatusChange = async () => {
    if (status === order.status) return

    setIsUpdating(true)
    try {
      await updateOrderStatus(order.id, status)
      showSuccess('סטטוס ההזמנה עודכן בהצלחה')
      onClose()
    } catch {
      showError('שגיאה בעדכון הסטטוס')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <AppDialog
      isOpen={true}
      onClose={onClose}
      title={`הזמנה ${order.id.slice(0, 8)}`}
      size="lg"
      footer={
        <div className="order-details-dialog__footer">
          <AppButton variant="secondary" onClick={onClose}>
            סגור
          </AppButton>
          <AppButton
            variant="primary"
            onClick={handleStatusChange}
            isLoading={isUpdating}
            disabled={status === order.status}
          >
            עדכן סטטוס
          </AppButton>
        </div>
      }
    >
      <div className="order-details-dialog">
        <div className="order-details-dialog__section">
          <h4>פרטי לקוח</h4>
          <div className="order-details-dialog__row">
            <span>שם:</span>
            <span>{order.customerName}</span>
          </div>
          <div className="order-details-dialog__row">
            <span>טלפון:</span>
            <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a>
          </div>
          {order.customerEmail && (
            <div className="order-details-dialog__row">
              <span>אימייל:</span>
              <span>{order.customerEmail}</span>
            </div>
          )}
        </div>

        <div className="order-details-dialog__section">
          <h4>פרטי הזמנה</h4>
          <div className="order-details-dialog__row">
            <span>תאריך:</span>
            <span>{formatDateTime(order.createdAt)}</span>
          </div>
          <div className="order-details-dialog__row">
            <span>סוג:</span>
            <span>{order.fulfillmentType === 'pickup' ? 'איסוף' : 'ישיבה במקום'}</span>
          </div>
          {order.pickupSlot && (
            <div className="order-details-dialog__row">
              <span>שעת איסוף:</span>
              <span>{order.pickupSlot.time}</span>
            </div>
          )}
          {order.notes && (
            <div className="order-details-dialog__row">
              <span>הערות:</span>
              <span>{order.notes}</span>
            </div>
          )}
        </div>

        <div className="order-details-dialog__section">
          <h4>פריטים</h4>
          <ul className="order-details-dialog__items">
            {order.items.map((item) => (
              <li key={item.id} className="order-details-dialog__item">
                <span className="order-details-dialog__item-name">
                  {item.name} x{item.quantity}
                </span>
                <span className="order-details-dialog__item-price">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="order-details-dialog__total">
            <span>סה״כ:</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        <div className="order-details-dialog__section">
          <h4>סטטוס</h4>
          <div className="order-details-dialog__status">
            <span>סטטוס נוכחי: {getStatusLabel(order.status)}</span>
            <AppSelect
              label="שנה סטטוס"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              options={statusOptions}
            />
          </div>
        </div>
      </div>
    </AppDialog>
  )
}
