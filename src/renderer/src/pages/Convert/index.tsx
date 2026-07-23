import React, { useRef, useState, useEffect } from 'react';
import { Loader2, UploadCloud, X, ArrowRight, FileText, Image as ImageIcon, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { useConvertStore } from '../../store/convertStore';
import { FeatureLayout } from '../../components/layout/FeatureLayout';
import { ConvertModeCards } from './components/ConvertModeCards';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { ProcessActionGroup } from '../../components/shared/ProcessActionGroup';
import { SuccessCard } from '../../components/shared/SuccessCard';
import { useProgressTracker } from '../../hooks/useProgressTracker';

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function ConvertPage() {
  const {
    files, mode, isProcessing, result, outputFormat, progress,
    setFiles, addFiles, removeFile, setMode, setIsProcessing, setResult, reset, setOutputFormat, setProgress
  } = useConvertStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const { progress: localProgress, timeRemaining, startTracking, stopTracking } = useProgressTracker(setProgress, 'Menghitung estimasi...');

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

  const getAcceptString = () => getAcceptedExtensions().join(',');

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
      startTracking();
      toast.loading('Sedang memproses konversi...', { id: 'convert-progress' });

      const filePaths = files.map(f => window.api.getFilePath(f)).filter(p => p !== '');
      const res = await window.api.convertPdf({ filePaths, mode, outputDirectory, outputFormat });

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
      stopTracking();
    }
  };

  const handleOpenFolder = () => {
    if (result?.outputDirectory) {
      window.api.openOutputFolder(result.outputDirectory);
    }
  };

  if (!mode) {
    return <ConvertModeCards />;
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
    <FeatureLayout 
      title={modeTitles[mode]} 
      description={modeDescriptions[mode]}
      onBack={reset} 
      maxWidth="7xl"
    >
      
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
      ) : result && result.success ? (
        <SuccessCard
          icon={CheckCircle2}
          title="Konversi Selesai!"
          description={`Konversi sukses! ${result.filesGenerated || files.length} file dihasilkan.`}
          actions={
            <>
              <Button 
                onClick={handleOpenFolder}
                className="bg-teal-600 hover:bg-teal-700 text-white px-8"
              >
                Buka Folder
              </Button>
              <Button 
                variant="outline" 
                onClick={reset}
                className="px-8 text-slate-600 border-slate-200 hover:bg-slate-50"
              >
                Kembali ke Menu Awal
              </Button>
            </>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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

          <div className="lg:col-span-4 flex flex-col space-y-6">
            <Card className="shadow-md border-slate-200 sticky top-6">
              <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-lg">Proses Konversi</CardTitle>
              </CardHeader>
              
              <CardContent className="pt-6 flex flex-col space-y-6">
                <div className="text-sm text-slate-600 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  Total file yang akan diproses: <strong>{files.length} dokumen</strong>.
                </div>

                <div className="flex flex-col space-y-6">
                  {mode === 'pdf-to-image' && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-slate-700">Format Gambar Output</Label>
                      <RadioGroup 
                        value={outputFormat} 
                        onValueChange={(val: 'jpg'|'png') => setOutputFormat(val)}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-slate-50 transition-colors [&:has([data-state=checked])]:border-teal-500 [&:has([data-state=checked])]:bg-teal-50">
                          <RadioGroupItem value="jpg" id="format-jpg" className="text-teal-600" />
                          <Label htmlFor="format-jpg" className="cursor-pointer flex-1 font-medium">JPG / JPEG</Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-slate-50 transition-colors [&:has([data-state=checked])]:border-teal-500 [&:has([data-state=checked])]:bg-teal-50">
                          <RadioGroupItem value="png" id="format-png" className="text-teal-600" />
                          <Label htmlFor="format-png" className="cursor-pointer flex-1 font-medium">PNG (Transparan)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                  
                  <ProcessActionGroup
                    isProcessing={isProcessing}
                    progress={progress}
                    timeRemaining={timeRemaining}
                    progressLabel="Progres Konversi"
                    onProcess={handleConvert}
                    processLabel={
                      <>
                        Mulai Konversi
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    }
                    processInProgressLabel="Memproses..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={getAcceptString()}
      />
    </FeatureLayout>
  );
}
