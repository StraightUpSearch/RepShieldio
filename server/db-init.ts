import { getDatabaseConfig } from './config/database';
import Database from 'better-sqlite3';
import postgres from 'postgres';

const config = getDatabaseConfig();
const isPostgres = config.type === 'postgresql';

/**
 * Initialize database tables if they don't exist
 * This ensures compatibility across different deployment environments
 */
export async function initializeDatabase(): Promise<void> {
  console.log('🔧 Initializing database tables...');

  try {
    if (isPostgres) {
      await initializePostgresql();
    } else {
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

      // Create indexes for common query patterns (SQLite)
      console.log('📋 Creating database indexes...');
      sqlite.exec(`
        -- User lookups
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

        -- Ticket queries
        CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
        CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
        CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);

        -- Admin queue filtering
        CREATE INDEX IF NOT EXISTS idx_audit_requests_processed ON audit_requests(processed);
        CREATE INDEX IF NOT EXISTS idx_quote_requests_processed ON quote_requests(processed);
        CREATE INDEX IF NOT EXISTS idx_brand_scan_tickets_processed ON brand_scan_tickets(processed);
        CREATE INDEX IF NOT EXISTS idx_brand_scan_tickets_email ON brand_scan_tickets(email);

        -- Funnel analytics
        CREATE INDEX IF NOT EXISTS idx_funnel_events_event_type ON funnel_events(event_type);
        CREATE INDEX IF NOT EXISTS idx_funnel_events_created_at ON funnel_events(created_at);

        -- Blog post lookups
        CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
        CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);

        -- Password reset token lookups
        CREATE UNIQUE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
      `);
      console.log('✅ Database indexes created');

      sqlite.close();
    }

    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't throw - let the application start even if this fails
  }
}

/**
 * Initialize PostgreSQL tables using CREATE TABLE IF NOT EXISTS
 * Matches the Drizzle schema in shared/schema.ts
 */
async function initializePostgresql(): Promise<void> {
  const sql = postgres(config.url);

  try {
    // Order matters: parent tables first, then tables with foreign keys
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY NOT NULL,
        email VARCHAR UNIQUE NOT NULL,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        password VARCHAR,
        role VARCHAR DEFAULT 'user' NOT NULL,
        account_balance VARCHAR DEFAULT '0.00',
        credits_remaining INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        type VARCHAR NOT NULL,
        status VARCHAR DEFAULT 'pending' NOT NULL,
        priority VARCHAR DEFAULT 'standard' NOT NULL,
        assigned_to VARCHAR,
        title TEXT NOT NULL,
        description TEXT,
        reddit_url TEXT,
        amount VARCHAR,
        progress INTEGER DEFAULT 0,
        request_data JSONB,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        ticket_id INTEGER REFERENCES tickets(id),
        type VARCHAR NOT NULL,
        amount VARCHAR NOT NULL,
        description TEXT,
        status VARCHAR DEFAULT 'completed' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        token VARCHAR NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS audit_requests (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT NOT NULL,
        website TEXT,
        message TEXT,
        processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS quote_requests (
        id SERIAL PRIMARY KEY,
        reddit_url TEXT NOT NULL,
        email TEXT NOT NULL,
        processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS brand_scan_tickets (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT NOT NULL,
        brand_name TEXT NOT NULL,
        processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS scan_results (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR REFERENCES users(id),
        brand_name VARCHAR NOT NULL,
        scan_type VARCHAR NOT NULL,
        total_mentions INTEGER DEFAULT 0,
        risk_level VARCHAR,
        risk_score INTEGER DEFAULT 0,
        platform_data JSONB,
        processing_time INTEGER,
        scan_id VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        plan_id VARCHAR NOT NULL,
        status VARCHAR DEFAULT 'active' NOT NULL,
        stripe_subscription_id VARCHAR,
        stripe_customer_id VARCHAR,
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        cancelled_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS funnel_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR NOT NULL,
        user_id VARCHAR,
        session_id VARCHAR,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        excerpt TEXT,
        content TEXT NOT NULL,
        meta_title VARCHAR(60),
        meta_description VARCHAR(160),
        keywords TEXT,
        featured_image VARCHAR,
        author VARCHAR NOT NULL,
        status VARCHAR DEFAULT 'draft',
        category VARCHAR,
        tags TEXT[],
        reading_time INTEGER,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS blog_categories (
        id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        meta_title VARCHAR(60),
        meta_description VARCHAR(160),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes for common query patterns
    await sql.unsafe(`
      -- User lookups
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

      -- Ticket queries
      CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
      CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);

      -- Admin queue filtering
      CREATE INDEX IF NOT EXISTS idx_audit_requests_processed ON audit_requests(processed);
      CREATE INDEX IF NOT EXISTS idx_quote_requests_processed ON quote_requests(processed);
      CREATE INDEX IF NOT EXISTS idx_brand_scan_tickets_processed ON brand_scan_tickets(processed);
      CREATE INDEX IF NOT EXISTS idx_brand_scan_tickets_email ON brand_scan_tickets(email);

      -- Funnel analytics
      CREATE INDEX IF NOT EXISTS idx_funnel_events_event_type ON funnel_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_funnel_events_created_at ON funnel_events(created_at);

      -- Blog post lookups
      CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
      CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);

      -- Password reset token lookups
      CREATE UNIQUE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
    `);

    // Create index on session expire (connect-pg-simple creates the session table itself)
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_session_expire ON session (expire);
    `).catch(() => {
      // Ignore - session table may not exist yet (connect-pg-simple creates it on first request)
    });

    console.log('✅ PostgreSQL tables initialized');
  } finally {
    await sql.end();
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
