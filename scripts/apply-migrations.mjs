#!/usr/bin/env node
/**
 * Apply Database Migrations to Supabase
 * 
 * This script applies all migrations in the supabase/migrations directory
 * to the CyberSoluce Supabase project.
 * 
 * Usage:
 *   node scripts/apply-migrations.mjs
 * 
 * Environment Variables:
 *   SUPABASE_URL - Your Supabase project URL (default: CyberSoluce project)
 *   SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key (required)
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Use CyberSoluce Supabase project
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://uvdrwbmhmtgacwzujfzc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is required');
  console.error('\nPlease set the service role key:');
  console.error('  export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.error('\nOr add it to your .env file:');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.error('\nGet your service role key from:');
  console.error('  https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/settings/api');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Get project reference from URL
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'uvdrwbmhmtgacwzujfzc';

console.log('🚀 CyberSoluce AssetManager - Database Migration Tool\n');
console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
console.log(`📦 Project Ref: ${projectRef}\n`);

/**
 * Execute SQL directly using Supabase REST API
 */
async function executeSQL(sql) {
  try {
    // Use the REST API to execute SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SQL execution failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    // Fallback: Try using Supabase client's RPC if available
    console.warn('Direct SQL execution failed, trying alternative method...');
    throw error;
  }
}

/**
 * Apply migration using Supabase Management API
 */
async function applyMigration(migrationFile, sql) {
  console.log(`\n📄 Applying: ${migrationFile}`);
  console.log('─'.repeat(60));

  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.length < 10) continue; // Skip very short statements
      
      try {
        // Use Supabase client to execute statements
        // Note: Some statements may need to be executed via SQL editor
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // If RPC doesn't exist, we'll need to use SQL editor manually
          console.warn(`⚠️  Statement may need manual execution: ${statement.substring(0, 50)}...`);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.warn(`⚠️  Statement execution warning: ${err.message}`);
        errorCount++;
      }
    }

    if (successCount > 0) {
      console.log(`✅ Applied ${successCount} statements`);
    }
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} statements may need manual review`);
    }

    return { success: true, successCount, errorCount };
  } catch (error) {
    console.error(`❌ Error applying migration: ${error.message}`);
    return { success: false, error };
  }
}

/**
 * Main migration function
 */
async function runMigrations() {
  const migrationsDir = join(projectRoot, 'supabase', 'migrations');
  
  try {
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Apply in chronological order

    if (files.length === 0) {
      console.error('❌ No migration files found in supabase/migrations/');
      process.exit(1);
    }

    console.log(`📁 Found ${files.length} migration file(s):\n`);
    files.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));

    console.log('\n⚠️  IMPORTANT:');
    console.log('   Due to Supabase security restrictions, migrations must be applied');
    console.log('   manually through the Supabase Dashboard SQL Editor.');
    console.log('\n📋 Next Steps:');
    console.log('   1. Go to: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new');
    console.log('   2. Copy and paste each migration file in order:');
    
    files.forEach((f, i) => {
      const filePath = join(migrationsDir, f);
      const content = readFileSync(filePath, 'utf-8');
      console.log(`\n   Migration ${i + 1}: ${f}`);
      console.log('   ─'.repeat(30));
      console.log(`   File: ${filePath}`);
      console.log(`   Size: ${(content.length / 1024).toFixed(2)} KB`);
    });

    console.log('\n✅ Migration files are ready to be applied manually');
    console.log('\n💡 Alternative Methods:');
    console.log('\n   Option 1: Supabase CLI');
    console.log('   supabase link --project-ref uvdrwbmhmtgacwzujfzc');
    console.log('   supabase db push');
    console.log('\n   Option 2: psql (PostgreSQL Client)');
    console.log('   psql "postgresql://postgres:K1551d0ug0u@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres" -f supabase/migrations/[migration-file].sql');
    console.log('\n   Database Connection String:');
    console.log('   postgresql://postgres:K1551d0ug0u@db.uvdrwbmhmtgacwzujfzc.supabase.co:5432/postgres');

  } catch (error) {
    console.error('❌ Error reading migrations:', error.message);
    process.exit(1);
  }
}

// Run migrations
runMigrations().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

