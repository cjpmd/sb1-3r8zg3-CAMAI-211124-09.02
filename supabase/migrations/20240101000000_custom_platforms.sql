-- Create custom_platforms table
create table if not exists public.custom_platforms (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    name text not null,
    icon_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    settings jsonb default '{}'::jsonb,
    constraint custom_platforms_name_user_id_key unique (name, user_id)
);

-- Enable RLS
alter table public.custom_platforms enable row level security;

-- Create RLS policies
create policy "Users can view their own custom platforms"
    on public.custom_platforms for select
    using (auth.uid() = user_id);

create policy "Users can insert their own custom platforms"
    on public.custom_platforms for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own custom platforms"
    on public.custom_platforms for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own custom platforms"
    on public.custom_platforms for delete
    using (auth.uid() = user_id);
