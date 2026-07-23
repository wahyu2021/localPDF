export interface CompressPayload {
  filePath: string;
  level: 'screen' | 'ebook' | 'printer' | 'custom';
  customDPI?: number;
}

export interface CompressResult {
  success: boolean;
  tempPath?: string;
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

export interface MergePayload {
  filePaths: string[];
}

export interface MergeResult {
  success: boolean;
  tempPath?: string;
  totalOriginalSize?: number;
  newSize?: number;
  error?: string;
}

export interface SplitPayload {
  filePath: string;
  mode: 'extract' | 'split_all';
  pages?: string;
  outputDirectory: string;
}

export interface SplitResult {
  success: boolean;
  outputDirectory?: string;
  filesGenerated?: number;
  error?: string;
}

export interface ConvertPayload {
  filePaths: string[];
  mode: 'office-to-pdf' | 'image-to-pdf' | 'pdf-to-image';
  outputDirectory: string;
}

export interface ConvertResult {
  success: boolean;
  outputDirectory?: string;
  filesGenerated?: number;
  error?: string;
}

export interface SecurityPayload {
  filePath: string;
  outputDirectory?: string;
  mode: 'lock' | 'unlock' | 'restrict';
  userPassword?: string;
  ownerPassword?: string;
  restrictions?: {
    print?: 'none' | 'low' | 'full';
    modify?: 'none' | 'annotate' | 'form' | 'assembly' | 'all';
    extract?: 'y' | 'n';
  };
}

export interface SecurityResult {
  success: boolean;
  outputPath?: string;
  error?: string;
}
