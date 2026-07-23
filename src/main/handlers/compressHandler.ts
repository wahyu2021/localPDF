import { ipcMain, dialog, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { CompressPayload, CompressResult, SavePayload, SaveResult } from '../../shared/ipc-types';
import { runEngine } from '../engines/engineRunner';
import { generateTaskId, getOutputPath } from '../utils/tempFileManager';
import { sendProgress } from '../utils/progress';
import { PDFDocument } from 'pdf-lib';
import log from 'electron-log';

/**
 * Mendaftarkan event listener untuk IPC Compress PDF.
 */
export function registerCompressHandler(mainWindow: BrowserWindow) {
  // 1. Handler Kompresi (Hanya menyimpan di Temp)
  ipcMain.handle(IPC_CHANNELS.COMPRESS_PDF, async (event, payload: CompressPayload): Promise<CompressResult> => {
    try {
      const taskId = generateTaskId();
      const originalFileName = path.basename(payload.filePath);
      const outputFileName = `${path.parse(originalFileName).name}_compressed.pdf`;
      const tempOutputPath = getOutputPath(outputFileName, taskId);
      const window = BrowserWindow.fromWebContents(event.sender);
      
      sendProgress(window, taskId, 5);

      let qualityFlag = '/screen'; 
      if (payload.level === 'ebook') qualityFlag = '/ebook'; 
      else if (payload.level === 'printer') qualityFlag = '/printer';
      
      const gsArgs = [
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
      ];

      if (payload.level === 'custom' && payload.customDPI) {
        gsArgs.push(
          '-dDownsampleColorImages=true',
          `-dColorImageResolution=${payload.customDPI}`,
          '-dDownsampleGrayImages=true',
          `-dGrayImageResolution=${payload.customDPI}`,
          '-dDownsampleMonoImages=true',
          `-dMonoImageResolution=${payload.customDPI}`
        );
      } else {
        gsArgs.push(`-dPDFSETTINGS=${qualityFlag}`);
      }

      gsArgs.push(`-sOutputFile=${tempOutputPath}`, payload.filePath);

      log.info(`Mengeksekusi kompresi untuk ${originalFileName} dengan mode ${payload.level}`);

      // Hitung total halaman untuk progress yang lebih mulus
      let totalPages = 1;
      try {
        const pdfBytes = await fs.promises.readFile(payload.filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        totalPages = pdfDoc.getPageCount();
      } catch (e) {
        log.warn(`Gagal membaca total halaman untuk progress:`, e);
      }

      sendProgress(window, taskId, 10);

      const result = await runEngine('gs/bin/gswin64c.exe', gsArgs, {
        onOutput: (data) => {
          const match = data.match(/Page\s+(\d+)/);
          if (match && match[1]) {
            const currentPage = parseInt(match[1], 10);
            const percent = Math.min(currentPage / totalPages, 1);
            // Progress Ghostscript dari 10% s.d. 95%
            const currentProgress = 10 + Math.floor(percent * 85);
            sendProgress(window, taskId, currentProgress);
          }
        }
      });
      
      sendProgress(window, taskId, 100);

      if (!result.success || !fs.existsSync(tempOutputPath)) {
        throw new Error('Proses kompresi Ghostscript gagal atau file tidak terbentuk.');
      }

      const originalSize = fs.statSync(payload.filePath).size;
      const newSize = fs.statSync(tempOutputPath).size;

      log.info(`Kompresi sukses. Temp file: ${tempOutputPath}`);

      return {
        success: true,
        tempPath: tempOutputPath,
        originalSize,
        newSize
      };
      
    } catch (error: any) {
      log.error('Error saat kompresi PDF:', error);
      return { success: false, error: error.message || 'Terjadi kesalahan internal pada engine.' };
    }
  });

  // 2. Handler Simpan (Memunculkan Dialog)
  ipcMain.handle(IPC_CHANNELS.SAVE_PDF, async (event, payload: SavePayload): Promise<SaveResult> => {
    try {
      const saveDialogResult = await dialog.showSaveDialog(mainWindow, {
        title: 'Simpan PDF yang Dikompres',
        defaultPath: payload.defaultFileName,
        filters: [{ name: 'Dokumen PDF', extensions: ['pdf'] }]
      });

      if (!saveDialogResult.canceled && saveDialogResult.filePath) {
        fs.copyFileSync(payload.tempPath, saveDialogResult.filePath);
        // Hapus temp setelah sukses disalin
        fs.unlinkSync(payload.tempPath);
        
        return { success: true, savedPath: saveDialogResult.filePath };
      }

      return { success: false, canceled: true, error: 'Dibatalkan oleh pengguna.' };
    } catch (error: any) {
      log.error('Error saat menyimpan file:', error);
      return { success: false, error: error.message };
    }
  });
}
