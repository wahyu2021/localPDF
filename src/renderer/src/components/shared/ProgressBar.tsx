import React from 'react';

interface ProgressBarProps {
  /** Nilai progress 0–100 */
  progress: number;
  /** Teks estimasi waktu yang ditampilkan di bawah bar */
  timeRemaining: string;
  /** Label judul di kiri atas */
  label?: string;
}

/**
 * Komponen progress bar yang konsisten digunakan di seluruh halaman fitur.
 */
export function ProgressBar({ progress, timeRemaining, label = 'Progres' }: ProgressBarProps) {
  return (
    <div className="space-y-2 p-4 bg-slate-50 border border-slate-100 rounded-lg">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-bold text-teal-600">{progress}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-teal-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-xs text-slate-500 text-right mt-1 font-medium">
        {timeRemaining}
      </div>
    </div>
  );
}
