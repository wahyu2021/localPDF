import { ipcMain, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { SecurityPayload, SecurityResult } from '../../shared/ipc-types';
import { runEngine } from '../engines/engineRunner';
import log from 'electron-log';

/**
 * Mendaftarkan event listener untuk IPC Security PDF.
 */
export function registerSecurityHandler(mainWindow: BrowserWindow) {
  ipcMain.handle(IPC_CHANNELS.SECURITY_PDF, async (event, payload: SecurityPayload): Promise<SecurityResult> => {
    const { filePath, outputDirectory, mode, userPassword, ownerPassword, restrictions } = payload;
    
    try {
      const parsedPath = path.parse(filePath);
      let outputFileName = '';
      const qpdfArgs: string[] = [];
      const qpdfPath = 'qpdf/qpdf.exe'; // Relatif ke folder binaries/win
      
      if (mode === 'lock') {
        outputFileName = `${parsedPath.name}_locked.pdf`;
        const outPath = path.join(outputDirectory, outputFileName);
        
        // Command: qpdf --encrypt user_pw owner_pw 256 -- input.pdf output.pdf
        const uPw = userPassword || '';
        const oPw = ownerPassword || uPw; // QPDF requires owner password to encrypt 256
        
        qpdfArgs.push('--encrypt', uPw, oPw, '256', '--', filePath, outPath);
        
      } else if (mode === 'unlock') {
        outputFileName = `${parsedPath.name}_unlocked.pdf`;
        const outPath = path.join(outputDirectory, outputFileName);
        
        // Command: qpdf --decrypt --password=user_pw input.pdf output.pdf
        const pw = userPassword || ownerPassword || '';
        qpdfArgs.push('--decrypt', `--password=${pw}`, filePath, outPath);
        
      } else if (mode === 'restrict') {
        outputFileName = `${parsedPath.name}_restricted.pdf`;
        const outPath = path.join(outputDirectory, outputFileName);
        
        // Command: qpdf --encrypt user_pw owner_pw 256 --[restrictions] -- input.pdf output.pdf
        const uPw = userPassword || '';
        const oPw = ownerPassword || '';
        
        if (!oPw) {
          throw new Error('Owner Password diperlukan untuk mengatur batasan akses.');
        }

        qpdfArgs.push('--encrypt', uPw, oPw, '256');

        if (restrictions) {
          if (restrictions.print) qpdfArgs.push(`--print=${restrictions.print}`);
          if (restrictions.modify) qpdfArgs.push(`--modify=${restrictions.modify}`);
          if (restrictions.extract) qpdfArgs.push(`--extract=${restrictions.extract}`);
        }
        
        qpdfArgs.push('--', filePath, outPath);
      } else {
        throw new Error(`Mode tidak dikenal: ${mode}`);
      }

      const outPath = path.join(outputDirectory, outputFileName);
      log.info(`[SecurityHandler] Menjalankan mode: ${mode} untuk ${parsedPath.base}`);
      
      const result = await runEngine(qpdfPath, qpdfArgs);

      if (!result.success || !fs.existsSync(outPath)) {
        throw new Error('Proses qpdf gagal atau file tidak terbentuk.');
      }

      log.info(`[SecurityHandler] Eksekusi sukses: ${outPath}`);
      return { success: true, outputPath: outPath };

    } catch (error: any) {
      log.error(`[SecurityHandler] Gagal:`, error);
      return { success: false, error: error.message || 'Terjadi kesalahan sistem.' };
    }
  });
}
