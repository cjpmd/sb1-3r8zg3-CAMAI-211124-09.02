import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface VideoDBSchema extends DBSchema {
  videos: {
    key: string;
    value: {
      id: string;
      blob: Blob;
      caption: string;
      likes: number;
      userAvatar: string;
      username: string;
      timestamp: number;
    };
  };
}

let db: IDBPDatabase<VideoDBSchema>;

export const initDB = async () => {
  db = await openDB<VideoDBSchema>('videos-db', 1, {
    upgrade(db) {
      db.createObjectStore('videos', { keyPath: 'id' });
    },
  });
};

export const saveVideo = async (videoData: VideoDBSchema['videos']['value']) => {
  await db.put('videos', videoData);
};

export const getAllVideos = async () => {
  return await db.getAll('videos');
};

export const deleteVideo = async (id: string) => {
  await db.delete('videos', id);
};