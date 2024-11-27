import { nanoid } from 'nanoid';

export interface VideoMetadata {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  createdAt: Date;
  userId: string;
}

export class LocalVideoStorage {
  async saveVideo(file: File, userId: string): Promise<VideoMetadata> {
    const id = nanoid();
    const extension = file.name.split('.').pop() || 'mp4';
    const filename = `${id}.${extension}`;

    // Convert File to ArrayBuffer and then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Get the file path and save the file using the Electron API
    const filePath = await window.api.getVideoPath(userId, filename);
    await window.api.saveVideo(filePath, buffer);

    const metadata: VideoMetadata = {
      id,
      filename,
      originalName: file.name,
      size: file.size,
      createdAt: new Date(),
      userId
    };

    // Save metadata
    await this.saveMetadata(metadata);

    return metadata;
  }

  private async saveMetadata(metadata: VideoMetadata): Promise<void> {
    const metadataPath = await window.api.getVideoPath(metadata.userId, 'metadata.json');
    
    // Ensure the directory exists
    const dirPath = await window.api.getVideoPath(metadata.userId, '');
    await window.api.ensureDirectory(dirPath);

    // Read existing metadata
    let existingMetadata: VideoMetadata[] = [];
    try {
      const { data } = await window.api.readMetadata(metadataPath);
      existingMetadata = data;
    } catch (error) {
      // File doesn't exist yet, that's fine
    }

    existingMetadata.push(metadata);
    await window.api.writeMetadata(metadataPath, existingMetadata);
  }

  async getUserVideos(userId: string): Promise<VideoMetadata[]> {
    try {
      const metadataPath = await window.api.getVideoPath(userId, 'metadata.json');
      const dirPath = await window.api.getVideoPath(userId, '');
      await window.api.ensureDirectory(dirPath);
      const { data } = await window.api.readMetadata(metadataPath);
      return data || [];
    } catch (error) {
      return [];
    }
  }

  async getVideoUrl(metadata: VideoMetadata): Promise<string> {
    const filePath = await window.api.getVideoPath(metadata.userId, metadata.filename);
    return `file://${filePath}`;
  }

  async deleteVideo(metadata: VideoMetadata): Promise<void> {
    const filePath = await window.api.getVideoPath(metadata.userId, metadata.filename);
    const metadataPath = await window.api.getVideoPath(metadata.userId, 'metadata.json');

    // Delete the video file
    try {
      await window.api.deleteVideo(filePath);
    } catch (error) {
      console.error('Error deleting video file:', error);
    }

    // Update metadata
    try {
      const { data } = await window.api.readMetadata(metadataPath);
      const existingMetadata = data || [];
      const updatedMetadata = existingMetadata.filter(m => m.id !== metadata.id);
      await window.api.writeMetadata(metadataPath, updatedMetadata);
    } catch (error) {
      console.error('Error updating metadata:', error);
    }
  }
}
