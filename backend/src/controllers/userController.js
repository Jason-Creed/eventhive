import { getPool } from '../config/database.js';
import { logger } from '../config/logger.js';

export const getAllUsers = async (req, res) => {
  try {
    const pool = await getPool();
    const [users] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users'
    );

    res.json({ users });
  } catch (error) {
    logger.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { active } = req.body;
    const pool = await getPool();

    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [active ? 'student' : 'student', req.params.id]);

    logger.info(`User ${req.params.id} status updated by admin ${req.user.email}`);
    res.json({ message: 'User status updated' });
  } catch (error) {
    logger.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};
