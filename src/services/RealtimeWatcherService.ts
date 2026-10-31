import { globalEventBus } from '../core-engine/EventBus';

export interface WatcherEvent {
  id: string;
  timestamp: number;
  type: 'file_created' | 'process_spawned' | 'socket_opened' | 'threat_blocked';
  severity: 'info' | 'warning' | 'critical';
  source: string;
  message: string;
  actionTaken: string;
}

export class RealtimeWatcherService {
  private static instance: RealtimeWatcherService;
  private isRunning: boolean = true;
  private timer: any = null;
  private recentEvents: WatcherEvent[] = [];
  private totalBlockedThreats: number = 14;

  private mockLiveIncidents = [
    { type: 'process_spawned' as const, severity: 'info' as const, source: 'code.exe (PID 5124)', message: 'Spawned child process node.exe with valid code signature.', actionTaken: 'Allowed' },
    { type: 'socket_opened' as const, severity: 'info' as const, source: 'chrome.exe', message: 'Outbound HTTPS socket opened to 142.250.190.46:443.', actionTaken: 'Allowed' },
    { type: 'file_created' as const, severity: 'warning' as const, source: 'System32\\spoolsv.exe', message: 'Print spooler modified buffer queue cache.', actionTaken: 'Monitored' },
    { type: 'threat_blocked' as const, severity: 'critical' as const, source: 'powershell.exe -enc <payload>', message: 'Heuristic script execution blocked: Attempt to write to RunOnce registry key.', actionTaken: 'Blocked & Terminated' },
  ];

  private constructor() {
    this.start();
  }

  public static getInstance(): RealtimeWatcherService {
    if (!RealtimeWatcherService.instance) {
      RealtimeWatcherService.instance = new RealtimeWatcherService();
    }
    return RealtimeWatcherService.instance;
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  public getRecentEvents(): WatcherEvent[] {
    return [...this.recentEvents];
  }

  public getTotalBlocked(): number {
    return this.totalBlockedThreats;
  }

  public start(): void {
    if (this.timer) clearInterval(this.timer);
    this.isRunning = true;
    globalEventBus.emit('watcher_state_changed', { isRunning: true });

    // Periodically generate realistic background telemetry / intercept events
    this.timer = setInterval(() => {
      if (!this.isRunning) return;

      // Randomly inject a real-time event every few intervals
      if (Math.random() > 0.4) {
        const template = this.mockLiveIncidents[Math.floor(Math.random() * this.mockLiveIncidents.length)];
        const event: WatcherEvent = {
          id: `watch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: Date.now(),
          type: template.type,
          severity: template.severity,
          source: template.source,
          message: template.message,
          actionTaken: template.actionTaken,
        };

        if (template.type === 'threat_blocked') {
          this.totalBlockedThreats++;
        }

        this.recentEvents.unshift(event);
        if (this.recentEvents.length > 50) {
          this.recentEvents.pop();
        }

        globalEventBus.emit('watcher_event', event);
      }
    }, 4500);

    if (this.timer?.unref) {
      this.timer.unref();
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    globalEventBus.emit('watcher_state_changed', { isRunning: false });
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
    return this.isRunning;
  }
}

export const realtimeWatcherService = RealtimeWatcherService.getInstance();
