export interface CompressPayload {
  filePath: string;
  level: 'screen' | 'ebook' | 'printer' | 'custom';
  customDPI?: number;
}

export interface CompressResult {
  success: boolean;
  tempPath?: string; // Berubah jadi tempPath, bukan langsung outputPath
  originalSize?: number;
  newSize?: number;
  error?: string;
}

export interface SavePayload {
  tempPath: string;
  defaultFileName: string;
}

export interface SaveResult {
  success: boolean;
  savedPath?: string;
  error?: string;
  canceled?: boolean;
}

export interface ProgressUpdateData {
  taskId: string;
  percent: number;
}
