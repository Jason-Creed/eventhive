-- Seed categories
INSERT IGNORE INTO categories (name) VALUES
  ('Academic'),
  ('Social'),
  ('Sports'),
  ('Career'),
  ('Workshop'),
  ('Music'),
  ('Volunteer');

-- Seed users (passwords are hashed versions of 'password123')
-- admin@eventhive.com / password123 (admin)
-- organizer@eventhive.com / password123 (organizer)
-- student@eventhive.com / password123 (student)

INSERT IGNORE INTO users (name, email, password_hash, role) VALUES
  ('Admin User', 'admin@eventhive.com', '$2b$10$SOLWuHrEh44enfVxiMSD6.8zpiPxmB593ImXd30TErpQAXyuKcIBO', 'admin'),
  ('Organizer User', 'organizer@eventhive.com', '$2b$10$SOLWuHrEh44enfVxiMSD6.8zpiPxmB593ImXd30TErpQAXyuKcIBO', 'organizer'),
  ('Student User', 'student@eventhive.com', '$2b$10$SOLWuHrEh44enfVxiMSD6.8zpiPxmB593ImXd30TErpQAXyuKcIBO', 'student');

-- Seed sample events
INSERT IGNORE INTO events (title, description, category_id, location, event_date, capacity, organizer_id, status) VALUES
  (
    'Welcome Week Mixer',
    'Join us for the annual Welcome Week Mixer! Meet new friends, enjoy free food, and kick off the semester right.',
    2,
    'Student Union Ballroom',
    '2026-09-05 18:00:00',
    200,
    2,
    'active'
  ),
  (
    'Resume Building Workshop',
    'Learn how to craft a standout resume with tips from career services professionals.',
    4,
    'Career Center, Room 201',
    '2026-09-10 14:00:00',
    50,
    2,
    'active'
  ),
  (
    'Intramural Soccer Tournament',
    'Sign up your team for the fall intramural soccer tournament. All skill levels welcome!',
    3,
    'Athletic Field A',
    '2026-09-15 16:00:00',
    80,
    2,
    'active'
  ),
  (
    'AI in Healthcare Seminar',
    'Explore the latest advances in artificial intelligence applications in modern healthcare.',
    1,
    'Science Building, Auditorium 3',
    '2026-09-20 13:00:00',
    150,
    2,
    'active'
  ),
  (
    'Open Mic Night',
    'Show off your talent or just come to enjoy the show. Sign-ups start at 7 PM.',
    6,
    'Campus Cafe',
    '2026-09-25 19:00:00',
    100,
    2,
    'active'
  );
