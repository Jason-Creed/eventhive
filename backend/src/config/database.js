import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'eventhive_user',
  password: process.env.DB_PASSWORD || 'eventhive_password',
  database: process.env.DB_NAME || 'eventhive_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
};

let pool;

export const getPool = async () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('MySQL connection pool created');
  }
  return pool;
};

export const testConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'eventhive_user',
      password: process.env.DB_PASSWORD || 'eventhive_password',
      database: process.env.DB_NAME || 'eventhive_db',
      port: parseInt(process.env.DB_PORT || '3306'),
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });
    await connection.execute('SELECT 1');
    await connection.end();
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    return false;
  }
};

export default dbConfig;
