import { passwordResetTokens } from '@shared/schema';
import { getDatabaseConfig } from './config/database';
import { sql } from 'drizzle-orm';
import Database from 'better-sqlite3';

const config = getDatabaseConfig();
const isPostgres = config.type === 'postgresql';

/**
 * Initialize database tables if they don't exist
 * This ensures compatibility across different deployment environments
 */
export async function initializeDatabase(): Promise<void> {
  console.log('🔧 Initializing database tables...');
  
  try {
    // Only create tables for SQLite - PostgreSQL should use proper migrations
    if (!isPostgres) {
      await ensurePasswordResetTokensTable();
    } else {
      console.log('ℹ️  PostgreSQL detected - skipping table creation (use migrations)');
    }
    
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't throw - let the application start even if this fails
  }
}

async function ensurePasswordResetTokensTable(): Promise<void> {
  try {
    // For SQLite, use direct better-sqlite3 connection to create tables
    const dbPath = config.url.replace('sqlite://', '');
    const sqlite = new Database(dbPath);
    
    // Check if table exists
    const tableExists = sqlite.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='password_reset_tokens'
    `).get();
    
    if (!tableExists) {
      console.log('📋 Creating password_reset_tokens table...');
      
      sqlite.exec(`
        CREATE TABLE password_reset_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          user_id TEXT NOT NULL,
          token TEXT NOT NULL UNIQUE,
          expires_at INTEGER NOT NULL,
          used INTEGER DEFAULT 0,
          created_at INTEGER,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
      
      console.log('✅ password_reset_tokens table created successfully');
    } else {
      console.log('✅ password_reset_tokens table already exists');
    }
    
    sqlite.close();
  } catch (error) {
    console.error('❌ Error ensuring password_reset_tokens table:', error);
    // Don't throw - non-critical error, let app continue
  }
} 