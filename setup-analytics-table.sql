-- Create analytics_events table for Mirrify analytics dashboard
-- Run this SQL in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  product_id BIGINT,
  product_title VARCHAR(255),
  product_handle VARCHAR(255),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shop VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product_id ON analytics_events(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_shop ON analytics_events(shop);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anonymous users to insert events
CREATE POLICY "Allow anonymous insert" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Create a policy that allows anonymous users to read events
CREATE POLICY "Allow anonymous read" ON analytics_events
  FOR SELECT USING (true);

-- Optional: Create a policy for admin users to delete events (if needed)
-- CREATE POLICY "Allow admin delete" ON analytics_events
--   FOR DELETE USING (auth.role() = 'authenticated');
