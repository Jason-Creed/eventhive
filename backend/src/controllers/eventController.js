import { getPool } from '../config/database.js';
import { logger } from '../config/logger.js';
import { uploadToS3, deleteFromS3 } from '../utils/s3.js';

const buildCountParams = (category, search, startDate, endDate) => {
  const params = [];
  if (category) params.push(category);
  if (search) params.push(`%${search}%`, `%${search}%`);
  if (startDate) params.push(startDate);
  if (endDate) params.push(endDate);
  return params;
};

export const getEvents = async (req, res) => {
  try {
    const { category, search, startDate, endDate, page = 1, limit = 20 } = req.query;
    const pool = await getPool();

    let query = `
      SELECT e.*, u.name as organizer_name, c.name as category_name
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      JOIN categories c ON e.category_id = c.id
      WHERE e.status = 'active'
    `;
    const params = [];

    if (category) {
      query += ' AND c.name = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (e.title LIKE ? OR e.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (startDate) {
      query += ' AND e.event_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND e.event_date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY e.event_date ASC LIMIT ? OFFSET ?';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);

    const [events] = await pool.query(query, params);

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM events e
       JOIN categories c ON e.category_id = c.id
       WHERE e.status = 'active' ${category ? 'AND c.name = ?' : ''} ${search ? 'AND (e.title LIKE ? OR e.description LIKE ?)' : ''} ${startDate ? 'AND e.event_date >= ?' : ''} ${endDate ? 'AND e.event_date <= ?' : ''}`,
      buildCountParams(category, search, startDate, endDate)
    );

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult[0].total)
      }
    });
  } catch (error) {
    logger.error('Get events error:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

export const getEvent = async (req, res) => {
  try {
    const pool = await getPool();
    const [events] = await pool.query(
      `SELECT e.*, u.name as organizer_name, c.name as category_name
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       JOIN categories c ON e.category_id = c.id
       WHERE e.id = ? AND e.status = 'active'`,
      [req.params.id]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event: events[0] });
  } catch (error) {
    logger.error('Get event error:', error);
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, category_id, location, event_date, capacity } = req.body;
    const pool = await getPool();

    let bannerImageUrl = null;
    if (req.file) {
      bannerImageUrl = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const [result] = await pool.query(
      `INSERT INTO events (title, description, category_id, location, event_date, capacity, banner_image_url, organizer_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category_id, location, event_date, capacity || 0, bannerImageUrl, req.user.id]
    );

    const [newEvent] = await pool.query(
      `SELECT e.*, u.name as organizer_name, c.name as category_name
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       JOIN categories c ON e.category_id = c.id
       WHERE e.id = ?`,
      [result.insertId]
    );

    logger.info(`Event created: ${title} by user ${req.user.email}`);
    res.status(201).json({ event: newEvent[0] });
  } catch (error) {
    logger.error('Create event error:', error);
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { title, description, category_id, location, event_date, capacity, status } = req.body;
    const pool = await getPool();

    const [existing] = await pool.query('SELECT banner_image_url FROM events WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    let bannerImageUrl = existing[0].banner_image_url;
    if (req.file) {
      if (bannerImageUrl) {
        await deleteFromS3(bannerImageUrl);
      }
      bannerImageUrl = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const updateFields = [];
    const updateValues = [];

    if (title) { updateFields.push('title = ?'); updateValues.push(title); }
    if (description) { updateFields.push('description = ?'); updateValues.push(description); }
    if (category_id) { updateFields.push('category_id = ?'); updateValues.push(category_id); }
    if (location) { updateFields.push('location = ?'); updateValues.push(location); }
    if (event_date) { updateFields.push('event_date = ?'); updateValues.push(event_date); }
    if (capacity !== undefined) { updateFields.push('capacity = ?'); updateValues.push(capacity); }
    if (status) { updateFields.push('status = ?'); updateValues.push(status); }
    if (bannerImageUrl !== undefined) { updateFields.push('banner_image_url = ?'); updateValues.push(bannerImageUrl); }

    updateValues.push(req.params.id);

    await pool.query(
      `UPDATE events SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    const [updatedEvent] = await pool.query(
      `SELECT e.*, u.name as organizer_name, c.name as category_name
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       JOIN categories c ON e.category_id = c.id
       WHERE e.id = ?`,
      [req.params.id]
    );

    logger.info(`Event updated: ${req.params.id} by user ${req.user.email}`);
    res.json({ event: updatedEvent[0] });
  } catch (error) {
    logger.error('Update event error:', error);
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const pool = await getPool();

    const [existing] = await pool.query('SELECT banner_image_url FROM events WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (existing[0].banner_image_url) {
      await deleteFromS3(existing[0].banner_image_url);
    }

    await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);

    logger.info(`Event deleted: ${req.params.id} by user ${req.user.email}`);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    logger.error('Delete event error:', error);
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const pool = await getPool();
    const [events] = await pool.query(
      `SELECT e.*, c.name as category_name,
       (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND status = 'going') as going_count,
       (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND status = 'interested') as interested_count
       FROM events e
       JOIN categories c ON e.category_id = c.id
       WHERE e.organizer_id = ?
       ORDER BY e.created_at DESC`,
      [req.user.id]
    );

    res.json({ events });
  } catch (error) {
    logger.error('Get my events error:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};
