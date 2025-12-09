import fs from 'fs';
import path from 'path';
import pool from '../config/database';

interface Migration {
  version: string;
  filename: string;
  filepath: string;
}

async function createMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(50) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      filename VARCHAR(255) NOT NULL
    )
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const result = await pool.query('SELECT version FROM schema_migrations ORDER BY version');
  return new Set(result.rows.map(row => row.version));
}

async function getAllMigrations(): Promise<Migration[]> {
  const migrationsDir = path.join(__dirname, '../../src/config/migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.log('⚠️  No migrations directory found');
    return [];
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort(); // Sort to ensure correct order (001, 002, 003...)

  return files.map(filename => {
    const version = filename.split('_')[0]; // Extract "001", "002", etc.
    return {
      version,
      filename,
      filepath: path.join(migrationsDir, filename)
    };
  });
}

async function runBaseSchema() {
  console.log('📦 Running base schema...');
  const schemaPath = path.join(__dirname, '../../src/config/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  await pool.query(schemaSql);
  console.log('✅ Base schema created successfully');
}

async function runMigration(migration: Migration) {
  console.log(`🔄 Running migration: ${migration.filename}`);

  const sql = fs.readFileSync(migration.filepath, 'utf-8');

  // Begin transaction
  await pool.query('BEGIN');

  try {
    // Run the migration SQL
    await pool.query(sql);

    // Record the migration
    await pool.query(
      'INSERT INTO schema_migrations (version, filename) VALUES ($1, $2)',
      [migration.version, migration.filename]
    );

    // Commit transaction
    await pool.query('COMMIT');
    console.log(`   ✅ Migration ${migration.filename} completed`);
  } catch (error) {
    // Rollback on error
    await pool.query('ROLLBACK');
    throw error;
  }
}

async function checkIfSchemaExists(): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      )
    `);
    return result.rows[0].exists;
  } catch (error) {
    return false;
  }
}

async function runMigrations() {
  console.log('🚀 Starting database migration...\n');

  try {
    // Check if base schema exists
    const schemaExists = await checkIfSchemaExists();

    if (!schemaExists) {
      // First time setup - run base schema
      await runBaseSchema();
    } else {
      console.log('✅ Base schema already exists');
    }

    // Create migrations tracking table
    await createMigrationsTable();
    console.log('✅ Migration tracking table ready\n');

    // Get list of applied and available migrations
    const appliedMigrations = await getAppliedMigrations();
    const allMigrations = await getAllMigrations();

    if (allMigrations.length === 0) {
      console.log('⚠️  No migration files found\n');
      return;
    }

    // Find pending migrations
    const pendingMigrations = allMigrations.filter(
      m => !appliedMigrations.has(m.version)
    );

    if (pendingMigrations.length === 0) {
      console.log('✅ All migrations are up to date!\n');
      console.log(`📊 Total migrations applied: ${appliedMigrations.size}`);
      return;
    }

    console.log(`📋 Found ${pendingMigrations.length} pending migration(s):\n`);
    pendingMigrations.forEach(m => {
      console.log(`   - ${m.filename}`);
    });
    console.log();

    // Run pending migrations in order
    for (const migration of pendingMigrations) {
      await runMigration(migration);
    }

    console.log('\n✅ Database migration completed successfully!');
    console.log(`📊 Migrations applied: ${pendingMigrations.length}`);
    console.log(`📊 Total migrations: ${appliedMigrations.size + pendingMigrations.length}`);

    // Check if default admin was created
    const userResult = await pool.query('SELECT COUNT(*) FROM users WHERE email = $1', ['admin@lab.com']);
    if (userResult.rows[0].count > 0) {
      console.log('\n📝 Default admin account exists');
      console.log('   Email: admin@lab.com');
      console.log('   ⚠️  Change the default password after first login!');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migrations
runMigrations()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  });
