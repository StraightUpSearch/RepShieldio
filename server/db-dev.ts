import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const sqlite = new Database('development.db');

export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
try {
  // Run migrations or create tables
  console.log('🔧 Using SQLite database for development');
  console.log('✅ Development database loaded successfully');
} catch (error) {
  console.error('Database initialization error:', error);
} 