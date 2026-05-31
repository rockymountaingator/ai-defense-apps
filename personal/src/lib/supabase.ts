import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL || '';

export const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl, ssl: false })
  : null;

export const isConfigured = () => !!pool;
