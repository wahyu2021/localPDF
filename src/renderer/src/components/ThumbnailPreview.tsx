import React from 'react';
import { FileText, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface ThumbnailPreviewProps {
  file: File;
  onClear: () => void;
  className?: string;
}

export function ThumbnailPreview({ file, onClear, className }: ThumbnailPreviewProps) {
  // Format bytes menjadi satuan mudah dibaca
  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className={cn(
      'relative flex items-center max-w-3xl mx-auto p-3 bg-white border border-slate-300 rounded-md', 
      className
    )}>
      <div className="flex items-center justify-center w-12 h-12 mr-3 rounded-md bg-teal-50 text-teal-700 border border-teal-100">
        <FileText size={24} />
      </div>
      <div className="flex-1 overflow-hidden">
        <h4 className="text-sm font-semibold text-slate-800 truncate" title={file.name}>
          {file.name}
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          Ukuran asli: {formatBytes(file.size)}
        </p>
      </div>
      <button
        onClick={onClear}
        className="p-2 ml-3 text-slate-500 transition-colors rounded hover:bg-slate-100 hover:text-slate-800 focus:outline-none"
        title="Batalkan pilihan file"
      >
        <X size={18} />
      </button>
    </div>
  );
}
