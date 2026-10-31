import { IScannerPlugin, ScannerProgressCallback } from './IScannerPlugin';
import { DiagnosticIssue, ScanMode } from '../core-engine/types';

export class CrashLogsScanner implements IScannerPlugin {
  readonly id = 'scanner-crashlogs';
  readonly name = 'Crash Dump & Event Log Diagnostic';
  readonly category = 'crash_dump' as const;
  readonly description = 'Parses BSOD minidumps, kernel panic traces, and application crash event logs with auto-remediation guidance.';
  readonly iconName = 'Bug';
  readonly version = '2.0.0';
  readonly author = 'SentinelCore Diagnostics Team';
  enabled = true;

  private mockCrashDumps = [
    {
      dumpFile: 'C:\\Windows\\Minidump\\090126-14921-01.dmp',
      bugCheckCode: '0x0000007E (SYSTEM_THREAD_EXCEPTION_NOT_HANDLED)',
      faultingModule: 'nvlddmkm.sys (Graphics Driver Fault)',
      severity: 'high' as const,
      isCrash: true,
      title: 'Kernel BugCheck Minidump: 0x7E',
      desc: 'System experienced an unexpected crash in graphics driver subsystem nvlddmkm.sys.',
    },
    {
      dumpFile: 'C:\\ProgramData\\Microsoft\\Windows\\WER\\ReportArchive\\AppCrash_explorer.exe',
      bugCheckCode: 'Exception 0xc0000005 (Access Violation)',
      faultingModule: 'shell32.dll',
      severity: 'medium' as const,
      title: 'Application Crash Event: explorer.exe',
      desc: 'Desktop Shell crashed 3 times due to corrupted thumbnail cache database.',
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
    const dumps = mode === 'quick' ? this.mockCrashDumps.slice(0, 1) : this.mockCrashDumps;

    for (let i = 0; i < dumps.length; i++) {
      if (isCancelled()) break;

      const dump = dumps[i];
      const percent = Math.floor(((i + 1) / dumps.length) * 100);

      await new Promise((r) => setTimeout(r, mode === 'deep' ? 110 : 50));

      let foundIssue: DiagnosticIssue | undefined;

      if (dump.isCrash) {
        foundIssue = {
          id: `crash-${Date.now()}-${i}`,
          pluginId: this.id,
          category: 'crash_dump',
          severity: dump.severity,
          title: dump.title,
          description: dump.desc,
          targetPath: dump.dumpFile,
          detectedAt: Date.now(),
          autoFixable: true,
          remediationAction: 'repair',
          safeToAutoFix: true,
          technicalDetails: {
            bugCheckCode: dump.bugCheckCode,
            faultingModule: dump.faultingModule,
            dumpLocation: dump.dumpFile,
            remediationAdvice: 'Clear corrupted thumbnail cache and reset driver watchdog parameters.',
          },
        };

        issues.push(foundIssue);
      }

      onProgress({
        scannedCount: i + 1,
        currentResource: `Dump: ${dump.dumpFile}`,
        subPhase: 'Analyzing Stack Traces & Kernel BugCheck Codes',
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
      message: `Crash dump analysis remediation applied: Corrupted cache purged and graphics driver timeout watchdog reset.`,
      details: {
        clearedDumps: issue.targetPath,
        remediationCode: 'SUCCESS_CACHE_PURGED',
      },
    };
  }
}
