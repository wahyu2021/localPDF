import { Lock, Unlock, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { useSecurityStore } from '../../../store/securityStore';

export function SecurityModeCards() {
  const { setMode } = useSecurityStore();

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
          className="group cursor-pointer border-slate-200 hover:border-teal-400 hover:shadow-md transition-colors duration-200 bg-white"
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
          className="group cursor-pointer border-slate-200 hover:border-blue-400 hover:shadow-md transition-colors duration-200 bg-white"
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
          className="group cursor-pointer border-slate-200 hover:border-orange-400 hover:shadow-md transition-colors duration-200 bg-white"
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
