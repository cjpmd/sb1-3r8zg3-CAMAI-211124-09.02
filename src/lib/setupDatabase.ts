import { supabase } from './supabase';

export async function setupDatabase() {
  try {
    // Create social_accounts table
    const { error: tableError } = await supabase
      .from('social_accounts')
      .select('id')
      .limit(1);

    if (tableError?.code === '42P01') {
      // Table doesn't exist, let's create it
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS social_accounts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          platform TEXT NOT NULL,
          username TEXT,
          token TEXT,
          refresh_token TEXT,
          token_expires_at TIMESTAMPTZ,
          settings JSONB DEFAULT '{"autoPost": false, "crossPost": true, "defaultPrivacy": "public", "notifications": true}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, platform)
        );
      `;

      const { error: createError } = await supabase.rpc('exec', { sql: createTableQuery });
      
      if (createError) {
        console.error('Error creating table:', createError);
        // If we can't create the table, we'll just continue - the table might already exist
        // or we might not have permissions to create it
      }
    }

    console.log('Database check completed');
  } catch (error) {
    console.error('Error checking database:', error);
    // Continue even if there's an error - the table might already exist
  }
}
