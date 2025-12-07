import fs from 'fs';
import path from 'path';
import pool from '../config/database';

async function runMigration() {
  console.log('🚀 Starting database migration...');

  try {
    // Read from src directory since SQL files aren't copied to dist
    const schemaPath = path.join(__dirname, '../../src/config/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    await pool.query(schemaSql);

    console.log('✅ Database migration completed successfully!');
    console.log('📝 Default admin account has been created.');
    console.log('   ⚠️  Please ensure you have the admin credentials from your secure configuration!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
