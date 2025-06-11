// Development SQLite database configuration
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';

console.log('🔧 Using SQLite database for development');

const sqlite = new Database('development.db');
export const db = drizzle(sqlite, { schema });

console.log('✅ Development database loaded successfully');
