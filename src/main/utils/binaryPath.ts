import path from 'path';
import { app } from 'electron';

/**
 * Mendapatkan absolute path dari folder binaries yang dibundel.
 * Menangani perbedaan letak file antara saat mode *development* dengan saat di-*build*.
 * 
 * @param binaryName - Nama eksekusi (contoh: 'qpdf.exe' atau 'gswin64c.exe').
 * @returns Absolute path ke file binary yang dituju.
 */
export function getBinaryPath(binaryName: string): string {
  const isProd = app.isPackaged;
  // Di development, __dirname biasanya merujuk ke out/main atau dist/main, 
  // jadi kita perlu naik dua level ke root direktori proyek.
  const rootDir = isProd ? process.resourcesPath : path.join(__dirname, '../../');
  
  // Karena saat ini fokus rilis untuk Windows
  const platformFolder = 'win';
  
  return path.join(rootDir, 'binaries', platformFolder, binaryName);
}
