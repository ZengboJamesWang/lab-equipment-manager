import * as fs from 'fs';
import pool from './database';

async function runMigration() {
  try {
    const sql = fs.readFileSync(
      './src/config/migrations/001_add_site_settings_and_equipment_features.sql',
      'utf8'
    );

    await pool.query(sql);
    console.log('✅ Migration executed successfully');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
