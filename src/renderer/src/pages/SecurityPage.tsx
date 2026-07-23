import { useState, useRef } from 'react';
import { useSecurityStore } from '../store/securityStore';
import { Lock, Unlock, ShieldAlert, UploadCloud, ChevronLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { DragDropZone } from '../components/DragDropZone';
import { ThumbnailPreview } from '../components/ThumbnailPreview';

export function SecurityPage() {
  const { 
    file, setFile, 
    mode, setMode, 
    userPassword, setUserPassword, 
    ownerPassword, setOwnerPassword,
    restrictions, setRestrictions,
    reset 
  } = useSecurityStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      const outputDir = window.api.getTempFolder();
      const filePath = window.api.getFilePath(file);
      
      const result = await window.api.securityPdf({
        filePath,
        outputDirectory: outputDir,
        mode,
        userPassword,
        ownerPassword,
        restrictions: mode === 'restrict' ? restrictions : undefined
      });

      if (result.success && result.outputPath) {
        toast.dismiss(loadingToast);
        
        // Simpan file
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

  // Render view awal (Mode Selection)
  if (!mode) {
    return (
      <div className="w-full max-w-5xl mx-auto py-8 px-6 animate-in fade-in duration-300">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Keamanan PDF</h1>
          <p className="text-lg text-slate-500 mt-3 max-w-2xl mx-auto">
            Kunci, buka kunci, atau atur batasan akses pada file PDF Anda. Pilih fitur yang ingin Anda gunakan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="group cursor-pointer hover:border-teal-400 hover:shadow-md transition-colors duration-200 bg-white"
            onClick={() => setMode('lock')}
          >
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Kunci PDF</h3>
              <p className="text-sm text-slate-500">
                Tambahkan password agar PDF hanya bisa dibuka oleh orang tertentu.
              </p>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer hover:border-blue-400 hover:shadow-md transition-colors duration-200 bg-white"
            onClick={() => setMode('unlock')}
          >
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Unlock size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Buka Kunci PDF</h3>
              <p className="text-sm text-slate-500">
                Hapus password dari file PDF yang terkunci (membutuhkan password asli).
              </p>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer hover:border-orange-400 hover:shadow-md transition-colors duration-200 bg-white"
            onClick={() => setMode('restrict')}
          >
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Batasi Akses</h3>
              <p className="text-sm text-slate-500">
                Larang pencetakan, penyalinan, atau pengeditan tanpa password Master.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render Workspace setelah mode dipilih
  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-6 animate-in fade-in duration-300">
      <div className="flex items-center mb-8 pb-4 border-b border-slate-200">
        <Button 
          variant="ghost" 
          onClick={reset}
          className="mr-4 text-slate-500 hover:text-slate-800"
        >
          <ChevronLeft size={20} className="mr-1" />
          Kembali
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {mode === 'lock' && 'Kunci File PDF'}
            {mode === 'unlock' && 'Buka Kunci File PDF'}
            {mode === 'restrict' && 'Atur Batasan Akses PDF'}
          </h2>
        </div>
      </div>

      {!file ? (
        <div className="animate-in fade-in duration-500">
          <DragDropZone onFileSelect={handleFileSelect} className="h-72" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* Kiri: Preview */}
          <div className="lg:col-span-7 space-y-4">
            <ThumbnailPreview file={file} onClear={handleRemoveFile} />
          </div>

          {/* Kanan: Pengaturan */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm">Pengaturan Keamanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {mode === 'lock' && (
                  <div className="space-y-2">
                    <Label>User Password (Untuk membuka file)</Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Masukkan password" 
                        value={userPassword} 
                        onChange={(e) => setUserPassword(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'unlock' && (
                  <div className="space-y-2">
                    <Label>Password File</Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Masukkan password asli file" 
                        value={userPassword} 
                        onChange={(e) => setUserPassword(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">Password ini akan dihapus permanen dari file hasil konversi.</p>
                  </div>
                )}

                {mode === 'restrict' && (
                  <>
                    <div className="space-y-2">
                      <Label>Owner / Master Password</Label>
                      <div className="relative">
                        <Input 
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Password untuk memodifikasi batasan" 
                          value={ownerPassword} 
                          onChange={(e) => setOwnerPassword(e.target.value)}
                        />
                        <button 
                          type="button" 
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <Label>Hak Akses Mencetak (Print)</Label>
                      <select 
                        className="w-full flex h-10 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={restrictions.print} 
                        onChange={(e) => setRestrictions({ print: e.target.value as any })}
                      >
                        <option value="none">Tidak Diizinkan (None)</option>
                        <option value="low">Kualitas Rendah (Low)</option>
                        <option value="full">Kualitas Penuh (Full)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <Label>Hak Akses Edit (Modify)</Label>
                      <select 
                        className="w-full flex h-10 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={restrictions.modify} 
                        onChange={(e) => setRestrictions({ modify: e.target.value as any })}
                      >
                        <option value="none">Tidak Diizinkan (None)</option>
                        <option value="annotate">Hanya Anotasi</option>
                        <option value="form">Hanya Isi Form</option>
                        <option value="all">Semua Diizinkan</option>
                      </select>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label>Izinkan Copy (Extract)</Label>
                      <select 
                        className="w-full flex h-10 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={restrictions.extract} 
                        onChange={(e) => setRestrictions({ extract: e.target.value as any })}
                      >
                        <option value="n">Tidak Diizinkan (No)</option>
                        <option value="y">Diizinkan (Yes)</option>
                      </select>
                    </div>
                  </>
                )}

              </CardContent>
            </Card>

            <Button 
              className="w-full h-12 text-md font-bold shadow-sm"
              onClick={handleExecute}
              disabled={isProcessing || !file}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                'Eksekusi'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
