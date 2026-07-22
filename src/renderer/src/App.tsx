import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { CompressPage } from './pages/CompressPage';
import { ArrowLeft } from 'lucide-react';

export default function App() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const renderContent = () => {
    switch (activeFeature) {
      case 'Compress':
        return <CompressPage />;
      // Fitur lainnya akan ditambahkan di Track berikutnya
      default:
        return (
          <div className="max-w-5xl mx-auto mt-12 px-8">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-8 text-center">Pilih Alat PDF</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['Compress', 'Merge', 'Split', 'Convert', 'Protect', 'Unlock'].map(feature => (
                <div 
                  key={feature} 
                  onClick={() => setActiveFeature(feature)}
                  className="flex flex-col items-center p-8 border border-slate-200 rounded-3xl bg-white cursor-pointer transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-400 group"
                >
                  <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                    {/* Placeholder Ikon */}
                    <span className="text-2xl font-bold text-slate-300 group-hover:text-teal-500">{feature.charAt(0)}</span>
                  </div>
                  <div className="text-xl font-bold mb-2 text-slate-800">{feature} PDF</div>
                  <div className="text-sm text-slate-500 font-medium text-center leading-relaxed">
                    Akses fitur {feature} PDF secara privat di perangkat Anda.
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 text-slate-900 font-sans">
      <Toaster position="bottom-center" richColors theme="light" />
      
      {/* Header dengan efek Glassmorphism */}
      <header className="sticky top-0 z-50 flex items-center w-full px-8 py-4 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-4 w-full max-w-7xl mx-auto">
          {activeFeature && (
            <button 
              onClick={() => setActiveFeature(null)}
              className="p-2 mr-2 text-slate-400 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              title="Kembali ke Beranda"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-teal-600 tracking-tight">LocalPDF</h1>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">
              Privat • Offline • Gratis
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {renderContent()}
      </main>
    </div>
  );
}
