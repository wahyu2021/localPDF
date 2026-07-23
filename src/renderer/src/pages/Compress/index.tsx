import React, { useRef, useState, useEffect } from 'react';
import { DragDropZone } from '../../components/shared/DragDropZone';
import { ThumbnailPreview } from '../../components/shared/ThumbnailPreview';
import { PDFCanvasPreview } from '../../components/shared/PDFCanvasPreview';
import { QualitySelector } from '../../components/shared/QualitySelector';
import { useCompressStore } from '../../store/compressStore';
import { toast } from 'sonner';
import { Loader2, Save, UploadCloud } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { FeatureLayout } from '../../components/layout/FeatureLayout';

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function CompressPage() {
  const { file, filePath, setFile, quality, customDpi, isProcessing, setIsProcessing, compressedResult, setCompressedResult, reset, progress, setProgress } = useCompressStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!window.api) return;
    const unsubscribe = window.api.onProgressUpdate((data) => {
      setProgress(data.percent);
      
      if (startTime && data.percent > 10 && data.percent < 100) {
        const elapsed = Date.now() - startTime;
        const totalEstimated = elapsed / (data.percent / 100);
        const remainingMs = totalEstimated - elapsed;
        
        if (remainingMs > 0) {
          const remainingSec = Math.ceil(remainingMs / 1000);
          if (remainingSec > 60) {
            setTimeRemaining(`~${Math.floor(remainingSec / 60)} mnt ${remainingSec % 60} dtk`);
          } else {
            setTimeRemaining(`~${remainingSec} detik lagi`);
          }
        }
      } else if (data.percent > 0 && data.percent <= 10) {
        setTimeRemaining('Sedang memproses data...');
      } else if (data.percent === 100) {
        setTimeRemaining('Selesai!');
      }
    });
    return () => unsubscribe();
  }, [startTime, setProgress]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
        const path = window.api?.getFilePath ? window.api.getFilePath(selectedFile) : ((selectedFile as any).path || '');
        setFile(selectedFile, path);
      } else {
        toast.error('Mohon hanya pilih file PDF.');
      }
    }
  };

  const handleCompress = async () => {
    if (!file || !filePath) {
      toast.error('File belum siap atau gagal dibaca.');
      return;
    }

    setIsProcessing(true);
    setStartTime(Date.now());
    setProgress(0);
    setTimeRemaining('Menghitung estimasi...');
    const loadingToast = toast.loading('Sedang mengompresi PDF...', {
      description: 'Mohon tunggu, proses ini mungkin memakan waktu.'
    });

    try {
      const result = await window.api.compressPdf({
        filePath: filePath,
        level: quality,
        customDpi: quality === 'custom' ? customDpi : undefined,
      });

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success('Kompresi Selesai!', {
          description: 'Cek perbandingan ukurannya sebelum menyimpan.',
          duration: 3000,
        });
        setCompressedResult(result);
      } else {
        toast.error('Kompresi Gagal', {
          description: result.error || 'Terjadi kesalahan tidak diketahui.'
        });
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error('Koneksi Gagal', {
        description: error.message || 'Koneksi ke sistem terputus.'
      });
    } finally {
      setIsProcessing(false);
      setStartTime(null);
    }
  };

  const handleSave = async () => {
    if (!compressedResult || !compressedResult.tempPath || !file) return;

    try {
      const saveResult = await window.api.savePdf({
        tempPath: compressedResult.tempPath,
        defaultFileName: `${file.name.replace(/\.pdf$/i, '')}_compressed.pdf`
      });

      if (saveResult.success) {
        toast.success('File Tersimpan!', {
          description: `Disimpan di: ${saveResult.savedPath}`
        });
        reset();
      } else if (!saveResult.canceled) {
        toast.error('Gagal Menyimpan', { description: saveResult.error });
      }
    } catch (error: any) {
      toast.error('Gagal Menyimpan', { description: error.message });
    }
  };

  const handleCancel = () => {
    setCompressedResult(null);
  };

  const savedPercentage = compressedResult?.originalSize && compressedResult?.newSize
    ? ((compressedResult.originalSize - compressedResult.newSize) / compressedResult.originalSize * 100).toFixed(1)
    : 0;

  return (
    <FeatureLayout 
      title="Kompres PDF"
      description="Perkecil ukuran file PDF Anda dengan mudah tanpa banyak kehilangan kualitas."
      headerActions={
        !file || !compressedResult ? (
          <>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="text-teal-700 bg-teal-50 border-teal-200 hover:bg-teal-100 shadow-sm"
            >
              <UploadCloud size={18} className="mr-2" />
              {file ? 'Ganti File' : 'Pilih File PDF'}
            </Button>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
          </>
        ) : null
      }
    >
      {!file ? (
        <div className="animate-in fade-in duration-500">
          <DragDropZone onFileSelect={(f) => {
            const path = window.api?.getFilePath ? window.api.getFilePath(f) : ((f as any).path || '');
            setFile(f, path);
          }} className="h-72 shadow-sm" />
        </div>
      ) : !compressedResult ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <ThumbnailPreview file={file} onClear={reset} />
              <PDFCanvasPreview file={file} />
            </div>
            
            <div className="lg:col-span-5 space-y-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm">Tingkat Kompresi</CardTitle>
                </CardHeader>
                <CardContent>
                  <QualitySelector />
                </CardContent>
              </Card>
              
              <div className="flex flex-col gap-3">
                {isProcessing && (
                  <div className="space-y-2 mb-2 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-700">Progres Kompresi</span>
                      <span className="font-bold text-teal-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-teal-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-500 text-right mt-1 font-medium">
                      {timeRemaining}
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={reset}
                    disabled={isProcessing}
                    className="flex-1 py-6"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleCompress}
                    disabled={isProcessing}
                    className="flex-[2] py-6 bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={18} className="animate-spin mr-2" />
                        Memproses...
                      </>
                    ) : (
                      'Kompres Sekarang'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in zoom-in-95 duration-500 max-w-2xl mx-auto mt-12">
          <Card className="border-slate-200 shadow-sm text-center pt-8">
            <CardContent>
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Save size={40} />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 mb-3">Kompresi Berhasil!</h2>
              <p className="text-slate-500 mb-10 text-lg">
                File PDF Anda berhasil diperkecil sebesar <span className="font-extrabold text-emerald-600">{savedPercentage}%</span>.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Ukuran Awal</p>
                  <p className="text-2xl font-bold text-slate-700">
                    {compressedResult.originalSize ? formatBytes(compressedResult.originalSize) : '?'}
                  </p>
                </div>
                <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-widest">Ukuran Baru</p>
                  <p className="text-2xl font-black text-emerald-700">
                    {compressedResult.newSize ? formatBytes(compressedResult.newSize) : '?'}
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
                  Simpan File Kompresi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </FeatureLayout>
  );
}
