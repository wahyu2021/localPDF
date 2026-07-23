import { BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import { ProgressUpdateData } from '../../shared/ipc-types';

/**
 * Mengirim pembaruan progres ke frontend.
 */
export function sendProgress(window: BrowserWindow | null, taskId: string, percent: number) {
  if (window && !window.isDestroyed()) {
    const data: ProgressUpdateData = { taskId, percent };
    window.webContents.send(IPC_CHANNELS.PROGRESS_UPDATE, data);
  }
}
