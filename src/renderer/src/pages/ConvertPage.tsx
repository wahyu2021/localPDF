import React, { useRef, useState, useEffect } from 'react';
import { useConvertStore, ConvertMode } from '../store/convertStore';
import { FileArchive, Loader2, UploadCloud, X, ArrowRight, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export function ConvertPage() {
  const {
    files,
    mode,
    isProcessing,
    result,
    setFiles,
    addFiles,
    removeFile,
    setMode,
    setIsProcessing,
    setResult,
    reset,
  } = useConvertStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Mendaftarkan event IPC progress listener
  useEffect(() => {
    if (!window.api) return;
    const unsubscribe = window.api.onProgressUpdate((data) => {
      // Progress UI untuk convert tidak di-store secara global agar sederhana,
      // tetapi bisa kita tangkap disini untuk merubah text "Memproses X%"
      // Karena kita pakai Loader2 spinner biasa, kita bisa update state lokal jika perlu.
    });
    return () => unsubscribe();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (selectedFiles: File[]) => {
    const validExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];
    
    const validFiles = selectedFiles.filter(file => {
      const name = file.name.toLowerCase();
      return validExtensions.some(ext => name.endsWith(ext));
    });

    if (validFiles.length < selectedFiles.length) {
      toast.error('Beberapa file diabaikan karena format tidak didukung.');
    }

    if (validFiles.length > 0) {
      addFiles(validFiles);
      setResult(null);
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    // Validasi mode dan input file
    const hasPdf = files.some(f => f.name.toLowerCase().endsWith('.pdf'));
    const hasImage = files.some(f => f.name.toLowerCase().match(/\.(jpg|jpeg|png)$/));
    const hasOffice = files.some(f => f.name.toLowerCase().match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/));

    if (mode === 'pdf-to-image' && !hasPdf) {
      toast.error('Pilih minimal 1 file PDF untuk mode PDF ke Gambar.');
      return;
    }

    if (mode === 'image-to-pdf' && !hasImage) {
      toast.error('Pilih minimal 1 file Gambar untuk mode Gambar ke PDF.');
      return;
    }

    if (mode === 'office-to-pdf' && !hasOffice) {
      toast.error('Pilih minimal 1 file Office untuk mode Office ke PDF.');
      return;
    }

    try {
      const outputDirectory = await window.api.selectFolder();
      if (!outputDirectory) {
        toast.info('Konversi dibatalkan.');
        return;
      }

      setIsProcessing(true);
      toast.loading('Sedang memproses konversi...', { id: 'convert-progress' });

      // Kumpulkan path file dari object File (dibantu API context bridge)
      const filePaths = files.map(f => {
        return window.api.getFilePath(f);
      }).filter(p => p !== '');

      const payload = {
        filePaths,
        mode,
        outputDirectory
      };

      const res = await window.api.convertPdf(payload);

      if (res.success) {
        setResult(res);
        toast.success(`Konversi sukses! ${res.filesGenerated} file dihasilkan.`, { id: 'convert-progress' });
      } else {
        toast.error(`Gagal melakukan konversi: ${res.error}`, { id: 'convert-progress' });
      }
    } catch (err: any) {
      toast.error(`Terjadi kesalahan: ${err.message}`, { id: 'convert-progress' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenFolder = () => {
    if (result?.outputDirectory) {
      window.api.openOutputFolder(result.outputDirectory);
    }
  };

  const handleReset = () => {
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-6 animate-in fade-in duration-500">
      
      {/* Jika belum ada file, tampilkan kotak Upload Besar */}
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Convert PDF</h1>
            <p className="text-slate-500 mt-3 text-lg max-w-xl mx-auto">
              Ubah dokumen Office dan Gambar menjadi PDF, atau ekstrak PDF menjadi Gambar. Sepenuhnya offline.
            </p>
          </div>

          <Card 
            className={`w-full max-w-3xl border-2 border-dashed transition-all duration-300 ease-out cursor-pointer group ${
              isDragging ? 'border-teal-500 bg-teal-50 scale-[1.02] shadow-xl' : 'border-slate-300 bg-white hover:border-teal-400 hover:shadow-lg'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="flex flex-col items-center justify-center py-20 px-6">
              <div className={`p-6 rounded-full transition-transform duration-500 ${isDragging ? 'bg-teal-100 scale-110' : 'bg-slate-100 group-hover:scale-110'}`}>
                <FileArchive size={64} className={isDragging ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-500'} />
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mt-6 mb-2">
                {isDragging ? 'Lepaskan file di sini' : 'Pilih Dokumen'}
              </h3>
              <p className="text-slate-500 text-center text-sm max-w-sm leading-relaxed mb-6">
                atau tarik & jatuhkan file ke area ini.<br />
                Mendukung: Word, Excel, PPT, JPG, PNG, dan PDF.
              </p>
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white shadow-md rounded-full px-8 pointer-events-none">
                Jelajahi File
              </Button>
            </CardContent>
          </Card>
          <input
            type="file"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
          />
        </div>
      ) : (
        /* Workspace Konversi (Jika sudah ada file) */
        <div className="flex flex-col min-h-[70vh]">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Konversi Dokumen</h2>
              <p className="text-sm text-slate-500 mt-1">Ubah format dokumen Anda dengan aman.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="text-teal-700 bg-teal-50 border-teal-200 hover:bg-teal-100 shadow-sm"
              disabled={isProcessing}
            >
              <UploadCloud size={18} className="mr-2" />
              Tambah File
            </Button>
            <input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Kolom Kiri: Daftar File (Visual) */}
            <div className="lg:col-span-7 flex flex-col h-full space-y-6">
              <Card className="shadow-sm border-slate-200 flex-1 flex flex-col overflow-hidden min-h-[500px]">
                <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-700">Daftar Dokumen ({files.length})</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-auto bg-slate-50/50">
                  <div className="divide-y divide-slate-100">
                    {files.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-4 overflow-hidden">
                          <div className="bg-teal-50 p-2 rounded-lg text-teal-600 shrink-0">
                            {file.name.toLowerCase().endsWith('.pdf') ? <FileText size={24} /> : <ImageIcon size={24} />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-slate-700 truncate">{file.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{formatSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0 ml-4"
                          disabled={isProcessing}
                        >
                          <X size={18} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Kolom Kanan: Pengaturan Konversi (Aksi) */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <Card className="shadow-md border-slate-200 min-h-[500px] flex flex-col">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Pengaturan Konversi</CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  {/* Pilihan Arah Konversi */}
                  <div className="mb-6">
                    <Label className="block text-sm font-bold text-slate-800 mb-4">Pilih Format Konversi</Label>
                    <RadioGroup
                      value={mode}
                      onValueChange={(val: ConvertMode) => setMode(val)}
                      disabled={isProcessing}
                      className="space-y-3"
                    >
                      <Label
                        htmlFor="mode-office"
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          mode === 'office-to-pdf' ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-100 ring-offset-1' : 'border-slate-200 hover:border-teal-200 hover:bg-slate-50'
                        }`}
                      >
                        <RadioGroupItem value="office-to-pdf" id="mode-office" className="sr-only" />
                        <div className="flex flex-col ml-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-700">Office ke PDF</span>
                          </div>
                          <span className="text-sm text-slate-500 mt-1 font-normal leading-relaxed">
                            Ubah Word, Excel, PPT menjadi PDF murni.
                          </span>
                        </div>
                      </Label>

                      <Label
                        htmlFor="mode-image-pdf"
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          mode === 'image-to-pdf' ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-100 ring-offset-1' : 'border-slate-200 hover:border-teal-200 hover:bg-slate-50'
                        }`}
                      >
                        <RadioGroupItem value="image-to-pdf" id="mode-image-pdf" className="sr-only" />
                        <div className="flex flex-col ml-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-700">Gambar ke PDF</span>
                          </div>
                          <span className="text-sm text-slate-500 mt-1 font-normal leading-relaxed">
                            Gabungkan gambar JPG/PNG ke dalam halaman PDF.
                          </span>
                        </div>
                      </Label>

                      <Label
                        htmlFor="mode-pdf-image"
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          mode === 'pdf-to-image' ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-100 ring-offset-1' : 'border-slate-200 hover:border-teal-200 hover:bg-slate-50'
                        }`}
                      >
                        <RadioGroupItem value="pdf-to-image" id="mode-pdf-image" className="sr-only" />
                        <div className="flex flex-col ml-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-700">PDF ke Gambar</span>
                          </div>
                          <span className="text-sm text-slate-500 mt-1 font-normal leading-relaxed">
                            Ekstrak semua halaman PDF menjadi gambar JPG (Batch).
                          </span>
                        </div>
                      </Label>
                    </RadioGroup>
                  </div>

                  {/* Spacer untuk menekan tombol aksi ke bawah */}
                  <div className="flex-1"></div>

                  {/* Tombol Aksi */}
                  {result && result.success ? (
                    <div className="space-y-3 bg-teal-50 p-4 rounded-xl border border-teal-100 animate-in fade-in zoom-in-95">
                      <div className="flex items-center space-x-3 text-teal-700 mb-2">
                        <div className="bg-teal-100 p-1.5 rounded-full shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="font-bold text-sm">Berhasil Mengonversi {result.filesGenerated} File</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button 
                          variant="outline" 
                          onClick={handleReset}
                          className="w-full bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        >
                          Mulai Baru
                        </Button>
                        <Button 
                          onClick={handleOpenFolder}
                          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          Buka Folder
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleConvert}
                      disabled={isProcessing}
                      className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold shadow-lg shadow-teal-600/20 transition-all active:scale-[0.98]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          Konversi Sekarang
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
