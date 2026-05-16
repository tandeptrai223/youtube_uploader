import cron from 'node-cron';
import { db, runQuery, runUpdate } from '../db/init';

export class SchedulerService {
  async scheduleUpload(videoId: string, publishDate: string) {
    try {
      const date = new Date(publishDate);
      const cronExpression = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${
        date.getMonth() + 1
      } *`;

      console.log(`Scheduled video ${videoId} for ${publishDate}`);
      
      await runUpdate(
        'UPDATE videos SET status = ? WHERE id = ?',
        ['scheduled', videoId]
      );
    } catch (error) {
      console.error('Error scheduling upload:', error);
      throw error;
    }
  }

  async uploadNow(videoId: string) {
    try {
      const videoData = await runQuery(
        'SELECT * FROM videos WHERE id = ?',
        [videoId]
      );

      if (!videoData || videoData.length === 0) {
        throw new Error('Video not found');
      }

      await runUpdate(
        'UPDATE videos SET status = ? WHERE id = ?',
        ['processing', videoId]
      );

      console.log(`Started upload for video ${videoId}`);
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  }
}
