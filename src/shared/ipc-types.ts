export interface CompressPayload {
  filePath: string;
  level: 'screen' | 'ebook' | 'printer' | 'custom';
  customDPI?: number;
}

export interface CompressResult {
  success: boolean;
  outputPath?: string;
  originalSize?: number;
  newSize?: number;
  error?: string;
}

// Tambahan tipe lainnya dapat disesuaikan seiring fitur diimplementasi
export interface ProgressUpdateData {
  taskId: string;
  percent: number;
}
