# DevMark API

Backend API for DevMark - Production-grade bookmark manager for developers.

## Tech Stack

- **Node.js** with **TypeScript**
- **Fastify** - Fast and low overhead web framework
- **PostgreSQL** - Database
- **Prisma** - Type-safe ORM
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing

## Core Features

- ✅ REST API
- ✅ Token-based authentication
- ✅ Mandatory note field (max 200 characters) for every bookmark
- ✅ Tags-only system (no folders)
- ✅ Max 5 tags per bookmark
- ✅ Case-insensitive tags with spaces allowed
- ✅ Solo user support

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `NODE_ENV` - Environment (development/production)

### Database Setup

Generate Prisma client:
```bash
npm run prisma:generate
```

Run migrations:
```bash
npm run prisma:migrate
```

### Development

Start development server with hot reload:
```bash
npm run dev
```

### Production

Build:
```bash
npm run build
```

Start:
```bash
npm start
```

## API Endpoints

### Authentication

#### Register
```
POST /api/auth/register
Body: { email, password, name? }
Response: { token, user }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { token, user }
```

#### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { id, email, name, createdAt }
```

### Bookmarks

All bookmark endpoints require authentication (`Authorization: Bearer <token>`).

#### Get All Bookmarks
```
GET /api/bookmarks
Response: [{ id, url, title, note, tags[], createdAt, updatedAt }]
```

#### Get Single Bookmark
```
GET /api/bookmarks/:id
Response: { id, url, title, note, tags[], createdAt, updatedAt }
```

#### Create Bookmark
```
POST /api/bookmarks
Body: { url, title, note, tags[] }
Response: { id, url, title, note, tags[], createdAt, updatedAt }

Validations:
- url: required
- title: required
- note: required, max 200 characters
- tags: optional, max 5 tags, case-insensitive
```

#### Update Bookmark
```
PUT /api/bookmarks/:id
Body: { url?, title?, note?, tags[]? }
Response: { id, url, title, note, tags[], createdAt, updatedAt }
```

#### Delete Bookmark
```
DELETE /api/bookmarks/:id
Response: 204 No Content
```

#### Search Bookmarks
```
GET /api/bookmarks/search?tag=<tag>&search=<query>
Response: [{ id, url, title, note, tags[], createdAt, updatedAt }]
```

### Tags

#### Get All Tags
```
GET /api/tags
Headers: Authorization: Bearer <token>
Response: [{ id, name, count }]
```

Returns all unique tags from user's bookmarks with usage count.

## Database Schema

### User
- id (uuid)
- email (unique)
- password (hashed)
- name (optional)
- createdAt
- updatedAt

### Bookmark
- id (uuid)
- url
- title
- note (required, max 200 chars)
- userId (foreign key)
- tags (many-to-many with Tag)
- createdAt
- updatedAt

### Tag
- id (uuid)
- name (unique, lowercase)
- bookmarks (many-to-many with Bookmark)
- createdAt

## Development Tools

### Prisma Studio

Open Prisma Studio to browse and edit data:
```bash
npm run prisma:studio
```

## Testing

```bash
npm test
```

## License

MIT
