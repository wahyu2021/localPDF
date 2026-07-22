import React, { useState } from 'react';

export default function App() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  return (
    <div className="flex h-screen w-full bg-background text-foreground flex-col items-center justify-center relative">
      <header className="absolute top-0 w-full p-6 text-center border-b border-border bg-surface">
        <h1 className="text-2xl font-bold text-primary">LocalPDF</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Semua fitur PDF premium. Gratis. Lokal. Privat.
        </p>
      </header>

      <main className="w-full max-w-4xl p-8 mt-24">
        {activeFeature ? (
          <div className="text-center">
            <h2 className="text-xl mb-4 font-semibold text-primary">Fitur {activeFeature} Aktif</h2>
            <div className="mb-6 p-12 border-2 border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">Area drop file akan diimplementasi di track berikutnya.</p>
            </div>
            <button 
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-muted transition-colors"
              onClick={() => setActiveFeature(null)}
            >
              Kembali ke Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dashboard Grid Sementara */}
            {['Compress', 'Merge', 'Split', 'Convert', 'Protect', 'Unlock'].map(feature => (
              <div 
                key={feature} 
                onClick={() => setActiveFeature(feature)}
                className="p-6 border border-border rounded-xl bg-secondary hover:bg-muted hover:border-primary cursor-pointer transition-all text-center shadow-sm hover:shadow-md"
              >
                <div className="text-lg font-semibold mb-2 text-primary-light">{feature}</div>
                <div className="text-sm text-muted-foreground">Klik untuk mencoba purwarupa fitur {feature}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
