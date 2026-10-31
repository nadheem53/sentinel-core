import { SystemMetrics } from '../core-engine/types';
import { globalEventBus } from '../core-engine/EventBus';

export class SystemMetricsService {
  private static instance: SystemMetricsService;
  private timer: any = null;
  private currentMetrics: SystemMetrics = {
    cpuUsagePercent: 28,
    cpuTempCelsius: 48,
    ramUsagePercent: 42,
    ramUsedGB: 6.7,
    ramTotalGB: 16.0,
    diskUsagePercent: 61,
    diskFreeGB: 198.4,
    diskTotalGB: 512.0,
    networkInKBps: 340,
    networkOutKBps: 120,
    runningProcessesCount: 164,
    systemUptimeSeconds: 142800,
    activeThreatsCount: 0,
    healthScore: 92,
  };

  private constructor() {
    this.startStreaming();
  }

  public static getInstance(): SystemMetricsService {
    if (!SystemMetricsService.instance) {
      SystemMetricsService.instance = new SystemMetricsService();
    }
    return SystemMetricsService.instance;
  }

  public getMetrics(): SystemMetrics {
    return { ...this.currentMetrics };
  }

  public updateHealthScore(newScore: number): void {
    this.currentMetrics.healthScore = Math.max(0, Math.min(100, newScore));
    globalEventBus.emit('metrics_updated', this.currentMetrics);
  }

  public updateActiveThreatsCount(count: number): void {
    this.currentMetrics.activeThreatsCount = count;
    // Lower health score if active threats exist
    const baseHealth = 98 - count * 15;
    this.currentMetrics.healthScore = Math.max(15, Math.min(100, baseHealth));
    globalEventBus.emit('metrics_updated', this.currentMetrics);
  }

  private startStreaming(): void {
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      // Create smooth realistic jitter in metrics
      const cpuDelta = (Math.random() - 0.5) * 6;
      this.currentMetrics.cpuUsagePercent = Math.max(12, Math.min(95, Math.round(this.currentMetrics.cpuUsagePercent + cpuDelta)));
      this.currentMetrics.cpuTempCelsius = Math.round(42 + (this.currentMetrics.cpuUsagePercent / 100) * 32);

      const ramDelta = (Math.random() - 0.5) * 0.1;
      this.currentMetrics.ramUsedGB = Math.max(4.0, Math.min(14.5, +(this.currentMetrics.ramUsedGB + ramDelta).toFixed(1)));
      this.currentMetrics.ramUsagePercent = Math.round((this.currentMetrics.ramUsedGB / this.currentMetrics.ramTotalGB) * 100);

      this.currentMetrics.networkInKBps = Math.max(10, Math.round(this.currentMetrics.networkInKBps + (Math.random() - 0.5) * 80));
      this.currentMetrics.networkOutKBps = Math.max(5, Math.round(this.currentMetrics.networkOutKBps + (Math.random() - 0.5) * 40));

      this.currentMetrics.systemUptimeSeconds += 1;

      globalEventBus.emit('metrics_updated', { ...this.currentMetrics });
    }, 1200);

    if (this.timer?.unref) {
      this.timer.unref();
    }
  }
}

export const systemMetricsService = SystemMetricsService.getInstance();
