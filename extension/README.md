# DevMark Chrome Extension

Capture-only Chrome extension for DevMark bookmark manager.

## Features

- ✅ Manifest v3
- ✅ Capture current tab URL and title
- ✅ Mandatory note field (max 200 characters)
- ✅ Tag input (max 5 tags, case-insensitive, spaces allowed)
- ✅ Direct save to DevMark API
- ✅ API Token authentication (secure, revocable)

## Installation

### Development

1. Build the extension (or use as-is for development):
   ```bash
   # No build needed for basic version
   ```

2. Load in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `extension` directory

### Configuration

The extension expects the DevMark API to be running at `http://localhost:3000`.

To use the extension:
1. Log in to DevMark web app (http://localhost:3001)
2. Navigate to Settings or Profile
3. Generate a new API token with name "Chrome Extension"
4. Copy the generated token (you can only see it once!)
5. Click the DevMark extension icon
6. Paste your API token when prompted
7. The token will be securely stored in Chrome's local storage

## Usage

1. Navigate to any webpage you want to bookmark
2. Click the DevMark extension icon
3. The URL and title will be automatically filled
4. Add a mandatory note (max 200 characters) explaining why you're saving this
5. Optionally add up to 5 tags
6. Click "Save Bookmark"

## Files

- `manifest.json` - Extension manifest (Manifest v3)
- `popup.html` - Popup UI
- `popup.js` - Popup logic and API integration
- `icons/` - Extension icons (16x16, 48x48, 128x128)

## API Integration

The extension communicates with the DevMark API:
- Endpoint: `POST /api/bookmarks`
- Authentication: API token stored in `chrome.storage.local` and sent via `X-API-Token` header
- Required fields: `url`, `title`, `note`
- Optional field: `tags` (array, max 5)

### Security

- API tokens are hashed and stored securely on the server
- Tokens are revocable through the web interface
- Each token can be named for easy identification
- Tokens can have expiration dates (optional)

## Notes

- This is a capture-only extension - viewing and managing bookmarks is done through the web app
- The extension requires a valid API token from the DevMark web app
- All bookmark validation (note length, tag count) is enforced both client-side and server-side
- API tokens are more secure than JWTs for extensions as they can be revoked individually

## License

MIT
