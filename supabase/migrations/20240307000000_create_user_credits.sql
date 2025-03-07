-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 2,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create function to decrement user credits
CREATE OR REPLACE FUNCTION decrement_user_credits(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_credits
  SET 
    credits = GREATEST(credits - 1, 0),
    updated_at = NOW()
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for user_credits table
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Policy for users to read only their own credits
CREATE POLICY "Users can read their own credits"
  ON user_credits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for the service role to manage all credits
CREATE POLICY "Service role can manage all credits"
  ON user_credits
  USING (auth.role() = 'service_role'); 