-- First, drop existing table and related objects
DROP TRIGGER IF EXISTS update_image_generation_usage_updated_at ON image_generation_usage;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS image_generation_usage;

-- Create the table for tracking image generation usage
CREATE TABLE image_generation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create an index on user_id and date for faster lookups
CREATE INDEX idx_image_generation_usage_user_date 
ON image_generation_usage(user_id, date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update the updated_at column
CREATE TRIGGER update_image_generation_usage_updated_at
  BEFORE UPDATE ON image_generation_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE image_generation_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own usage"
  ON image_generation_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON image_generation_usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON image_generation_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Optional: Function to reset daily usage (can be called by a cron job)
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS void AS $$
BEGIN
  -- Archive old records (optional)
  -- INSERT INTO image_generation_usage_history 
  -- SELECT * FROM image_generation_usage 
  -- WHERE date < CURRENT_DATE;

  -- Delete old records
  DELETE FROM image_generation_usage 
  WHERE date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql; 