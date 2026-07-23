import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { CompressPage } from './pages/CompressPage';
import { MergePage } from './pages/MergePage';
import { SplitPage } from './pages/SplitPage';
import { ConvertPage } from './pages/ConvertPage';
import { FileDown, Layers, SplitSquareHorizontal, FileArchive, Lock, Unlock } from 'lucide-react';
import { cn } from './utils/cn';
import logo from './assets/logo.png';

const TOOLS = [
  { id: 'Compress', name: 'Kompres PDF', icon: FileDown },
  { id: 'Merge', name: 'Gabungkan PDF', icon: Layers },
  { id: 'Split', name: 'Pisahkan PDF', icon: SplitSquareHorizontal },
  { id: 'Convert', name: 'Konversi PDF', icon: FileArchive },
  { id: 'Protect', name: 'Kunci PDF', icon: Lock },
  { id: 'Unlock', name: 'Buka Kunci PDF', icon: Unlock },
];

export default function App() {
  const [activeFeature, setActiveFeature] = useState<string>('Compress');

  const renderContent = () => {
    switch (activeFeature) {
      case 'Compress':
        return <CompressPage />;
      case 'Merge':
        return <MergePage />;
      case 'Split':
        return <SplitPage />;
      case 'Convert':
        return <ConvertPage />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-sm font-medium text-slate-500">
            Fitur {TOOLS.find(t => t.id === activeFeature)?.name} sedang dalam pengembangan.
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-white text-slate-900 font-sans overflow-hidden">
      <Toaster position="bottom-right" richColors theme="light" />
      
      {/* Sidebar Panel */}
      <aside className="w-56 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <img src={logo} alt="LocalPDF Logo" className="w-8 h-8 object-contain" />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-teal-700 tracking-tight leading-tight">LocalPDF</h1>
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              Offline Utility
            </p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {TOOLS.map(tool => {
            const Icon = tool.icon;
            const isActive = activeFeature === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveFeature(tool.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded transition-colors",
                  isActive 
                    ? "bg-teal-600 text-white shadow-sm" 
                    : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                )}
              >
                <Icon size={16} />
                {tool.name}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Simple Top Toolbar for Context */}
        <header className="h-12 border-b border-slate-200 flex items-center px-6 bg-white flex-shrink-0">
          <h2 className="text-sm font-semibold text-slate-800">
            {TOOLS.find(t => t.id === activeFeature)?.name}
          </h2>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
