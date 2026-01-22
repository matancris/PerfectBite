-- ============================================
-- FIX RLS POLICIES
-- ============================================
-- IMPORTANT: Customers are NOT authenticated - they order anonymously!
-- This migration ADDS missing policies without breaking existing ones.

-- ============================================
-- BUSINESSES TABLE - Add public read access
-- ============================================
-- Customers need to see business name, logo, etc.
-- Original schema only had admin policy!

CREATE POLICY "Business info is viewable by everyone" ON businesses
    FOR SELECT 
    USING (true);

-- ============================================
-- ORDERS TABLE - Fix UPDATE/DELETE to be admin-only
-- ============================================
-- Original policies allow anyone to create/view orders (correct)
-- But the "Admins can manage orders" FOR ALL policy allows anonymous updates
-- We need to be more specific about UPDATE/DELETE

-- Drop the overly broad admin policy
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;

-- Re-add specific admin policies for UPDATE and DELETE only
-- (INSERT and SELECT are already handled by anonymous policies)
CREATE POLICY "Admins can update orders" ON orders
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete orders" ON orders
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- ============================================
-- ORDER ITEMS TABLE - Fix UPDATE/DELETE to be admin-only
-- ============================================

DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;

CREATE POLICY "Admins can update order items" ON order_items
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete order items" ON order_items
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- ============================================
-- PAYMENTS TABLE - Restrict SELECT to admins
-- ============================================
-- Anyone can INSERT (customers pay), but only admins should view payment details

DROP POLICY IF EXISTS "Admins can manage payments" ON payments;

-- Admins can view all payments
CREATE POLICY "Admins can view payments" ON payments
    FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update payments" ON payments
    FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete payments" ON payments
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- ============================================
-- PICKUP SLOTS - Allow anonymous to update counts
-- ============================================
-- The original "Admins can manage pickup slots" FOR ALL policy
-- doesn't allow anonymous users to increment current_orders.
-- We need to add a specific policy for this.

-- Keep admin management but add anonymous update for order counts
CREATE POLICY "Anyone can increment pickup slot orders" ON pickup_slots
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- ============================================
-- EVENT PICKUP SLOTS - Allow anonymous to update counts
-- ============================================
-- Same issue - need anonymous UPDATE for order placement

CREATE POLICY "Anyone can increment event pickup slot orders" ON event_pickup_slots
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- ============================================
-- EVENT ITEMS - Allow anonymous to update quantity
-- ============================================
-- Need to allow incrementing current_quantity when orders are placed

CREATE POLICY "Anyone can update event item quantities" ON event_items
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
