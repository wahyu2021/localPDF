import React, { useState, useRef } from 'react';
import { UploadCloud, FileType2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface DragDropZoneProps {
  onFileSelect: (file: File, path: string) => void;
  className?: string;
}

export function DragDropZone({ onFileSelect, className }: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const filePath = window.api?.getFilePath ? window.api.getFilePath(file) : ((file as any).path || '');
        onFileSelect(file, filePath);
      } else {
        alert('Mohon masukkan file dengan format PDF.'); 
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const filePath = window.api?.getFilePath ? window.api.getFilePath(file) : ((file as any).path || '');
      onFileSelect(file, filePath);
    }
  };

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center w-full max-w-3xl p-10 mx-auto',
        'border-2 border-dashed rounded-2xl cursor-pointer transition-colors shadow-sm',
        isDragging ? 'border-teal-500 bg-teal-50 text-teal-600' : 'border-slate-300 bg-white text-slate-400 hover:border-teal-400 hover:bg-teal-50',
        className
      )}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept="application/pdf"
        className="hidden"
      />

      <div className="relative z-10 flex flex-col items-center">
        <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-teal-100' : 'bg-slate-100'}`}>
          <UploadCloud size={40} className={isDragging ? 'text-teal-600' : 'text-slate-400'} />
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-1">Pilih atau Tarik File PDF</h3>
        <p className="text-sm text-slate-500 text-center">
          Jatuhkan file di sini untuk memulai
        </p>
      </div>
    </div>
  );
}
