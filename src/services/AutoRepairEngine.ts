import { AutoRepairReport, DiagnosticIssue, ThreatItem } from '../core-engine/types';
import { pluginRegistry } from '../core-engine/PluginRegistry';
import { quarantineVaultService } from './QuarantineVaultService';
import { globalEventBus } from '../core-engine/EventBus';

export class AutoRepairEngine {
  private static instance: AutoRepairEngine;
  private isRepairing: boolean = false;
  private lastRepairReport: AutoRepairReport | null = null;

  private constructor() {}

  public static getInstance(): AutoRepairEngine {
    if (!AutoRepairEngine.instance) {
      AutoRepairEngine.instance = new AutoRepairEngine();
    }
    return AutoRepairEngine.instance;
  }

  public isBusy(): boolean {
    return this.isRepairing;
  }

  public getLastReport(): AutoRepairReport | null {
    return this.lastRepairReport;
  }

  /**
   * Preview what changes will happen without applying them (Dry Run).
   */
  public generateDryRunPreview(issues: DiagnosticIssue[]): {
    totalFixable: number;
    quarantineCount: number;
    fileRepairCount: number;
    registryCleanCount: number;
    performanceOptimizeCount: number;
    networkResetCount: number;
    startupDisableCount: number;
  } {
    let quarantineCount = 0;
    let fileRepairCount = 0;
    let registryCleanCount = 0;
    let performanceOptimizeCount = 0;
    let networkResetCount = 0;
    let startupDisableCount = 0;

    issues.forEach((issue) => {
      if (issue.isFixed) return;
      if (issue.category === 'malware' || issue.remediationAction === 'quarantine') {
        quarantineCount++;
      } else if (issue.category === 'system_integrity') {
        fileRepairCount++;
      } else if (issue.category === 'registry') {
        registryCleanCount++;
      } else if (issue.category === 'performance') {
        performanceOptimizeCount++;
      } else if (issue.category === 'network') {
        networkResetCount++;
      } else if (issue.category === 'startup_bloat') {
        startupDisableCount++;
      }
    });

    return {
      totalFixable: issues.filter((i) => !i.isFixed && i.autoFixable).length,
      quarantineCount,
      fileRepairCount,
      registryCleanCount,
      performanceOptimizeCount,
      networkResetCount,
      startupDisableCount,
    };
  }

  /**
   * Execute automated repair on a single issue.
   */
  public async fixSingleIssue(issue: DiagnosticIssue): Promise<{ success: boolean; message: string }> {
    if (issue.isFixed) {
      return { success: true, message: 'Issue is already fixed.' };
    }

    try {
      // 1. If malware, handle quarantine
      if (issue.category === 'malware') {
        const vaultItem = quarantineVaultService.quarantineThreat(issue as ThreatItem);
        issue.isFixed = true;
        issue.fixedAt = Date.now();
        issue.quarantinedVaultId = vaultItem.id;
        globalEventBus.emit('issue_repaired', { issue, vaultItem });
        return {
          success: true,
          message: `Threat isolated to Quarantine Vault (${vaultItem.fileName}).`,
        };
      }

      // 2. Delegate to respective plugin repair handler
      const plugin = pluginRegistry.getPlugin(issue.pluginId);
      if (!plugin) {
        throw new Error(`No plugin found for ID ${issue.pluginId}`);
      }

      const repairResult = await plugin.repair(issue);
      if (repairResult.success) {
        issue.isFixed = true;
        issue.fixedAt = Date.now();
        globalEventBus.emit('issue_repaired', { issue, details: repairResult.details });
      }

      return repairResult;
    } catch (err: any) {
      console.error(`[AutoRepairEngine] Failed to repair issue ${issue.id}:`, err);
      return {
        success: false,
        message: err.message || 'Unknown error occurred during repair.',
      };
    }
  }

  /**
   * Execute 1-Click Auto-Fix across an array of issues.
   */
  public async fixAllIssues(
    issues: DiagnosticIssue[],
    onProgress?: (repairedCount: number, total: number, currentIssueTitle: string) => void
  ): Promise<AutoRepairReport> {
    this.isRepairing = true;
    globalEventBus.emit('repair_started', { total: issues.length });

    const fixableIssues = issues.filter((i) => !i.isFixed && i.autoFixable);
    const report: AutoRepairReport = {
      timestamp: Date.now(),
      totalAttempted: fixableIssues.length,
      totalSucceeded: 0,
      totalFailed: 0,
      repairedIssues: [],
    };

    for (let i = 0; i < fixableIssues.length; i++) {
      const issue = fixableIssues[i];
      if (onProgress) {
        onProgress(i + 1, fixableIssues.length, issue.title);
      }

      const res = await this.fixSingleIssue(issue);
      if (res.success) {
        report.totalSucceeded++;
      } else {
        report.totalFailed++;
      }

      report.repairedIssues.push({
        issueId: issue.id,
        title: issue.title,
        action: issue.remediationAction,
        success: res.success,
        message: res.message,
      });

      // Brief pause between actions for UI telemetry display
      await new Promise((r) => setTimeout(r, 120));
    }

    this.isRepairing = false;
    this.lastRepairReport = report;
    globalEventBus.emit('repair_completed', report);
    return report;
  }
}

export const autoRepairEngine = AutoRepairEngine.getInstance();
