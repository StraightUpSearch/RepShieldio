import { defineConfig } from "drizzle-kit";
import { getDatabaseConfig } from "./server/config/database";

// Get environment-specific database configuration
const dbConfig = getDatabaseConfig();

// Configure Drizzle based on database type and environment
const config = dbConfig.type === 'postgresql'
  ? {
      dialect: "postgresql" as const,
      dbCredentials: {
        url: dbConfig.url,
      },
    }
  : {
      dialect: "sqlite" as const,
      dbCredentials: {
        url: dbConfig.url.replace('sqlite://', ''),
      },
    };

console.log(`🔧 Drizzle Config: ${config.dialect} for ${dbConfig.environment}`);

// Validation: Prevent accidental cross-environment operations
if (process.env.NODE_ENV === 'production' && config.dialect === 'sqlite' && 
    config.dbCredentials.url.includes('development')) {
  throw new Error('❌ CRITICAL: Cannot run production migrations against development database');
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  ...config,
});
