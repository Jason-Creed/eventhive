# EventHive

EventHive is a campus event management system and cloud-native web application built for a university capstone project (CSBC 252: Introduction to Cloud Computing). It centralizes event discovery, creation, and RSVP tracking for students and organizers, replacing scattered WhatsApp groups and posters with a unified platform.

## Features

- **Student**: Browse/search events, view details, RSVP (going/interested), view RSVP history
- **Organizer**: Create/edit/delete events, upload banner images, view RSVP counts and attendee lists
- **Admin**: View/manage all users and events, deactivate events or users
- **Cloud-Ready**: Deployable on AWS Free Tier with structured logging, health checks, and infrastructure as code

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │───▶│   EC2/ALB   │───▶│  Node.js    │
│ (React SPA) │    │ (Frontend)  │    │  Express    │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                              │
                                              ▼
                                       ┌───────────┐
                                       │   RDS     │
                                       │  MySQL    │
                                       └───────────┘
                                              │
                                              ▼
                                       ┌───────────┐
                                       │    S3     │
                                       │ (Banners) │
                                       └───────────┘
```

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Node.js + Express (REST API) |
| Database | MySQL on Amazon RDS |
| Frontend | React (Vite) |
| Auth | JWT + bcrypt |
| File Uploads | Multer → Amazon S3 |
| Logging | Winston (structured JSON logs) |
| Process Manager | PM2 |
| Monitoring | CloudWatch Logs + Metrics |

## Local Setup

### Prerequisites

- Node.js 18+
- MySQL 8.0+ (or Docker)
- npm or yarn

### Backend Setup

```bash
cd backend
cp .env.example .env
npm install

# Start MySQL (Docker)
docker run --name eventhive-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=eventhive_db -e MYSQL_USER=eventhive_user -e MYSQL_PASSWORD=eventhive_password -p 3306:3306 mysql:8.0

# Run migrations
npm run migrate

# Seed sample data
npm run seed

# Start dev server
npm run dev
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Environment Variables

See `backend/.env.example` and `frontend/.env.example` for required variables.

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Get current user

### Events
- `GET /api/events` — List events (with filters: category, search, date range)
- `GET /api/events/:id` — Get event details
- `POST /api/events` — Create event (organizer/admin)
- `PUT /api/events/:id` — Update event (owner/admin)
- `DELETE /api/events/:id` — Delete event (owner/admin)

### RSVPs
- `POST /api/events/:id/rsvp` — Create RSVP
- `DELETE /api/events/:id/rsvp` — Cancel RSVP
- `GET /api/events/:id/rsvps` — Get event RSVPs (organizer/admin)
- `GET /api/events/my-rsvps` — Get my RSVPs

### Users
- `GET /api/users` — Get all users (admin)
- `PUT /api/users/:id/status` — Update user status (admin)

### Health
- `GET /health` — Health check endpoint

## Database Schema

- `users` — User accounts with role-based access (student/organizer/admin)
- `categories` — Event categories (Academic, Social, Sports, etc.)
- `events` — Event details with S3 banner URLs
- `rsvps` — User RSVP records with unique constraint on (event_id, user_id)

## AWS Deployment

See `infra/` directory for deployment scripts and documentation.

### Infrastructure Files

| File | Description |
|------|-------------|
| `infra/iam-policy.json` | IAM policy for EC2 role (S3 + RDS access) |
| `infra/ec2-setup.sh` | EC2 instance setup script (Node.js, PM2, app deploy) |
| `infra/security-groups.md` | Security group rules documentation |
| `infra/cloudwatch-setup.md` | CloudWatch agent setup guide |

### Quick Deploy Steps

1. **RDS**: Create MySQL instance, note endpoint, create `eventhive_db`
2. **S3**: Create bucket `eventhive-event-banners` (append random suffix if needed)
3. **EC2**: Launch t2.micro instance, attach IAM role with `infra/iam-policy.json`
4. **Security Groups**: Configure as per `infra/security-groups.md`
5. **App**: Run `infra/ec2-setup.sh` on EC2, configure `.env`, run migrations and seeds

## Security

- Passwords hashed with bcrypt (salt rounds: 12)
- All secrets via environment variables (.env in .gitignore)
- Parameterized SQL queries (mysql2 prepared statements) — no SQL injection
- File upload validation: image mime types only, 5MB limit
- CORS restricted to deployed frontend origin
- Rate limiting on auth endpoints (5 attempts per 15 minutes)
- Helmet.js for security headers
- S3 bucket private by default; objects served via presigned URLs
- RDS not publicly accessible; SSL enabled in production
- IAM least-privilege policy scoped to single S3 bucket and RDS

## Testing

```bash
cd backend
npm test
```

Tests cover auth (register, login, token validation) and RSVP endpoints with JWT authentication.

## License

MIT — Built for CSBC 252 Capstone Project
