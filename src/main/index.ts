import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { createMainWindow } from './window';
import { registerCompressHandler } from './handlers/compressHandler';
import { registerMergeHandler } from './handlers/mergeHandler';
import { initTempFolders, cleanupTempFolders } from './utils/tempFileManager';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import { registerSplitHandler } from './handlers/splitHandler';

app.whenReady().then(() => {
  // Siapkan folder temporer
  initTempFolders();

  const mainWindow = createMainWindow();

  // Handler buka folder
  ipcMain.handle(IPC_CHANNELS.OPEN_OUTPUT_FOLDER, async (_event, folderPath: string) => {
    await shell.openPath(folderPath);
  });

  // Daftarkan semua IPC Handlers di sini
  registerCompressHandler(mainWindow);
  registerMergeHandler(mainWindow);
  registerSplitHandler(mainWindow);

  app.on('activate', () => {
    // Pada macOS biasanya re-create window saat icon di-klik
    if (BrowserWindow.getAllWindows().length === 0) {
      const newWin = createMainWindow();
      registerCompressHandler(newWin);
      registerMergeHandler(newWin);
      registerSplitHandler(newWin);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Bersihkan file sisa (temp) sebelum keluar
app.on('will-quit', () => {
  cleanupTempFolders();
});
