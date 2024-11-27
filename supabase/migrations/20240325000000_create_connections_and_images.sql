-- Create connections table
create table if not exists public.connections (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    platform varchar(255) not null,
    platform_user_id varchar(255),
    platform_username varchar(255),
    access_token text,
    refresh_token text,
    token_expires_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    settings jsonb default '{}'::jsonb,
    status varchar(50) default 'active',
    unique(user_id, platform)
);

-- Create images table
create table if not exists public.images (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    url text not null,
    thumbnail_url text,
    alt_text text,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.connections enable row level security;
alter table public.images enable row level security;

-- Connections policies
create policy "Users can view their own connections"
    on public.connections for select
    using (auth.uid() = user_id);

create policy "Users can insert their own connections"
    on public.connections for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own connections"
    on public.connections for update
    using (auth.uid() = user_id);

create policy "Users can delete their own connections"
    on public.connections for delete
    using (auth.uid() = user_id);

-- Images policies
create policy "Users can view their own images"
    on public.images for select
    using (auth.uid() = user_id);

create policy "Users can insert their own images"
    on public.images for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own images"
    on public.images for update
    using (auth.uid() = user_id);

create policy "Users can delete their own images"
    on public.images for delete
    using (auth.uid() = user_id);
