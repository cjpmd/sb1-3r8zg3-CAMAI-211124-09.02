create table if not exists video_uploads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  upload_month date not null, -- Stored as first day of month for easy querying
  upload_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for faster lookups
create index if not exists video_uploads_user_month_idx on video_uploads(user_id, upload_month);

-- Function to update updated_at on row changes
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_video_uploads_updated_at
  before update on video_uploads
  for each row
  execute function update_updated_at_column();

-- RLS policies
alter table video_uploads enable row level security;

create policy "Users can view their own upload counts"
  on video_uploads for select
  using (auth.uid() = user_id);

create policy "Users can update their own upload counts"
  on video_uploads for update
  using (auth.uid() = user_id);

create policy "Users can insert their own upload counts"
  on video_uploads for insert
  with check (auth.uid() = user_id);
