import { create } from 'zustand'
import type { Order } from '@/types'
import { dashboardService } from '@/services/dashboard.service'

interface DashboardStats {
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  monthlyOrders: number
  ordersTrend: number
  revenueTrend: number
  revenueData: { date: string; amount: number }[]
}

interface DashboardState {
  stats: DashboardStats
  recentOrders: Order[]
  isLoading: boolean
  error: string | null
  fetchDashboardData: () => Promise<void>
}

const initialStats: DashboardStats = {
  todayOrders: 0,
  todayRevenue: 0,
  pendingOrders: 0,
  monthlyOrders: 0,
  ordersTrend: 0,
  revenueTrend: 0,
  revenueData: [],
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: initialStats,
  recentOrders: [],
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null })
    try {
      const [statsResult, ordersResult] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentOrders(),
      ])

      set({
        stats: statsResult.data ?? initialStats,
        recentOrders: ordersResult.data ?? [],
        isLoading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
}))
