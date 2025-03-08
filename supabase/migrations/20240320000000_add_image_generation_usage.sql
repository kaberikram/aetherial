-- Enable RLS
ALTER TABLE IF EXISTS image_generation_usage DISABLE ROW LEVEL SECURITY;

-- Create the table for tracking image generation usage
CREATE TABLE IF NOT EXISTS image_generation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create an index on user_id and date for faster lookups
CREATE INDEX IF NOT EXISTS idx_image_generation_usage_user_date 
ON image_generation_usage(user_id, date);

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