#!/bin/bash

# Get the Supabase URL and Key from .env.local
SUPABASE_URL=$(grep VITE_SUPABASE_URL .env.local | cut -d '=' -f2)
SUPABASE_KEY=$(grep VITE_SUPABASE_ANON_KEY .env.local | cut -d '=' -f2)

# Apply migrations
for migration in migrations/*.sql; do
    echo "Applying migration: $migration"
    curl -X POST "${SUPABASE_URL}/rest/v1/rpc/apply_migration" \
        -H "apikey: ${SUPABASE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"sql\": \"$(cat $migration | tr '\n' ' ')\"}"
    echo
done
