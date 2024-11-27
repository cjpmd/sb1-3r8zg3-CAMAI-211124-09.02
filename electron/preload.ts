import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    saveVideo: async (filePath: string, data: Buffer) => {
      return ipcRenderer.invoke('save-video', filePath, data);
    },
    readVideo: async (filePath: string) => {
      return ipcRenderer.invoke('read-video', filePath);
    },
    deleteVideo: async (filePath: string) => {
      return ipcRenderer.invoke('delete-video', filePath);
    },
    ensureDirectory: async (dirPath: string) => {
      return ipcRenderer.invoke('ensure-directory', dirPath);
    },
    readMetadata: async (filePath: string) => {
      return ipcRenderer.invoke('read-metadata', filePath);
    },
    writeMetadata: async (filePath: string, data: any) => {
      return ipcRenderer.invoke('write-metadata', filePath, data);
    },
    getVideoPath: (userId: string, filename: string) => {
      return ipcRenderer.invoke('get-video-path', userId, filename);
    }
  }
);
