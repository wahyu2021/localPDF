import { create } from 'zustand';
import { MergeResult } from '../../../shared/ipc-types';

export interface MergeFile {
  id: string;
  path: string;
  file: File;
}

interface MergeStore {
  files: MergeFile[];
  isProcessing: boolean;
  progress: number;
  mergeResult: MergeResult | null;
  addFiles: (newFiles: MergeFile[]) => void;
  removeFile: (id: string) => void;
  reorderFiles: (startIndex: number, endIndex: number) => void;
  clearFiles: () => void;
  setIsProcessing: (status: boolean) => void;
  setProgress: (progress: number) => void;
  setMergeResult: (result: MergeResult | null) => void;
  reset: () => void;
}

export const useMergeStore = create<MergeStore>((set) => ({
  files: [],
  isProcessing: false,
  progress: 0,
  mergeResult: null,

  addFiles: (newFiles) => set((state) => {
    // Hindari duplikasi berdasarkan path
    const existingPaths = new Set(state.files.map(f => f.path));
    const uniqueNewFiles = newFiles.filter(f => !existingPaths.has(f.path));
    return { files: [...state.files, ...uniqueNewFiles] };
  }),
  
  removeFile: (id) => set((state) => ({
    files: state.files.filter(f => f.id !== id)
  })),
  
  reorderFiles: (startIndex, endIndex) => set((state) => {
    const result = Array.from(state.files);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return { files: result };
  }),
  
  clearFiles: () => set({ files: [], mergeResult: null }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setProgress: (progress) => set({ progress }),
  setMergeResult: (result) => set({ mergeResult: result }),
  reset: () => set({ files: [], isProcessing: false, progress: 0, mergeResult: null }),
}));
