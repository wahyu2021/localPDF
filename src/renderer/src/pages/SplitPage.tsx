import React, { useRef, useState, useEffect } from 'react';
import { useSplitStore, SplitMode } from '../store/splitStore';
import { FolderOpen, Scissors, File as FileIcon, X, CheckCircle2, UploadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ThumbnailPreview } from '../components/ThumbnailPreview';
import { PDFCanvasPreview } from '../components/PDFCanvasPreview';

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
  const pageInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // UX: Auto-focus input saat mode berpindah ke 'extract'
  useEffect(() => {
    if (mode === 'extract' && file && !result && pageInputRef.current) {
      pageInputRef.current.focus();
    }
  }, [mode, file, result]);

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Mohon hanya pilih file PDF.');
      return;
    }
    setFile(selectedFile);
    setResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  // UX: Event handler untuk Drag and Drop
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // UX: Validasi Real-time input teks
  const handlePagesInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hanya mengizinkan angka, koma, spasi, dan strip
    const val = e.target.value.replace(/[^0-9,\-\s]/g, '');
    setPagesInput(val);
  };

  const handleProcess = async () => {
    if (!file) return;
    
    if (mode === 'extract' && !pagesInput.trim()) {
      toast.error('Harap masukkan rentang halaman (contoh: 1-3, 5).');
      return;
    }

    try {
      const outputDirectory = await window.api.selectFolder();
      if (!outputDirectory) {
        return; 
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
        
        {!result ? (
          <div className="bg-white border border-slate-300 rounded-md overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-100 border-b border-slate-300 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Pilih File & Pengaturan</h3>
              </div>
              {!file && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded hover:bg-teal-100 flex items-center gap-2 transition-colors"
                >
                  <UploadCloud size={16} />
                  Pilih File PDF
                </button>
              )}
              <input
                type="file"
                accept=".pdf,application/pdf"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="p-4 bg-slate-50 min-h-[300px]">
              {!file ? (
                <div 
                  className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-md transition-colors cursor-pointer ${
                    isDragging ? 'border-teal-500 bg-teal-50 text-teal-600' : 'border-slate-300 bg-white text-slate-400 hover:border-teal-400 hover:bg-teal-50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                >
                  <UploadCloud size={40} className="mb-3" />
                  <p className="text-sm font-medium">Klik atau drop file ke sini</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Kolom Kiri: Preview */}
                    <div className="space-y-4">
                      <ThumbnailPreview file={file} onClear={handleRemoveFile} />
                      <PDFCanvasPreview file={file} />
                    </div>

                    {/* Kolom Kanan: Pengaturan */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 mb-4">Mode Pemecahan</h4>
                        <div className="flex flex-col gap-3">
                          <label className={`flex items-center gap-3 p-4 border rounded cursor-pointer transition-colors ${mode === 'extract' ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                            <input
                              type="radio"
                              name="splitMode"
                              value="extract"
                              checked={mode === 'extract'}
                              onChange={() => setMode('extract')}
                              className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                            />
                            <div>
                              <span className="block text-sm font-semibold text-slate-800">Ekstrak Halaman</span>
                              <span className="block text-xs text-slate-500 mt-1">Pilih halaman tertentu untuk disatukan</span>
                            </div>
                          </label>
                          <label className={`flex items-center gap-3 p-4 border rounded cursor-pointer transition-colors ${mode === 'split_all' ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                            <input
                              type="radio"
                              name="splitMode"
                              value="split_all"
                              checked={mode === 'split_all'}
                              onChange={() => setMode('split_all')}
                              className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                            />
                            <div>
                              <span className="block text-sm font-semibold text-slate-800">Pecah Semua</span>
                              <span className="block text-xs text-slate-500 mt-1">1 file = 1 halaman terpisah</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {mode === 'extract' && (
                        <div>
                          <label htmlFor="pagesInput" className="block text-sm font-semibold text-slate-800 mb-2">Rentang Halaman</label>
                          <input
                            id="pagesInput"
                            ref={pageInputRef}
                            type="text"
                            value={pagesInput}
                            onChange={handlePagesInputChange}
                            placeholder="Contoh: 1-3, 5, 7-10"
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-shadow shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-300 bg-white flex justify-end gap-3">
              {file && (
                <button
                  onClick={reset}
                  disabled={isProcessing}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 border border-transparent rounded hover:bg-slate-200 disabled:opacity-60"
                >
                  Batal
                </button>
              )}
              <button
                onClick={handleProcess}
                disabled={isProcessing || !file}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-teal-700 border border-teal-800 rounded hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
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
        ) : (
          
          <div className="bg-white border border-slate-300 rounded-md overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-100 border-b border-slate-300">
              <h3 className="text-sm font-semibold text-slate-800">Hasil Pemecahan PDF</h3>
            </div>
            
            <div className="p-6">
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 bg-slate-50 text-sm font-medium text-slate-600 w-1/3">Status</th>
                    <td className="py-3 px-4 text-sm font-semibold text-green-600 flex items-center gap-2">
                      <CheckCircle2 size={18} /> Berhasil
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 bg-slate-50 text-sm font-medium text-slate-600">Mode Pemecahan</th>
                    <td className="py-3 px-4 text-sm text-slate-800">
                      {mode === 'extract' ? 'Ekstrak Halaman' : 'Pecah Semua Halaman'}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-3 px-4 bg-slate-50 text-sm font-medium text-slate-600">Total File Dihasilkan</th>
                    <td className="py-3 px-4 text-sm font-bold text-teal-700">
                      {result.filesGenerated} File
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-300 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={reset}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-2 transition-colors"
              >
                Batal / Ulangi
              </button>
              <button
                onClick={handleOpenFolder}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 border border-teal-800 rounded hover:bg-teal-800 flex items-center gap-2 transition-colors shadow-sm"
              >
                <FolderOpen size={16} />
                Buka Folder Tujuan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
