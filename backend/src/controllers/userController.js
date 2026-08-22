import { getPool } from '../config/database.js';
import { logger } from '../config/logger.js';
import { param, body } from 'express-validator';

export const getAllUsers = async (req, res) => {
  try {
    const pool = await getPool();
    const [users] = await pool.query(
      'SELECT id, name, email, role, is_active, created_at FROM users'
    );
    res.json({ users });
  } catch (error) {
    logger.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

export const updateUserStatusValidators = [
  param('id')
    .isInt({ min: 1 }).withMessage('User ID must be a valid integer'),
  body('active')
    .isBoolean().withMessage('Active must be true or false'),
];

export const updateUserStatus = async (req, res) => {
  try {
    const { active } = req.body;
    const pool = await getPool();
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [!!active, req.params.id]);
    logger.info(`User ${req.params.id} status updated to ${active ? 'active' : 'inactive'} by admin ${req.user.email}`);
    res.json({ message: 'User status updated', active: !!active });
  } catch (error) {
    logger.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};