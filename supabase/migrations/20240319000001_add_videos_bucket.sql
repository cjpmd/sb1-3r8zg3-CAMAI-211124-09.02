-- Create a new storage bucket for videos if it doesn't exist
insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do nothing;

-- Allow authenticated users to upload their own videos
create policy "Users can upload their own videos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'videos' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own videos
create policy "Users can view their own videos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'videos' and
  (storage.foldername(name))[1] = auth.uid()::text
);
