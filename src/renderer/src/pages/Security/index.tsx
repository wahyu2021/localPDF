import { useState, useRef } from 'react';
import { Lock, Unlock, ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { DragDropZone } from '../../components/shared/DragDropZone';
import { ThumbnailPreview } from '../../components/shared/ThumbnailPreview';
import { FeatureLayout } from '../../components/layout/FeatureLayout';
import { useSecurityStore } from '../../store/securityStore';

// Sub-components
import { SecurityModeCards } from './components/SecurityModeCards';
import { SecuritySettingsPanel } from './components/SecuritySettingsPanel';

export function SecurityPage() {
  const { 
    file, setFile, 
    mode, userPassword, ownerPassword, restrictions,
    reset 
  } = useSecurityStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Mohon hanya pilih file PDF.');
      return;
    }
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExecute = async () => {
    if (!file || !mode) return;
    
    // Validasi
    if (mode === 'lock' && !userPassword) {
      toast.error('User password tidak boleh kosong untuk mengunci PDF.');
      return;
    }
    if (mode === 'unlock' && !userPassword && !ownerPassword) {
      toast.error('Password diperlukan untuk membuka PDF.');
      return;
    }
    if (mode === 'restrict' && !ownerPassword) {
      toast.error('Owner password (Master) wajib diisi untuk mengatur batasan akses.');
      return;
    }

    const loadingToast = toast.loading('Memproses file keamanan...', {
      description: 'Mohon tunggu sebentar.'
    });

    setIsProcessing(true);

    try {
      const filePath = window.api.getFilePath(file);
      
      const result = await window.api.securityPdf({
        filePath,
        mode,
        userPassword,
        ownerPassword,
        restrictions: mode === 'restrict' ? restrictions : undefined
      });

      if (result.success && result.outputPath) {
        toast.dismiss(loadingToast);
        
        const saveResult = await window.api.savePdf({
          tempPath: result.outputPath,
          defaultFileName: `${file.name.replace(/\.pdf$/i, '')}_${mode}ed.pdf`
        });

        if (saveResult.success) {
          toast.success('File Tersimpan!', {
            description: `Disimpan di: ${saveResult.savedPath}`
          });
          reset();
        } else if (!saveResult.canceled) {
          toast.error('Gagal Menyimpan', { description: saveResult.error });
        }
      } else {
        toast.dismiss(loadingToast);
        toast.error('Proses Gagal', {
          description: result.error || 'Password mungkin salah atau file rusak.'
        });
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error('Koneksi Gagal', {
        description: error.message || 'Terjadi kesalahan sistem.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mode) {
    return <SecurityModeCards />;
  }

  const getTitle = () => {
    if (mode === 'lock') return 'Kunci File PDF';
    if (mode === 'unlock') return 'Buka Kunci File PDF';
    if (mode === 'restrict') return 'Atur Batasan Akses PDF';
    return 'Keamanan PDF';
  };

  return (
    <FeatureLayout title={getTitle()} onBack={reset} maxWidth="7xl">
      {!file ? (
        <div className="animate-in fade-in duration-500">
          <DragDropZone onFileSelect={handleFileSelect} className="h-72" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-7 space-y-4">
            <ThumbnailPreview file={file} onClear={handleRemoveFile} />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <SecuritySettingsPanel />

            <Button 
              className="w-full h-14 text-lg font-bold shadow-md bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
              onClick={handleExecute}
              disabled={isProcessing || !file}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={22} className="animate-spin mr-2" />
                  Sedang Memproses...
                </>
              ) : (
                <>
                  {mode === 'lock' && <Lock size={20} className="mr-2" />}
                  {mode === 'unlock' && <Unlock size={20} className="mr-2" />}
                  {mode === 'restrict' && <ShieldAlert size={20} className="mr-2" />}
                  Mulai Eksekusi
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </FeatureLayout>
  );
}
