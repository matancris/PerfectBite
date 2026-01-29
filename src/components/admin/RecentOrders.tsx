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
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
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
