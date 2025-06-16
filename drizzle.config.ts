import { defineConfig } from "drizzle-kit";

// Use SQLite for development/production without DATABASE_URL
const config = process.env.DATABASE_URL 
  ? {
      dialect: "postgresql" as const,
      dbCredentials: {
        url: process.env.DATABASE_URL,
      },
    }
  : {
      dialect: "sqlite" as const,
      dbCredentials: {
        url: "development.db",
      },
    };

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  ...config,
});
