# Contributing to DevMark

Thank you for your interest in contributing to DevMark! This document provides guidelines and instructions for contributing.

## Project Philosophy

DevMark is an opinionated bookmark manager built for solo developers with these core principles:

1. **Quality over Quantity**: Mandatory notes force users to think about why they're saving bookmarks
2. **Simplicity**: Tags-only system, no folders or complex hierarchies
3. **Developer-First**: Built by developers, for developers
4. **Production Quality**: Real SaaS quality, not a prototype

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/devmark.git`
3. Follow the QUICKSTART.md guide to set up your development environment
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## Development Setup

```bash
# Complete setup with Docker
make setup

# Or manual setup
make docker-up      # Start PostgreSQL
make install        # Install dependencies
make migrate        # Run migrations

# Start development
make dev            # Starts both API and web servers
```

## Project Structure

```
devmark/
├── api/           # Backend REST API (Node.js + TypeScript + Fastify)
├── web/           # Frontend web app (Next.js 14 App Router)
├── extension/     # Chrome extension (Manifest v3)
├── docs/          # Additional documentation
└── tests/         # Integration tests (future)
```

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types
- Use explicit return types for functions
- No `any` types (use `unknown` if necessary)

### Backend (API)

- Follow REST conventions
- Use Prisma for database operations
- Validate all inputs
- Return appropriate HTTP status codes
- Use JWT for authentication

### Frontend (Web)

- Use Next.js App Router conventions
- Server Components by default, 'use client' only when needed
- Use Tailwind CSS for styling
- Keep components focused and reusable
- Use TypeScript interfaces for props

### Chrome Extension

- Follow Manifest v3 best practices
- Keep popup lightweight
- Use Chrome storage API for persistence
- Handle errors gracefully

## Making Changes

### API Changes

1. Update Prisma schema if needed: `api/prisma/schema.prisma`
2. Create migration: `cd api && npm run prisma:migrate`
3. Update route handlers in `api/src/routes/`
4. Update types in `api/src/types/`
5. Test manually with Prisma Studio or API client

### Web Changes

1. Update pages in `web/app/`
2. Update components in `web/components/`
3. Update API client in `web/lib/api.ts` if needed
4. Test in browser at http://localhost:3001

### Extension Changes

1. Update manifest: `extension/manifest.json`
2. Update popup: `extension/popup.html` and `extension/popup.js`
3. Reload extension in Chrome to test

## Testing

Currently, there are no automated tests. Manual testing is required:

1. Test authentication flow (register/login)
2. Test bookmark CRUD operations
3. Test validation (note length, tag count)
4. Test search and filtering
5. Test extension capture functionality

Future: Add Jest/Vitest for unit tests and Playwright for e2e tests.

## Validation Rules

When adding features, maintain these core rules:

### Notes
- **Required** for every bookmark
- Maximum 200 characters
- Validated on both client and server

### Tags
- Optional
- Maximum 5 tags per bookmark
- Case-insensitive (stored as lowercase)
- Spaces allowed in tag names
- No duplicate tags (case-insensitive check)

### Bookmarks
- URL required
- Title required
- Note required (max 200 chars)
- Tags optional (max 5)

## Documentation

- Update README.md for major features
- Update relevant README in subdirectories
- Update QUICKSTART.md if setup changes
- Add JSDoc comments for complex functions
- Update API documentation for new endpoints

## Commit Guidelines

Use clear, descriptive commit messages:

```
feat: Add bookmark import from browser
fix: Correct tag deduplication logic
docs: Update QUICKSTART guide
refactor: Simplify bookmark validation
test: Add tests for tag endpoints
```

Prefixes:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Pull Request Process

1. Update documentation for your changes
2. Test your changes thoroughly
3. Create a pull request with:
   - Clear title and description
   - List of changes
   - Screenshots for UI changes
   - Testing steps
4. Link any related issues
5. Wait for review and address feedback

## Feature Ideas

Interested in contributing but not sure what to work on? Here are some ideas:

### High Priority
- [ ] Import bookmarks from browser
- [ ] Export bookmarks (JSON, CSV)
- [ ] Full-text search
- [ ] Dark mode
- [ ] Email verification
- [ ] Password reset

### Medium Priority
- [ ] Bookmark collections/folders (opt-in)
- [ ] Archive functionality
- [ ] Keyboard shortcuts
- [ ] Bulk operations
- [ ] API rate limiting
- [ ] Bookmark preview/screenshots

### Low Priority
- [ ] Firefox extension
- [ ] Safari extension
- [ ] Mobile app (React Native)
- [ ] Browser bookmarks sync
- [ ] Social sharing (optional)
- [ ] Bookmark statistics

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Check existing issues before creating new ones

## License

By contributing to DevMark, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
