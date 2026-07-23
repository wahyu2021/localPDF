import { useState, useEffect, useCallback } from 'react';

interface UseProgressTrackerReturn {
  progress: number;
  timeRemaining: string;
  startTracking: () => void;
  stopTracking: () => void;
}

/**
 * Hook untuk mengelola progress bar dan estimasi waktu selesai
 * secara real-time berdasarkan event PROGRESS_UPDATE dari main process.
 */
export function useProgressTracker(
  setProgress: (p: number) => void,
  initialMessage = 'Sedang memproses data...'
): UseProgressTrackerReturn {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [progress, setLocalProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!window.api) return;

    const unsubscribe = window.api.onProgressUpdate((data) => {
      setLocalProgress(data.percent);
      setProgress(data.percent);

      if (!startTime) return;

      if (data.percent > 10 && data.percent < 100) {
        const elapsed = Date.now() - startTime;
        const totalEstimated = elapsed / (data.percent / 100);
        const remainingMs = totalEstimated - elapsed;

        if (remainingMs > 0) {
          const remainingSec = Math.ceil(remainingMs / 1000);
          setTimeRemaining(
            remainingSec > 60
              ? `~${Math.floor(remainingSec / 60)} mnt ${remainingSec % 60} dtk`
              : `~${remainingSec} detik lagi`
          );
        }
      } else if (data.percent > 0 && data.percent <= 10) {
        setTimeRemaining(initialMessage);
      } else if (data.percent === 100) {
        setTimeRemaining('Selesai!');
      }
    });

    return () => unsubscribe();
  }, [startTime, setProgress, initialMessage]);

  const startTracking = useCallback(() => {
    setStartTime(Date.now());
    setLocalProgress(0);
    setTimeRemaining(initialMessage);
  }, [initialMessage]);

  const stopTracking = useCallback(() => {
    setStartTime(null);
  }, []);

  return { progress, timeRemaining, startTracking, stopTracking };
}
