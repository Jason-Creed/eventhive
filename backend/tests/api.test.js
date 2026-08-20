import request from 'supertest';
import app from '../src/app.js';
import { getPool } from '../src/config/database.js';

let authToken;
let testEventId;

const testUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'password123'
};

beforeAll(async () => {
  const pool = await getPool();
  await pool.query("DELETE FROM rsvps WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@example.com')");
  await pool.query("DELETE FROM events WHERE title = 'Test Event'");
  await pool.query("DELETE FROM users WHERE email = 'testuser@example.com'");
});

afterAll(async () => {
  const pool = await getPool();
  await pool.query("DELETE FROM rsvps WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@example.com')");
  await pool.query("DELETE FROM events WHERE title = 'Test Event'");
  await pool.query("DELETE FROM users WHERE email = 'testuser@example.com'");
  await pool.end();
});

describe('Auth Endpoints', () => {
  test('POST /api/auth/register - should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Registration successful');
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.role).toBe('student');
  });

  test('POST /api/auth/register - should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Email already registered');
  });

  test('POST /api/auth/login - should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  test('POST /api/auth/login - should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  test('GET /api/auth/me - should return current user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });
});

describe('RSVP Endpoints', () => {
  let eventId;

  beforeAll(async () => {
    const pool = await getPool();
    const [result] = await pool.query(
      "INSERT INTO events (title, description, category_id, location, event_date, organizer_id) VALUES (?, ?, 1, ?, ?, 2)",
      ['Test Event', 'Test description', 'Test Location', '2026-12-31 23:59:59']
    );
    eventId = result.insertId;
  });

  afterAll(async () => {
    const pool = await getPool();
    await pool.query("DELETE FROM rsvps WHERE event_id = ?", [eventId]);
    await pool.query("DELETE FROM events WHERE id = ?", [eventId]);
  });

  test('POST /api/events/:id/rsvp - should create RSVP', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'going' });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('RSVP created');
    expect(res.body.status).toBe('going');
  });

  test('POST /api/events/:id/rsvp - should reject duplicate RSVP', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'going' });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('RSVP already exists');
  });

  test('DELETE /api/events/:id/rsvp - should cancel RSVP', async () => {
    const res = await request(app)
      .delete(`/api/events/${eventId}/rsvp`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('RSVP cancelled');
  });

  test('GET /api/events/:id/rsvps - should require organizer/admin role', async () => {
    const res = await request(app)
      .get(`/api/events/${eventId}/rsvps`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(403);
  });
});

describe('Health Endpoint', () => {
  test('GET /health - should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});
