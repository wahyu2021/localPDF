import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { nanoid } from 'nanoid';

// Simpan temp di bawah folder userData agar tidak bentrok dengan permission sistem Windows
const tempRoot = path.join(app.getPath('userData'), 'LocalPDF_Temp');
const uploadsDir = path.join(tempRoot, 'uploads');
const outputDir = path.join(tempRoot, 'output');

/**
 * Menyiapkan folder temporer jika belum ada.
 */
export function initTempFolders() {
  [tempRoot, uploadsDir, outputDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Membuat Task ID unik untuk proses isolasi pekerjaan PDF.
 * @returns String unik berupa Task ID.
 */
export function generateTaskId(): string {
  return nanoid();
}

/**
 * Mendapatkan path tujuan untuk menyimpan file yang diunggah oleh user sebelum diproses.
 * 
 * @param fileName - Nama file asli (misal: "laporan.pdf").
 * @param taskId - ID tugas yang saat ini berjalan.
 * @returns Path absolut yang aman dari bentrok.
 */
export function getUploadPath(fileName: string, taskId: string): string {
  return path.join(uploadsDir, `${taskId}_${fileName}`);
}

/**
 * Mendapatkan path tujuan untuk file hasil (output) pemrosesan engine.
 * 
 * @param fileName - Nama file hasil (misal: "laporan_compressed.pdf").
 * @param taskId - ID tugas yang saat ini berjalan.
 * @returns Path absolut untuk hasil.
 */
export function getOutputPath(fileName: string, taskId: string): string {
  return path.join(outputDir, `${taskId}_${fileName}`);
}

/**
 * Menghapus seluruh isi folder temporer (cleanup).
 * Disarankan untuk memanggil ini sebelum aplikasi (app) ditutup.
 */
export function cleanupTempFolders() {
  try {
    if (fs.existsSync(tempRoot)) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  } catch (error) {
    console.error('Gagal membersihkan folder temporer:', error);
  }
}
