import { getDatabaseConfig } from '../server/config/database';

/**
 * Environment validation for migration scripts
 * Call this at the start of each migration to ensure proper database targeting
 */
export function validateMigrationEnvironment() {
  const config = getDatabaseConfig();
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  console.log(`🔧 Migration Environment Check: ${config.type} (${config.environment})`);
  
  // Critical validations
  if (nodeEnv === 'production' && config.url.includes('development')) {
    throw new Error('❌ CRITICAL: Cannot run production migration against development database');
  }
  
  if (nodeEnv === 'production' && config.type === 'sqlite' && !config.url.includes('production')) {
    console.warn('⚠️  Running production migration against SQLite - ensure this is intentional');
  }
  
  // Log migration target for audit trail
  console.log(`📊 Migration Target: ${config.url.replace(/\/\/.*@/, '//***:***@')}`);
  
  return config;
} 