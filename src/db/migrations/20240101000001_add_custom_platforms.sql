-- Create custom platforms table
create table custom_platforms (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  platform_name text not null,
  platform_url text not null,
  username text,
  -- Encrypted credentials stored securely
  credentials jsonb,
  icon_url text,
  is_enabled boolean default true,
  is_private boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Add unique constraint per user and platform
  unique(user_id, platform_name)
);

-- Add RLS policies
alter table custom_platforms enable row level security;

create policy "Users can only see their own custom platforms"
  on custom_platforms for select
  using (auth.uid() = user_id);

create policy "Users can only insert their own custom platforms"
  on custom_platforms for insert
  with check (auth.uid() = user_id);

create policy "Users can only update their own custom platforms"
  on custom_platforms for update
  using (auth.uid() = user_id);

create policy "Users can only delete their own custom platforms"
  on custom_platforms for delete
  using (auth.uid() = user_id);
