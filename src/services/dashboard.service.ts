import { supabase } from '@/lib/supabase'
import type { Order, ApiResponse } from '@/types'
import { mapOrder } from '@/utils/mappers'

interface DashboardStats {
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  monthlyOrders: number
  ordersTrend: number
  revenueTrend: number
  revenueData: { date: string; amount: number }[]
}

export const dashboardService = {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split('T')[0]
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      // Today's orders
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('id, total_amount')
        .gte('created_at', todayStr)

      // Pending orders
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'pending')

      // Monthly orders
      const { data: monthlyOrders } = await supabase
        .from('orders')
        .select('id')
        .gte('created_at', monthStart)

      // Revenue data for last 7 days
      const { data: weekOrders } = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .gte('created_at', weekAgo)
        .order('created_at')

      const revenueByDate = new Map<string, number>()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
        revenueByDate.set(date.toISOString().split('T')[0], 0)
      }

      weekOrders?.forEach((order) => {
        const date = order.created_at.split('T')[0]
        if (revenueByDate.has(date)) {
          revenueByDate.set(date, revenueByDate.get(date)! + order.total_amount)
        }
      })

      const revenueData = Array.from(revenueByDate.entries()).map(
        ([date, amount]) => ({ date, amount })
      )

      const todayRevenue =
        todayOrders?.reduce((sum, o) => sum + o.total_amount, 0) ?? 0

      return {
        data: {
          todayOrders: todayOrders?.length ?? 0,
          todayRevenue,
          pendingOrders: pendingOrders?.length ?? 0,
          monthlyOrders: monthlyOrders?.length ?? 0,
          ordersTrend: 0, // TODO: Calculate trend
          revenueTrend: 0, // TODO: Calculate trend
          revenueData,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },

  async getRecentOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          pickup_slots (*)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: (data ?? []).map(mapOrder), error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  },
}
