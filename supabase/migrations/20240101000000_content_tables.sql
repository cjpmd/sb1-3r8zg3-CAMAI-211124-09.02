-- Create enum for content status
CREATE TYPE content_status AS ENUM ('draft', 'scheduled', 'published', 'failed');

-- Create enum for platform types
CREATE TYPE platform_type AS ENUM ('instagram', 'tiktok', 'youtube', 'twitter');

-- Create contents table
CREATE TABLE contents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    platform platform_type NOT NULL,
    media_urls TEXT[] NOT NULL DEFAULT '{}',
    status content_status NOT NULL DEFAULT 'draft',
    scheduled_for TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create RLS policies
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own content"
    ON contents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content"
    ON contents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content"
    ON contents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content"
    ON contents FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contents_updated_at
    BEFORE UPDATE ON contents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX contents_user_id_idx ON contents(user_id);
CREATE INDEX contents_status_idx ON contents(status);
CREATE INDEX contents_platform_idx ON contents(platform);
CREATE INDEX contents_scheduled_for_idx ON contents(scheduled_for);

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Set up storage policies
CREATE POLICY "Authenticated users can upload media"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'media' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = 'content'
    );

CREATE POLICY "Authenticated users can update their media"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'media'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = 'content'
    );

CREATE POLICY "Anyone can view media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'media');

CREATE POLICY "Users can delete their media"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'media'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = 'content'
    );
