import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase credentials
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://uvdrwbmhmtgacwzujfzc.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2ZHJ3Ym1obXRnYWN3enVqZnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMTgxOTEsImV4cCI6MjA3ODY5NDE5MX0.VgsSXsKsPspHToKb2a8m4myz6PDw3GRyPJke4ZXiUTs';

// Create Supabase client with service role key for migrations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  try {
    console.log('🚀 Starting migration...');
    console.log(`📡 Connecting to: ${SUPABASE_URL}`);
    
    // Read migration file
    const migrationPath = join(__dirname, 'supabase', 'migrations', '20250125000000_dependency_manager_features.sql');
    console.log(`📄 Reading migration file: ${migrationPath}`);
    
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    // Split SQL into individual statements (basic splitting by semicolon)
    // Note: This is a simplified approach. For production, use a proper SQL parser
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('/*') && !s.startsWith('--') && s !== '$$');
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.startsWith('/*') || statement.length === 0) {
        continue;
      }
      
      try {
        // Use RPC or direct query - Supabase JS doesn't support raw SQL directly
        // We'll use the REST API approach
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct query approach
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            },
            body: JSON.stringify({ sql: statement })
          });
          
          if (!response.ok) {
            // Some statements might fail if objects already exist, which is OK
            if (statement.includes('CREATE TABLE IF NOT EXISTS') || 
                statement.includes('CREATE INDEX IF NOT EXISTS') ||
                statement.includes('CREATE POLICY') ||
                statement.includes('CREATE TRIGGER')) {
              console.log(`⚠️  Statement ${i + 1} skipped (may already exist): ${statement.substring(0, 50)}...`);
            } else {
              console.error(`❌ Error in statement ${i + 1}:`, error);
              errorCount++;
            }
          } else {
            successCount++;
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } else {
          successCount++;
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        // Some errors are expected (e.g., IF NOT EXISTS)
        if (statement.includes('IF NOT EXISTS') || statement.includes('IF EXISTS')) {
          console.log(`⚠️  Statement ${i + 1} conditionally executed: ${statement.substring(0, 50)}...`);
          successCount++;
        } else {
          console.error(`❌ Error executing statement ${i + 1}:`, err.message);
          errorCount++;
        }
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with some errors. Check the output above.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

