export type IssueCategory =
  | 'malware'
  | 'system_integrity'
  | 'registry'
  | 'performance'
  | 'network'
  | 'startup_bloat'
  | 'crash_dump';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ScanMode = 'quick' | 'deep' | 'custom';

export type ScanState = 'idle' | 'scanning' | 'paused' | 'completed' | 'cancelled';

export interface DiagnosticIssue {
  id: string;
  pluginId: string;
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  description: string;
  targetPath?: string;
  targetResource?: string;
  detectedAt: number;
  autoFixable: boolean;
  remediationAction: 'quarantine' | 'delete' | 'repair' | 'disable' | 'optimize' | 'flush';
  technicalDetails?: Record<string, any>;
  safeToAutoFix: boolean;
  isFixed?: boolean;
  fixedAt?: number;
  quarantinedVaultId?: string;
}

export interface ThreatItem extends DiagnosticIssue {
  category: 'malware';
  threatFamily: string;
  signatureMatch?: string;
  hashSHA256?: string;
  heuristicScore?: number;
  processPid?: number;
}

export interface QuarantinedItem {
  id: string;
  originalPath: string;
  fileName: string;
  fileSizeBytes: number;
  threatFamily: string;
  sha256: string;
  quarantinedAt: number;
  encryptedContentPreview: string; // Base64 or hex preview
  restored: boolean;
}

export interface SystemMetrics {
  cpuUsagePercent: number;
  cpuTempCelsius: number;
  ramUsagePercent: number;
  ramUsedGB: number;
  ramTotalGB: number;
  diskUsagePercent: number;
  diskFreeGB: number;
  diskTotalGB: number;
  networkInKBps: number;
  networkOutKBps: number;
  runningProcessesCount: number;
  systemUptimeSeconds: number;
  activeThreatsCount: number;
  healthScore: number; // 0 - 100
}

export interface AllowlistEntry {
  id: string;
  type: 'path' | 'hash' | 'process_name';
  pattern: string;
  description: string;
  addedAt: number;
  isSystemDefault: boolean;
}

export interface ThreatDefinitionRule {
  id: string;
  name: string;
  category: string;
  family: string;
  severity: IssueSeverity;
  hashMatch?: string;
  patternRegex?: string;
  heuristicIndicators?: string[];
  description: string;
}

export interface ScanProgressEvent {
  scanId: string;
  mode: ScanMode;
  state: ScanState;
  percent: number;
  currentPhase: string;
  currentPluginName: string;
  currentFilePath: string;
  scannedFilesCount: number;
  scannedProcessesCount: number;
  detectedIssuesCount: number;
  elapsedSeconds: number;
}

export interface ScanResult {
  scanId: string;
  mode: ScanMode;
  startedAt: number;
  completedAt: number;
  totalScannedFiles: number;
  totalScannedProcesses: number;
  issues: DiagnosticIssue[];
  healthScoreDelta: number;
}

export interface AutoRepairReport {
  timestamp: number;
  totalAttempted: number;
  totalSucceeded: number;
  totalFailed: number;
  repairedIssues: { issueId: string; title: string; action: string; success: boolean; message: string }[];
}

export interface AuditReport {
  id: string;
  generatedAt: number;
  scanMode: ScanMode;
  healthScore: number;
  totalIssuesFound: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  issues: DiagnosticIssue[];
  systemEnvironment: {
    osPlatform: string;
    osVersion: string;
    arch: string;
    hostName: string;
    totalMemory: string;
    cpuCores: number;
  };
}
