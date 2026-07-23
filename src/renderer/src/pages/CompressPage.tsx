import React, { useRef } from 'react';
import { DragDropZone } from '../components/DragDropZone';
import { ThumbnailPreview } from '../components/ThumbnailPreview';
import { PDFCanvasPreview } from '../components/PDFCanvasPreview';
import { QualitySelector } from '../components/QualitySelector';
import { useCompressStore } from '../store/compressStore';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw, ArrowRight, UploadCloud } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function CompressPage() {
  const { file, filePath, setFile, quality, customDpi, isProcessing, setIsProcessing, compressedResult, setCompressedResult, reset } = useCompressStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // Membatalkan hasil dan mengulang dari state file yang sama
    setCompressedResult(null);
  };

  // Kalkulasi persentase hemat
  const savedPercentage = compressedResult?.originalSize && compressedResult?.newSize
    ? ((compressedResult.originalSize - compressedResult.newSize) / compressedResult.originalSize * 100).toFixed(1)
    : 0;

  return (
    <div className="w-full max-w-5xl mx-auto pb-10">
      <div className="space-y-6">
        {!file ? (
          <div className="pt-8 animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Kompres PDF</h2>
              <p className="text-slate-500 mt-2">Perkecil ukuran file PDF Anda dengan mudah tanpa banyak kehilangan kualitas.</p>
            </div>
            <DragDropZone onFileSelect={setFile} className="h-72 shadow-sm" />
          </div>
        ) : !compressedResult ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6 pt-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Pengaturan Kompresi</h2>
                <p className="text-sm text-slate-500 mt-1">Sesuaikan kualitas file PDF Anda sebelum dikompres.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="text-teal-700 bg-teal-50 border-teal-200 hover:bg-teal-100 shadow-sm"
              >
                <UploadCloud size={18} className="mr-2" />
                Ganti File
              </Button>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
            </div>

            {/* 2 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Kolom Kiri: Previews */}
              <div className="lg:col-span-7 space-y-4">
                <ThumbnailPreview file={file} onClear={reset} />
                <PDFCanvasPreview file={file} />
              </div>
              
              {/* Kolom Kanan: Settings & Actions */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm">Tingkat Kompresi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QualitySelector />
                  </CardContent>
                </Card>
                
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
        ) : (
          /* Tampilan Berhasil & Perbandingan Ukuran */
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
      </div>
    </div>
  );
}
