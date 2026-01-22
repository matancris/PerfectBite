-- PerfectBite Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Businesses table (multi-tenant support)
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Categories
CREATE TABLE menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Items
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    max_quantity INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events (weekly sales, pizza days, etc.)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    order_deadline TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Items (items available in specific events)
CREATE TABLE event_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    custom_price DECIMAL(10, 2),
    max_quantity INTEGER,
    UNIQUE(event_id, menu_item_id)
);

-- Pickup Slots
CREATE TABLE pickup_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    time VARCHAR(10) NOT NULL,
    max_orders INTEGER,
    current_orders INTEGER DEFAULT 0
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    customer_id UUID,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    fulfillment_type VARCHAR(20) NOT NULL CHECK (fulfillment_type IN ('pickup', 'dine_in')),
    pickup_slot_id UUID REFERENCES pickup_slots(id) ON DELETE SET NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    notes TEXT
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_menu_items_business ON menu_items(business_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_events_business ON events(business_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_orders_business ON orders(business_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);

-- Row Level Security (RLS)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Public read access for menu items (customers can browse)
CREATE POLICY "Menu items are viewable by everyone" ON menu_items
    FOR SELECT USING (is_active = true);

CREATE POLICY "Menu categories are viewable by everyone" ON menu_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Active events are viewable by everyone" ON events
    FOR SELECT USING (is_active = true);

CREATE POLICY "Event items are viewable by everyone" ON event_items
    FOR SELECT USING (true);

CREATE POLICY "Pickup slots are viewable by everyone" ON pickup_slots
    FOR SELECT USING (true);

-- Customers can create orders (anonymous)
CREATE POLICY "Anyone can create orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can create order items" ON order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can create payments" ON payments
    FOR INSERT WITH CHECK (true);

-- Customers can view their own orders (by order ID)
CREATE POLICY "Orders are viewable by order ID" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Order items are viewable with order" ON order_items
    FOR SELECT USING (true);

-- Admin policies (authenticated users)
CREATE POLICY "Admins can do everything on businesses" ON businesses
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage menu categories" ON menu_categories
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage menu items" ON menu_items
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage events" ON events
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage event items" ON event_items
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage pickup slots" ON pickup_slots
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage orders" ON orders
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage order items" ON order_items
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage payments" ON payments
    FOR ALL USING (auth.role() = 'authenticated');

-- Enable realtime for orders (admin dashboard updates)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;

-- Sample data (optional - run after creating tables)
-- INSERT INTO businesses (id, name, phone, email) VALUES 
--     ('11111111-1111-1111-1111-111111111111', 'יעל מאפים', '054-8319848', 'yael@example.com');

-- INSERT INTO pickup_slots (business_id, time) VALUES
--     ('11111111-1111-1111-1111-111111111111', '17:05'),
--     ('11111111-1111-1111-1111-111111111111', '17:40'),
--     ('11111111-1111-1111-1111-111111111111', '17:45'),
--     ('11111111-1111-1111-1111-111111111111', '17:50'),
--     ('11111111-1111-1111-1111-111111111111', '18:25'),
--     ('11111111-1111-1111-1111-111111111111', '18:55');
