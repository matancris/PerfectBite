import { Routes, Route } from 'react-router-dom'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { HomePage } from '@/pages/customer/HomePage'
import { MenuPage } from '@/pages/customer/MenuPage'
import { CheckoutPage } from '@/pages/customer/CheckoutPage'
import { OrderConfirmationPage } from '@/pages/customer/OrderConfirmationPage'
import { AdminDashboardPage } from '@/pages/admin/DashboardPage'
import { AdminOrdersPage } from '@/pages/admin/OrdersPage'
import { AdminMenuPage } from '@/pages/admin/MenuPage'
import { AdminEventsPage } from '@/pages/admin/EventsPage'
import { AdminPickupSlotsPage } from '@/pages/admin/PickupSlotsPage'
import { AdminSettingsPage } from '@/pages/admin/SettingsPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export function AppRouter() {
  return (
    <Routes>
      {/* Customer Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu/:eventId?" element={<MenuPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="menu" element={<AdminMenuPage />} />
        <Route path="events" element={<AdminEventsPage />} />
        <Route path="pickup-slots" element={<AdminPickupSlotsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* 404 Not Found - must be last */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
