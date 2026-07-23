import React, { useRef, useState, useEffect } from 'react';
import { useSplitStore } from '../../store/splitStore';
import { FileArchive, FolderOpen, Loader2, UploadCloud, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { toast } from 'sonner';
import { DragDropZone } from '../../components/shared/DragDropZone';
import { ThumbnailPreview } from '../../components/shared/ThumbnailPreview';
import { PDFCanvasPreview } from '../../components/shared/PDFCanvasPreview';
import { FeatureLayout } from '../../components/layout/FeatureLayout';

export function SplitPage() {
  const {
    file,
    mode,
    pagesInput,
    isProcessing,
    result,
    progress,
    setFile,
    setMode,
    setPagesInput,
    setIsProcessing,
    setResult,
    setProgress,
    reset,
  } = useSplitStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageInputRef = useRef<HTMLInputElement>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageError, setPageError] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!window.api) return;
    const unsubscribe = window.api.onProgressUpdate((data: { percent: number }) => {
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

  useEffect(() => {
    if (mode === 'extract' && file && !result && pageInputRef.current) {
      pageInputRef.current.focus();
    }
  }, [mode, file, result]);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Mohon hanya pilih file PDF.');
      return;
    }
    setFile(selectedFile);
    setResult(null);
    setTotalPages(0);
    setPageError('');
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePagesInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9,\-\s]/g, '');
    setPagesInput(val);
  };

  useEffect(() => {
    if (!pagesInput.trim() || totalPages === 0) {
      setPageError('');
      return;
    }
    
    const numbers = pagesInput.match(/\d+/g);
    if (numbers) {
      for (const numStr of numbers) {
        const num = parseInt(numStr, 10);
        if (num > totalPages) {
          setPageError(`Halaman ${num} melebihi total dokumen (${totalPages} halaman).`);
          return;
        }
        if (num === 0) {
          setPageError('Halaman tidak boleh 0.');
          return;
        }
      }
    }
    setPageError('');
  }, [pagesInput, totalPages]);

  const handleProcess = async () => {
    if (!file) return;
    
    if (mode === 'extract' && !pagesInput.trim()) {
      toast.error('Harap masukkan rentang halaman (contoh: 1-3, 5).');
      return;
    }

    if (pageError) {
      toast.error('Terdapat error pada input halaman Anda.');
      return;
    }

    try {
      const outputDirectory = await window.api.selectFolder();
      if (!outputDirectory) return;
      
      setIsProcessing(true);
      setStartTime(Date.now());
      setProgress(0);
      setTimeRemaining('Menghitung estimasi...');
      
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
      setStartTime(null);
    }
  };

  const handleOpenFolder = () => {
    if (result && result.outputDirectory) {
      window.api.openOutputFolder(result.outputDirectory);
    }
  };

  return (
    <FeatureLayout 
      title="Pisahkan PDF"
      description="Ekstrak halaman tertentu atau pecah file menjadi banyak bagian."
      headerActions={
        !result ? (
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
              accept=".pdf,application/pdf"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />
          </>
        ) : null
      }
    >
      {!result ? (
        <div className="animate-in fade-in duration-500">

          {!file ? (
            <DragDropZone onFileSelect={handleFileSelect} className="h-72" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="lg:col-span-7 space-y-4">
                <ThumbnailPreview file={file} onClear={handleRemoveFile} />
                <PDFCanvasPreview 
                  file={file} 
                  requestedPage={
                    mode === 'extract' && pagesInput.match(/\d+/) 
                      ? parseInt(pagesInput.match(/\d+/)![0], 10) 
                      : 1
                  } 
                  onLoadSuccess={setTotalPages}
                />
              </div>

              <div className="lg:col-span-5 space-y-6">
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm">Mode Pemecahan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={mode} onValueChange={(val: any) => setMode(val)} className="flex flex-col gap-4">
                      <Label
                        htmlFor="extract"
                        className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-colors ${mode === 'extract' ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 hover:bg-slate-50'}`}
                      >
                        <RadioGroupItem value="extract" id="extract" className="mt-0.5 sr-only" />
                        <div className={`mt-0.5 w-4 h-4 shrink-0 rounded-full border flex items-center justify-center ${mode === 'extract' ? 'border-teal-600' : 'border-slate-300'}`}>
                          {mode === 'extract' && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-slate-800">Ekstrak Halaman</span>
                          <span className="block text-xs text-slate-500 mt-1 leading-relaxed font-normal">Pilih halaman atau rentang halaman tertentu untuk disatukan menjadi 1 file.</span>
                        </div>
                      </Label>
                      
                      <Label
                        htmlFor="split_all"
                        className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-colors ${mode === 'split_all' ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 hover:bg-slate-50'}`}
                      >
                        <RadioGroupItem value="split_all" id="split_all" className="mt-0.5 sr-only" />
                        <div className={`mt-0.5 w-4 h-4 shrink-0 rounded-full border flex items-center justify-center ${mode === 'split_all' ? 'border-teal-600' : 'border-slate-300'}`}>
                          {mode === 'split_all' && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-slate-800">Pecah Semua Halaman</span>
                          <span className="block text-xs text-slate-500 mt-1 leading-relaxed font-normal">Pisahkan setiap halaman menjadi file PDF individual (1 file = 1 halaman).</span>
                        </div>
                      </Label>
                    </RadioGroup>

                    {mode === 'extract' && (
                      <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in">
                        <Label htmlFor="pagesInput" className="block text-sm font-bold text-slate-800 mb-2">Rentang Halaman</Label>
                        <Input
                          id="pagesInput"
                          ref={pageInputRef}
                          value={pagesInput}
                          onChange={handlePagesInputChange}
                          placeholder="contoh: 1-5, 8, 11-13"
                          className={`border-2 h-12 ${pageError ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-200 focus-visible:ring-teal-500 focus-visible:border-teal-500'}`}
                        />
                        {pageError ? (
                          <p className="text-red-500 text-xs font-medium mt-2 flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 inline-block"></span>
                            {pageError}
                          </p>
                        ) : (
                          <p className="text-slate-500 text-xs mt-2 font-medium">Pisahkan dengan koma (,) atau gunakan strip (-) untuk rentang halaman.</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-3">
                  {isProcessing && (
                    <div className="space-y-2 mb-2 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-700">Progres Pemisahan</span>
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
                      onClick={handleRemoveFile}
                      disabled={isProcessing}
                      className="flex-1 py-6 shadow-sm text-slate-600"
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleProcess}
                      disabled={isProcessing || (mode === 'extract' && !pagesInput.trim())}
                      className="flex-[2] py-6 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={18} className="animate-spin mr-2" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          Pisahkan Sekarang
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in zoom-in-95 duration-500 max-w-2xl mx-auto mt-12">
          <Card className="border-slate-200 shadow-sm text-center pt-8">
            <CardContent>
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileArchive size={40} />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 mb-3">Pemecahan Selesai!</h2>
              <p className="text-slate-500 mb-10 text-lg">
                Proses {mode === 'extract' ? 'ekstraksi' : 'pemecahan'} PDF berhasil menghasilkan <span className="font-extrabold text-emerald-600">{result.filesGenerated}</span> file.
              </p>
              
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-left mb-10">
                <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Lokasi File Disimpan</p>
                <p className="text-sm font-medium text-slate-700 break-all select-all font-mono bg-white p-3 border border-slate-200 rounded mt-2">
                  {result.outputDirectory}
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={reset}
                  className="px-8 py-6 text-sm font-bold shadow-sm"
                >
                  Proses File Lain
                </Button>
                <Button
                  onClick={handleOpenFolder}
                  className="px-8 py-6 text-sm font-bold bg-teal-600 hover:bg-teal-700 shadow-sm"
                >
                  <FolderOpen size={18} className="mr-2" />
                  Buka Folder Hasil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </FeatureLayout>
  );
}
