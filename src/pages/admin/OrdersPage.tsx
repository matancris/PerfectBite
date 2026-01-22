import { useEffect, useState } from 'react'
import { useOrdersStore } from '@/stores/orders.store'
import { OrdersTable } from '@/components/admin/OrdersTable'
import { OrderDetailsDialog } from '@/components/admin/OrderDetailsDialog'
import { AppInput } from '@/components/ui'
import type { Order, OrderStatus } from '@/types'

const statusFilters: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'הכל' },
  { value: 'pending', label: 'ממתין' },
  { value: 'confirmed', label: 'אושר' },
  { value: 'preparing', label: 'בהכנה' },
  { value: 'ready', label: 'מוכן' },
  { value: 'completed', label: 'הושלם' },
  { value: 'cancelled', label: 'בוטל' },
]

export function AdminOrdersPage() {
  const { orders, isLoading, fetchOrders, subscribeToOrders } = useOrdersStore()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchOrders()
    const unsubscribe = subscribeToOrders()
    return () => unsubscribe()
  }, [fetchOrders, subscribeToOrders])

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesSearch =
      searchQuery === '' ||
      order.customerName.includes(searchQuery) ||
      order.customerPhone.includes(searchQuery) ||
      order.id.includes(searchQuery)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="orders-page">
      <h1 className="orders-page__title">ניהול הזמנות</h1>

      <div className="orders-page__filters">
        <AppInput
          placeholder="חיפוש לפי שם, טלפון או מספר הזמנה..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="orders-page__search"
        />
        <div className="orders-page__status-filters">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              className={`status-filter ${statusFilter === filter.value ? 'status-filter--active' : ''}`}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="orders-page__loading">
          <div className="spinner" />
          <p>טוען הזמנות...</p>
        </div>
      ) : (
        <OrdersTable
          orders={filteredOrders}
          onOrderSelect={setSelectedOrder}
        />
      )}

      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}
