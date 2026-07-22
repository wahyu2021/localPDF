import { create } from 'zustand';
import type { CompressPayload } from '../../../shared/ipc-types';

export type CompressionLevel = CompressPayload['level'];

interface CompressState {
  file: File | null;
  filePath: string | null;
  quality: CompressionLevel;
  customDpi: number;
  isProcessing: boolean;
  compressedResult: CompressResult | null;
  
  // Actions
  setFile: (file: File | null, path?: string) => void;
  setQuality: (quality: CompressionLevel) => void;
  setCustomDpi: (dpi: number) => void;
  setIsProcessing: (status: boolean) => void;
  setCompressedResult: (result: CompressResult | null) => void;
  reset: () => void;
}

export const useCompressStore = create<CompressState>((set) => ({
  file: null,
  filePath: null,
  quality: 'screen', // Mode default (Extreme Compression)
  customDpi: 72,
  isProcessing: false,
  compressedResult: null,
  
  setFile: (file, path) => set({ file, filePath: path || null }),
  setQuality: (quality) => set({ quality }),
  setCustomDpi: (customDpi) => set({ customDpi }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setCompressedResult: (result) => set({ compressedResult: result }),
  reset: () => set({ file: null, filePath: null, quality: 'screen', customDpi: 72, isProcessing: false, compressedResult: null }),
}));
