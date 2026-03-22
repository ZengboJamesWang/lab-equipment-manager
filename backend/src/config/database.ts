import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the project root (portable across OSs)
dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'lab_manager',
  user: process.env.DB_USER || 'lab_admin',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL pool connected');
});

pool.on('error', (err: Error) => {
  console.error('❌ Unexpected database error:', err);
});

export default pool;
