import React from 'react';
import { DragDropZone } from '../components/DragDropZone';
import { ThumbnailPreview } from '../components/ThumbnailPreview';
import { QualitySelector } from '../components/QualitySelector';
import { useCompressStore } from '../store/compressStore';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw, ArrowRight } from 'lucide-react';

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
    <div className="w-full max-w-3xl mx-auto">
      <div className="space-y-6">
        {!file ? (
          <div className="pt-8">
            <DragDropZone onFileSelect={setFile} />
          </div>
        ) : !compressedResult ? (
          <div className="space-y-5">
            <ThumbnailPreview file={file} onClear={reset} />
            
            {/* Form Kualitas */}
            <div className="pt-2">
              <QualitySelector />
            </div>
            
            {/* Tombol Eksekusi */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleCompress}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-teal-700 border border-teal-800 rounded hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Kompres PDF Sekarang'
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Tampilan Berhasil & Perbandingan Ukuran */
          <div className="space-y-6 mt-4">
            <div className="bg-white border border-slate-300 rounded-md overflow-hidden">
              <div className="p-4 bg-slate-100 border-b border-slate-300">
                <h3 className="text-sm font-semibold text-slate-800">Hasil Kompresi</h3>
              </div>
              
              <div className="p-6">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-4 bg-slate-50 text-sm font-medium text-slate-600 w-1/3">Ukuran Awal</th>
                      <td className="py-3 px-4 text-sm text-slate-800">
                        {compressedResult.originalSize ? formatBytes(compressedResult.originalSize) : '?'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-4 bg-slate-50 text-sm font-medium text-slate-600">Ukuran Baru</th>
                      <td className="py-3 px-4 text-sm font-bold text-teal-700">
                        {compressedResult.newSize ? formatBytes(compressedResult.newSize) : '?'}
                      </td>
                    </tr>
                    <tr>
                      <th className="py-3 px-4 bg-slate-50 text-sm font-medium text-slate-600">Penghematan</th>
                      <td className="py-3 px-4 text-sm text-slate-800">
                        {savedPercentage}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-2"
              >
                Batal / Ulangi
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 border border-teal-800 rounded hover:bg-teal-800 flex items-center gap-2"
              >
                <Save size={16} />
                Simpan File Kompresi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
