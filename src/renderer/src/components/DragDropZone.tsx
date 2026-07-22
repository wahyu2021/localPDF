import React, { useState, useRef } from 'react';
import { UploadCloud, FileType2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface DragDropZoneProps {
  onFileSelect: (file: File) => void;
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
        onFileSelect(file);
      } else {
        alert('Mohon masukkan file dengan format PDF.'); // Sementara pakai alert native
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center w-full max-w-3xl p-12 mx-auto',
        'border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300',
        'group overflow-hidden bg-slate-50',
        isDragging
          ? 'border-teal-500 bg-teal-50/50 shadow-[0_0_40px_rgba(20,184,166,0.15)] scale-[1.02]'
          : 'border-slate-300 hover:border-teal-400 hover:bg-slate-100',
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

      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div
          className={cn(
            'flex items-center justify-center w-24 h-24 mb-6 rounded-full',
            'transition-colors duration-300',
            isDragging ? 'bg-teal-100 text-teal-600' : 'bg-slate-200 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-500'
          )}
        >
          {isDragging ? <FileType2 size={40} className="animate-bounce" /> : <UploadCloud size={40} />}
        </div>
        
        <h3 className="mb-2 text-2xl font-bold text-slate-800">
          Pilih file PDF
        </h3>
        <p className="text-slate-500 font-medium">
          atau tarik dan jatuhkan file PDF ke sini
        </p>
      </div>
    </div>
  );
}
