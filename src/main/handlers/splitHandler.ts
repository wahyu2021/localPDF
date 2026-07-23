import { ipcMain, BrowserWindow, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { SplitPayload, SplitResult } from '../../shared/ipc-types';
import { runEngine } from '../engines/engineRunner';
import log from 'electron-log';
import { sendProgress } from '../utils/progress';

export function registerSplitHandler(mainWindow: BrowserWindow) {
  // Handler untuk memilih folder
  ipcMain.handle(IPC_CHANNELS.SELECT_FOLDER, async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return null;
    const result = await dialog.showOpenDialog(window, {
      title: 'Pilih Folder Tujuan',
      properties: ['openDirectory', 'createDirectory']
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  // Handler untuk mengeksekusi split (QPDF)
  ipcMain.handle(IPC_CHANNELS.SPLIT_PDF, async (event, payload: SplitPayload): Promise<SplitResult> => {
    try {
      const taskId = 'split_' + Date.now();
      const window = BrowserWindow.fromWebContents(event.sender);
      sendProgress(window, taskId, 10);
      
      if (!payload.filePath || !fs.existsSync(payload.filePath)) {
        throw new Error('File PDF tidak ditemukan.');
      }
      if (!payload.outputDirectory || !fs.existsSync(payload.outputDirectory)) {
        throw new Error('Folder tujuan tidak ditemukan.');
      }

      const originalFileName = path.parse(path.basename(payload.filePath)).name;
      let qpdfArgs: string[] = [];

      log.info(`Mengeksekusi split PDF mode: ${payload.mode} untuk file: ${payload.filePath}`);

      if (payload.mode === 'extract') {
        if (!payload.pages) {
          throw new Error('Halaman atau rentang halaman harus diisi untuk mode extract.');
        }
        // QPDF Extract: qpdf --empty --pages input.pdf 1-3,5 -- output.pdf
        const outputFileName = `${originalFileName}_extracted.pdf`;
        const outputPath = path.join(payload.outputDirectory, outputFileName);
        
        qpdfArgs = [
          '--empty',
          '--pages',
          payload.filePath,
          payload.pages,
          '--',
          outputPath
        ];
      } else if (payload.mode === 'split_all') {
        // QPDF Split: qpdf --split-pages input.pdf output_prefix.pdf
        const outputPrefix = path.join(payload.outputDirectory, originalFileName + '_page.pdf');
        
        qpdfArgs = [
          '--split-pages',
          payload.filePath,
          outputPrefix
        ];
      } else {
        throw new Error('Mode split tidak dikenali.');
      }

      const result = await runEngine('qpdf/qpdf.exe', qpdfArgs);
      
      sendProgress(window, taskId, 100);

      if (!result.success) {
        throw new Error('Proses pemecahan QPDF gagal.');
      }

      let filesGenerated = 1;
      if (payload.mode === 'split_all') {
         const files = fs.readdirSync(payload.outputDirectory);
         filesGenerated = files.filter(f => f.startsWith(originalFileName + '_page')).length;
      }

      log.info(`Split sukses. Output Directory: ${payload.outputDirectory}`);

      return {
        success: true,
        outputDirectory: payload.outputDirectory,
        filesGenerated
      };
      
    } catch (error: any) {
      log.error('Error saat split PDF:', error);
      return { success: false, error: error.message || 'Terjadi kesalahan internal saat memecah PDF.' };
    }
  });
}
