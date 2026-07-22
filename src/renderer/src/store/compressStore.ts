import { create } from 'zustand';
import type { CompressPayload } from '../../../shared/ipc-types';

export type CompressionLevel = CompressPayload['level'];

interface CompressState {
  file: File | null;
  quality: CompressionLevel;
  customDpi: number;
  isProcessing: boolean;
  
  // Actions
  setFile: (file: File | null) => void;
  setQuality: (quality: CompressionLevel) => void;
  setCustomDpi: (dpi: number) => void;
  setIsProcessing: (status: boolean) => void;
  reset: () => void;
}

export const useCompressStore = create<CompressState>((set) => ({
  file: null,
  quality: 'screen', // Mode default (Extreme Compression)
  customDpi: 72,
  isProcessing: false,
  
  setFile: (file) => set({ file }),
  setQuality: (quality) => set({ quality }),
  setCustomDpi: (customDpi) => set({ customDpi }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  reset: () => set({ file: null, quality: 'screen', customDpi: 72, isProcessing: false }),
}));
