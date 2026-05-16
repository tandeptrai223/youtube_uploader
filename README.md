# YouTube Sheets Uploader

Auto-upload YouTube videos from Google Sheets with scheduling support.

## Features

✅ Google OAuth authentication
✅ Import videos from Google Sheets
✅ Auto-download from Google Drive
✅ Auto-upload to YouTube
✅ Schedule uploads by date/time
✅ Track upload status
✅ Beautiful React dashboard

## Prerequisites

- Node.js 16+
- npm or yarn
- Google Cloud Console account
- YouTube channel

## Installation

```bash
npm run install-all
```

## Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable APIs:
   - Google Sheets API
   - Google Drive API
   - Google+ API
4. Create OAuth 2.0 Desktop credentials
5. Copy Client ID and Secret

## Configuration

```bash
cp .env.example .env
```

Fill in your credentials:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
YOUTUBE_EMAIL=your_email@gmail.com
YOUTUBE_PASSWORD=your_app_password
SESSION_SECRET=random_secret_key
```

## Running

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

Open http://localhost:3000

## Google Sheets Format

Create a sheet with these columns:
- A: Google Drive Link (video file)
- B: Title
- C: Description
- D: Tags (comma-separated)
- E: Playlist Name
- F: Thumbnail URL
- G: Publish Date (YYYY-MM-DD HH:mm)

## Usage

1. Sign in with Google
2. Connect your YouTube account
3. Select your Google Sheet
4. Import videos
5. Set publish dates
6. Let the app auto-upload!

## License

MIT
