import { IScannerPlugin, ScannerProgressCallback } from './IScannerPlugin';
import { DiagnosticIssue, ScanMode } from '../core-engine/types';

export class StartupBloatScanner implements IScannerPlugin {
  readonly id = 'scanner-startup';
  readonly name = 'Startup & Background Bloat Optimizer';
  readonly category = 'startup_bloat' as const;
  readonly description = 'Analyzes startup impact, delayed boot items, and excessive background daemon bloat.';
  readonly iconName = 'Zap';
  readonly version = '1.9.0';
  readonly author = 'SentinelCore Boot Diagnostics';
  enabled = true;

  private mockStartupItems = [
    {
      name: 'GameLauncherSyncService',
      path: 'C:\\Program Files\\GameStore\\sync_agent.exe',
      impact: 'High (+4.2s boot delay)',
      isBloat: true,
      severity: 'medium' as const,
      title: 'High-Impact Startup Bloatware',
      desc: 'Unnecessary background game sync utility launching automatically on system startup.',
    },
    {
      name: 'OrphanedAudioTrayHelper',
      path: 'C:\\Program Files\\OldDriver\\tray.exe (NOT FOUND)',
      impact: 'Medium (+1.8s timeout)',
      isBloat: true,
      severity: 'low' as const,
      title: 'Orphaned Startup Registry Entry',
      desc: 'Startup entry points to a missing file, causing OS explorer initialization lag.',
    },
    {
      name: 'WindowsSecurityNotification',
      path: 'C:\\Windows\\System32\\SecurityHealthSystray.exe',
      impact: 'Low (<0.1s)',
      isBloat: false,
      severity: 'info' as const,
      title: 'Core Windows Security Tray',
      desc: 'Essential',
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
    const items = mode === 'quick' ? this.mockStartupItems.slice(0, 2) : this.mockStartupItems;

    for (let i = 0; i < items.length; i++) {
      if (isCancelled()) break;

      const item = items[i];
      const percent = Math.floor(((i + 1) / items.length) * 100);

      await new Promise((r) => setTimeout(r, mode === 'deep' ? 90 : 40));

      let foundIssue: DiagnosticIssue | undefined;

      if (item.isBloat) {
        foundIssue = {
          id: `startup-${Date.now()}-${i}`,
          pluginId: this.id,
          category: 'startup_bloat',
          severity: item.severity,
          title: `${item.title}: ${item.name}`,
          description: item.desc,
          targetResource: item.name,
          targetPath: item.path,
          detectedAt: Date.now(),
          autoFixable: true,
          remediationAction: 'disable',
          safeToAutoFix: true,
          technicalDetails: {
            startupName: item.name,
            bootImpact: item.impact,
            executablePath: item.path,
            recommendation: 'Disable automatic autorun to speed up machine boot time.',
          },
        };

        issues.push(foundIssue);
      }

      onProgress({
        scannedCount: i + 1,
        currentResource: `Startup Item: ${item.name}`,
        subPhase: 'Evaluating Startup Launch Latency Impact',
        percent,
        foundIssue,
      });
    }

    return issues;
  }

  async repair(issue: DiagnosticIssue): Promise<{ success: boolean; message: string; details?: any }> {
    await new Promise((r) => setTimeout(r, 200));
    return {
      success: true,
      message: `Startup item '${issue.targetResource}' successfully disabled from automatic boot sequence.`,
      details: {
        startupDisabled: issue.targetResource,
        bootTimeSavedEstSec: 4.2,
      },
    };
  }
}
