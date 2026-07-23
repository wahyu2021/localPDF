import { execa, Options as ExecaOptions } from 'execa';
import log from 'electron-log';
import { getBinaryPath } from '../utils/binaryPath';

export interface RunEngineOptions extends ExecaOptions {
  timeoutMs?: number;
  onOutput?: (data: string) => void;
}

/**
 * Mengeksekusi binary native (Ghostscript, QPDF, dll) secara aman dengan batas waktu (timeout).
 * 
 * @param binaryName - Nama file exe (contoh: 'qpdf.exe')
 * @param args - Argument array untuk diteruskan ke exe.
 * @param options - Opsi eksekusi tambahan (termasuk timeoutMs).
 * @returns Object berisi stdout dan stderr.
 */
export async function runEngine(
  binaryName: string, 
  args: string[], 
  options: RunEngineOptions = {}
) {
  const exePath = getBinaryPath(binaryName);
  const timeoutMs = options.timeoutMs || 60000; // Default batas aman proses adalah 60 detik

  log.info(`[Engine] Memulai eksekusi ${binaryName} dengan argumen:`, args.join(' '));

  try {
    const child = execa(exePath, args, {
      timeout: timeoutMs,
      ...options
    });

    if (options.onOutput) {
      child.stdout?.on('data', (data) => options.onOutput!(data.toString()));
      child.stderr?.on('data', (data) => options.onOutput!(data.toString()));
    }

    const { stdout, stderr } = await child;
    
    // Walaupun sukses, beberapa engine (seperti Ghostscript) mungkin membuang output ke stderr
    if (stderr) {
      log.warn(`[Engine] Peringatan dari ${binaryName}:`, stderr);
    }
    
    log.info(`[Engine] Eksekusi ${binaryName} selesai dengan sukses.`);
    return { stdout, stderr, success: true };
  } catch (error: any) {
    log.error(`[Engine] Gagal mengeksekusi ${binaryName}:`, error.message || error);
    
    // Periksa apakah gagal secara spesifik karena timeout
    if (error.isCanceled || error.timedOut) {
      throw new Error(`Eksekusi gagal: Waktu proses terlalu lama (lebih dari ${timeoutMs / 1000} detik).`);
    }
    
    throw new Error(`Eksekusi gagal: ${error.message}`);
  }
}
