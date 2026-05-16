import express, { Request, Response } from 'express';
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

router.get('/list', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const videos = runQuery('SELECT * FROM videos WHERE userId = ? ORDER BY createdAt DESC', [userId]);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

router.post('/create', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { driveLink, title, description, tags, playlist, thumbnail, publishDate } = req.body;

    const videoId = uuid();
    runUpdate(
      `INSERT INTO videos (id, userId, driveLink, title, description, tags, playlist, thumbnail, publishDate, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [videoId, userId, driveLink, title, description, JSON.stringify(tags), playlist, thumbnail, publishDate, 'pending']
    );

    const video = runQuery('SELECT * FROM videos WHERE id = ?', [videoId]);
    res.json(video[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create video' });
  }
});

router.post('/upload/:videoId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const userId = (req.user as any).id;

    runUpdate('UPDATE videos SET status = ? WHERE id = ? AND userId = ?', ['processing', videoId, userId]);

    res.json({ message: 'Upload started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start upload' });
  }
});

router.delete('/:videoId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const userId = (req.user as any).id;

    runUpdate('DELETE FROM videos WHERE id = ? AND userId = ?', [videoId, userId]);

    res.json({ message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

export default router;
