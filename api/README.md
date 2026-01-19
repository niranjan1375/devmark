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

- ✅ REST API (V1 & V2)
- ✅ Token-based authentication (JWT for web, API tokens for extensions)
- ✅ Workspace-based data model (each user has a personal workspace)
- ✅ Mandatory note field (max 200 characters) for every bookmark
- ✅ Tags-only system (no folders)
- ✅ Max 5 tags per bookmark
- ✅ Case-insensitive tags with spaces allowed
- ✅ Workspace-scoped tags (unique per workspace)
- ✅ Personal API tokens (revocable, hashed)

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

All bookmark endpoints require authentication:
- **JWT:** `Authorization: Bearer <jwt_token>` (for web app)
- **API Token:** `X-API-Token: <api_token>` (for extensions)

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

### API Tokens

#### Generate API Token
```
POST /api/tokens
Headers: Authorization: Bearer <jwt_token>
Body: { name: "Chrome Extension" }
Response: { id, name, token, createdAt, expiresAt, message }
```

**Important:** The `token` field is only shown once. Save it securely!

#### List API Tokens
```
GET /api/tokens
Headers: Authorization: Bearer <jwt_token>
Response: [{ id, name, lastUsedAt, createdAt, expiresAt }]
```

Returns all non-revoked tokens for the user (without token values).

#### Revoke API Token
```
DELETE /api/tokens/:id
Headers: Authorization: Bearer <jwt_token>
Response: 204 No Content
```

### V2 Workspace API

See [V2_MIGRATION_GUIDE.md](../V2_MIGRATION_GUIDE.md) for complete V2 API documentation.

Quick reference:
- `GET /api/v2/workspaces` - Get user's workspaces
- `GET /api/v2/workspaces/:id/bookmarks` - Get workspace bookmarks
- `GET /api/v2/workspaces/:id/tags` - Get workspace tags

## Database Schema

### User
- id (uuid)
- email (unique)
- password (hashed)
- name (optional)
- personalWorkspace (one-to-one with Workspace)
- apiTokens (one-to-many with ApiToken)
- createdAt
- updatedAt

### Workspace
- id (uuid)
- name
- isPersonal (boolean, default true)
- userId (foreign key, unique)
- bookmarks (one-to-many)
- tags (one-to-many)
- createdAt
- updatedAt

### Bookmark
- id (uuid)
- url
- title
- note (required, max 200 chars)
- workspaceId (foreign key)
- tags (many-to-many with Tag)
- createdAt
- updatedAt

### Tag
- id (uuid)
- name (lowercase)
- workspaceId (foreign key)
- bookmarks (many-to-many with Bookmark)
- createdAt
- **Unique constraint:** (name, workspaceId) - tags are unique per workspace

### ApiToken
- id (uuid)
- name (user-friendly name)
- token (hashed)
- userId (foreign key)
- lastUsedAt
- createdAt
- expiresAt (optional)
- revokedAt (optional)

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
