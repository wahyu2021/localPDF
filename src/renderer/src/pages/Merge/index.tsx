import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileText, X, UploadCloud, GripVertical, Save, Loader2, Layers, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DragDropZone } from '../../components/shared/DragDropZone';
import { ThumbnailPreview } from '../../components/shared/ThumbnailPreview';
import { PDFCanvasPreview } from '../../components/shared/PDFCanvasPreview';
import { useMergeStore } from '../../store/mergeStore';
import { cn } from '../../utils/cn';
import { FeatureLayout } from '../../components/layout/FeatureLayout';
import { useProgressTracker } from '../../hooks/useProgressTracker';
import { ProgressBar } from '../../components/shared/ProgressBar';

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
    setMergeResult,
    progress,
    setProgress
  } = useMergeStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const { timeRemaining, startTracking, stopTracking } = useProgressTracker(setProgress);

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

  const onDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget as any);
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

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error('Dibutuhkan minimal 2 file PDF untuk digabungkan.');
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);
      startTracking();
      
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
      stopTracking();
    }
  };

  const handleSave = async () => {
    if (!mergeResult || !mergeResult.tempPath) return;

    try {
      const firstFileName = files[0].file.name.replace(/\.pdf$/i, '');
      const defaultFileName = `${firstFileName}_merged.pdf`;

      const saveRes = await window.api.savePdf({
        tempPath: mergeResult.tempPath,
        defaultFileName
      });

      if (saveRes.success) {
        toast.success('File berhasil disimpan!');
        clearFiles();
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
    <FeatureLayout 
      title="Gabungkan PDF" 
      description="Susun dan gabungkan beberapa file PDF menjadi satu dokumen."
      headerActions={
        !mergeResult ? (
          <>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="text-teal-700 bg-teal-50 border-teal-200 hover:bg-teal-100 shadow-sm"
            >
              <UploadCloud size={18} className="mr-2" />
              Tambah File
            </Button>
            <input
              type="file"
              multiple
              accept="application/pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
          </>
        ) : null
      }
    >
      {!mergeResult ? (
        <div className="animate-in fade-in duration-500">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-5 flex flex-col h-full space-y-6">
              <Card className="shadow-sm border-slate-200 flex flex-col h-full min-h-[300px]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm">Tambahkan PDF Baru</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div 
                    className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-400 hover:border-teal-400 hover:bg-teal-50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                      <UploadCloud size={32} className="text-teal-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-600 mb-1">Pilih File PDF</p>
                    <p className="text-xs text-slate-500 text-center px-4">Tarik & jatuhkan file atau klik untuk menelusuri</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                {isProcessing && <ProgressBar progress={progress} timeRemaining={timeRemaining} label="Progres Penggabungan" />}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={clearFiles}
                    disabled={isProcessing || files.length === 0}
                    className="flex-1 py-6 text-slate-600 shadow-sm"
                  >
                    Bersihkan
                  </Button>
                  <Button
                    onClick={handleMerge}
                    disabled={isProcessing || files.length < 2}
                    className="flex-[2] py-6 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={18} className="animate-spin mr-2" />
                        Menggabungkan...
                      </>
                    ) : (
                      <>
                        Gabungkan PDF
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col h-full">
              <Card className="shadow-sm border-slate-200 h-full flex flex-col min-h-[365px]">
                <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm">Urutan Penggabungan</CardTitle>
                  <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {files.length} File
                  </span>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto mr-2 space-y-3">
                  {files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 min-h-[200px] border-2 border-dashed border-slate-200 rounded-xl">
                      <Layers size={32} className="mb-2 text-slate-300" />
                      <p className="text-sm font-medium">Belum ada file yang ditambahkan.</p>
                    </div>
                  ) : (
                    files.map((item, index) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, index)}
                        onDragOver={(e) => onDragOver(e)}
                        onDrop={(e) => onDrop(e, index)}
                        className={cn(
                          "flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm group hover:border-teal-300 hover:shadow-md transition-all",
                          draggedIdx === index ? "opacity-40 scale-95" : ""
                        )}
                      >
                        <div className="text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500 transition-colors">
                          <GripVertical size={20} />
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-teal-50 text-teal-600 shrink-0 border border-teal-100">
                          <FileText size={24} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold text-slate-800 truncate" title={item.file.name}>
                            {item.file.name}
                          </p>
                          <p className="text-xs font-medium text-slate-500 mt-1">
                            {formatBytes(item.file.size)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFile(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                          title="Hapus dari daftar"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in zoom-in-95 duration-500 max-w-2xl mx-auto mt-12">
          <Card className="border-slate-200 shadow-sm text-center pt-8">
            <CardContent>
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Layers size={40} />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 mb-3">Penggabungan Selesai!</h2>
              <p className="text-slate-500 mb-10 text-lg">
                <span className="font-extrabold text-emerald-600">{files.length}</span> file PDF Anda berhasil digabungkan menjadi satu.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Total Ukuran Awal</p>
                  <p className="text-2xl font-bold text-slate-700">
                    {mergeResult.totalOriginalSize ? formatBytes(mergeResult.totalOriginalSize) : '?'}
                  </p>
                </div>
                <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-widest">Ukuran Gabungan</p>
                  <p className="text-2xl font-black text-emerald-700">
                    {mergeResult.newSize ? formatBytes(mergeResult.newSize) : '?'}
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="px-8 py-6 text-sm font-bold shadow-sm"
                >
                  Ulangi
                </Button>
                <Button
                  onClick={handleSave}
                  className="px-8 py-6 text-sm font-bold bg-teal-600 hover:bg-teal-700 shadow-sm"
                >
                  <Save size={18} className="mr-2" />
                  Simpan Hasil Gabungan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </FeatureLayout>
  );
}
