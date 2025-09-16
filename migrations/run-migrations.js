const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cocos_challenge',
  user: process.env.DB_USERNAME || 'cocos_user',
  password: process.env.DB_PASSWORD || 'cocos_password',
};

// Create migrations table if it doesn't exist
const createMigrationsTable = async (pool) => {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
  console.log('✓ Migrations table ready');
};

// Get list of executed migrations
const getExecutedMigrations = async (pool) => {
  const result = await pool.query('SELECT filename FROM migrations ORDER BY id');
  return result.rows.map(row => row.filename);
};

// Execute a single migration file
const executeMigration = async (pool, filename) => {
  const filePath = path.join(__dirname, filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  console.log(`Running migration: ${filename}`);
  
  try {
    await pool.query('BEGIN');
    await pool.query(sql);
    await pool.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
    await pool.query('COMMIT');
    console.log(`✓ Migration ${filename} executed successfully`);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(`✗ Migration ${filename} failed:`, error.message);
    throw error;
  }
};

// Main migration runner
const runMigrations = async () => {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('Starting database migrations...');
    console.log(`Connecting to database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    
    // Test connection
    await pool.query('SELECT 1');
    console.log('✓ Database connection successful');
    
    // Create migrations table
    await createMigrationsTable(pool);
    
    // Get list of executed migrations
    const executedMigrations = await getExecutedMigrations(pool);
    console.log(`Found ${executedMigrations.length} executed migrations`);
    
    // Get list of migration files
    const migrationFiles = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Execute pending migrations
    let executedCount = 0;
    for (const filename of migrationFiles) {
      if (!executedMigrations.includes(filename)) {
        await executeMigration(pool, filename);
        executedCount++;
      } else {
        console.log(`⏭ Skipping already executed migration: ${filename}`);
      }
    }
    
    if (executedCount === 0) {
      console.log('✓ No new migrations to execute');
    } else {
      console.log(`✓ Successfully executed ${executedCount} new migrations`);
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
