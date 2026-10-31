import {
  initialMockJunkCategories,
  initialMockNetworkConnections,
  initialMockProcesses,
  initialMockStartupItems,
  MockJunkCategory,
  MockNetworkConnection,
  MockProcess,
  MockStartupItem,
} from './mockData';

export interface SystemInfo {
  platform: 'windows' | 'macos' | 'linux' | 'ios' | 'android';
  osRelease: string;
  hostName: string;
  cpuModel: string;
  totalMemoryBytes: number;
  freeMemoryBytes: number;
  uptimeSeconds: number;
  isElevated: boolean;
}

export class NativeBridge {
  private static instance: NativeBridge;
  private isElectronRuntime: boolean = false;
  private detectedPlatform: 'windows' | 'macos' | 'linux' | 'ios' | 'android' = 'windows';
  private processes: MockProcess[] = [];
  private startupItems: MockStartupItem[] = [];
  private junkCategories: MockJunkCategory[] = [];
  private networkConnections: MockNetworkConnection[] = [];

  private constructor() {
    this.isElectronRuntime = typeof window !== 'undefined' && Boolean((window as any).sentinelNative);
    this.detectEnvironment();
  }

  public static getInstance(): NativeBridge {
    if (!NativeBridge.instance) {
      NativeBridge.instance = new NativeBridge();
    }
    return NativeBridge.instance;
  }

  private detectEnvironment(): void {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
        this.detectedPlatform = 'ios';
      } else if (ua.includes('android')) {
        this.detectedPlatform = 'android';
      } else if (ua.includes('mac')) {
        this.detectedPlatform = 'macos';
      } else if (ua.includes('linux')) {
        this.detectedPlatform = 'linux';
      } else {
        this.detectedPlatform = 'windows';
      }
    }

    this.processes = this.getPlatformProcesses();
    this.startupItems = this.getPlatformStartupItems();
    this.junkCategories = [...initialMockJunkCategories];
    this.networkConnections = [...initialMockNetworkConnections];
  }

  private getPlatformProcesses(): MockProcess[] {
    if (this.detectedPlatform === 'macos') {
      return [
        { pid: 1, name: 'launchd', user: 'root', cpuPercent: 0.8, memoryMB: 48, threads: 14, status: 'running' },
        { pid: 94, name: 'WindowServer', user: '_windowserver', cpuPercent: 4.2, memoryMB: 420, threads: 28, status: 'running' },
        { pid: 312, name: 'Finder', user: 'admin', cpuPercent: 1.1, memoryMB: 280, threads: 16, status: 'running' },
        { pid: 1042, name: 'Google Chrome', user: 'admin', cpuPercent: 5.4, memoryMB: 1140, threads: 44, status: 'running' },
        { pid: 4182, name: 'crypto_helper_daemon', user: 'admin', cpuPercent: 88.4, memoryMB: 3420, threads: 16, status: 'leaking' },
        { pid: 6120, name: 'electron_crash_watcher', user: 'admin', cpuPercent: 1.2, memoryMB: 1980, threads: 18, status: 'leaking' },
        { pid: 8901, name: 'com.apple.WebKit.GPU', user: 'admin', cpuPercent: 2.1, memoryMB: 380, threads: 12, status: 'running' },
      ];
    } else if (this.detectedPlatform === 'linux') {
      return [
        { pid: 1, name: 'systemd', user: 'root', cpuPercent: 0.4, memoryMB: 32, threads: 8, status: 'running' },
        { pid: 412, name: 'systemd-journald', user: 'root', cpuPercent: 0.2, memoryMB: 64, threads: 6, status: 'running' },
        { pid: 820, name: 'gnome-shell', user: 'user', cpuPercent: 3.8, memoryMB: 510, threads: 22, status: 'running' },
        { pid: 4182, name: 'xmrig_miner', user: 'user', cpuPercent: 91.2, memoryMB: 3200, threads: 16, status: 'leaking' },
        { pid: 5190, name: 'firefox', user: 'user', cpuPercent: 4.5, memoryMB: 1280, threads: 36, status: 'running' },
      ];
    }
    return [...initialMockProcesses];
  }

  private getPlatformStartupItems(): MockStartupItem[] {
    if (this.detectedPlatform === 'macos') {
      return [
        { id: 'st-mac-1', name: 'com.spotify.webhelper.plist', publisher: 'Spotify AB', path: '~/Library/LaunchAgents/com.spotify.plist', impact: 'Medium', enabled: true, status: '+1.4s Boot Delay' },
        { id: 'st-mac-2', name: 'com.adobe.acc.helper.plist', publisher: 'Adobe Inc.', path: '/Library/LaunchDaemons/com.adobe.plist', impact: 'High', enabled: true, status: '+3.1s Boot Delay' },
        { id: 'st-mac-3', name: 'com.apple.dock.extra', publisher: 'Apple Inc.', path: '/System/Library/CoreServices/Dock.app', impact: 'Low', enabled: true, status: 'System Service' },
      ];
    } else if (this.detectedPlatform === 'linux') {
      return [
        { id: 'st-lin-1', name: 'discord-canary.desktop', publisher: 'Discord Inc.', path: '~/.config/autostart/discord.desktop', impact: 'Medium', enabled: true, status: '+2.1s Boot Delay' },
        { id: 'st-lin-2', name: 'systemd-miner.service', publisher: 'Unknown Service', path: '/etc/systemd/system/miner.service', impact: 'High', enabled: true, status: '+4.8s Boot Delay' },
      ];
    }
    return [...initialMockStartupItems];
  }

  public isNative(): boolean {
    return this.isElectronRuntime;
  }

  public async getSystemInfo(): Promise<SystemInfo> {
    if (this.isElectronRuntime) {
      return (window as any).sentinelNative.getSystemInfo();
    }

    if (this.detectedPlatform === 'macos') {
      return {
        platform: 'macos',
        osRelease: 'macOS Sonoma 14.5 (Darwin 23.5.0)',
        hostName: 'SENTINEL-MACBOOK-PRO',
        cpuModel: 'Apple M3 Max (16 Cores / 16 Threads)',
        totalMemoryBytes: 38654705664, // 36 GB
        freeMemoryBytes: 21474836480,
        uptimeSeconds: 198400,
        isElevated: true,
      };
    } else if (this.detectedPlatform === 'linux') {
      return {
        platform: 'linux',
        osRelease: 'Ubuntu 24.04 LTS (Kernel 6.8.0-38-generic)',
        hostName: 'SENTINEL-LINUX-NODE',
        cpuModel: 'AMD Ryzen 9 7950X (16 Cores / 32 Threads)',
        totalMemoryBytes: 34359738368,
        freeMemoryBytes: 18253611008,
        uptimeSeconds: 864200,
        isElevated: true,
      };
    } else if (this.detectedPlatform === 'ios') {
      return {
        platform: 'ios',
        osRelease: 'iOS / iPadOS 18.0 (Metal Accelerated)',
        hostName: 'SENTINEL-IPAD-PRO',
        cpuModel: 'Apple M4 SoC (9 Core GPU/CPU)',
        totalMemoryBytes: 17179869184, // 16 GB
        freeMemoryBytes: 10737418240,
        uptimeSeconds: 43200,
        isElevated: true,
      };
    } else if (this.detectedPlatform === 'android') {
      return {
        platform: 'android',
        osRelease: 'Android 15 (Kernel 6.6-android)',
        hostName: 'SENTINEL-MOBILE-DEVICE',
        cpuModel: 'Qualcomm Snapdragon 8 Gen 3',
        totalMemoryBytes: 12884901888, // 12 GB
        freeMemoryBytes: 6442450944,
        uptimeSeconds: 28800,
        isElevated: true,
      };
    }

    return {
      platform: 'windows',
      osRelease: 'Windows 11 Pro 23H2 (Build 22631.3880)',
      hostName: 'SENTINEL-DESKTOP-01',
      cpuModel: 'Intel(R) Core(TM) i9-13900K @ 3.00GHz (24 Cores / 32 Threads)',
      totalMemoryBytes: 34359738368, // 32 GB
      freeMemoryBytes: 19327352832,
      uptimeSeconds: 142800,
      isElevated: true,
    };
  }

  public async getProcesses(): Promise<MockProcess[]> {
    if (this.isElectronRuntime) {
      return (window as any).sentinelNative.getProcesses();
    }
    return [...this.processes];
  }

  public async terminateProcess(pid: number): Promise<{ success: boolean; message: string }> {
    if (this.isElectronRuntime) {
      return (window as any).sentinelNative.terminateProcess(pid);
    }
    const idx = this.processes.findIndex((p) => p.pid === pid);
    if (idx !== -1) {
      const removed = this.processes.splice(idx, 1)[0];
      return { success: true, message: `Terminated process '${removed.name}' (PID: ${pid}).` };
    }
    return { success: false, message: `Process PID ${pid} not found.` };
  }

  public async getStartupItems(): Promise<MockStartupItem[]> {
    if (this.isElectronRuntime) {
      return (window as any).sentinelNative.getStartupItems();
    }
    return [...this.startupItems];
  }

  public async toggleStartupItem(id: string, enabled: boolean): Promise<boolean> {
    if (this.isElectronRuntime) {
      return (window as any).sentinelNative.toggleStartupItem(id, enabled);
    }
    const item = this.startupItems.find((i) => i.id === id);
    if (item) {
      item.enabled = enabled;
      return true;
    }
    return false;
  }

  public async getJunkCategories(): Promise<MockJunkCategory[]> {
    return [...this.junkCategories];
  }

  public async cleanJunk(categoryIds: string[]): Promise<{ reclaimedBytes: number; itemsCleaned: number }> {
    let reclaimedBytes = 0;
    let itemsCleaned = 0;

    this.junkCategories.forEach((cat) => {
      if (categoryIds.includes(cat.id)) {
        reclaimedBytes += cat.sizeBytes;
        itemsCleaned += cat.itemCount;
        cat.sizeBytes = 0;
        cat.itemCount = 0;
      }
    });

    return { reclaimedBytes, itemsCleaned };
  }

  public async getActiveConnections(): Promise<MockNetworkConnection[]> {
    if (this.isElectronRuntime) {
      return (window as any).sentinelNative.getActiveConnections();
    }
    return [...this.networkConnections];
  }

  public async testDnsLatency(): Promise<{ server: string; ip: string; latencyMs: number; status: 'optimal' | 'moderate' | 'degraded' }[]> {
    await new Promise((r) => setTimeout(r, 600));
    return [
      { server: 'Cloudflare DNS Primary', ip: '1.1.1.1', latencyMs: 8, status: 'optimal' },
      { server: 'Google Public DNS', ip: '8.8.8.8', latencyMs: 14, status: 'optimal' },
      { server: 'Quad9 Secure Resolver', ip: '9.9.9.9', latencyMs: 22, status: 'optimal' },
      { server: 'Local Gateway DNS', ip: '192.168.1.1', latencyMs: 2, status: 'optimal' },
      { server: 'Suspicious Proxy Route', ip: '198.51.100.25', latencyMs: 462, status: 'degraded' },
    ];
  }
}

export const nativeBridge = NativeBridge.getInstance();
