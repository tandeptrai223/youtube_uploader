import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'uploads.db');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      googleId TEXT UNIQUE,
      email TEXT UNIQUE,
      name TEXT,
      avatar TEXT,
      youtubeEmail TEXT,
      youtubePassword TEXT,
      sheetsId TEXT,
      googleAccessToken TEXT,
      googleRefreshToken TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      driveLink TEXT,
      title TEXT,
      description TEXT,
      tags TEXT,
      playlist TEXT,
      thumbnail TEXT,
      publishDate DATETIME,
      status TEXT DEFAULT 'pending',
      youtubeLink TEXT,
      error TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS uploadJobs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      videoId TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      error TEXT,
      startedAt DATETIME,
      completedAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (videoId) REFERENCES videos(id)
    );

    CREATE TABLE IF NOT EXISTS sheetsIntegrations (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL UNIQUE,
      sheetsId TEXT,
      sheetName TEXT,
      lastSync DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);

  console.log('✅ Database initialized');
}

export function runQuery(sql: string, params: any[] = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  } catch (error) {
    console.error('DB Query Error:', error);
    throw error;
  }
}

export function runUpdate(sql: string, params: any[] = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  } catch (error) {
    console.error('DB Update Error:', error);
    throw error;
  }
}
