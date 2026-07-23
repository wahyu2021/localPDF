import { BrowserWindow, app } from 'electron';
import { join } from 'path';
import icon from '../../resources/icon.ico?asset';

export function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true, // Wajib aktif demi keamanan
      nodeIntegration: false, // Wajib non-aktif demi keamanan
      plugins: true           // Wajib aktif agar native PDF viewer Electron berfungsi di iframe/embed
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    // Buka DevTools secara otomatis (berguna saat ada error)
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
      mainWindow.webContents.openDevTools();
    }
  });

  // HMR dari electron-vite saat development
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return mainWindow;
}
