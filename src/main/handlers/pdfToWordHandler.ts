import { ipcMain, dialog, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { execa } from 'execa';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { PdfToWordPayload, PdfToWordResult, SavePayload, SaveResult } from '../../shared/ipc-types';
import { generateTaskId, getOutputPath } from '../utils/tempFileManager';
import { sendProgress } from '../utils/progress';
import log from 'electron-log';

/**
 * Menentukan path binary LibreOffice secara dinamis tergantung mode dev/prod.
 */
function getLibreOfficePath(): string {
  const isProd = require('electron').app.isPackaged;
  const rootDir = isProd ? process.resourcesPath : path.join(__dirname, '../../');
  return path.join(rootDir, 'binaries', 'win', 'LibreOfficePortable', 'App', 'libreoffice', 'program', 'soffice.exe');
}

/**
 * Mendaftarkan handler IPC untuk fitur PDF ke Word.
 */
export function registerPdfToWordHandler(mainWindow: BrowserWindow) {
  // 1. Handler Konversi PDF ke Word
  ipcMain.handle(IPC_CHANNELS.PDF_TO_WORD, async (event, payload: PdfToWordPayload): Promise<PdfToWordResult> => {
    const taskId = generateTaskId();
    const window = BrowserWindow.fromWebContents(event.sender);

    try {
      const libreOfficePath = getLibreOfficePath();

      if (!fs.existsSync(libreOfficePath)) {
        throw new Error(`LibreOffice Portable tidak ditemukan di: ${libreOfficePath}. Pastikan sudah diekstrak.`);
      }

      if (!fs.existsSync(payload.filePath)) {
        throw new Error(`File PDF tidak ditemukan: ${payload.filePath}`);
      }

      const originalFileName = path.basename(payload.filePath, '.pdf');
      const outputFileName = `${originalFileName}.docx`;

      // LibreOffice selalu menyimpan output di direktori yang sama dengan input.
      // Kita buat folder temp khusus untuk menampung output, lalu salin ke lokasi final.
      const tempDir = path.join(require('electron').app.getPath('userData'), 'LocalPDF_Temp', 'output', taskId);
      fs.mkdirSync(tempDir, { recursive: true });

      sendProgress(window, taskId, 5);
      log.info(`[PdfToWordHandler] Memulai konversi: ${payload.filePath} -> ${outputFileName}`);

      // Jalankan LibreOffice secara headless
      await execa(libreOfficePath, [
        '--headless',
        '--norestore',
        '--nofirststartwizard',
        '--infilter=writer_pdf_import',
        '--convert-to', 'docx',
        '--outdir', tempDir,
        payload.filePath,
      ]);

      sendProgress(window, taskId, 90);

      const generatedFilePath = path.join(tempDir, outputFileName);

      if (!fs.existsSync(generatedFilePath)) {
        throw new Error('LibreOffice selesai berjalan namun file .docx tidak terbentuk. PDF mungkin terenkripsi atau tidak memiliki teks.');
      }

      sendProgress(window, taskId, 100);
      log.info(`[PdfToWordHandler] Konversi berhasil: ${generatedFilePath}`);

      return { success: true, tempPath: generatedFilePath };
    } catch (error: any) {
      log.error('[PdfToWordHandler] Error saat konversi:', error);
      sendProgress(window, taskId, 0);
      return { success: false, error: error.message || 'Terjadi kesalahan internal.' };
    }
  });

  // 2. Handler Simpan File DOCX
  ipcMain.handle(`${IPC_CHANNELS.PDF_TO_WORD}:save`, async (event, payload: SavePayload): Promise<SaveResult> => {
    try {
      const saveDialogResult = await dialog.showSaveDialog(mainWindow, {
        title: 'Simpan File Word',
        defaultPath: payload.defaultFileName,
        filters: [{ name: 'Dokumen Word', extensions: ['docx'] }],
      });

      if (!saveDialogResult.canceled && saveDialogResult.filePath) {
        fs.copyFileSync(payload.tempPath, saveDialogResult.filePath);
        fs.unlinkSync(payload.tempPath);
        return { success: true, savedPath: saveDialogResult.filePath };
      }

      return { success: false, canceled: true, error: 'Dibatalkan oleh pengguna.' };
    } catch (error: any) {
      log.error('[PdfToWordHandler] Error saat menyimpan:', error);
      return { success: false, error: error.message };
    }
  });
}
