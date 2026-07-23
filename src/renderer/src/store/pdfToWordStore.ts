import { create } from 'zustand';
import type { PdfToWordResult } from '../../../shared/ipc-types';

interface PdfToWordState {
  file: File | null;
  filePath: string | null;
  isProcessing: boolean;
  progress: number;
  result: PdfToWordResult | null;

  // Actions
  setFile: (file: File | null, path?: string) => void;
  setIsProcessing: (status: boolean) => void;
  setProgress: (progress: number) => void;
  setResult: (result: PdfToWordResult | null) => void;
  reset: () => void;
}

export const usePdfToWordStore = create<PdfToWordState>((set) => ({
  file: null,
  filePath: null,
  isProcessing: false,
  progress: 0,
  result: null,

  setFile: (file, path) => set({ file, filePath: path || null }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setProgress: (progress) => set({ progress }),
  setResult: (result) => set({ result }),
  reset: () => set({ file: null, filePath: null, isProcessing: false, progress: 0, result: null }),
}));
