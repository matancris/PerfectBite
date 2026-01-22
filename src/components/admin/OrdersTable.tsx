import type { Order } from '@/types'
import { formatDateTime, formatCurrency, getStatusLabel, getStatusColor } from '@/utils/formatters'
import { AppBadge, AppButton } from '@/components/ui'

interface OrdersTableProps {
  orders: Order[]
  onOrderSelect: (order: Order) => void
}

export function OrdersTable({ orders, onOrderSelect }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="orders-table orders-table--empty">
        <p>אין הזמנות להצגה</p>
      </div>
    )
  }

  return (
    <div className="orders-table">
      <table>
        <thead>
          <tr>
            <th>מספר</th>
            <th>שם לקוח</th>
            <th>טלפון</th>
            <th>סכום</th>
            <th>סטטוס</th>
            <th>תאריך</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="orders-table__id">{order.id.slice(0, 8)}</td>
              <td>{order.customerName}</td>
              <td>{order.customerPhone}</td>
              <td>{formatCurrency(order.totalAmount)}</td>
              <td>
                <AppBadge variant={getStatusColor(order.status) as 'success' | 'warning' | 'danger' | 'info' | 'default'}>
                  {getStatusLabel(order.status)}
                </AppBadge>
              </td>
              <td>{formatDateTime(order.createdAt)}</td>
              <td>
                <AppButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onOrderSelect(order)}
                >
                  צפה
                </AppButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
