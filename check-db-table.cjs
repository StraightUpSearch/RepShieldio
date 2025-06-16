const Database = require('better-sqlite3');
const path = require('path');

// Check development database
console.log('🔍 Checking development database...');
try {
  const devDb = new Database(path.join(__dirname, 'development.db'));
  
  // Check if table exists
  const devTableExists = devDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='password_reset_tokens'").get();
  
  if (devTableExists) {
    console.log('✅ password_reset_tokens table exists in development.db');
  } else {
    console.log('❌ password_reset_tokens table missing in development.db - creating...');
    devDb.exec(`
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
    console.log('✅ Created password_reset_tokens table in development.db');
  }
  
  devDb.close();
} catch (error) {
  console.error('❌ Error with development database:', error.message);
}

// Check production database
console.log('\n🔍 Checking production database...');
try {
  const prodDb = new Database(path.join(__dirname, 'production.db'));
  
  // Check if table exists
  const prodTableExists = prodDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='password_reset_tokens'").get();
  
  if (prodTableExists) {
    console.log('✅ password_reset_tokens table exists in production.db');
  } else {
    console.log('❌ password_reset_tokens table missing in production.db - creating...');
    prodDb.exec(`
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
    console.log('✅ Created password_reset_tokens table in production.db');
  }
  
  prodDb.close();
} catch (error) {
  console.error('❌ Error with production database:', error.message);
}

console.log('\n🎉 Database check complete!'); 