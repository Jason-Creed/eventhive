import { getPool } from '../config/database.js';
import { logger } from '../config/logger.js';
import { body, param } from 'express-validator';

export const createRSVPValidators = [
  param('id')
    .isInt({ min: 1 }).withMessage('Event ID must be a valid integer'),
  body('status')
    .optional()
    .isIn(['going', 'interested']).withMessage('Status must be either "going" or "interested"'),
];

export const createRSVP = async (req, res) => {
  try {
    const { status = 'going' } = req.body;
    const pool = await getPool();

    const [eventCheck] = await pool.query('SELECT id, status FROM events WHERE id = ?', [req.params.id]);
    if (eventCheck.length === 0 || eventCheck[0].status === 'cancelled') {
      return res.status(404).json({ message: 'Event not found or unavailable' });
    }

    const [existingRSVP] = await pool.query(
      'SELECT id, status FROM rsvps WHERE event_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existingRSVP.length > 0) {
      if (existingRSVP[0].status === 'cancelled') {
        await pool.query(
          'UPDATE rsvps SET status = ? WHERE event_id = ? AND user_id = ?',
          [status, req.params.id, req.user.id]
        );
        logger.info(`RSVP updated for event ${req.params.id} by user ${req.user.email}`);
        return res.json({ message: 'RSVP updated', status });
      }
      return res.status(409).json({ message: 'RSVP already exists' });
    }

    await pool.query(
      'INSERT INTO rsvps (event_id, user_id, status) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, status]
    );

    logger.info(`RSVP created for event ${req.params.id} by user ${req.user.email}`);
    res.status(201).json({ message: 'RSVP created', status });
  } catch (error) {
    logger.error('Create RSVP error:', error);
    res.status(500).json({ message: 'Failed to create RSVP', error: error.message });
  }
};

export const deleteRSVP = async (req, res) => {
  try {
    const pool = await getPool();

    const [existing] = await pool.query(
      'SELECT id FROM rsvps WHERE event_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'RSVP not found' });
    }

    await pool.query('UPDATE rsvps SET status = ? WHERE event_id = ? AND user_id = ?', [
      'cancelled',
      req.params.id,
      req.user.id
    ]);

    logger.info(`RSVP cancelled for event ${req.params.id} by user ${req.user.email}`);
    res.json({ message: 'RSVP cancelled' });
  } catch (error) {
    logger.error('Delete RSVP error:', error);
    res.status(500).json({ message: 'Failed to cancel RSVP', error: error.message });
  }
};

export const getEventRSVPs = async (req, res) => {
  try {
    const pool = await getPool();

    const [event] = await pool.query(
      'SELECT organizer_id FROM events WHERE id = ?',
      [req.params.id]
    );

    if (event.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event[0].organizer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view RSVPs' });
    }

    const [rsvps] = await pool.query(
      `SELECT r.*, u.name as user_name, u.email as user_email
       FROM rsvps r
       JOIN users u ON r.user_id = u.id
       WHERE r.event_id = ? AND r.status != 'cancelled'
       ORDER BY r.created_at ASC`,
      [req.params.id]
    );

    res.json({ rsvps });
  } catch (error) {
    logger.error('Get event RSVPs error:', error);
    res.status(500).json({ message: 'Failed to fetch RSVPs', error: error.message });
  }
};

export const getMyRSVPs = async (req, res) => {
  try {
    const pool = await getPool();
    const [rsvps] = await pool.query(
      `SELECT r.*, e.title as event_title, e.location as event_location, e.event_date,
       c.name as category_name, u.name as organizer_name
       FROM rsvps r
       JOIN events e ON r.event_id = e.id
       JOIN categories c ON e.category_id = c.id
       JOIN users u ON e.organizer_id = u.id
       WHERE r.user_id = ? AND r.status != 'cancelled'
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json({ rsvps });
  } catch (error) {
    logger.error('Get my RSVPs error:', error);
    res.status(500).json({ message: 'Failed to fetch RSVPs', error: error.message });
  }
};
