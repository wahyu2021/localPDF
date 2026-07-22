import { app, BrowserWindow } from 'electron';
import { createMainWindow } from './window';

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    // Pada macOS biasanya re-create window saat icon di-klik
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
