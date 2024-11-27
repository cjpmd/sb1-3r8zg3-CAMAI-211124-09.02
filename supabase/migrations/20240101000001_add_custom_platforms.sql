-- Create custom_platforms table
CREATE TABLE IF NOT EXISTS custom_platforms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    icon_url TEXT NOT NULL,
    oauth_auth_url TEXT NOT NULL,
    oauth_token_url TEXT NOT NULL,
    oauth_client_id TEXT NOT NULL,
    oauth_scope TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    settings JSONB DEFAULT '{
        "autoPost": false,
        "crossPost": false,
        "notifications": false
    }'::jsonb NOT NULL,
    UNIQUE(user_id, name)
);

-- Create social_accounts table for user connections
CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform_id UUID NOT NULL REFERENCES custom_platforms(id) ON DELETE CASCADE,
    username VARCHAR(255),
    profile_url TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    settings JSONB DEFAULT '{
        "autoPost": false,
        "crossPost": false,
        "notifications": false
    }'::jsonb NOT NULL,
    UNIQUE(user_id, platform_id)
);

-- Add RLS policies for custom_platforms
ALTER TABLE custom_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom platforms"
    ON custom_platforms FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom platforms"
    ON custom_platforms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom platforms"
    ON custom_platforms FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom platforms"
    ON custom_platforms FOR DELETE
    USING (auth.uid() = user_id);

-- Add RLS policies for social_accounts
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own social accounts"
    ON social_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social accounts"
    ON social_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social accounts"
    ON social_accounts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social accounts"
    ON social_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_custom_platforms_updated_at
    BEFORE UPDATE ON custom_platforms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at
    BEFORE UPDATE ON social_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
