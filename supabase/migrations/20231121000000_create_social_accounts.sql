create table social_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  platform text not null,
  platform_user_id text,
  username text,
  profile_picture text,
  access_token text not null,
  refresh_token text,
  token_expires_at timestamp with time zone,
  connected_at timestamp with time zone default now(),
  
  -- Each user can only connect one account per platform
  unique(user_id, platform)
);

-- Enable RLS
alter table social_accounts enable row level security;

-- Policies
create policy "Users can view their own social accounts"
  on social_accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own social accounts"
  on social_accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own social accounts"
  on social_accounts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own social accounts"
  on social_accounts for delete
  using (auth.uid() = user_id);
