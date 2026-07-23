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
    <div className="w-full max-w-5xl mx-auto pb-10">
      <div className="space-y-6">
        
        {!result ? (
          <div className="animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8 pt-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Pisahkan PDF</h2>
                <p className="text-sm text-slate-500 mt-1">Ekstrak halaman tertentu atau pecah file menjadi banyak bagian.</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 flex items-center gap-2 transition-colors shadow-sm"
              >
                <UploadCloud size={18} />
                {file ? 'Ganti File' : 'Pilih File PDF'}
              </button>
              <input
                type="file"
                accept=".pdf,application/pdf"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {!file ? (
              <div 
                className={`flex flex-col items-center justify-center h-72 border-2 border-dashed rounded-2xl transition-colors cursor-pointer shadow-sm ${
                  isDragging ? 'border-teal-500 bg-teal-50 text-teal-600' : 'border-slate-300 bg-white text-slate-400 hover:border-teal-400 hover:bg-teal-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={onDragOver}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-teal-100' : 'bg-slate-100'}`}>
                  <UploadCloud size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Pilih atau Tarik File PDF</h3>
                <p className="text-sm text-slate-500">Jatuhkan file di sini untuk mulai memisahkan</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                {/* Kolom Kiri: Preview */}
                <div className="lg:col-span-7 space-y-4">
                  <ThumbnailPreview file={file} onClear={handleRemoveFile} />
                  <PDFCanvasPreview file={file} />
                </div>

                {/* Kolom Kanan: Pengaturan */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 mb-5">Mode Pemecahan</h4>
                    <div className="flex flex-col gap-4">
                      <label className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition-colors ${mode === 'extract' ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <div className="mt-0.5">
                          <input
                            type="radio"
                            name="splitMode"
                            value="extract"
                            checked={mode === 'extract'}
                            onChange={() => setMode('extract')}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-slate-800">Ekstrak Halaman</span>
                          <span className="block text-xs text-slate-500 mt-1 leading-relaxed">Pilih halaman atau rentang halaman tertentu untuk disatukan menjadi 1 file.</span>
                        </div>
                      </label>
                      
                      <label className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition-colors ${mode === 'split_all' ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <div className="mt-0.5">
                          <input
                            type="radio"
                            name="splitMode"
                            value="split_all"
                            checked={mode === 'split_all'}
                            onChange={() => setMode('split_all')}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-slate-800">Pecah Semua Halaman</span>
                          <span className="block text-xs text-slate-500 mt-1 leading-relaxed">Pisahkan setiap halaman menjadi file PDF individual (1 file = 1 halaman).</span>
                        </div>
                      </label>
                    </div>

                    {mode === 'extract' && (
                      <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in">
                        <label htmlFor="pagesInput" className="block text-sm font-bold text-slate-800 mb-2">Rentang Halaman</label>
                        <input
                          id="pagesInput"
                          ref={pageInputRef}
                          type="text"
                          value={pagesInput}
                          onChange={handlePagesInputChange}
                          placeholder="Contoh: 1-3, 5, 7-10"
                          className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-sm"
                        />
                        <p className="text-xs text-slate-500 mt-2">Gunakan koma untuk memisahkan, dan strip untuk rentang.</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleRemoveFile}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-3.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-60 transition-colors shadow-sm"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className="flex-[2] flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold text-white bg-teal-600 border border-teal-700 rounded-xl hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        'Pisahkan Sekarang'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
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
