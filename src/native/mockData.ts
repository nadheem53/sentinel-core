export interface MockProcess {
  pid: number;
  name: string;
  user: string;
  cpuPercent: number;
  memoryMB: number;
  threads: number;
  status: 'running' | 'idle' | 'suspended' | 'leaking';
  commandLine?: string;
}

export interface MockStartupItem {
  id: string;
  name: string;
  publisher: string;
  path: string;
  impact: 'High' | 'Medium' | 'Low' | 'None';
  enabled: boolean;
  status: string;
}

export interface MockJunkCategory {
  id: string;
  name: string;
  description: string;
  sizeBytes: number;
  itemCount: number;
  selected: boolean;
}

export interface MockNetworkConnection {
  id: string;
  proto: 'TCP' | 'UDP';
  localAddress: string;
  localPort: number;
  foreignAddress: string;
  foreignPort: number;
  state: 'ESTABLISHED' | 'LISTENING' | 'TIME_WAIT' | 'SYN_SENT';
  pid: number;
  processName: string;
  country: string;
  isSuspicious?: boolean;
}

export const initialMockProcesses: MockProcess[] = [
  { pid: 4, name: 'System', user: 'SYSTEM', cpuPercent: 1.2, memoryMB: 120, threads: 240, status: 'running' },
  { pid: 912, name: 'svchost.exe', user: 'NETWORK SERVICE', cpuPercent: 0.8, memoryMB: 84, threads: 32, status: 'running' },
  { pid: 1420, name: 'csrss.exe', user: 'SYSTEM', cpuPercent: 0.1, memoryMB: 14, threads: 12, status: 'running' },
  { pid: 2180, name: 'explorer.exe', user: 'Admin', cpuPercent: 3.4, memoryMB: 310, threads: 48, status: 'running' },
  { pid: 4182, name: 'crypto_helper_daemon.exe', user: 'Admin', cpuPercent: 88.4, memoryMB: 3420, threads: 16, status: 'leaking' },
  { pid: 5040, name: 'chrome.exe', user: 'Admin', cpuPercent: 6.2, memoryMB: 1240, threads: 64, status: 'running' },
  { pid: 6120, name: 'electron_crash_watcher.exe', user: 'Admin', cpuPercent: 1.2, memoryMB: 1980, threads: 18, status: 'leaking' },
  { pid: 7890, name: 'code.exe', user: 'Admin', cpuPercent: 4.1, memoryMB: 890, threads: 52, status: 'running' },
  { pid: 9120, name: 'svch0st.exe (Trojan)', user: 'Admin', cpuPercent: 12.4, memoryMB: 140, threads: 8, status: 'running' },
];

export const initialMockStartupItems: MockStartupItem[] = [
  { id: 'st-1', name: 'Microsoft Teams', publisher: 'Microsoft Corporation', path: 'C:\\Program Files\\Teams\\Teams.exe', impact: 'High', enabled: true, status: '+3.8s Boot Delay' },
  { id: 'st-2', name: 'Spotify Web Helper', publisher: 'Spotify AB', path: 'C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe', impact: 'Medium', enabled: true, status: '+1.6s Boot Delay' },
  { id: 'st-3', name: 'GameLauncherSyncService', publisher: 'Unknown Publisher', path: 'C:\\Program Files\\GameStore\\sync_agent.exe', impact: 'High', enabled: true, status: '+4.2s Boot Delay' },
  { id: 'st-4', name: 'Windows Security Health SysTray', publisher: 'Microsoft Corporation', path: 'C:\\Windows\\System32\\SecurityHealthSystray.exe', impact: 'Low', enabled: true, status: 'Essential Protection' },
  { id: 'st-5', name: 'Adobe Creative Cloud Background', publisher: 'Adobe Systems', path: 'C:\\Program Files\\Adobe\\CC\\ACC.exe', impact: 'High', enabled: true, status: '+2.9s Boot Delay' },
  { id: 'st-6', name: 'Realtek Audio Control Panel', publisher: 'Realtek Semiconductor', path: 'C:\\Program Files\\Realtek\\RtkNGUI64.exe', impact: 'Low', enabled: true, status: 'Hardware Driver' },
];

export const initialMockJunkCategories: MockJunkCategory[] = [
  { id: 'junk-temp', name: 'Windows Temporary System Files (%TEMP%)', description: 'Leftover installation files and application scratch storage', sizeBytes: 3420000000, itemCount: 1240, selected: true },
  { id: 'junk-cache', name: 'Browser Web Cache & Shader Cache', description: 'Chromium, Edge, Firefox, and DirectX compiled shader cache', sizeBytes: 2180000000, itemCount: 6890, selected: true },
  { id: 'junk-dump', name: 'Memory Dumps & BSOD Crash Reports', description: 'Kernel minidumps, WER error logs, and legacy bug check traces', sizeBytes: 1450000000, itemCount: 34, selected: true },
  { id: 'junk-logs', name: 'System Event & Setup Diagnostic Logs', description: 'Historical CBS.log, DISM.log, and Windows Update installation logs', sizeBytes: 740000000, itemCount: 412, selected: true },
  { id: 'junk-thumb', name: 'Corrupted Thumbnail & Icon Cache (thumbcache.db)', description: 'Orphaned Windows Explorer preview cache files', sizeBytes: 310000000, itemCount: 18, selected: true },
  { id: 'junk-recycle', name: 'Recycle Bin Pending Discards', description: 'Deleted items awaiting permanent cluster overwrite', sizeBytes: 4200000000, itemCount: 154, selected: true },
];

export const initialMockNetworkConnections: MockNetworkConnection[] = [
  { id: 'net-1', proto: 'TCP', localAddress: '192.168.1.104', localPort: 52140, foreignAddress: '142.250.180.14', foreignPort: 443, state: 'ESTABLISHED', pid: 5040, processName: 'chrome.exe', country: 'US (Google LLC)' },
  { id: 'net-2', proto: 'TCP', localAddress: '192.168.1.104', localPort: 4444, foreignAddress: '185.220.101.42', foreignPort: 4444, state: 'ESTABLISHED', pid: 9120, processName: 'svch0st.exe', country: 'RO (Unknown Host)', isSuspicious: true },
  { id: 'net-3', proto: 'TCP', localAddress: '192.168.1.104', localPort: 59124, foreignAddress: '52.96.166.130', foreignPort: 443, state: 'ESTABLISHED', pid: 2180, processName: 'explorer.exe', country: 'US (Microsoft Azure)' },
  { id: 'net-4', proto: 'TCP', localAddress: '0.0.0.0', localPort: 135, foreignAddress: '0.0.0.0', foreignPort: 0, state: 'LISTENING', pid: 912, processName: 'svchost.exe (RPC)', country: 'Local' },
  { id: 'net-5', proto: 'TCP', localAddress: '0.0.0.0', localPort: 1337, foreignAddress: '0.0.0.0', foreignPort: 0, state: 'LISTENING', pid: 4182, processName: 'crypto_helper_daemon.exe', country: 'Local', isSuspicious: true },
  { id: 'net-6', proto: 'UDP', localAddress: '192.168.1.104', localPort: 5353, foreignAddress: '224.0.0.251', foreignPort: 5353, state: 'ESTABLISHED', pid: 4, processName: 'mDNSResponder', country: 'Multicast' },
];
