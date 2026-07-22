import { app, BrowserWindow } from 'electron';
import { createMainWindow } from './window';
import { registerCompressHandler } from './handlers/compressHandler';
import { registerMergeHandler } from './handlers/mergeHandler';
import { initTempFolders, cleanupTempFolders } from './utils/tempFileManager';

app.whenReady().then(() => {
  // Siapkan folder temporer
  initTempFolders();

  const mainWindow = createMainWindow();

  // Daftarkan semua IPC Handlers di sini
  registerCompressHandler(mainWindow);
  registerMergeHandler(mainWindow);

  app.on('activate', () => {
    // Pada macOS biasanya re-create window saat icon di-klik
    if (BrowserWindow.getAllWindows().length === 0) {
      const newWin = createMainWindow();
      registerCompressHandler(newWin);
      registerMergeHandler(newWin);
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
