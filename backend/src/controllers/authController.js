import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { getPool } from '../config/database.js';
import { logger } from '../config/logger.js';

export const registerValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'organizer']).withMessage('Invalid role')
];

export const loginValidators = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, password, role = 'student' } = req.body;
    const pool = await getPool();

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, role]
    );

    const token = jwt.sign(
      { id: result.insertId, email, role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    logger.info(`New user registered: ${email} (${role})`);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: result.insertId, name, email, role }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;
    const pool = await getPool();

    const [users] = await pool.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const logout = (req, res) => {
  logger.info(`User logged out: ${req.user?.email}`);
  res.json({ message: 'Logout successful' });
};

export const getMe = async (req, res) => {
  try {
    const pool = await getPool();
    const [users] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    logger.error('GetMe error:', error);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};
