import { create } from 'zustand';

export type SplitMode = 'extract' | 'split_all';

interface SplitState {
  file: File | null;
  mode: SplitMode;
  pagesInput: string;
  isProcessing: boolean;
  progress: number;
  result: {
    success: boolean;
    outputDirectory?: string;
    filesGenerated?: number;
    error?: string;
  } | null;
  setFile: (file: File | null) => void;
  setMode: (mode: SplitMode) => void;
  setPagesInput: (pages: string) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setProgress: (progress: number) => void;
  setResult: (result: SplitState['result']) => void;
  reset: () => void;
}

export const useSplitStore = create<SplitState>((set) => ({
  file: null,
  mode: 'extract',
  pagesInput: '',
  isProcessing: false,
  progress: 0,
  result: null,
  setFile: (file) => set({ file }),
  setMode: (mode) => set({ mode }),
  setPagesInput: (pagesInput) => set({ pagesInput }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setProgress: (progress) => set({ progress }),
  setResult: (result) => set({ result }),
  reset: () => set({ file: null, mode: 'extract', pagesInput: '', isProcessing: false, progress: 0, result: null }),
}));
