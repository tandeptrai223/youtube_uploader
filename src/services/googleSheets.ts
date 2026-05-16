import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleSheetsService {
  private auth: OAuth2Client;
  private sheets = google.sheets('v4');

  constructor(auth: OAuth2Client) {
    this.auth = auth;
  }

  async getSheets(spreadsheetId: string) {
    try {
      const response = await this.sheets.spreadsheets.get({
        auth: this.auth,
        spreadsheetId,
      });
      return response.data.sheets || [];
    } catch (error) {
      console.error('Error fetching sheets:', error);
      throw error;
    }
  }

  async readSheet(spreadsheetId: string, range: string) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        auth: this.auth,
        spreadsheetId,
        range,
      });
      return response.data.values || [];
    } catch (error) {
      console.error('Error reading sheet:', error);
      throw error;
    }
  }

  async updateCell(spreadsheetId: string, range: string, value: string) {
    try {
      await this.sheets.spreadsheets.values.update({
        auth: this.auth,
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[value]],
        },
      });
    } catch (error) {
      console.error('Error updating cell:', error);
      throw error;
    }
  }

  parseVideosFromSheet(rows: any[][]): any[] {
    if (!rows || rows.length < 2) return [];

    const headers = rows[0];
    const videos = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue;

      videos.push({
        driveLink: row[0] || '',
        title: row[1] || 'Untitled',
        description: row[2] || '',
        tags: row[3] ? row[3].split(',').map((t: string) => t.trim()) : [],
        playlist: row[4] || '',
        thumbnail: row[5] || '',
        publishDate: row[6] || new Date().toISOString(),
        status: 'pending',
      });
    }

    return videos;
  }
}
