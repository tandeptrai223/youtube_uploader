import { upload } from 'youtube-videos-uploader';

export class YouTubeUploadService {
  async uploadVideo(
    email: string,
    password: string,
    videoData: {
      path: string;
      title: string;
      description: string;
      tags?: string[];
      thumbnail?: string;
      playlist?: string;
    }
  ): Promise<string> {
    try {
      const credentials = {
        email,
        pass: password,
      };

      const uploadData = {
        path: videoData.path,
        title: videoData.title,
        description: videoData.description,
        tags: videoData.tags || [],
        thumbnail: videoData.thumbnail,
        playlist: videoData.playlist,
        isNotForKids: true,
      };

      const results = await upload(credentials, [uploadData], { headless: true });

      if (results && results.length > 0) {
        return results[0];
      }

      throw new Error('Upload failed - no result returned');
    } catch (error) {
      console.error('Error uploading to YouTube:', error);
      throw error;
    }
  }
}
