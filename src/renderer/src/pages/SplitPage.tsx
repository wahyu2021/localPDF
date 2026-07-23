import React, { useRef, useState } from 'react';
import { useSplitStore, SplitMode } from '../store/splitStore';
import { ArrowLeft, FolderOpen, Scissors, File as FileIcon, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function SplitPage() {
  const {
    file,
    mode,
    pagesInput,
    isProcessing,
    result,
    setFile,
    setMode,
    setPagesInput,
    setIsProcessing,
    setResult,
    reset,
  } = useSplitStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProcess = async () => {
    if (!file) return;
    
    if (mode === 'extract' && !pagesInput.trim()) {
      toast.error('Harap masukkan rentang halaman (contoh: 1-3, 5).');
      return;
    }

    try {
      
      // Pilih folder tujuan
      const outputDirectory = await window.api.selectFolder();
      if (!outputDirectory) {
        return; // User canceled
      }
      
      setIsProcessing(true);
      const filePath = window.api.getFilePath(file);
      
      const payload = {
        filePath,
        mode,
        pages: pagesInput.trim(),
        outputDirectory
      };
      
      const res = await window.api.splitPdf(payload);
      
      if (res.success) {
        setResult(res);
        toast.success('Berhasil memecah PDF!');
      } else {
        toast.error(res.error || 'Terjadi kesalahan saat memecah PDF.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error tidak diketahui saat memproses PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenFolder = () => {
    if (result && result.outputDirectory) {
      window.api.openOutputFolder(result.outputDirectory);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-6">
        {!file && (
          <div className="bg-white border border-slate-300 rounded-md overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-10">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
              <Scissors size={32} />
            </div>
            <h3 className="text-xl font-medium text-slate-700">Pilih Dokumen PDF</h3>
            <p className="text-slate-500 text-center max-w-sm mb-4">
              Pilih satu file PDF yang ingin Anda pisah halamannya.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              Pilih File PDF
            </button>
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {file && !result && (
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileIcon size={24} className="text-blue-500 flex-shrink-0" />
                <span className="font-medium text-slate-700 truncate" title={file.name}>
                  {file.name}
                </span>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Hapus File"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-slate-700 mb-3">Mode Pemecahan</h4>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${mode === 'extract' ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input
                    type="radio"
                    name="splitMode"
                    value="extract"
                    checked={mode === 'extract'}
                    onChange={() => setMode('extract')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="block font-medium text-slate-800">Ekstrak Halaman</span>
                    <span className="block text-xs text-slate-500 mt-1">Pilih halaman tertentu untuk disatukan</span>
                  </div>
                </label>
                <label className={`flex-1 flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${mode === 'split_all' ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input
                    type="radio"
                    name="splitMode"
                    value="split_all"
                    checked={mode === 'split_all'}
                    onChange={() => setMode('split_all')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="block font-medium text-slate-800">Pecah Semua</span>
                    <span className="block text-xs text-slate-500 mt-1">1 file = 1 halaman terpisah</span>
                  </div>
                </label>
              </div>
            </div>

            {mode === 'extract' && (
              <div className="mb-6">
                <label htmlFor="pagesInput" className="block font-medium text-slate-700 mb-2">Rentang Halaman</label>
                <input
                  id="pagesInput"
                  type="text"
                  value={pagesInput}
                  onChange={(e) => setPagesInput(e.target.value)}
                  placeholder="Contoh: 1-3, 5, 7-10"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              </div>
            )}

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-300 bg-white flex justify-end gap-3 mt-4">
              <button
                onClick={reset}
                disabled={isProcessing}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 border border-transparent rounded hover:bg-slate-200 disabled:opacity-60"
              >
                Batal
              </button>
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-teal-700 border border-teal-800 rounded hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Scissors size={16} />
                    Pisah PDF
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center gap-4 mt-8 shadow-sm">
             <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 size={32} />
             </div>
             <h3 className="text-2xl font-semibold text-slate-800">Berhasil Memecah PDF!</h3>
             <p className="text-slate-500 text-center mb-6">
               Proses selesai. File telah disimpan di folder tujuan.
             </p>

             <div className="flex gap-4 w-full">
                <button
                  onClick={handleOpenFolder}
                  className="flex-1 py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <FolderOpen size={20} className="text-slate-500" />
                  Buka Folder Tujuan
                </button>
                <button
                  onClick={reset}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <FileIcon size={20} />
                  Pecah File Lainnya
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
