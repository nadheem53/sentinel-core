import { DiagnosticIssue, ScanMode, ScanProgressEvent, ScanResult, ScanState } from './types';
import { pluginRegistry } from './PluginRegistry';
import { globalEventBus } from './EventBus';

export class ScanOrchestrator {
  private static instance: ScanOrchestrator;
  private currentScanState: ScanState = 'idle';
  private currentScanId: string | null = null;
  private currentMode: ScanMode = 'quick';
  private isAbortRequested: boolean = false;
  private isPauseRequested: boolean = false;
  private detectedIssues: DiagnosticIssue[] = [];
  private totalScannedFiles: number = 0;
  private totalScannedProcesses: number = 0;
  private startTime: number = 0;

  private constructor() {}

  public static getInstance(): ScanOrchestrator {
    if (!ScanOrchestrator.instance) {
      ScanOrchestrator.instance = new ScanOrchestrator();
    }
    return ScanOrchestrator.instance;
  }

  public getState(): ScanState {
    return this.currentScanState;
  }

  public getActiveScanId(): string | null {
    return this.currentScanId;
  }

  public getDetectedIssues(): DiagnosticIssue[] {
    return [...this.detectedIssues];
  }

  public async startScan(mode: ScanMode = 'quick', selectedPluginIds?: string[]): Promise<ScanResult> {
    if (this.currentScanState === 'scanning') {
      throw new Error('A scan is already in progress.');
    }

    this.currentScanId = `scan-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    this.currentMode = mode;
    this.currentScanState = 'scanning';
    this.isAbortRequested = false;
    this.isPauseRequested = false;
    this.detectedIssues = [];
    this.totalScannedFiles = 0;
    this.totalScannedProcesses = 0;
    this.startTime = Date.now();

    globalEventBus.emit('scan_started', {
      scanId: this.currentScanId,
      mode: this.currentMode,
      startedAt: this.startTime,
    });

    let plugins = pluginRegistry.getEnabledPlugins();
    if (selectedPluginIds && selectedPluginIds.length > 0) {
      plugins = plugins.filter((p) => selectedPluginIds.includes(p.id));
    }

    if (plugins.length === 0) {
      this.currentScanState = 'completed';
      return {
        scanId: this.currentScanId,
        mode: this.currentMode,
        startedAt: this.startTime,
        completedAt: Date.now(),
        totalScannedFiles: 0,
        totalScannedProcesses: 0,
        issues: [],
        healthScoreDelta: 0,
      };
    }

    try {
      for (let i = 0; i < plugins.length; i++) {
        if (this.isAbortRequested) {
          this.currentScanState = 'cancelled';
          globalEventBus.emit('scan_cancelled', { scanId: this.currentScanId });
          break;
        }

        while (this.isPauseRequested) {
          this.currentScanState = 'paused';
          await new Promise((r) => setTimeout(r, 200));
          if (this.isAbortRequested) break;
        }
        this.currentScanState = 'scanning';

        const plugin = plugins[i];
        const basePercent = Math.floor((i / plugins.length) * 100);
        const stepPercent = Math.floor(100 / plugins.length);

        const pluginIssues = await plugin.scan(
          mode,
          (prog) => {
            if (plugin.category === 'performance' || plugin.category === 'startup_bloat') {
              this.totalScannedProcesses += 1;
            } else {
              this.totalScannedFiles += 1;
            }

            if (prog.foundIssue) {
              this.detectedIssues.push(prog.foundIssue);
              globalEventBus.emit('issue_detected', prog.foundIssue);
            }

            const overallPercent = Math.min(
              99,
              Math.floor(basePercent + (prog.percent / 100) * stepPercent)
            );

            const progressPayload: ScanProgressEvent = {
              scanId: this.currentScanId!,
              mode: this.currentMode,
              state: this.currentScanState,
              percent: overallPercent,
              currentPhase: `${plugin.name} (${i + 1}/${plugins.length})`,
              currentPluginName: plugin.name,
              currentFilePath: prog.currentResource,
              scannedFilesCount: this.totalScannedFiles,
              scannedProcessesCount: this.totalScannedProcesses,
              detectedIssuesCount: this.detectedIssues.length,
              elapsedSeconds: Math.floor((Date.now() - this.startTime) / 1000),
            };

            globalEventBus.emit('scan_progress', progressPayload);
          },
          () => this.isAbortRequested
        );

        // Deduplicate issues
        pluginIssues.forEach((issue) => {
          if (!this.detectedIssues.some((d) => d.id === issue.id)) {
            this.detectedIssues.push(issue);
            globalEventBus.emit('issue_detected', issue);
          }
        });
      }

      const completedAt = Date.now();
      if (!this.isAbortRequested) {
        this.currentScanState = 'completed';
      }

      const result: ScanResult = {
        scanId: this.currentScanId,
        mode: this.currentMode,
        startedAt: this.startTime,
        completedAt,
        totalScannedFiles: this.totalScannedFiles,
        totalScannedProcesses: this.totalScannedProcesses,
        issues: [...this.detectedIssues],
        healthScoreDelta: this.calculateHealthPenalty(this.detectedIssues),
      };

      globalEventBus.emit('scan_completed', result);
      return result;
    } catch (error) {
      console.error('[ScanOrchestrator] Scan execution error:', error);
      this.currentScanState = 'completed';
      throw error;
    }
  }

  public pauseScan(): void {
    if (this.currentScanState === 'scanning') {
      this.isPauseRequested = true;
      this.currentScanState = 'paused';
      globalEventBus.emit('scan_paused', { scanId: this.currentScanId });
    }
  }

  public resumeScan(): void {
    if (this.currentScanState === 'paused') {
      this.isPauseRequested = false;
      this.currentScanState = 'scanning';
      globalEventBus.emit('scan_resumed', { scanId: this.currentScanId });
    }
  }

  public cancelScan(): void {
    this.isAbortRequested = true;
    this.isPauseRequested = false;
    this.currentScanState = 'cancelled';
    globalEventBus.emit('scan_cancelled', { scanId: this.currentScanId });
  }

  private calculateHealthPenalty(issues: DiagnosticIssue[]): number {
    let penalty = 0;
    issues.forEach((iss) => {
      if (iss.isFixed) return;
      if (iss.severity === 'critical') penalty += 20;
      else if (iss.severity === 'high') penalty += 10;
      else if (iss.severity === 'medium') penalty += 5;
      else if (iss.severity === 'low') penalty += 2;
    });
    return Math.min(100, penalty);
  }
}

export const scanOrchestrator = ScanOrchestrator.getInstance();
