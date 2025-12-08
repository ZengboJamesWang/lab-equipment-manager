import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function exportToSQL(): Promise<void> {
  console.log('🚀 Starting SQL database export...\n');

  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || '5432';
  const dbName = process.env.DB_NAME || 'lab_manager';
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || '';

  // Create exports directory if it doesn't exist
  const exportsDir = path.join(__dirname, '../../exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = `lab-manager-dump-${timestamp}.sql`;
  const filepath = path.join(exportsDir, filename);

  // Build pg_dump command
  // Export only data (no schema, no default users/categories)
  const pgDumpCommand = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --data-only --inserts --column-inserts -f "${filepath}"`;

  console.log('📊 Running pg_dump...');
  console.log(`   Database: ${dbName}`);
  console.log(`   Host: ${dbHost}:${dbPort}`);
  console.log(`   Output: ${filepath}\n`);

  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    if (dbPassword) {
      env.PGPASSWORD = dbPassword;
    }

    exec(pgDumpCommand, { env }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error during SQL export:', error.message);
        if (stderr) console.error('   ', stderr);
        reject(error);
        return;
      }

      if (stderr && !stderr.includes('WARNING')) {
        console.warn('⚠️  Warning:', stderr);
      }

      console.log('✅ SQL export completed successfully!');
      console.log(`📁 File saved to: ${filepath}`);
      console.log('\n💡 To import this on another system:');
      console.log(`   psql -h <host> -U <user> -d <database> -f "${path.basename(filepath)}"`);

      resolve();
    });
  });
}

// Run the export
exportToSQL()
  .then(() => {
    console.log('\n✅ SQL database export completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ SQL database export failed:', error);
    console.error('\n💡 Make sure pg_dump is installed and available in your PATH');
    console.error('   You can install PostgreSQL client tools to get pg_dump');
    process.exit(1);
  });
