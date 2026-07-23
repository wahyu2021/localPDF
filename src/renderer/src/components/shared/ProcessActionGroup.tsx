import React from 'react';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

interface ProcessActionGroupProps {
  /** Nilai progress bar (0-100) */
  progress: number;
  /** Status apakah proses sedang berjalan. Jika true, progress bar muncul & tombol utama jadi loading. */
  isProcessing: boolean;
  /** Teks estimasi waktu dari progress tracker. */
  timeRemaining: string;
  /** Teks kustom untuk progress bar (misal: "Progres Kompresi"). @default "Progres" */
  progressLabel?: string;
  
  /** Handler saat tombol batal ditekan (opsional, tergantung dari fitur) */
  onCancel?: () => void;
  /** Label untuk tombol batal. @default "Batal" */
  cancelLabel?: React.ReactNode;
  
  /** Handler saat tombol proses ditekan. */
  onProcess: () => void;
  /** Label untuk tombol proses saat IDLE (misal: "Kompres PDF"). */
  processLabel: React.ReactNode;
  /** Label untuk tombol proses saat PROCESSING (misal: "Mengompres..."). */
  processInProgressLabel: React.ReactNode;
  /** Apakah tombol proses harus di-disable (karena validasi belum lengkap). */
  disableProcess?: boolean;
}

/**
 * Komponen yang membungkus Progress Bar dan grup tombol aksi (Batal & Proses Utama)
 * yang konsisten di semua panel konfigurasi fitur.
 */
export function ProcessActionGroup({
  progress,
  isProcessing,
  timeRemaining,
  progressLabel = 'Progres',
  onCancel,
  cancelLabel = 'Batal',
  onProcess,
  processLabel,
  processInProgressLabel,
  disableProcess = false
}: ProcessActionGroupProps) {
  return (
    <div className="flex flex-col gap-3">
      {isProcessing && (
        <ProgressBar 
          progress={progress} 
          timeRemaining={timeRemaining} 
          label={progressLabel} 
        />
      )}

      <div className="flex gap-3">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-6 shadow-sm text-slate-600"
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          onClick={onProcess}
          disabled={isProcessing || disableProcess}
          className="flex-[2] py-6 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
        >
          {isProcessing ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              {processInProgressLabel}
            </>
          ) : (
            processLabel
          )}
        </Button>
      </div>
    </div>
  );
}
