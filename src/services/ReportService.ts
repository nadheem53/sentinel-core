import { AuditReport, DiagnosticIssue, ScanMode } from '../core-engine/types';

export class ReportService {
  private static instance: ReportService;
  private reportsHistory: AuditReport[] = [];

  private constructor() {
    // Initial sample report
    this.reportsHistory.push({
      id: 'REP-20260901-0812',
      generatedAt: Date.now() - 86400000,
      scanMode: 'quick',
      healthScore: 88,
      totalIssuesFound: 4,
      criticalIssues: 1,
      highIssues: 1,
      mediumIssues: 1,
      lowIssues: 1,
      issues: [],
      systemEnvironment: {
        osPlatform: 'Windows 11 Pro 64-bit (23H2)',
        osVersion: '10.0.22631.3880',
        arch: 'x64',
        hostName: 'SENTINEL-NODE-01',
        totalMemory: '16.0 GB DDR5',
        cpuCores: 16,
      },
    });
  }

  public static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  public getHistory(): AuditReport[] {
    return [...this.reportsHistory];
  }

  public generateReport(
    scanMode: ScanMode,
    healthScore: number,
    issues: DiagnosticIssue[]
  ): AuditReport {
    const critical = issues.filter((i) => i.severity === 'critical').length;
    const high = issues.filter((i) => i.severity === 'high').length;
    const medium = issues.filter((i) => i.severity === 'medium').length;
    const low = issues.filter((i) => i.severity === 'low' || i.severity === 'info').length;

    const report: AuditReport = {
      id: `REP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      generatedAt: Date.now(),
      scanMode,
      healthScore,
      totalIssuesFound: issues.length,
      criticalIssues: critical,
      highIssues: high,
      mediumIssues: medium,
      lowIssues: low,
      issues: [...issues],
      systemEnvironment: {
        osPlatform: navigator.userAgent.includes('Win') ? 'Windows 11 / 10' : navigator.userAgent.includes('Mac') ? 'macOS Sonoma' : 'Linux Kernel 6.8',
        osVersion: 'Build 2026.09-REL',
        arch: 'x86_64',
        hostName: 'SENTINEL-DIAGNOSTIC-NODE',
        totalMemory: '16.0 GB RAM',
        cpuCores: navigator.hardwareConcurrency || 8,
      },
    };

    this.reportsHistory.unshift(report);
    return report;
  }

  public exportAsJSON(report: AuditReport): void {
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    this.downloadBlob(blob, `${report.id}_SentinelCore_Report.json`);
  }

  public exportAsCSV(report: AuditReport): void {
    const headers = ['ID', 'Category', 'Severity', 'Title', 'Target', 'Remediation', 'Status'];
    const rows = report.issues.map((i) => [
      i.id,
      i.category,
      i.severity,
      `"${i.title.replace(/"/g, '""')}"`,
      `"${(i.targetPath || i.targetResource || '').replace(/"/g, '""')}"`,
      i.remediationAction,
      i.isFixed ? 'FIXED' : 'UNRESOLVED',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${report.id}_SentinelCore_Audit.csv`);
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const reportService = ReportService.getInstance();
