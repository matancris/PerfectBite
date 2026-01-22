import type { Order } from '@/types'
import { formatDateTime, formatCurrency, getStatusLabel, getStatusColor } from '@/utils/formatters'
import { AppBadge } from '@/components/ui'

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  if (orders.length === 0) {
    return (
      <div className="recent-orders recent-orders--empty">
        <p>אין הזמנות אחרונות</p>
      </div>
    )
  }

  return (
    <div className="recent-orders">
      <ul className="recent-orders__list">
        {orders.map((order) => (
          <li key={order.id} className="recent-orders__item">
            <div className="recent-orders__info">
              <span className="recent-orders__name">{order.customerName}</span>
              <span className="recent-orders__time">
                {formatDateTime(order.createdAt)}
              </span>
            </div>
            <div className="recent-orders__details">
              <span className="recent-orders__amount">
                {formatCurrency(order.totalAmount)}
              </span>
              <AppBadge variant={getStatusColor(order.status) as 'success' | 'warning' | 'danger' | 'info' | 'default'}>
                {getStatusLabel(order.status)}
              </AppBadge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
