// Database configuration that supports both PostgreSQL and SQLite
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import postgres from 'postgres';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';

let db: any;

if (process.env.DATABASE_URL) {
  // Use PostgreSQL for production with DATABASE_URL
  const sql = postgres(process.env.DATABASE_URL);
  db = drizzlePg(sql, { schema });
  console.log('✅ Using PostgreSQL database with DATABASE_URL');
} else {
  // Use SQLite for development or production without DATABASE_URL
  const sqlite = new Database('development.db');
  db = drizzleSqlite(sqlite, { schema });
  
  const envMsg = process.env.NODE_ENV === 'production' ? 'production (fallback)' : 'development';
  console.log(`✅ Using SQLite database for ${envMsg}`);
}

export { db };
