# DevMark Quick Start Guide

This guide will help you set up and run DevMark locally in under 10 minutes.

## Prerequisites

- Node.js 18 or higher
- PostgreSQL (or Docker to run it)
- Chrome browser (for extension)

## Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/niranjan1375/devmark.git
cd devmark
```

## Step 2: Database Setup

### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL with docker-compose
docker-compose up -d

# Your database is now running on localhost:5432
# Connection details:
#   - Database: devmark
#   - User: devmark
#   - Password: devmark123
```

### Option B: Using Existing PostgreSQL

Make sure PostgreSQL is running and create a database:

```sql
CREATE DATABASE devmark;
```

## Step 3: Backend API Setup

```bash
cd api

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env and set your DATABASE_URL
# For Docker setup, use:
# DATABASE_URL="postgresql://devmark:devmark123@localhost:5432/devmark?schema=public"

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start the API server
npm run dev
```

The API will be running at `http://localhost:3000`

## Step 4: Frontend Web Setup

Open a new terminal:

```bash
cd web

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# The default API URL (http://localhost:3000) should work
# Edit .env.local if you need to change it

# Start the web server
npm run dev
```

The web app will be running at `http://localhost:3001`

## Step 5: Create Your Account

1. Open http://localhost:3001 in your browser
2. Click "Register"
3. Enter your email, password, and optional name
4. Click "Register"
5. You'll be redirected to your bookmarks page

## Step 6: Create Your First Bookmark

1. Click "New Bookmark"
2. Fill in:
   - URL: Any valid URL
   - Title: A descriptive title
   - Note: **Required** - Explain why you're saving this (max 200 chars)
   - Tags: Optional, up to 5 tags
3. Click "Create Bookmark"

## Step 7: Install Chrome Extension (Optional)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Navigate to and select the `extension/` directory
5. The DevMark icon will appear in your toolbar

### Using the Extension

1. Navigate to any webpage
2. Click the DevMark extension icon
3. The URL and title will be auto-filled
4. Add your mandatory note
5. Add tags (optional)
6. Click "Save Bookmark"

The bookmark will appear in your web app immediately.

## Troubleshooting

### API won't start

- Check that PostgreSQL is running: `docker ps` or `psql -U devmark -d devmark`
- Check that DATABASE_URL in `api/.env` is correct
- Check that migrations ran: `cd api && npm run prisma:migrate`

### Web app can't connect to API

- Check that API is running on port 3000
- Check `web/.env.local` has correct NEXT_PUBLIC_API_URL
- Check browser console for CORS errors

### Extension won't save bookmarks

- Make sure you're logged in to the web app first
- Check that API URL in `extension/popup.js` is correct (default: http://localhost:3000)
- Check browser console in the extension popup for errors

### Database migration errors

```bash
cd api

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --name init
```

## Next Steps

### Explore Features

- Try searching bookmarks
- Filter by tags
- Edit and delete bookmarks
- Use the Chrome extension to capture pages quickly

### Development

- API: `cd api && npm run dev` (hot reload with tsx)
- Web: `cd web && npm run dev` (Next.js dev server)
- Database GUI: `cd api && npm run prisma:studio`

### Production Deployment

See the main README.md for production deployment instructions.

## Key Features to Remember

1. **Every bookmark needs a note** - max 200 characters
2. **Tags only, no folders** - max 5 tags per bookmark
3. **Case-insensitive tags** - "JavaScript" and "javascript" are the same
4. **Spaces allowed in tags** - "web dev" is a valid tag

## Getting Help

- Check the API documentation: `api/README.md`
- Check the web app documentation: `web/README.md`
- Check the extension documentation: `extension/README.md`
- Open an issue on GitHub

## Database Schema

```
User
  - id (uuid)
  - email (unique)
  - password (hashed)
  - name (optional)

Bookmark
  - id (uuid)
  - url
  - title
  - note (required, max 200 chars)
  - userId
  - tags (many-to-many)

Tag
  - id (uuid)
  - name (unique, lowercase)
  - bookmarks (many-to-many)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Bookmarks (requires auth)
- `GET /api/bookmarks` - List all bookmarks
- `POST /api/bookmarks` - Create bookmark
- `GET /api/bookmarks/:id` - Get single bookmark
- `PUT /api/bookmarks/:id` - Update bookmark
- `DELETE /api/bookmarks/:id` - Delete bookmark
- `GET /api/bookmarks/search?tag=<tag>&search=<query>` - Search bookmarks

### Tags (requires auth)
- `GET /api/tags` - List all tags with usage count

All authenticated endpoints require `Authorization: Bearer <token>` header.

## Success!

You should now have DevMark running locally. Start saving bookmarks with meaningful notes! 🎉
