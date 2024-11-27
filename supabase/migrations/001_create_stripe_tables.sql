-- customers table
create table customers (
  id uuid references auth.users not null primary key,
  stripe_customer_id text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- subscriptions table
create table subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  stripe_subscription_id text unique,
  status text,
  price_id text,
  quantity integer,
  cancel_at_period_end boolean,
  cancel_at timestamp with time zone,
  canceled_at timestamp with time zone,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone
);
