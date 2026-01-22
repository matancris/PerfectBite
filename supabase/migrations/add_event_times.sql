-- Add start_time and end_time columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS start_time VARCHAR(10) NOT NULL DEFAULT '17:00',
ADD COLUMN IF NOT EXISTS end_time VARCHAR(10) NOT NULL DEFAULT '19:00';

-- Add current_quantity column to event_items table (if not already added)
ALTER TABLE event_items 
ADD COLUMN IF NOT EXISTS current_quantity INTEGER DEFAULT 0;

-- Add available_anytime column to menu_items table
-- Items with available_anytime = true can be ordered from regular menu without an event
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS available_anytime BOOLEAN DEFAULT false;

-- Create event_pickup_slots table for event-specific pickup hours
CREATE TABLE IF NOT EXISTS event_pickup_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    time VARCHAR(10) NOT NULL,
    max_orders INTEGER NOT NULL DEFAULT 10,
    current_orders INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on event_pickup_slots
ALTER TABLE event_pickup_slots ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view event pickup slots
CREATE POLICY "Event pickup slots are viewable by everyone" ON event_pickup_slots
    FOR SELECT USING (true);

-- Policy: Authenticated users (admins) can manage pickup slots
CREATE POLICY "Authenticated users can manage event pickup slots" ON event_pickup_slots
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_event_pickup_slots_event_id ON event_pickup_slots(event_id);
