# DevMark V2 Migration Guide

This document describes the V2 data model refactoring and API changes for DevMark.

## What Changed?

### 1. Workspace-Based Data Model

**Before (V1):**
- Bookmarks were owned by `userId`
- Tags were global (unique across all users)

**After (V2):**
- **Every user has a personal workspace** (created automatically on registration)
- **Bookmarks are owned by `workspaceId`** (not `userId`)
- **Tags are scoped per workspace** (unique per workspace, not global)
  - Multiple workspaces can have the same tag name
  - Tags are automatically created per workspace

### 2. API Token Authentication

**New Feature:**
- **API tokens** for Chrome extension and other integrations
- Tokens are hashed and stored securely
- Tokens are revocable through the API
- Each token has a user-friendly name (e.g., "Chrome Extension", "Mobile App")

**Web app continues to use JWT**, extension uses API tokens.

## API Endpoints

### V1 Endpoints (Backward Compatible)

These endpoints continue to work exactly as before, but internally use workspaces:

#### Authentication (No changes)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

#### Bookmarks (No changes in request/response)
- `GET /api/bookmarks` - Get all bookmarks for authenticated user
- `GET /api/bookmarks/:id` - Get single bookmark
- `POST /api/bookmarks` - Create bookmark
- `PUT /api/bookmarks/:id` - Update bookmark
- `DELETE /api/bookmarks/:id` - Delete bookmark
- `GET /api/bookmarks/search?tag=...&search=...` - Search bookmarks

#### Tags (No changes)
- `GET /api/tags` - Get all tags with usage count

### V2 Endpoints (New)

These are workspace-aware endpoints for future features:

#### Workspaces
- `GET /api/v2/workspaces` - Get user's workspaces
- `GET /api/v2/workspaces/:id` - Get specific workspace
- `PUT /api/v2/workspaces/:id` - Update workspace name
- `GET /api/v2/workspaces/:id/stats` - Get workspace stats

#### Workspace Bookmarks
- `GET /api/v2/workspaces/:workspaceId/bookmarks` - Get workspace bookmarks
- `GET /api/v2/workspaces/:workspaceId/bookmarks/:id` - Get single bookmark
- `POST /api/v2/workspaces/:workspaceId/bookmarks` - Create bookmark in workspace
- `GET /api/v2/workspaces/:workspaceId/bookmarks/search` - Search in workspace

#### Workspace Tags
- `GET /api/v2/workspaces/:workspaceId/tags` - Get workspace tags
- `GET /api/v2/workspaces/:workspaceId/tags/:tagName/bookmarks` - Get bookmarks by tag

### API Token Management

- `POST /api/tokens` - Generate new API token (JWT auth required)
  ```json
  {
    "name": "Chrome Extension"
  }
  ```
  Response:
  ```json
  {
    "id": "token-id",
    "name": "Chrome Extension",
    "token": "raw-token-value", // Only shown once!
    "createdAt": "2026-01-19T05:24:51.973Z",
    "expiresAt": null,
    "message": "Save this token securely. You won't be able to see it again."
  }
  ```

- `GET /api/tokens` - List user's API tokens (JWT auth required)
- `DELETE /api/tokens/:id` - Revoke API token (JWT auth required)

## Authentication

### For Web App (No Change)
Use JWT tokens as before:
```javascript
fetch('/api/bookmarks', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
})
```

### For Extensions/Integrations (New)
Use API tokens via `X-API-Token` header:
```javascript
fetch('/api/bookmarks', {
  headers: {
    'X-API-Token': apiToken
  }
})
```

**Note:** The flexible authentication middleware accepts both JWT and API tokens on all bookmark/tag endpoints.

## Database Schema

### New Tables

#### `workspaces`
```sql
CREATE TABLE "workspaces" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isPersonal" BOOLEAN DEFAULT true,
    "userId" TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
```

#### `api_tokens`
```sql
CREATE TABLE "api_tokens" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "token" TEXT UNIQUE NOT NULL, -- Hashed
    "userId" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3)
);
```

### Modified Tables

#### `bookmarks`
- **Removed:** `userId` column
- **Added:** `workspaceId` column (foreign key to `workspaces`)

#### `tags`
- **Removed:** Global unique constraint on `name`
- **Added:** `workspaceId` column (foreign key to `workspaces`)
- **Added:** Composite unique constraint on `(name, workspaceId)`

## Migration Guide

### For Existing Users
1. On first login after migration, their personal workspace is automatically created
2. All existing bookmarks are migrated to their personal workspace
3. All tags used in their bookmarks are copied to their workspace

### For Web Frontend
**No changes required!** The V1 API endpoints work exactly as before.

**Optional enhancements:**
1. Add UI to manage API tokens (Settings page)
   - List tokens with creation date and last used
   - Generate new token with name
   - Revoke/delete tokens
2. Show workspace name in UI (currently just "Your Workspace")
3. Add workspace stats to dashboard (using V2 API)

### For Extension
Extension has been updated to use API tokens. Users need to:
1. Login to web app
2. Generate an API token
3. Paste token in extension popup

## Benefits of V2

1. **Better Security:** API tokens are revocable without invalidating user sessions
2. **Scalability:** Foundation for future team/shared workspace features
3. **Data Isolation:** Tags are properly scoped per workspace
4. **Backward Compatible:** Existing web app continues to work without changes

## Testing

All endpoints have been tested:
- ✅ User registration creates workspace automatically
- ✅ V1 API with JWT authentication (web app)
- ✅ V1 API with API token authentication (extension)
- ✅ V2 workspace endpoints
- ✅ Tag workspace scoping
- ✅ Bookmark workspace ownership

## Future Enhancements (V3)

The workspace model enables:
- Team workspaces (sharing bookmarks with others)
- Workspace-level permissions
- Multiple workspaces per user
- Workspace templates
- Public/private workspaces
