import { create } from 'zustand';

export type ConvertMode = 'office-to-pdf' | 'image-to-pdf' | 'pdf-to-image';

interface ConvertState {
  files: File[];
  mode: ConvertMode;
  isProcessing: boolean;
  progress: number;
  result: any;
  setFiles: (files: File[]) => void;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  setMode: (mode: ConvertMode) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setProgress: (progress: number) => void;
  setResult: (result: any) => void;
  reset: () => void;
}

export const useConvertStore = create<ConvertState>((set) => ({
  files: [],
  mode: 'office-to-pdf',
  isProcessing: false,
  progress: 0,
  result: null,
  setFiles: (files) => set({ files }),
  addFiles: (newFiles) => set((state) => ({ files: [...state.files, ...newFiles] })),
  removeFile: (index) => set((state) => ({ files: state.files.filter((_, i) => i !== index) })),
  setMode: (mode) => set({ mode }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setProgress: (progress) => set({ progress }),
  setResult: (result) => set({ result }),
  reset: () => set({
    files: [],
    mode: 'office-to-pdf',
    isProcessing: false,
    progress: 0,
    result: null
  }),
}));
