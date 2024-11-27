import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { promises } from "fs";
process.env.DIST_ELECTRON = join(__dirname, "..");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, "../public");
let win = null;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, "../preload/index.js")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(join(process.env.DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});
app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload: join(__dirname, "../preload/index.js")
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
  } else {
    childWindow.loadFile(join(process.env.DIST, `index.html`), { hash: arg });
  }
});
ipcMain.handle("get-video-path", async (_, userId, filename) => {
  return join(app.getPath("home"), "ShortFormVideos", userId, filename);
});
ipcMain.handle("save-video", async (_, filePath, data) => {
  try {
    await promises.mkdir(join(filePath, ".."), { recursive: true });
    await promises.writeFile(filePath, data);
    return { success: true };
  } catch (error) {
    console.error("Error saving video:", error);
    throw error;
  }
});
ipcMain.handle("read-video", async (_, filePath) => {
  try {
    const data = await promises.readFile(filePath);
    return { data };
  } catch (error) {
    console.error("Error reading video:", error);
    throw error;
  }
});
ipcMain.handle("delete-video", async (_, filePath) => {
  try {
    await promises.unlink(filePath);
    return { success: true };
  } catch (error) {
    console.error("Error deleting video:", error);
    throw error;
  }
});
ipcMain.handle("ensure-directory", async (_, dirPath) => {
  try {
    await promises.mkdir(dirPath, { recursive: true });
    return { success: true };
  } catch (error) {
    console.error("Error ensuring directory:", error);
    throw error;
  }
});
ipcMain.handle("read-metadata", async (_, filePath) => {
  try {
    const data = await promises.readFile(filePath, "utf-8");
    return { data: JSON.parse(data) };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { data: [] };
    }
    console.error("Error reading metadata:", error);
    throw error;
  }
});
ipcMain.handle("write-metadata", async (_, filePath, data) => {
  try {
    await promises.writeFile(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    console.error("Error writing metadata:", error);
    throw error;
  }
});
app.whenReady().then(createWindow);
