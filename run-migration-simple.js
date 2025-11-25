import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📄 Migration SQL File Location:');
console.log(join(__dirname, 'supabase', 'migrations', '20250125000000_dependency_manager_features.sql'));
console.log('\n' + '='.repeat(80));
console.log('📋 MIGRATION SQL:');
console.log('='.repeat(80) + '\n');

const migrationPath = join(__dirname, 'supabase', 'migrations', '20250125000000_dependency_manager_features.sql');
const migrationSQL = readFileSync(migrationPath, 'utf-8');

console.log(migrationSQL);

console.log('\n' + '='.repeat(80));
console.log('📝 INSTRUCTIONS:');
console.log('='.repeat(80));
console.log('\n1. Copy the SQL above');
console.log('2. Go to: https://app.supabase.com/project/uvdrwbmhmtgacwzujfzc/sql/new');
console.log('3. Paste the SQL into the editor');
console.log('4. Click "Run" or press Ctrl+Enter');
console.log('\n✅ Migration will create 8 new tables and update the risks table\n');

