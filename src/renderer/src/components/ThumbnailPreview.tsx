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
      'relative flex items-center max-w-3xl mx-auto p-4 bg-white border border-slate-200 rounded-2xl shadow-sm animate-in fade-in zoom-in-95 duration-300', 
      className
    )}>
      <div className="flex items-center justify-center w-16 h-16 mr-4 rounded-xl bg-teal-50 text-teal-600">
        <FileText size={32} />
      </div>
      <div className="flex-1 overflow-hidden">
        <h4 className="text-lg font-bold text-slate-800 truncate" title={file.name}>
          {file.name}
        </h4>
        <p className="text-sm font-medium text-slate-500">
          Ukuran asli: {formatBytes(file.size)}
        </p>
      </div>
      <button
        onClick={onClear}
        className="p-3 ml-4 text-slate-400 transition-colors rounded-xl hover:bg-rose-50 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
        title="Batalkan pilihan file"
      >
        <X size={20} />
      </button>
    </div>
  );
}
