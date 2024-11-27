import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld(
  "api",
  {
    saveVideo: async (filePath, data) => {
      return ipcRenderer.invoke("save-video", filePath, data);
    },
    readVideo: async (filePath) => {
      return ipcRenderer.invoke("read-video", filePath);
    },
    deleteVideo: async (filePath) => {
      return ipcRenderer.invoke("delete-video", filePath);
    },
    ensureDirectory: async (dirPath) => {
      return ipcRenderer.invoke("ensure-directory", dirPath);
    },
    readMetadata: async (filePath) => {
      return ipcRenderer.invoke("read-metadata", filePath);
    },
    writeMetadata: async (filePath, data) => {
      return ipcRenderer.invoke("write-metadata", filePath, data);
    },
    getVideoPath: (userId, filename) => {
      return ipcRenderer.invoke("get-video-path", userId, filename);
    }
  }
);
