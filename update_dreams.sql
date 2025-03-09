-- First, backup existing data if needed (uncomment if you want to backup)
-- CREATE TABLE dreams_backup AS SELECT * FROM dreams;

-- Update any existing records to use new ending values
UPDATE dreams
SET ending = CASE 
    WHEN ending = 'wokeUpSuddenly' THEN 'abruptly'
    WHEN ending = 'fadedAway' THEN 'slowly'
    ELSE ending
END;

-- Drop existing tables and types
DROP TABLE IF EXISTS dreams;
DROP TYPE IF EXISTS dream_time_of_day;
DROP TYPE IF EXISTS dream_emotion;
DROP TYPE IF EXISTS dream_category;
DROP TYPE IF EXISTS dream_state;
DROP TYPE IF EXISTS dream_type;

-- Create enum types
CREATE TYPE dream_time_of_day AS ENUM (
    'Morning',
    'Afternoon',
    'Night',
    'Unknown'
);

CREATE TYPE dream_emotion AS ENUM (
    'Happy',
    'Scared',
    'Confused',
    'Peaceful',
    'Anxious',
    'Excited'
);

CREATE TYPE dream_category AS ENUM (
    'Daytime Carryover Dream',
    'Random Dream',
    'Carried Dream',
    'Learning Dream',
    'Receiving Dream',
    'Message Dream',
    'Disturbance Dream',
    'Blank Dream'
);

CREATE TYPE dream_state AS ENUM (
    'Watching a Screen',
    'Character in Dream',
    'Both Watching and Being a Character'
);

CREATE TYPE dream_type AS ENUM (
    'Normal Dream',
    'Aware but Can''t Control',
    'Lucid Dream',
    'Liminal Dream',
    'Vivid Dream'
);

-- Create dreams table
CREATE TABLE dreams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    people TEXT,
    time_of_day dream_time_of_day NOT NULL DEFAULT 'Unknown',
    activity TEXT,
    unusual_events JSONB NOT NULL DEFAULT '{"occurred": false, "description": ""}'::jsonb,
    symbols TEXT,
    emotion dream_emotion NOT NULL DEFAULT 'Happy',
    kategori_mimpi dream_category NOT NULL DEFAULT 'Random Dream',
    keadaan_mimpi dream_state NOT NULL DEFAULT 'Character in Dream',
    jenis_mimpi dream_type NOT NULL DEFAULT 'Normal Dream',
    ending TEXT CHECK (ending IN ('abruptly', 'slowly') OR ending IS NULL),
    final_moments TEXT,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dreams"
    ON dreams FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dreams"
    ON dreams FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dreams"
    ON dreams FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dreams"
    ON dreams FOR DELETE
    USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dreams_updated_at
    BEFORE UPDATE ON dreams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX dreams_user_id_idx ON dreams(user_id);
CREATE INDEX dreams_created_at_idx ON dreams(created_at);

-- Grant permissions
GRANT ALL ON dreams TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 