import React from 'react';
import { cn } from '../../utils/cn';
import { useCompressStore } from '../../store/compressStore';
import { Settings, Zap, CheckCircle2, FileUp } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

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
    <div className="w-full">
      <RadioGroup value={quality} onValueChange={(val: any) => setQuality(val)}>
        <div className="flex flex-col gap-4 mb-6">
          {presets.map((preset) => {
            const isSelected = quality === preset.id;
            const Icon = preset.icon;
            return (
              <Label
                key={preset.id}
                htmlFor={preset.id}
                className={cn(
                  'flex flex-col text-left p-4 rounded-xl border-2 transition-all cursor-pointer relative',
                  isSelected 
                    ? 'border-teal-600 bg-teal-50/50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <RadioGroupItem value={preset.id} id={preset.id} className="sr-only" />
                <div className={cn("mb-3", isSelected ? "text-teal-600" : "text-slate-400")}>
                  <Icon size={24} strokeWidth={isSelected ? 2.5 : 2} />
                </div>
                <h4 className="font-bold text-sm text-slate-800 mb-1">{preset.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">{preset.desc}</p>
                {isSelected && (
                  <div className="absolute top-4 right-4 text-teal-600">
                    <CheckCircle2 size={18} className="fill-teal-100" />
                  </div>
                )}
              </Label>
            );
          })}
        </div>

        {/* Custom DPI Slider Tab */}
        <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="custom" id="custom" className="text-teal-600 border-slate-300" />
            <Label htmlFor="custom" className={cn(
              "font-semibold text-sm cursor-pointer transition-colors",
              quality === 'custom' ? "text-slate-800" : "text-slate-500 hover:text-slate-700"
            )}>
              Mode Kustom (Resolusi Manual)
            </Label>
          </div>
          
          <div className={cn(
            "pl-7 overflow-hidden transition-all duration-300 ease-in-out",
            quality === 'custom' ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
          )}>
            <div className="flex justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">Resolusi DPI (Dots Per Inch)</span>
              <span className="text-sm font-bold px-2.5 py-1 bg-teal-50 rounded-md text-teal-700 border border-teal-100">{customDpi} DPI</span>
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
            <div className="flex justify-between mt-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Ukuran Kecil</span>
              <span>Kualitas Tinggi</span>
            </div>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
