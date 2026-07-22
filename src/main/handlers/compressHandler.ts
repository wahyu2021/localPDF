import { ipcMain, dialog, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { CompressPayload, CompressResult } from '../../shared/ipc-types';
import { runEngine } from '../engines/engineRunner';
import { generateTaskId, getOutputPath } from '../utils/tempFileManager';
import log from 'electron-log';

/**
 * Mendaftarkan event listener untuk IPC Compress PDF.
 * @param mainWindow Instance BrowserWindow utama untuk mengikat dialog Save As.
 */
export function registerCompressHandler(mainWindow: BrowserWindow) {
  ipcMain.handle(IPC_CHANNELS.COMPRESS_PDF, async (event, payload: CompressPayload): Promise<CompressResult> => {
    try {
      const taskId = generateTaskId();
      const originalFileName = path.basename(payload.filePath);
      const outputFileName = `${path.parse(originalFileName).name}_compressed.pdf`;
      const tempOutputPath = getOutputPath(outputFileName, taskId);

      // Konversi level kualitas frontend menjadi flag parameter Ghostscript
      let qualityFlag = '/screen'; // Mode Extreme (lowest quality, ~72 DPI)
      
      if (payload.level === 'ebook') {
        qualityFlag = '/ebook'; // Recommended (medium quality, ~150 DPI)
      } else if (payload.level === 'printer') {
        qualityFlag = '/printer'; // Less Compression (high quality, ~300 DPI)
      }
      
      // Argument standar Ghostscript untuk memproses PDF ke PDF
      const gsArgs = [
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
      ];

      // Terapkan pengaturan custom resolusi atau preset standar
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

      // Input / Output File (selalu diletakkan di akhir argumen)
      gsArgs.push(`-sOutputFile=${tempOutputPath}`, payload.filePath);

      log.info(`Mengeksekusi kompresi untuk ${originalFileName} dengan mode ${payload.level}`);

      // Eksekusi binary
      const result = await runEngine('gs/bin/gswin64c.exe', gsArgs);

      if (!result.success || !fs.existsSync(tempOutputPath)) {
        throw new Error('Proses kompresi Ghostscript gagal atau file tidak terbentuk.');
      }

      // Kalkulasi rasio penyimpanan untuk dilaporkan kembali ke user
      const originalSize = fs.statSync(payload.filePath).size;
      const newSize = fs.statSync(tempOutputPath).size;

      log.info(`Kompresi sukses. Ukuran awal: ${originalSize}, Ukuran akhir: ${newSize}`);

      // Minta pengguna menentukan lokasi simpan
      const saveDialogResult = await dialog.showSaveDialog(mainWindow, {
        title: 'Simpan PDF yang Dikompres',
        defaultPath: outputFileName,
        filters: [{ name: 'Dokumen PDF', extensions: ['pdf'] }]
      });

      if (!saveDialogResult.canceled && saveDialogResult.filePath) {
        // Pindahkan dari folder temp ke folder pilihan pengguna
        fs.copyFileSync(tempOutputPath, saveDialogResult.filePath);
        fs.unlinkSync(tempOutputPath); // bersihkan temp
        
        return {
          success: true,
          outputPath: saveDialogResult.filePath,
          originalSize,
          newSize
        };
      }

      // Jika user menekan tombol Cancel (Batal Simpan)
      fs.unlinkSync(tempOutputPath);
      return { success: false, error: 'Proses penyimpanan dibatalkan pengguna.' };
      
    } catch (error: any) {
      log.error('Error saat kompresi PDF:', error);
      return {
        success: false,
        error: error.message || 'Terjadi kesalahan internal pada engine.'
      };
    }
  });
}
