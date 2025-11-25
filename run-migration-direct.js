import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase credentials
const SUPABASE_URL = 'https://uvdrwbmhmtgacwzujfzc.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2ZHJ3Ym1obXRnYWN3enVqZnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMTgxOTEsImV4cCI6MjA3ODY5NDE5MX0.VgsSXsKsPspHToKb2a8m4myz6PDw3GRyPJke4ZXiUTs';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  try {
    console.log('🚀 Starting migration...');
    console.log(`📡 Connecting to: ${SUPABASE_URL}`);
    
    // Read migration file
    const migrationPath = join(__dirname, 'supabase', 'migrations', '20250125000000_dependency_manager_features.sql');
    console.log(`📄 Reading migration file: ${migrationPath}`);
    
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    // Use Supabase's REST API to execute SQL directly
    // Note: This requires the service_role key, not the anon key
    console.log('📤 Executing migration SQL...');
    
    // Split into manageable chunks (Supabase has query size limits)
    // Execute the entire migration as a single query using the REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: migrationSQL })
    });
    
    if (!response.ok) {
      // Try alternative approach - execute via PostgREST
      console.log('⚠️  Direct RPC not available, trying alternative method...');
      console.log('📝 Please run this SQL manually in Supabase SQL Editor:');
      console.log('\n' + '='.repeat(80));
      console.log(migrationSQL);
      console.log('='.repeat(80));
      console.log('\n💡 Copy the SQL above and paste it into the Supabase SQL Editor at:');
      console.log(`   ${SUPABASE_URL.replace('https://', 'https://app.supabase.com/project/')}/sql`);
      return;
    }
    
    const result = await response.text();
    console.log('✅ Migration executed successfully!');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📝 Alternative: Run the SQL manually');
    console.log('1. Go to Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the migration SQL');
    console.log('\nMigration file location:');
    console.log(join(__dirname, 'supabase', 'migrations', '20250125000000_dependency_manager_features.sql'));
    process.exit(1);
  }
}

runMigration();

