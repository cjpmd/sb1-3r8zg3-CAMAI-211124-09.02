import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { promises as fs } from 'fs';

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js
// │ ├─┬ preload
// │ │ └── index.js
// │ ├─┬ renderer
// │ │ └── index.html

process.env.DIST_ELECTRON = join(__dirname, '..');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, '../public');

let win: BrowserWindow | null = null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, '../preload/index.js'),
    },
  });

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(join(process.env.DIST, 'index.html'));
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  win = null;
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
  } else {
    childWindow.loadFile(join(process.env.DIST, `index.html`), { hash: arg });
  }
});

// File system operations
ipcMain.handle('get-video-path', async (_, userId: string, filename: string) => {
  return join(app.getPath('home'), 'ShortFormVideos', userId, filename);
});

ipcMain.handle('save-video', async (_, filePath: string, data: Buffer) => {
  try {
    // Ensure the directory exists
    await fs.mkdir(join(filePath, '..'), { recursive: true });
    await fs.writeFile(filePath, data);
    return { success: true };
  } catch (error) {
    console.error('Error saving video:', error);
    throw error;
  }
});

ipcMain.handle('read-video', async (_, filePath: string) => {
  try {
    const data = await fs.readFile(filePath);
    return { data };
  } catch (error) {
    console.error('Error reading video:', error);
    throw error;
  }
});

ipcMain.handle('delete-video', async (_, filePath: string) => {
  try {
    await fs.unlink(filePath);
    return { success: true };
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
});

ipcMain.handle('ensure-directory', async (_, dirPath: string) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return { success: true };
  } catch (error) {
    console.error('Error ensuring directory:', error);
    throw error;
  }
});

ipcMain.handle('read-metadata', async (_, filePath: string) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return { data: JSON.parse(data) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { data: [] };
    }
    console.error('Error reading metadata:', error);
    throw error;
  }
});

ipcMain.handle('write-metadata', async (_, filePath: string, data: any) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error writing metadata:', error);
    throw error;
  }
});

app.whenReady().then(createWindow);
