import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

export class GoogleDriveService {
  private auth: OAuth2Client;
  private drive = google.drive('v3');

  constructor(auth: OAuth2Client) {
    this.auth = auth;
  }

  extractFileId(url: string): string | null {
    const match = url.match(/[\/d=]([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }

  async downloadVideo(driveLink: string, outputPath: string): Promise<void> {
    try {
      const fileId = this.extractFileId(driveLink);
      if (!fileId) {
        throw new Error('Invalid Google Drive link');
      }

      const response = await this.drive.files.get(
        {
          auth: this.auth,
          fileId,
          fields: 'webContentLink',
        },
        { responseType: 'stream' }
      );

      if (!response.data || !response.data.webContentLink) {
        throw new Error('Cannot get download link');
      }

      const downloadUrl = response.data.webContentLink + '&export=download';

      const writer = fs.createWriteStream(outputPath);
      const download = await axios({
        method: 'get',
        url: downloadUrl,
        responseType: 'stream',
      });

      download.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Error downloading video:', error);
      throw error;
    }
  }

  async getFileInfo(fileId: string) {
    try {
      const response = await this.drive.files.get({
        auth: this.auth,
        fileId,
        fields: 'name, size, mimeType',
      });
      return response.data;
    } catch (error) {
      console.error('Error getting file info:', error);
      throw error;
    }
  }
}
