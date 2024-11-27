-- Create social_accounts table
create table if not exists public.social_accounts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    platform text not null,
    username text,
    token text,
    refresh_token text,
    token_expires_at timestamp with time zone,
    settings jsonb default '{
        "autoPost": false,
        "crossPost": true,
        "defaultPrivacy": "public",
        "notifications": true
    }'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, platform)
);

-- Enable RLS
alter table public.social_accounts enable row level security;

-- Create policies
create policy "Users can view their own social accounts"
    on public.social_accounts for select
    using (auth.uid() = user_id);

create policy "Users can insert their own social accounts"
    on public.social_accounts for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own social accounts"
    on public.social_accounts for update
    using (auth.uid() = user_id);

create policy "Users can delete their own social accounts"
    on public.social_accounts for delete
    using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger handle_social_accounts_updated_at
    before update on public.social_accounts
    for each row
    execute function public.handle_updated_at();

-- Create indexes
create index if not exists social_accounts_user_id_idx on public.social_accounts(user_id);
create index if not exists social_accounts_platform_idx on public.social_accounts(platform);
