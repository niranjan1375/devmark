# DevMark Web Application

Frontend web application for DevMark bookmark manager built with Next.js 14 App Router.

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management

## Features

- ✅ User authentication (register/login)
- ✅ Create, read, update, delete bookmarks
- ✅ Mandatory note field (max 200 characters)
- ✅ Tag management (max 5 per bookmark)
- ✅ Search and filter bookmarks
- ✅ Tag-based filtering
- ✅ Responsive design

## Setup

### Prerequisites

- Node.js 18 or higher
- DevMark API running (see `../api/README.md`)

### Installation

```bash
npm install
```

### Configuration

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

This should point to your DevMark API server.

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser.

The default port is 3001 to avoid conflicts with the API running on port 3000.

### Production Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Project Structure

```
web/
├── app/                    # Next.js app directory (App Router)
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   └── register/      # Register page
│   ├── bookmarks/         # Bookmark pages
│   │   ├── new/          # Create bookmark
│   │   └── page.tsx      # List bookmarks
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── page.tsx           # Home/landing page
├── components/            # React components
│   ├── BookmarkCard.tsx  # Bookmark display card
│   └── BookmarkForm.tsx  # Bookmark create/edit form
├── lib/                   # Libraries and utilities
│   ├── api.ts            # API client
│   └── auth.tsx          # Auth context and hooks
├── types/                 # TypeScript type definitions
│   └── index.ts          # Shared types
└── public/               # Static assets
```

## Key Components

### Authentication

The app uses a React context (`AuthProvider`) to manage authentication state globally:

```tsx
import { useAuth } from '@/lib/auth';

function MyComponent() {
  const { user, login, logout } = useAuth();
  // ...
}
```

### API Client

All API calls go through the centralized API client in `lib/api.ts`:

```tsx
import { api } from '@/lib/api';

// Get bookmarks
const bookmarks = await api.getBookmarks();

// Create bookmark
await api.createBookmark({
  url: 'https://example.com',
  title: 'Example',
  note: 'This is why I saved it',
  tags: ['example', 'demo']
});
```

### Validation

Client-side validation is implemented in the `BookmarkForm` component:
- Note: required, max 200 characters
- Tags: max 5, no duplicates (case-insensitive)
- URL and title: required

Server-side validation is also enforced by the API.

## Pages

### Home (`/`)
- Landing page with feature overview
- Redirects to `/bookmarks` if logged in
- Links to login/register

### Login (`/auth/login`)
- Email/password login form
- Redirects to `/bookmarks` on success

### Register (`/auth/register`)
- User registration form
- Optional name field
- Redirects to `/bookmarks` on success

### Bookmarks List (`/bookmarks`)
- Protected route (requires authentication)
- Displays all bookmarks
- Search and filter functionality
- Tag-based filtering
- Links to create/edit/delete

### New Bookmark (`/bookmarks/new`)
- Protected route
- Form to create new bookmark
- Mandatory note field with character counter
- Tag input with max 5 tags

## Styling

This project uses Tailwind CSS for styling. The configuration is in `tailwind.config.ts`.

Key design principles:
- Clean, minimal interface
- Focus on content (bookmarks)
- Clear visual hierarchy
- Responsive design (mobile-first)

## Authentication Flow

1. User registers or logs in
2. API returns JWT token
3. Token stored in localStorage
4. Token included in all API requests via Authorization header
5. AuthProvider checks token on mount
6. Protected routes redirect to login if not authenticated

## Development Notes

### Running with API

Make sure the API server is running before starting the web app:

```bash
# Terminal 1 - API
cd ../api
npm run dev

# Terminal 2 - Web
cd ../web
npm run dev
```

### CORS

The API has CORS enabled to allow requests from the web app during development.

### Type Safety

All API responses and inputs are typed using TypeScript interfaces in `types/index.ts`.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set `NEXT_PUBLIC_API_URL` environment variable
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Node.js:
- Netlify
- AWS Amplify
- Railway
- Render
- Self-hosted with PM2

Make sure to:
1. Set the `NEXT_PUBLIC_API_URL` environment variable
2. Run `npm run build` before starting
3. Ensure the API is accessible from the deployment

## License

MIT
