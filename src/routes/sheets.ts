import express, { Request, Response } from 'express';
import { GoogleSheetsService } from '../services/googleSheets';
import { v4 as uuid } from 'uuid';
import { runQuery, runUpdate } from '../db/init';

const router = express.Router();

const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (req.user) {
    next();
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
};

router.get('/list/:sheetsId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Placeholder - in production, use Google auth
    const sheets = [
      { properties: { sheetId: 0, title: 'Sheet1' } },
    ];
    res.json(sheets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sheets' });
  }
});

router.post('/import', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { sheetsId, sheetName } = req.body;
    const userId = (req.user as any).id;

    // Save sheets integration
    const integrationId = uuid();
    runUpdate(
      `INSERT OR REPLACE INTO sheetsIntegrations (id, userId, sheetsId, sheetName, lastSync)
       VALUES (?, ?, ?, ?, ?)`,
      [integrationId, userId, sheetsId, sheetName, new Date().toISOString()]
    );

    // In production, fetch actual data from Sheets
    // For now, return sample data
    const videos = [
      {
        id: uuid(),
        userId,
        driveLink: 'https://drive.google.com/file/d/example',
        title: 'Sample Video',
        description: 'Sample Description',
        tags: JSON.stringify(['sample', 'demo']),
        playlist: 'My Playlist',
        thumbnail: '',
        publishDate: new Date().toISOString(),
        status: 'pending',
      },
    ];

    for (const video of videos) {
      runUpdate(
        `INSERT INTO videos (id, userId, driveLink, title, description, tags, playlist, thumbnail, publishDate, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          video.id,
          video.userId,
          video.driveLink,
          video.title,
          video.description,
          video.tags,
          video.playlist,
          video.thumbnail,
          video.publishDate,
          video.status,
        ]
      );
    }

    res.json({ message: 'Videos imported successfully', count: videos.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import videos' });
  }
});

export default router;
