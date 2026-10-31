import { DiagnosticIssue, IssueCategory, ScanMode } from '../core-engine/types';

export interface ScannerProgressCallback {
  (progress: {
    scannedCount: number;
    currentResource: string;
    subPhase: string;
    percent: number;
    foundIssue?: DiagnosticIssue;
  }): void;
}

export interface IScannerPlugin {
  readonly id: string;
  readonly name: string;
  readonly category: IssueCategory;
  readonly description: string;
  readonly iconName: string;
  readonly version: string;
  readonly author: string;
  enabled: boolean;

  /**
   * Run the scan detection routine.
   * @param mode Scan mode (quick, deep, custom)
   * @param onProgress Callback to stream live progress and newly detected issues
   * @param isCancelled Function to check if scan has been aborted by user
   */
  scan(
    mode: ScanMode,
    onProgress: ScannerProgressCallback,
    isCancelled: () => boolean
  ): Promise<DiagnosticIssue[]>;

  /**
   * Perform safe automated repair or remediation for a detected issue.
   * @param issue The issue to fix
   */
  repair(issue: DiagnosticIssue): Promise<{ success: boolean; message: string; details?: any }>;

  /**
   * Safe check to determine whether the plugin can run on the host environment
   */
  isSupported(): boolean;
}
