# DevMark

Production-grade bookmark manager for developers. Every bookmark requires a mandatory note explaining why it was saved.

## Overview

DevMark is a modern bookmark manager built specifically for developers who want to maintain context about why they saved each bookmark. It enforces quality over quantity with mandatory notes and a clean tag-based organization system.

## Architecture

This monorepo contains three separate applications:

- **`api/`** - Backend REST API (Node.js + TypeScript + Fastify + Postgres + Prisma)
- **`web/`** - Frontend web application (Next.js 14 with App Router)
- **`extension/`** - Chrome extension for bookmark capture (Manifest v3)

## Core Features

### Mandatory Notes
- Every bookmark **must** have a note (max 200 characters)
- Forces you to think about why you're saving something
- No more forgotten bookmarks without context

### Tags-Only Organization
- No folders - just tags
- Max 5 tags per bookmark
- Case-insensitive tags with spaces allowed
- Clean, flexible organization

### Solo Developer Focus
- Built for individual developers
- Production SaaS quality
- No team features or collaboration (V1)

## Tech Stack

### Backend (`api/`)
- Node.js + TypeScript
- Fastify (web framework)
- PostgreSQL (database)
- Prisma (ORM)
- JWT (authentication)
- bcrypt (password hashing)

### Frontend (`web/`)
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- React hooks for state management

### Extension (`extension/`)
- Chrome Extension Manifest v3
- Vanilla JavaScript
- Capture-only functionality

## Quick Start

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- Chrome browser (for extension)

### 1. Setup Backend API

```bash
cd api
npm install

# Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Generate Prisma client and run migrations
npm run prisma:generate
npm run prisma:migrate

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

### 2. Setup Frontend

```bash
cd web
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local with your API URL (default: http://localhost:3000)

# Start development server
npm run dev
```

The web app will be available at `http://localhost:3001`

### 3. Setup Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension/` directory
5. The extension icon will appear in your Chrome toolbar

**Note:** The extension requires you to be logged in to the web app first to obtain an authentication token.

## Usage

### Web Application

1. **Register/Login**: Create an account or log in at http://localhost:3001
2. **Create Bookmarks**: Click "New Bookmark" and fill in:
   - URL (required)
   - Title (required)
   - Note (required, max 200 chars) - explain why you're saving this
   - Tags (optional, max 5)
3. **Browse Bookmarks**: View all your bookmarks on the main page
4. **Search & Filter**: Use the search bar or click tags to filter
5. **Edit/Delete**: Manage your bookmarks from the card actions

### Chrome Extension

1. Navigate to any webpage you want to bookmark
2. Click the DevMark extension icon
3. URL and title are auto-filled from the current tab
4. Add your mandatory note (max 200 chars)
5. Optionally add up to 5 tags
6. Click "Save Bookmark"

The bookmark will be saved to your account and visible in the web app.

## API Endpoints

See `api/README.md` for complete API documentation.

Key endpoints:
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/bookmarks` - List bookmarks
- `POST /api/bookmarks` - Create bookmark
- `GET /api/tags` - List tags

All bookmark endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## Development

### API Development

```bash
cd api
npm run dev          # Start with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:studio # Open Prisma Studio (DB GUI)
```

### Web Development

```bash
cd web
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
```

### Database Migrations

```bash
cd api
npm run prisma:migrate     # Create and apply migration
npm run prisma:generate    # Regenerate Prisma client
```

## Production Deployment

### Backend
1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npm run prisma:migrate`
4. Build: `npm run build`
5. Start: `npm start`

### Frontend
1. Configure `NEXT_PUBLIC_API_URL` to point to production API
2. Build: `npm run build`
3. Deploy to Vercel, Netlify, or any Node.js hosting

### Extension
1. Generate PNG icons from SVG (see `extension/icons/create-icons.sh`)
2. Update API URL in `popup.js` to production URL
3. Package extension for Chrome Web Store
4. Submit for review

## Project Structure

```
devmark/
├── api/                    # Backend API
│   ├── prisma/            # Database schema and migrations
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── plugins/       # Fastify plugins
│   │   ├── utils/         # Utilities
│   │   └── types/         # TypeScript types
│   └── package.json
├── web/                    # Frontend web app
│   ├── app/               # Next.js app directory
│   │   ├── auth/         # Auth pages
│   │   ├── bookmarks/    # Bookmark pages
│   │   └── page.tsx      # Home page
│   ├── components/        # React components
│   ├── lib/              # Libraries and utilities
│   └── package.json
├── extension/             # Chrome extension
│   ├── manifest.json     # Extension manifest
│   ├── popup.html        # Extension popup UI
│   ├── popup.js          # Extension logic
│   └── icons/            # Extension icons
└── README.md             # This file
```

## Validation Rules

### Notes
- Required for every bookmark
- Maximum 200 characters
- Validated on both client and server

### Tags
- Optional
- Maximum 5 tags per bookmark
- Case-insensitive (stored as lowercase)
- Spaces allowed in tag names
- Duplicates not allowed (case-insensitive check)

### Bookmarks
- URL required
- Title required
- Note required (max 200 chars)
- Tags optional (max 5)

## Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- CORS enabled for cross-origin requests
- Input validation on all endpoints
- SQL injection protection via Prisma

## Roadmap (Future)

- [ ] Import bookmarks from browser
- [ ] Export bookmarks
- [ ] Dark mode
- [ ] Bookmark collections
- [ ] Full-text search
- [ ] Archive functionality
- [ ] Browser extension for Firefox
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Email verification
- [ ] Password reset

## License

MIT

## Contributing

This is an indie-hacker MVP. Contributions welcome but expect opinionated decisions focused on solo developer use cases.
