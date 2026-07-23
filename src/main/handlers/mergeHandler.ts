import { ipcMain, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { MergePayload, MergeResult } from '../../shared/ipc-types';
import { runEngine } from '../engines/engineRunner';
import { generateTaskId, getOutputPath } from '../utils/tempFileManager';
import { sendProgress } from '../utils/progress';
import log from 'electron-log';

export function registerMergeHandler(mainWindow: BrowserWindow) {
  ipcMain.handle(IPC_CHANNELS.MERGE_PDF, async (event, payload: MergePayload): Promise<MergeResult> => {
    try {
      if (!payload.filePaths || payload.filePaths.length < 2) {
        throw new Error('Minimal butuh 2 file PDF untuk digabungkan.');
      }

      const taskId = generateTaskId();
      const window = BrowserWindow.fromWebContents(event.sender);
      sendProgress(window, taskId, 10);

      const firstFileName = path.parse(path.basename(payload.filePaths[0])).name;
      const outputFileName = `${firstFileName}_merged.pdf`;
      const tempOutputPath = getOutputPath(outputFileName, taskId);

      // Argumen QPDF: qpdf --empty --pages file1.pdf file2.pdf ... -- output.pdf
      const qpdfArgs = [
        '--empty',
        '--pages',
        ...payload.filePaths,
        '--',
        tempOutputPath
      ];

      log.info(`Mengeksekusi penggabungan ${payload.filePaths.length} file PDF menggunakan QPDF...`);

      // Panggil binary QPDF
      const result = await runEngine('qpdf/qpdf.exe', qpdfArgs);
      
      sendProgress(window, taskId, 100);

      if (!result.success || !fs.existsSync(tempOutputPath)) {
        throw new Error('Proses penggabungan QPDF gagal atau file tidak terbentuk.');
      }

      let totalOriginalSize = 0;
      for (const file of payload.filePaths) {
        if (fs.existsSync(file)) {
          totalOriginalSize += fs.statSync(file).size;
        }
      }
      
      const newSize = fs.statSync(tempOutputPath).size;

      log.info(`Penggabungan sukses. Temp file: ${tempOutputPath}`);

      return {
        success: true,
        tempPath: tempOutputPath,
        totalOriginalSize,
        newSize
      };
      
    } catch (error: any) {
      log.error('Error saat penggabungan PDF:', error);
      return { success: false, error: error.message || 'Terjadi kesalahan internal saat menggabungkan PDF.' };
    }
  });
}
