import React, { useRef, useState, useEffect } from 'react';
import { useSplitStore, SplitMode } from '../store/splitStore';
import { FileArchive, FolderOpen, Loader2, UploadCloud, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
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
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageError, setPageError] = useState<string>('');

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
    setTotalPages(0);
    setPageError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  // UX: Event handler untuk Drag and Drop
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

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

  useEffect(() => {
    if (!pagesInput.trim() || totalPages === 0) {
      setPageError('');
      return;
    }
    
    // Validasi out of bounds
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

                {/* Kolom Kanan: Pengaturan */}
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

                  {/* Actions */}
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
                      disabled={isProcessing}
                      className="flex-2 py-6 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={18} className="animate-spin mr-2" />
                          Memproses...
                        </>
                      ) : (
                        'Pisahkan Sekarang'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Tampilan Berhasil */
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
      </div>
    </div>
  );
}
