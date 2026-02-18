import { getDatabaseConfig } from './config/database';
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
      const dbPath = config.url.replace('sqlite://', '');
      const sqlite = new Database(dbPath);

      ensureTable(sqlite, 'password_reset_tokens', `
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

      ensureTable(sqlite, 'scan_results', `
        CREATE TABLE scan_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          user_id TEXT REFERENCES users(id),
          brand_name TEXT NOT NULL,
          scan_type TEXT NOT NULL,
          total_mentions INTEGER DEFAULT 0,
          risk_level TEXT,
          risk_score INTEGER DEFAULT 0,
          platform_data TEXT,
          processing_time INTEGER,
          scan_id TEXT NOT NULL,
          created_at INTEGER
        )
      `);

      ensureTable(sqlite, 'subscriptions', `
        CREATE TABLE subscriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          user_id TEXT NOT NULL REFERENCES users(id),
          plan_id TEXT NOT NULL,
          status TEXT DEFAULT 'active' NOT NULL,
          stripe_subscription_id TEXT,
          stripe_customer_id TEXT,
          current_period_start INTEGER,
          current_period_end INTEGER,
          cancelled_at INTEGER,
          created_at INTEGER,
          updated_at INTEGER
        )
      `);

      ensureTable(sqlite, 'funnel_events', `
        CREATE TABLE funnel_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          event_type TEXT NOT NULL,
          user_id TEXT,
          session_id TEXT,
          metadata TEXT,
          created_at INTEGER
        )
      `);

      ensureTable(sqlite, 'transactions', `
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          user_id TEXT NOT NULL REFERENCES users(id),
          ticket_id INTEGER REFERENCES tickets(id),
          type TEXT NOT NULL,
          amount TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'completed' NOT NULL,
          created_at INTEGER
        )
      `);

      // Core tables that Drizzle migrations should create, but ensure they exist
      ensureTable(sqlite, 'sessions', `
        CREATE TABLE sessions (
          sid TEXT PRIMARY KEY NOT NULL,
          sess TEXT NOT NULL,
          expire INTEGER NOT NULL
        )
      `);

      ensureTable(sqlite, 'users', `
        CREATE TABLE users (
          id TEXT PRIMARY KEY NOT NULL,
          email TEXT UNIQUE NOT NULL,
          first_name TEXT,
          last_name TEXT,
          profile_image_url TEXT,
          password TEXT,
          role TEXT DEFAULT 'user' NOT NULL,
          account_balance TEXT DEFAULT '0.00',
          credits_remaining INTEGER DEFAULT 0,
          created_at INTEGER,
          updated_at INTEGER
        )
      `);

      ensureTable(sqlite, 'tickets', `
        CREATE TABLE tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          user_id TEXT NOT NULL REFERENCES users(id),
          type TEXT NOT NULL,
          status TEXT DEFAULT 'pending' NOT NULL,
          priority TEXT DEFAULT 'standard' NOT NULL,
          assigned_to TEXT,
          title TEXT NOT NULL,
          description TEXT,
          reddit_url TEXT,
          amount TEXT,
          progress INTEGER DEFAULT 0,
          request_data TEXT,
          notes TEXT,
          created_at INTEGER,
          updated_at INTEGER
        )
      `);

      ensureTable(sqlite, 'audit_requests', `
        CREATE TABLE audit_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          company TEXT NOT NULL,
          website TEXT,
          message TEXT,
          processed INTEGER DEFAULT 0,
          created_at INTEGER
        )
      `);

      ensureTable(sqlite, 'quote_requests', `
        CREATE TABLE quote_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          reddit_url TEXT NOT NULL,
          email TEXT NOT NULL,
          processed INTEGER DEFAULT 0,
          created_at INTEGER
        )
      `);

      ensureTable(sqlite, 'brand_scan_tickets', `
        CREATE TABLE brand_scan_tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          company TEXT NOT NULL,
          brand_name TEXT NOT NULL,
          processed INTEGER DEFAULT 0,
          created_at INTEGER
        )
      `);

      ensureTable(sqlite, 'blog_posts', `
        CREATE TABLE blog_posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          title TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          excerpt TEXT,
          content TEXT NOT NULL,
          meta_title TEXT,
          meta_description TEXT,
          keywords TEXT,
          featured_image TEXT,
          author TEXT NOT NULL,
          status TEXT DEFAULT 'draft',
          category TEXT,
          tags TEXT,
          reading_time INTEGER,
          published_at INTEGER,
          created_at INTEGER,
          updated_at INTEGER
        )
      `);

      ensureTable(sqlite, 'blog_categories', `
        CREATE TABLE blog_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          description TEXT,
          meta_title TEXT,
          meta_description TEXT,
          created_at INTEGER
        )
      `);

      sqlite.close();
    } else {
      console.log('ℹ️  PostgreSQL detected - skipping table creation (use migrations)');
    }

    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't throw - let the application start even if this fails
  }
}

function ensureTable(sqlite: Database.Database, tableName: string, createSQL: string): void {
  try {
    const exists = sqlite.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name=?
    `).get(tableName);

    if (!exists) {
      console.log(`📋 Creating ${tableName} table...`);
      sqlite.exec(createSQL);
      console.log(`✅ ${tableName} table created`);
    } else {
      console.log(`✅ ${tableName} table already exists`);
    }
  } catch (error) {
    console.error(`❌ Error ensuring ${tableName} table:`, error);
  }
}
