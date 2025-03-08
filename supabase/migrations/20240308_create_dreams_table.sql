create type dream_time_of_day as enum ('Morning', 'Afternoon', 'Night', 'Unknown');
create type dream_emotion as enum ('Happy', 'Scared', 'Confused', 'Peaceful', 'Anxious', 'Excited');

create table dreams (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  date timestamp with time zone not null,
  location text,
  people text,
  time_of_day dream_time_of_day not null default 'Unknown',
  activity text,
  unusual_events jsonb not null default '{"occurred": false, "description": ""}'::jsonb,
  symbols text,
  emotion dream_emotion not null default 'Happy',
  ending text,
  final_moments text,
  summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index on user_id for faster queries
create index dreams_user_id_idx on dreams(user_id);

-- Enable Row Level Security
alter table dreams enable row level security;

-- Create policy to allow users to insert their own dreams
create policy "Users can insert their own dreams"
  on dreams for insert
  with check (auth.uid() = user_id);

-- Create policy to allow users to view their own dreams
create policy "Users can view their own dreams"
  on dreams for select
  using (auth.uid() = user_id);

-- Create policy to allow users to update their own dreams
create policy "Users can update their own dreams"
  on dreams for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create policy to allow users to delete their own dreams
create policy "Users can delete their own dreams"
  on dreams for delete
  using (auth.uid() = user_id);

-- Create function to automatically update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_dreams_updated_at
  before update on dreams
  for each row
  execute function update_updated_at_column(); 