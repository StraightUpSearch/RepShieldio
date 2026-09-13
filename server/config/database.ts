import { drizzle as drizzlePg, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleSqlite } from 'drizzle-orm/libsql';
import postgres from 'postgres';
import { createClient } from '@libsql/client';
import * as schema from '@shared/schema';

interface DatabaseConfig {
  url: string;
  type: 'sqlite' | 'postgresql';
  environment: string;
}

/**
 * Get environment-specific database configuration
 * Enforces strict separation between development and production databases
 */
function getDatabaseConfig(): DatabaseConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // Environment-specific database URL selection
  let dbUrl: string;
  let dbType: 'sqlite' | 'postgresql';
  
  if (nodeEnv === 'production') {
    // Production environment - prefer PROD_DATABASE_URL
    dbUrl = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL || '';
    
    if (!dbUrl) {
      console.warn('⚠️  No production database URL configured - falling back to SQLite');
      dbUrl = 'sqlite://production.db';
      dbType = 'sqlite';
    } else if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
      dbType = 'postgresql';
    } else {
      dbType = 'sqlite';
    }
  } else {
    // Development environment - prefer DEV_DATABASE_URL
    dbUrl = process.env.DEV_DATABASE_URL || 'sqlite://development.db';
    dbType = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://') ? 'postgresql' : 'sqlite';
  }
  
  // Validation: Prevent cross-environment contamination
  if (nodeEnv === 'production' && dbUrl.includes('development.db')) {
    throw new Error('❌ CRITICAL: Production environment cannot use development database');
  }
  
  if (nodeEnv === 'development' && dbUrl.includes('production.db')) {
    console.warn('⚠️  Development environment using production database - this is unusual');
  }
  
  return {
    url: dbUrl,
    type: dbType,
    environment: nodeEnv
  };
}

/**
 * Initialize database connection with environment-specific configuration
 */
function initializeDatabase() {
  const config = getDatabaseConfig();
  
  console.log(`🔧 Database Config: ${config.type} (${config.environment})`);
  
  if (config.type === 'postgresql') {
    // PostgreSQL connection for production
    const sql = postgres(config.url);
    const db = drizzlePg(sql, { schema });
    console.log(`✅ Using PostgreSQL database for ${config.environment}`);
    return db;
  } else {
    // SQLite connection for development or fallback (via @libsql/client — no native compilation)
    const dbPath = config.url.replace('sqlite://', '');
    const client = createClient({ url: `file:${dbPath}` });
    const db = drizzleSqlite(client, { schema });
    console.log(`✅ Using SQLite database (${dbPath}) for ${config.environment}`);
    return db;
  }
}

// Export configured database instance
// Cast to PG type for consistent TypeScript types (runtime uses correct dialect)
export const db = initializeDatabase() as PostgresJsDatabase<typeof schema>;
export { getDatabaseConfig };