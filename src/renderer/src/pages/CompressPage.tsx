import React from 'react';
import { DragDropZone } from '../components/DragDropZone';
import { ThumbnailPreview } from '../components/ThumbnailPreview';
import { QualitySelector } from '../components/QualitySelector';
import { useCompressStore } from '../store/compressStore';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function CompressPage() {
  const { file, setFile, quality, customDpi, isProcessing, setIsProcessing, reset } = useCompressStore();

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    const loadingToast = toast.loading('Sedang mengompresi PDF...', {
      description: 'Mohon tunggu, proses ini mungkin memakan waktu.'
    });

    try {
      // Di Electron, objek File hasil input web memiliki atribut tersembunyi "path" (absolute path)
      const filePath = (file as any).path;

      // Panggil IPC bridge ke Main Process
      const result = await window.api.compressPdf({
        filePath,
        level: quality,
        customDpi: quality === 'custom' ? customDpi : undefined,
      });

      toast.dismiss(loadingToast);

      if (result.success) {
        // Kalkulasi penghematan jika ada
        const savedSpace = result.originalSize && result.newSize 
          ? ((result.originalSize - result.newSize) / result.originalSize * 100).toFixed(1)
          : null;
          
        toast.success('Kompresi Selesai!', {
          description: savedSpace 
            ? `Berhasil menghemat ukuran sebesar ${savedSpace}%.`
            : 'File berhasil dikompresi dan disimpan.',
          duration: 5000,
        });
        reset(); // Kembalikan UI ke awal
      } else {
        toast.error('Kompresi Dibatalkan / Gagal', {
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

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-4xl mx-auto w-full space-y-10">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            Compress PDF
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Kurangi ukuran file PDF Anda secara drastis tanpa kehilangan kualitas visual yang signifikan. Cepat, privat, dan offline.
          </p>
        </div>

        {/* Main Workspace Area */}
        <div className="space-y-6">
          {!file ? (
            <DragDropZone onFileSelect={setFile} className="mt-8" />
          ) : (
            <div className="space-y-6">
              <ThumbnailPreview file={file} onClear={() => setFile(null)} />
              
              {/* Form Kualitas */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
                <QualitySelector />
              </div>
              
              {/* Tombol Eksekusi */}
              <div className="flex justify-center pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
                <button
                  onClick={handleCompress}
                  disabled={isProcessing}
                  className="relative flex items-center justify-center gap-3 px-12 py-4 text-lg font-bold text-white transition-all bg-teal-600 rounded-full shadow-xl shadow-teal-500/20 hover:bg-teal-500 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:pointer-events-none disabled:scale-100 group"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      Memproses File...
                    </>
                  ) : (
                    <>
                      Kompres PDF Sekarang
                      <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.4)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
