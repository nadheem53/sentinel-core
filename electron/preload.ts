import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('sentinelNative', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  terminateProcess: (pid: number) => ipcRenderer.invoke('terminate-process', pid),
  getProcesses: () => ipcRenderer.invoke('get-processes'),
  getStartupItems: () => ipcRenderer.invoke('get-startup-items'),
  toggleStartupItem: (id: string, enabled: boolean) => ipcRenderer.invoke('toggle-startup-item', id, enabled),
  getActiveConnections: () => ipcRenderer.invoke('get-active-connections'),
});
