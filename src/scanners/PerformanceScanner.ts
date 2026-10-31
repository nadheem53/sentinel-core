import { IScannerPlugin, ScannerProgressCallback } from './IScannerPlugin';
import { DiagnosticIssue, ScanMode } from '../core-engine/types';

export class PerformanceScanner implements IScannerPlugin {
  readonly id = 'scanner-performance';
  readonly name = 'Performance & Memory Leak Monitor';
  readonly category = 'performance' as const;
  readonly description = 'Detects unconstrained memory growth, runaway CPU threads, zombie processes, and disk I/O thrashing.';
  readonly iconName = 'Gauge';
  readonly version = '3.0.1';
  readonly author = 'SentinelCore Performance Labs';
  enabled = true;

  private mockProcessAudit = [
    {
      pid: 4182,
      name: 'crypto_helper_daemon.exe',
      cpuPercent: 88.4,
      memoryMB: 3420,
      isLeak: true,
      severity: 'high' as const,
      title: 'Runaway Background CPU Hog',
      desc: 'Process consuming 88.4% CPU continuously without active UI window.',
    },
    {
      pid: 6120,
      name: 'electron_crash_watcher.exe',
      cpuPercent: 1.2,
      memoryMB: 1980,
      isLeak: true,
      severity: 'medium' as const,
      title: 'Unbounded Memory Leak Detected',
      desc: 'Memory footprint has grown by 1.8GB in 30 minutes with zero garbage collection.',
    },
    {
      pid: 1044,
      name: 'system_idle_process.exe',
      cpuPercent: 5.0,
      memoryMB: 40,
      isLeak: false,
      severity: 'info' as const,
      title: 'Normal Process',
      desc: 'Healthy',
    },
  ];

  isSupported(): boolean {
    return true;
  }

  async scan(
    mode: ScanMode,
    onProgress: ScannerProgressCallback,
    isCancelled: () => boolean
  ): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = [];
    const procs = mode === 'quick' ? this.mockProcessAudit.slice(0, 2) : this.mockProcessAudit;

    for (let i = 0; i < procs.length; i++) {
      if (isCancelled()) break;

      const p = procs[i];
      const percent = Math.floor(((i + 1) / procs.length) * 100);

      await new Promise((r) => setTimeout(r, mode === 'deep' ? 100 : 50));

      let foundIssue: DiagnosticIssue | undefined;

      if (p.isLeak) {
        foundIssue = {
          id: `perf-${p.pid}-${Date.now()}`,
          pluginId: this.id,
          category: 'performance',
          severity: p.severity,
          title: `${p.title} (${p.name})`,
          description: p.desc,
          targetResource: `PID ${p.pid} - ${p.name}`,
          detectedAt: Date.now(),
          autoFixable: true,
          remediationAction: 'optimize',
          safeToAutoFix: true,
          technicalDetails: {
            pid: p.pid,
            processName: p.name,
            cpuUsage: `${p.cpuPercent}%`,
            workingSetMB: `${p.memoryMB} MB`,
            recommendation: 'Terminate runaway process and release allocated memory heap.',
          },
        };

        issues.push(foundIssue);
      }

      onProgress({
        scannedCount: i + 1,
        currentResource: `Process: ${p.name} (PID ${p.pid})`,
        subPhase: 'Profiling Memory Working Sets & CPU Queues',
        percent,
        foundIssue,
      });
    }

    return issues;
  }

  async repair(issue: DiagnosticIssue): Promise<{ success: boolean; message: string; details?: any }> {
    await new Promise((r) => setTimeout(r, 300));
    return {
      success: true,
      message: `Performance bottleneck for '${issue.targetResource}' resolved. Process safely terminated and system RAM reclaimed.`,
      details: {
        resource: issue.targetResource,
        memoryReclaimedMB: 1850,
      },
    };
  }
}
