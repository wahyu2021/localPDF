import React, { useRef, useState, useEffect } from 'react';
import { useConvertStore, ConvertMode } from '../store/convertStore';
import { Loader2, UploadCloud, X, ArrowRight, FileText, Image as ImageIcon, FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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

  useEffect(() => {
    if (!window.api) return;
    const unsubscribe = window.api.onProgressUpdate((data) => {
      // Progress UI
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

  const getAcceptedExtensions = () => {
    if (mode === 'office-to-pdf') return ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
    if (mode === 'image-to-pdf') return ['.jpg', '.jpeg', '.png'];
    if (mode === 'pdf-to-image') return ['.pdf'];
    return [];
  };

  const getAcceptString = () => {
    return getAcceptedExtensions().join(',');
  };

  const processFiles = (selectedFiles: File[]) => {
    const validExtensions = getAcceptedExtensions();
    
    const validFiles = selectedFiles.filter(file => {
      const name = file.name.toLowerCase();
      return validExtensions.some(ext => name.endsWith(ext));
    });

    if (validFiles.length < selectedFiles.length) {
      toast.error(`Beberapa file diabaikan karena format tidak didukung untuk mode ini.`);
    }

    if (validFiles.length > 0) {
      addFiles(validFiles);
      setResult(null);
    }
  };

  const handleConvert = async () => {
    if (files.length === 0 || !mode) return;

    try {
      const outputDirectory = await window.api.selectFolder();
      if (!outputDirectory) {
        toast.info('Konversi dibatalkan.');
        return;
      }

      setIsProcessing(true);
      toast.loading('Sedang memproses konversi...', { id: 'convert-progress' });

      const filePaths = files.map(f => window.api.getFilePath(f)).filter(p => p !== '');

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

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderModeSelection = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Pilih Alat Konversi</h1>
        <p className="text-slate-500 mt-3 text-lg max-w-xl mx-auto">
          Apa yang ingin Anda lakukan hari ini? Pilih salah satu mode di bawah ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-6">
        {/* Office to PDF */}
        <Card 
          className="group cursor-pointer hover:border-teal-400 hover:shadow-md transition-colors duration-200 bg-white"
          onClick={() => setMode('office-to-pdf')}
        >
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="bg-teal-50 p-4 rounded-2xl group-hover:bg-teal-100 transition-colors mb-6">
              <FileSpreadsheet size={48} className="text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Office ke PDF</h3>
            <p className="text-slate-500 text-sm">
              Ubah dokumen Word, Excel, dan PowerPoint Anda menjadi PDF murni dengan akurasi tinggi.
            </p>
          </CardContent>
        </Card>

        {/* Image to PDF */}
        <Card 
          className="group cursor-pointer hover:border-blue-400 hover:shadow-md transition-colors duration-200 bg-white"
          onClick={() => setMode('image-to-pdf')}
        >
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="bg-blue-50 p-4 rounded-2xl group-hover:bg-blue-100 transition-colors mb-6">
              <ImageIcon size={48} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Gambar ke PDF</h3>
            <p className="text-slate-500 text-sm">
              Gabungkan kumpulan gambar JPG dan PNG menjadi satu atau beberapa file PDF.
            </p>
          </CardContent>
        </Card>

        {/* PDF to Image */}
        <Card 
          className="group cursor-pointer hover:border-orange-400 hover:shadow-md transition-colors duration-200 bg-white"
          onClick={() => setMode('pdf-to-image')}
        >
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="bg-orange-50 p-4 rounded-2xl group-hover:bg-orange-100 transition-colors mb-6">
              <FileText size={48} className="text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">PDF ke Gambar</h3>
            <p className="text-slate-500 text-sm">
              Ekstrak setiap halaman dari dokumen PDF Anda menjadi file gambar JPG berkualitas tinggi.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (!mode) {
    return renderModeSelection();
  }

  const modeTitles = {
    'office-to-pdf': 'Office ke PDF',
    'image-to-pdf': 'Gambar ke PDF',
    'pdf-to-image': 'PDF ke Gambar',
  };

  const modeDescriptions = {
    'office-to-pdf': 'Tambahkan file Word (.doc/.docx), Excel (.xls/.xlsx), atau PowerPoint (.ppt/.pptx)',
    'image-to-pdf': 'Tambahkan file gambar (.jpg/.jpeg/.png)',
    'pdf-to-image': 'Tambahkan file dokumen PDF (.pdf)',
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-6 animate-in fade-in duration-300">
      
      {/* Tombol Kembali & Judul */}
      <div className="flex items-center mb-8 pb-4 border-b border-slate-200">
        <Button 
          variant="ghost" 
          onClick={reset} 
          className="mr-4 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{modeTitles[mode]}</h2>
          <p className="text-sm text-slate-500 mt-1">{modeDescriptions[mode]}</p>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-12">
          <Card 
            className={`w-full max-w-2xl border-2 border-dashed transition-all duration-300 ease-out cursor-pointer group ${
              isDragging ? 'border-teal-500 bg-teal-50 scale-[1.02] shadow-xl' : 'border-slate-300 bg-white hover:border-teal-400 hover:shadow-lg'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="flex flex-col items-center justify-center py-20 px-6">
              <div className={`p-6 rounded-full transition-transform duration-500 ${isDragging ? 'bg-teal-100 scale-110' : 'bg-slate-100 group-hover:scale-110'}`}>
                <UploadCloud size={64} className={isDragging ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-500'} />
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mt-6 mb-2">
                {isDragging ? 'Lepaskan file di sini' : 'Pilih Dokumen'}
              </h3>
              <p className="text-slate-500 text-center text-sm max-w-sm leading-relaxed mb-6">
                atau tarik & jatuhkan file Anda ke area ini.
              </p>
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white shadow-md rounded-full px-8 pointer-events-none">
                Jelajahi File
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Daftar File */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            <Card className="shadow-sm border-slate-200 flex-1 flex flex-col min-h-[400px]">
              <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-700">Daftar Dokumen ({files.length})</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 text-teal-700 bg-teal-50 border-teal-200 hover:bg-teal-100"
                  disabled={isProcessing}
                >
                  <UploadCloud size={14} className="mr-2" />
                  Tambah
                </Button>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-auto bg-slate-50/50">
                <div className="divide-y divide-slate-100">
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-4 overflow-hidden">
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-600 shrink-0">
                          {file.name.toLowerCase().endsWith('.pdf') ? <FileText size={24} /> : 
                           file.name.toLowerCase().match(/\.(jpg|jpeg|png)$/) ? <ImageIcon size={24} /> : 
                           <FileSpreadsheet size={24} />}
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

          {/* Kolom Kanan: Aksi Konversi */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            <Card className="shadow-md border-slate-200 sticky top-6">
              <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-lg">Proses Konversi</CardTitle>
              </CardHeader>
              
              <CardContent className="pt-6 flex flex-col space-y-6">
                <div className="text-sm text-slate-600 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  Total file yang akan diproses: <strong>{files.length} dokumen</strong>.
                </div>

                {result && result.success ? (
                  <div className="space-y-4 bg-teal-50 p-4 rounded-xl border border-teal-100 animate-in fade-in zoom-in-95">
                    <div className="flex items-center space-x-3 text-teal-700">
                      <div className="bg-teal-100 p-2 rounded-full shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="font-bold text-sm">Konversi Selesai!</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 pt-2">
                      <Button 
                        onClick={handleOpenFolder}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        Buka Folder
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={reset}
                        className="w-full bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      >
                        Kembali ke Menu Awal
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
                        Mulai Konversi
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Hidden input for file selection */}
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={getAcceptString()}
      />
    </div>
  );
}
