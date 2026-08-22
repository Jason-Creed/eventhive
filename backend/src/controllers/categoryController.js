import { getPool } from '../config/database.js';

export const getAllCategories = async (req, res) => {
  try {
    const pool = await getPool();
    const [categories] = await pool.query('SELECT id, name FROM categories ORDER BY name');
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};