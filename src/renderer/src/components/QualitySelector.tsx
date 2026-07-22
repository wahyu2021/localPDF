import React from 'react';
import { cn } from '../utils/cn';
import { useCompressStore } from '../store/compressStore';
import { Settings, Zap, CheckCircle2, FileUp } from 'lucide-react';

export function QualitySelector() {
  const { quality, setQuality, customDpi, setCustomDpi } = useCompressStore();

  const presets = [
    {
      id: 'screen',
      title: 'Extreme Compression',
      desc: 'Ukuran file paling kecil, kualitas gambar sangat diturunkan.',
      icon: Zap,
    },
    {
      id: 'ebook',
      title: 'Recommended',
      desc: 'Keseimbangan terbaik antara ukuran file dan kualitas visual.',
      icon: CheckCircle2,
    },
    {
      id: 'printer',
      title: 'Less Compression',
      desc: 'Pengurangan ukuran sedikit demi mempertahankan kualitas tinggi.',
      icon: FileUp,
    },
  ] as const;

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
          <Settings size={20} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Tingkat Kompresi</h3>
      </div>
      
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {presets.map((preset) => {
            const isSelected = quality === preset.id;
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                onClick={() => setQuality(preset.id)}
                className={cn(
                  'flex flex-col text-left p-4 rounded-2xl border-2 transition-all duration-200 relative',
                  isSelected 
                    ? 'border-teal-500 bg-teal-50 shadow-sm ring-4 ring-teal-500/10'
                    : 'border-slate-100 hover:border-teal-300 hover:bg-slate-50'
                )}
              >
                <div className={cn("mb-3 transition-colors", isSelected ? "text-teal-600" : "text-slate-400")}>
                  <Icon size={24} />
                </div>
                <h4 className="font-semibold text-slate-800 mb-1">{preset.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{preset.desc}</p>
                {isSelected && (
                  <div className="absolute top-4 right-4 text-teal-500 animate-in zoom-in">
                    <CheckCircle2 size={18} className="fill-teal-100" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom DPI Slider Tab */}
        <div className="pt-5 border-t border-slate-100 flex flex-col gap-4">
          <label className="flex items-center gap-3 cursor-pointer group w-fit">
            <div className="relative flex items-center justify-center">
              <input 
                type="radio" 
                name="quality"
                checked={quality === 'custom'}
                onChange={() => setQuality('custom')}
                className="w-5 h-5 text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer"
              />
            </div>
            <span className={cn(
              "font-semibold transition-colors",
              quality === 'custom' ? "text-slate-800" : "text-slate-500 group-hover:text-slate-700"
            )}>
              Mode Kustom (Resolusi Manual)
            </span>
          </label>
          
          <div className={cn(
            "pl-8 pr-4 overflow-hidden transition-all duration-300 ease-in-out",
            quality === 'custom' ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
          )}>
            <div className="flex justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">Resolusi DPI (Dots Per Inch)</span>
              <span className="text-sm font-bold px-2 py-1 bg-slate-100 rounded-md text-teal-600">{customDpi} DPI</span>
            </div>
            <input 
              type="range"
              min="36"
              max="300"
              step="12"
              value={customDpi}
              onChange={(e) => setCustomDpi(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20"
            />
            <div className="flex justify-between mt-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Ukuran Kecil</span>
              <span>Kualitas Tinggi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
