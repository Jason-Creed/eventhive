import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { logger } from '../config/logger.js';

dotenv.config();

const SEEDS_DIR = path.join(process.cwd(), 'src', 'seeds');

const runSeeds = async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'eventhive_user',
    password: process.env.DB_PASSWORD || 'eventhive_password',
    database: process.env.DB_NAME || 'eventhive_db',
    multipleStatements: true,
    port: parseInt(process.env.DB_PORT || '3306'),
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });

  try {
    const files = await fs.readdir(SEEDS_DIR);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

    logger.info(`Found ${sqlFiles.length} seed files`);

    for (const file of sqlFiles) {
      logger.info(`Running seed: ${file}`);
      const sql = await fs.readFile(path.join(SEEDS_DIR, file), 'utf-8');
      await pool.query(sql);
      logger.info(`Seed ${file} completed`);
    }

    logger.info('All seeds completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seed failed:', error);
    process.exit(1);
  }
};

runSeeds();
