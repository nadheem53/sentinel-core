import { IScannerPlugin, ScannerProgressCallback } from './IScannerPlugin';
import { DiagnosticIssue, ScanMode } from '../core-engine/types';

export class RegistryConfigScanner implements IScannerPlugin {
  readonly id = 'scanner-registry';
  readonly name = 'Registry & Configuration Health Analyzer';
  readonly category = 'registry' as const;
  readonly description = 'Scans Windows Registry & Unix system configs for orphaned keys, broken CLSIDs, and hijacked file associations.';
  readonly iconName = 'DatabaseZap';
  readonly version = '2.1.0';
  readonly author = 'SentinelCore System Diagnostics';
  enabled = true;

  private mockRegistryKeys = [
    {
      hive: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
      keyName: 'BrowserSpeedupUpdater',
      badValue: 'C:\\Users\\User\\AppData\\Local\\Temp\\updater_x86.exe --silent',
      isAnomaly: true,
      severity: 'high' as const,
      title: 'Suspicious Persistence AutoRun Key',
      desc: 'Orphaned or malicious startup key pointing to an untrusted executable in Temp folder.',
    },
    {
      hive: 'HKEY_CLASSES_ROOT\\CLSID\\{A84920E1-4192-498A-BF39-9214781A00B2}',
      keyName: 'InProcServer32',
      badValue: 'C:\\Program Files\\ObsoleteToolbar\\toolbar_x64.dll (FILE MISSING)',
      isAnomaly: true,
      severity: 'medium' as const,
      title: 'Broken COM/CLSID Class Registration',
      desc: 'Orphaned registry class pointing to deleted DLL component causing Explorer context menu lag.',
    },
    {
      hive: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\OrphanedApp_109',
      keyName: 'UninstallString',
      badValue: 'C:\\Invalid\\Path\\unins000.exe',
      isAnomaly: true,
      severity: 'low' as const,
      title: 'Orphaned Add/Remove Software Entry',
      desc: 'Dead uninstaller reference remaining in registry after partial application removal.',
    },
    {
      hive: 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters',
      keyName: 'TcpWindowSize',
      badValue: 'Standard 65535',
      isAnomaly: false,
      severity: 'info' as const,
      title: 'TCP Stack Parameter',
      desc: 'Valid',
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
    const keys = mode === 'quick' ? this.mockRegistryKeys.slice(0, 2) : this.mockRegistryKeys;

    for (let i = 0; i < keys.length; i++) {
      if (isCancelled()) break;

      const reg = keys[i];
      const percent = Math.floor(((i + 1) / keys.length) * 100);

      await new Promise((r) => setTimeout(r, mode === 'deep' ? 100 : 50));

      let foundIssue: DiagnosticIssue | undefined;

      if (reg.isAnomaly) {
        foundIssue = {
          id: `registry-${Date.now()}-${i}`,
          pluginId: this.id,
          category: 'registry',
          severity: reg.severity,
          title: reg.title,
          description: reg.desc,
          targetPath: `${reg.hive}\\${reg.keyName}`,
          detectedAt: Date.now(),
          autoFixable: true,
          remediationAction: 'repair',
          safeToAutoFix: true,
          technicalDetails: {
            registryHive: reg.hive,
            valueName: reg.keyName,
            valueData: reg.badValue,
            actionPlan: 'Delete orphaned key and sanitize registry hive structure.',
          },
        };

        issues.push(foundIssue);
      }

      onProgress({
        scannedCount: i + 1,
        currentResource: `${reg.hive}\\${reg.keyName}`,
        subPhase: 'Querying Registry Hive Trees',
        percent,
        foundIssue,
      });
    }

    return issues;
  }

  async repair(issue: DiagnosticIssue): Promise<{ success: boolean; message: string; details?: any }> {
    await new Promise((r) => setTimeout(r, 280));
    return {
      success: true,
      message: `Registry key '${issue.targetPath}' successfully sanitized and orphaned references pruned.`,
      details: {
        cleanedPath: issue.targetPath,
        hiveBackupSnapshotCreated: true,
      },
    };
  }
}
