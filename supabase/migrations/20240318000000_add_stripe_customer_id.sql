-- Add stripe_customer_id column to profiles table
ALTER TABLE profiles ADD COLUMN stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN subscription_tier text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN subscription_status text DEFAULT 'inactive';

-- Create index for stripe_customer_id
CREATE INDEX idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Add RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);