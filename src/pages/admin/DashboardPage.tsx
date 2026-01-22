import { useEffect } from 'react'
import { useDashboardStore } from '@/stores/dashboard.store'
import { StatCard } from '@/components/admin/StatCard'
import { RecentOrders } from '@/components/admin/RecentOrders'
import { RevenueChart } from '@/components/admin/RevenueChart'

export function AdminDashboardPage() {
  const { stats, recentOrders, isLoading, fetchDashboardData } = useDashboardStore()

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (isLoading) {
    return (
      <div className="dashboard-page dashboard-page--loading">
        <div className="spinner" />
        <p>טוען נתונים...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-page__title">דשבורד</h1>

      <div className="dashboard-page__stats">
        <StatCard
          title="הזמנות היום"
          value={stats.todayOrders}
          icon="receipt_long"
          trend={stats.ordersTrend}
        />
        <StatCard
          title="הכנסות היום"
          value={`₪${stats.todayRevenue.toFixed(0)}`}
          icon="payments"
          trend={stats.revenueTrend}
        />
        <StatCard
          title="הזמנות ממתינות"
          value={stats.pendingOrders}
          icon="hourglass_empty"
        />
        <StatCard
          title="הזמנות החודש"
          value={stats.monthlyOrders}
          icon="bar_chart"
        />
      </div>

      <div className="dashboard-page__content">
        <div className="dashboard-page__chart">
          <h2 className="dashboard-page__section-title">הכנסות - 7 ימים אחרונים</h2>
          <RevenueChart data={stats.revenueData} />
        </div>
        <div className="dashboard-page__recent">
          <h2 className="dashboard-page__section-title">הזמנות אחרונות</h2>
          <RecentOrders orders={recentOrders} />
        </div>
      </div>
    </div>
  )
}
