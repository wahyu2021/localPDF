import React, { useRef, useState, useEffect } from 'react';
import { DragDropZone } from '../../components/shared/DragDropZone';
import { ThumbnailPreview } from '../../components/shared/ThumbnailPreview';
import { PDFCanvasPreview } from '../../components/shared/PDFCanvasPreview';
import { usePdfToWordStore } from '../../store/pdfToWordStore';
import { toast } from 'sonner';
import { Loader2, Save, UploadCloud, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { FeatureLayout } from '../../components/layout/FeatureLayout';

export function PDFToWordPage() {
  const {
    file,
    filePath,
    setFile,
    isProcessing,
    setIsProcessing,
    progress,
    setProgress,
    result,
    setResult,
    reset,
  } = usePdfToWordStore();

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
        setTimeRemaining('Memuat LibreOffice...');
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

  const handleConvert = async () => {
    if (!file || !filePath) {
      toast.error('File belum siap atau gagal dibaca.');
      return;
    }

    setIsProcessing(true);
    setStartTime(Date.now());
    setProgress(0);
    setTimeRemaining('Memuat LibreOffice...');

    const loadingToast = toast.loading('Sedang mengonversi ke Word...', {
      description: 'LibreOffice sedang memproses PDF Anda. Ini mungkin memerlukan waktu beberapa saat.',
    });

    try {
      const convResult = await window.api.pdfToWord({ filePath });
      toast.dismiss(loadingToast);

      if (convResult.success) {
        toast.success('Konversi Berhasil!', {
          description: 'File Word siap untuk disimpan.',
          duration: 3000,
        });
        setResult(convResult);
      } else {
        toast.error('Konversi Gagal', {
          description: convResult.error || 'Terjadi kesalahan tidak diketahui.',
        });
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error('Koneksi Gagal', {
        description: error.message || 'Koneksi ke sistem terputus.',
      });
    } finally {
      setIsProcessing(false);
      setStartTime(null);
    }
  };

  const handleSave = async () => {
    if (!result?.tempPath || !file) return;

    try {
      const defaultName = file.name.replace(/\.pdf$/i, '') + '.docx';
      const saveResult = await window.api.saveWordFile({
        tempPath: result.tempPath,
        defaultFileName: defaultName,
      });

      if (saveResult.success) {
        toast.success('File Tersimpan!', {
          description: `Disimpan di: ${saveResult.savedPath}`,
        });
        reset();
      } else if (!saveResult.canceled) {
        toast.error('Gagal Menyimpan', { description: saveResult.error });
      }
    } catch (error: any) {
      toast.error('Gagal Menyimpan', { description: error.message });
    }
  };

  return (
    <FeatureLayout
      title="PDF ke Word"
      description="Ubah dokumen PDF menjadi file Word (.docx) yang dapat diedit, 100% luring tanpa upload ke internet."
      headerActions={
        !file || !result ? (
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
          <DragDropZone
            onFileSelect={(f) => {
              const path = window.api?.getFilePath ? window.api.getFilePath(f) : ((f as any).path || '');
              setFile(f, path);
            }}
            className="h-72 shadow-sm"
          />
        </div>
      ) : !result ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <ThumbnailPreview file={file} onClear={reset} />
              <PDFCanvasPreview file={file} />
            </div>

            <div className="lg:col-span-5 space-y-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm">Informasi Konversi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <FileText size={18} className="text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-700">Format Output: .docx</p>
                      <p className="text-blue-600 text-xs mt-1">
                        Menggunakan LibreOffice untuk konversi offline yang andal. Teks dan tata letak dasar akan dipertahankan.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                {isProcessing && (
                  <div className="space-y-2 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-700">Progres Konversi</span>
                      <span className="font-bold text-teal-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-teal-600 h-2.5 rounded-full transition-all duration-500 ease-out"
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
                    onClick={handleConvert}
                    disabled={isProcessing}
                    className="flex-[2] py-6 bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={18} className="animate-spin mr-2" />
                        Mengonversi...
                      </>
                    ) : (
                      'Konversi ke Word'
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
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={40} />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 mb-3">Konversi Berhasil!</h2>
              <p className="text-slate-500 mb-10 text-lg">
                File PDF Anda berhasil diubah menjadi dokumen <span className="font-extrabold text-blue-600">.docx</span> yang dapat diedit.
              </p>

              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setResult(null)}
                  className="px-8 py-6 text-sm font-bold shadow-sm"
                >
                  Konversi Lagi
                </Button>
                <Button
                  onClick={handleSave}
                  className="px-8 py-6 text-sm font-bold bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  <Save size={18} className="mr-2" />
                  Simpan File Word
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </FeatureLayout>
  );
}
