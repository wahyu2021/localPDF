import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileText, X, UploadCloud, GripVertical, Save, Loader2 } from 'lucide-react';
import { useMergeStore } from '../store/mergeStore';
import { cn } from '../utils/cn';

export function MergePage() {
  const {
    files,
    isProcessing,
    mergeResult,
    addFiles,
    removeFile,
    reorderFiles,
    clearFiles,
    setIsProcessing,
    setMergeResult
  } = useMergeStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // --- HANDLERS: INPUT FILES ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(
        f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      );
      
      if (selectedFiles.length === 0) {
        toast.error('Mohon hanya pilih file PDF.');
        return;
      }
      
      const newMergeFiles = selectedFiles.map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        path: window.api?.getFilePath ? window.api.getFilePath(file) : ((file as any).path || '')
      }));

      addFiles(newMergeFiles);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  // --- HANDLERS: DRAG AND DROP LIST ---
  const onDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget as any); // Firefox hack
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== idx) {
      reorderFiles(draggedIdx, idx);
    }
    setDraggedIdx(null);
  };

  // --- HANDLERS: MERGE PROCESS ---
  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error('Dibutuhkan minimal 2 file PDF untuk digabungkan.');
      return;
    }

    try {
      setIsProcessing(true);
      const filePaths = files.map(f => f.path);
      
      const result = await window.api.mergePdf({ filePaths });
      
      if (result.success) {
        setMergeResult(result);
        toast.success('Penggabungan berhasil! Silakan simpan hasilnya.');
      } else {
        toast.error(`Gagal menggabungkan: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!mergeResult || !mergeResult.tempPath) return;

    try {
      // Default file name based on the first file in list
      const firstFileName = files[0].file.name.replace(/\.pdf$/i, '');
      const defaultFileName = `${firstFileName}_merged.pdf`;

      const saveRes = await window.api.savePdf({
        tempPath: mergeResult.tempPath,
        defaultFileName
      });

      if (saveRes.success) {
        toast.success('File berhasil disimpan!');
        clearFiles(); // Reset UI
      } else if (!saveRes.canceled) {
        toast.error(`Gagal menyimpan: ${saveRes.error}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan file.');
    }
  };

  const handleCancel = () => {
    clearFiles();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-6">
        
        {/* VIEW 1: Input & List Mode */}
        {!mergeResult ? (
          <div className="bg-white border border-slate-300 rounded-md overflow-hidden">
            <div className="p-4 bg-slate-100 border-b border-slate-300 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Daftar File PDF ({files.length})</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tarik dan jatuhkan (*drag and drop*) file di bawah ini untuk mengatur urutan penggabungan.</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded hover:bg-teal-100 flex items-center gap-2 transition-colors"
              >
                <UploadCloud size={16} />
                Tambah File
              </button>
              <input
                type="file"
                multiple
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
            </div>

            <div className="p-4 bg-slate-50 min-h-[300px]">
              {files.length === 0 ? (
                <div 
                  className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-300 rounded-md bg-white text-slate-400 hover:border-teal-400 hover:bg-teal-50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud size={40} className="mb-3" />
                  <p className="text-sm font-medium">Klik atau drop file ke sini</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((item, index) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, index)}
                      onDragOver={(e) => onDragOver(e)}
                      onDrop={(e) => onDrop(e, index)}
                      className={cn(
                        "flex items-center gap-3 p-3 bg-white border border-slate-200 rounded shadow-sm group",
                        draggedIdx === index ? "opacity-50" : ""
                      )}
                    >
                      <div className="text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500 p-1">
                        <GripVertical size={20} />
                      </div>
                      <div className="flex items-center justify-center w-10 h-10 rounded bg-teal-50 text-teal-600">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-slate-800 truncate" title={item.file.name}>
                          {item.file.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatBytes(item.file.size)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                        title="Hapus dari daftar"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-300 bg-white flex justify-end gap-3">
              {files.length > 0 && (
                <button
                  onClick={clearFiles}
                  disabled={isProcessing}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 border border-transparent rounded hover:bg-slate-200 disabled:opacity-60"
                >
                  Bersihkan
                </button>
              )}
              <button
                onClick={handleMerge}
                disabled={isProcessing || files.length < 2}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-teal-700 border border-teal-800 rounded hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Menggabungkan...
                  </>
                ) : (
                  'Gabungkan PDF'
                )}
              </button>
            </div>
          </div>
        ) : (
          
          /* VIEW 2: Result & Save Mode */
          <div className="bg-white border border-slate-300 rounded-md overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-100 border-b border-slate-300">
              <h3 className="text-sm font-semibold text-slate-800">Hasil Penggabungan</h3>
            </div>
            
            <div className="p-6">
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 bg-slate-50 text-sm font-medium text-slate-600 w-1/3">Jumlah File Digabung</th>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-800">
                      {files.length} File
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 bg-slate-50 text-sm font-medium text-slate-600">Total Ukuran Asli</th>
                    <td className="py-3 px-4 text-sm text-slate-800">
                      {mergeResult.totalOriginalSize ? formatBytes(mergeResult.totalOriginalSize) : '?'}
                    </td>
                  </tr>
                  <tr>
                    <th className="py-3 px-4 bg-slate-50 text-sm font-medium text-slate-600">Ukuran Akhir (Gabungan)</th>
                    <td className="py-3 px-4 text-sm font-bold text-teal-700">
                      {mergeResult.newSize ? formatBytes(mergeResult.newSize) : '?'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-300 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-2 transition-colors"
              >
                Batal / Ulangi
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 border border-teal-800 rounded hover:bg-teal-800 flex items-center gap-2 transition-colors shadow-sm"
              >
                <Save size={16} />
                Simpan Hasil Gabungan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
