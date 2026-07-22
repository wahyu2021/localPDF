import { contextBridge, ipcRenderer, webUtils } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import type { CompressPayload, CompressResult, ProgressUpdateData } from '../shared/ipc-types';

const api = {
  getFilePath: (file: File) => {
    try {
      return webUtils.getPathForFile(file);
    } catch (e) {
      return (file as any).path || '';
    }
  },
  
  compressPdf: (payload: CompressPayload): Promise<CompressResult> => 
    ipcRenderer.invoke(IPC_CHANNELS.COMPRESS_PDF, payload),
    
  savePdf: (payload: { tempPath: string; defaultFileName: string }): Promise<any> =>
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_PDF, payload),
  
  onProgressUpdate: (callback: (data: ProgressUpdateData) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: ProgressUpdateData) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.PROGRESS_UPDATE, handler);
    // Fungsi untuk menghapus listener
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.PROGRESS_UPDATE, handler);
    };
  }
};

contextBridge.exposeInMainWorld('api', api);

export type ElectronAPI = typeof api;
