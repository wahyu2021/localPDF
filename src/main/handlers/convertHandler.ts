import path from 'path';
import fs from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
import log from 'electron-log';
import { runEngine } from '../engines/engineRunner';
import { ConvertPayload, ConvertResult, ProgressUpdateData } from '../../shared/ipc-types';
import { IpcMainInvokeEvent, BrowserWindow, ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';

export function registerConvertHandler(_mainWindow: BrowserWindow) {
  ipcMain.handle(IPC_CHANNELS.CONVERT_PDF, handleConvertPdf);
}

/**
 * Mengirim pembaruan progres ke frontend.
 */
function sendProgress(window: BrowserWindow | null, taskId: string, percent: number) {
  if (window && !window.isDestroyed()) {
    const data: ProgressUpdateData = { taskId, percent };
    window.webContents.send(IPC_CHANNELS.PROGRESS_UPDATE, data);
  }
}

/**
 * Memproses permintaan konversi PDF.
 */
export async function handleConvertPdf(
  event: IpcMainInvokeEvent,
  payload: ConvertPayload
): Promise<ConvertResult> {
  const { filePaths, mode, outputDirectory, outputFormat = 'jpg' } = payload;
  const taskId = 'convert_' + Date.now();
  const window = BrowserWindow.fromWebContents(event.sender);
  let filesGenerated = 0;

  try {
    log.info(`[ConvertHandler] Memulai konversi mode: ${mode} untuk ${filePaths.length} file.`);
    sendProgress(window, taskId, 10);

    for (let i = 0; i < filePaths.length; i++) {
      const file = filePaths[i];
      const parsedPath = path.parse(file);

      if (mode === 'office-to-pdf') {
        log.info(`[ConvertHandler] Office -> PDF: ${file}`);
        
        // Pengecekan apakah LibreOffice Portable sudah diekstrak oleh user
        const isProd = require('electron').app.isPackaged;
        const rootDir = isProd ? process.resourcesPath : path.join(__dirname, '../../');
        const libreOfficePath = path.join(rootDir, 'binaries', 'win', 'LibreOfficePortable', 'App', 'libreoffice', 'program', 'soffice.exe');
        
        if (!require('fs').existsSync(libreOfficePath)) {
          throw new Error('LibreOffice Portable belum ditemukan. Silakan unduh LibreOffice Portable dan ekstrak ke folder "binaries/win/LibreOfficePortable".');
        }

        // soffice --headless --convert-to pdf --outdir <dir> <file>
        await runEngine('LibreOfficePortable/App/libreoffice/program/soffice.exe', [
          '--headless',
          '--convert-to',
          'pdf',
          '--outdir',
          outputDirectory,
          file
        ], { timeoutMs: 120000 }); // timeout 2 menit
        filesGenerated++;

      } else if (mode === 'pdf-to-image') {
        log.info(`[ConvertHandler] PDF -> Image: ${file} (Format: ${outputFormat})`);
        
        // Cari tau jumlah halaman untuk progress yang lebih smooth
        let totalPages = 1;
        try {
          const pdfBytes = await fs.readFile(file);
          const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
          totalPages = pdfDoc.getPageCount();
          log.info(`[ConvertHandler] Total halaman PDF: ${totalPages}`);
        } catch (e) {
          log.warn(`[ConvertHandler] Gagal menghitung halaman, fallback ke progress dasar.`, e);
        }

        const isPng = outputFormat === 'png';
        const ext = isPng ? 'png' : 'jpg';
        const device = isPng ? 'png16m' : 'jpeg';
        
        const outputPattern = path.join(outputDirectory, `${parsedPath.name}_page-%03d.${ext}`);
        const gsArgs = [
          '-dSAFER',
          '-dBATCH',
          '-dNOPAUSE',
          '-r300',
          `-sDEVICE=${device}`,
          '-dTextAlphaBits=4',
          '-dGraphicsAlphaBits=4',
          `-sOutputFile=${outputPattern}`,
          file
        ];

        // JPEG quality only applies to jpeg
        if (!isPng) {
          gsArgs.splice(5, 0, '-dJPEGQ=90');
        }

        // Kalkulasi proporsi progress untuk file ini
        const baseProgress = 10 + Math.floor((i / filePaths.length) * 80);
        const maxFileProgress = Math.floor((1 / filePaths.length) * 80);

        await runEngine('gs/bin/gswin64c.exe', gsArgs, {
          onOutput: (data) => {
            const match = data.match(/Page\s+(\d+)/);
            if (match && match[1]) {
              const currentPage = parseInt(match[1], 10);
              const filePercent = Math.min(currentPage / totalPages, 1);
              const currentProgress = baseProgress + Math.floor(filePercent * maxFileProgress);
              // Update UI tiap halaman selesai dirender
              sendProgress(window, taskId, currentProgress);
            }
          }
        });
        // Ghostscript bisa menghasilkan banyak file, kita hanya menghitung file inputnya saja sebagai +1 operasi sukses
        filesGenerated++;

      } else if (mode === 'image-to-pdf') {
        log.info(`[ConvertHandler] Image -> PDF: ${file}`);
        const imageBytes = await fs.readFile(file);
        const pdfDoc = await PDFDocument.create();
        
        let image;
        if (parsedPath.ext.toLowerCase() === '.png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else if (parsedPath.ext.toLowerCase() === '.jpg' || parsedPath.ext.toLowerCase() === '.jpeg') {
          image = await pdfDoc.embedJpg(imageBytes);
        } else {
          throw new Error(`Ekstensi ${parsedPath.ext} tidak didukung untuk Image to PDF.`);
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });

        const pdfBytes = await pdfDoc.save();
        const outputFilePath = path.join(outputDirectory, `${parsedPath.name}_converted.pdf`);
        await fs.writeFile(outputFilePath, pdfBytes);
        filesGenerated++;
      }

      // Update progres secara proporsional
      const progress = 10 + Math.floor(((i + 1) / filePaths.length) * 80);
      sendProgress(window, taskId, progress);
    }

    sendProgress(window, taskId, 100);
    return {
      success: true,
      outputDirectory,
      filesGenerated
    };
  } catch (error: any) {
    log.error('[ConvertHandler] Gagal melakukan konversi:', error);
    sendProgress(window, taskId, 0);
    return {
      success: false,
      error: error.message || String(error)
    };
  }
}
