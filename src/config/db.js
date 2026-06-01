const { Pool } = require('pg');

function resolveSslConfig() {
  return process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;
}

function buildPoolConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: resolveSslConfig()
    };
  }

  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_dawa',
    ssl: resolveSslConfig(),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  };
}

const pool = new Pool(buildPoolConfig());

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      stock INT NOT NULL,
      image_url VARCHAR(500) NOT NULL
    )
  `);
}

module.exports = {
  pool,
  initializeDatabase
};