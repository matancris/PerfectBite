-- Add allow_any_pickup_time column to events table
-- When true, customers can pick up anytime during event hours (no specific slots required)

ALTER TABLE events
ADD COLUMN allow_any_pickup_time BOOLEAN DEFAULT false;

-- Update existing events to have this field set to false (require pickup slots)
UPDATE events SET allow_any_pickup_time = false WHERE allow_any_pickup_time IS NULL;
