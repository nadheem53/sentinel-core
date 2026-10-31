import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Plus,
} from 'lucide-react';
import type { AuditReport, DiagnosticIssue, SystemMetrics } from '../../core-engine/types';
import { reportService } from '../../services/ReportService';
import { soundFx } from '../../services/SoundFxService';

interface ReportsViewProps {
  issues: DiagnosticIssue[];
  metrics: SystemMetrics;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ issues, metrics }) => {
  const [reports, setReports] = useState<AuditReport[]>(reportService.getHistory());
  const [selectedReport, setSelectedReport] = useState<AuditReport | null>(reports[0] || null);

  const handleGenerateReport = () => {
    soundFx.playClick();
    const newReport = reportService.generateReport('deep', metrics.healthScore, issues);
    setReports(reportService.getHistory());
    setSelectedReport(newReport);
    soundFx.playSuccessChime();
  };

  const handleExportJSON = (report: AuditReport) => {
    soundFx.playClick();
    reportService.exportAsJSON(report);
  };

  const handleExportCSV = (report: AuditReport) => {
    soundFx.playClick();
    reportService.exportAsCSV(report);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display tracking-wide text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyber-cyan" />
            <span>DIAGNOSTIC AUDIT LOGS & REPORTS</span>
          </h2>
          <p className="text-xs text-cyber-muted mt-1">
            Exportable compliance & security audit summaries with cryptographic timestamps.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-neon-cyan transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>GENERATE AUDIT REPORT</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Reports History List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
            Historical Snapshots ({reports.length})
          </div>

          {reports.map((rep) => {
            const isSelected = selectedReport?.id === rep.id;
            return (
              <div
                key={rep.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedReport(rep);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  isSelected
                    ? 'bg-cyber-card border-cyber-cyan shadow-neon-cyan/10'
                    : 'bg-cyber-surface/70 border-cyber-border hover:border-cyber-borderGlow'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">{rep.id}</span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      rep.healthScore >= 80
                        ? 'bg-cyber-green/15 text-cyber-green'
                        : 'bg-cyber-amber/15 text-cyber-amber'
                    }`}
                  >
                    Health: {rep.healthScore}%
                  </span>
                </div>

                <div className="text-[11px] text-cyber-muted flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(rep.generatedAt).toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-cyber-border/40 text-[10px] font-mono text-slate-400">
                  <span>{rep.scanMode.toUpperCase()} SCAN</span>
                  <span>{rep.totalIssuesFound} Issues Logged</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Report Detailed View */}
        <div className="lg:col-span-8 space-y-4">
          {selectedReport ? (
            <div className="p-6 rounded-2xl bg-cyber-card/90 border border-cyber-border space-y-6">
              {/* Report Title & Export Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyber-border/80">
                <div>
                  <span className="text-[10px] font-mono uppercase text-cyber-cyan font-bold tracking-widest">
                    AUDIT REPORT INSPECTOR
                  </span>
                  <h3 className="text-lg font-bold font-display text-white mt-0.5">
                    {selectedReport.id}
                  </h3>
                  <p className="text-[11px] text-cyber-muted font-mono">
                    Generated on {new Date(selectedReport.generatedAt).toUTCString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleExportJSON(selectedReport)}
                    className="px-3 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-xs text-white flex items-center space-x-1.5 transition-colors"
                    title="Export JSON"
                  >
                    <Download className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>JSON</span>
                  </button>

                  <button
                    onClick={() => handleExportCSV(selectedReport)}
                    className="px-3 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-xs text-white flex items-center space-x-1.5 transition-colors"
                    title="Export CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-cyber-green" />
                    <span>CSV</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="p-2 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-slate-300 hover:text-white transition-colors"
                    title="Print Report"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Environment Snapshot */}
              <div className="p-4 rounded-xl bg-cyber-surface/90 border border-cyber-border/80 space-y-3">
                <div className="text-[10px] font-mono text-cyber-cyan uppercase font-bold tracking-wider">
                  Target Host & Operating System Environment
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-cyber-muted text-[10px] block">OS PLATFORM</span>
                    <span className="text-white font-semibold">
                      {selectedReport.systemEnvironment.osPlatform}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyber-muted text-[10px] block">HOSTNAME</span>
                    <span className="text-white font-semibold">
                      {selectedReport.systemEnvironment.hostName}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyber-muted text-[10px] block">CPU CORES</span>
                    <span className="text-white font-semibold">
                      {selectedReport.systemEnvironment.cpuCores} Logic Threads
                    </span>
                  </div>
                  <div>
                    <span className="text-cyber-muted text-[10px] block">TOTAL RAM</span>
                    <span className="text-white font-semibold">
                      {selectedReport.systemEnvironment.totalMemory}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyber-muted text-[10px] block">BUILD RELEASE</span>
                    <span className="text-white font-semibold">
                      {selectedReport.systemEnvironment.osVersion}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyber-muted text-[10px] block">DIAGNOSTIC SCORE</span>
                    <span className="text-cyber-green font-bold">
                      {selectedReport.healthScore} / 100
                    </span>
                  </div>
                </div>
              </div>

              {/* Severity Metrics Summary */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-cyber-surface border border-cyber-crimson/30 text-center">
                  <div className="text-lg font-bold font-display text-cyber-crimson">
                    {selectedReport.criticalIssues}
                  </div>
                  <div className="text-[10px] font-mono text-cyber-muted">Critical</div>
                </div>
                <div className="p-3 rounded-xl bg-cyber-surface border border-cyber-amber/30 text-center">
                  <div className="text-lg font-bold font-display text-cyber-amber">
                    {selectedReport.highIssues}
                  </div>
                  <div className="text-[10px] font-mono text-cyber-muted">High</div>
                </div>
                <div className="p-3 rounded-xl bg-cyber-surface border border-cyber-border text-center">
                  <div className="text-lg font-bold font-display text-slate-300">
                    {selectedReport.mediumIssues}
                  </div>
                  <div className="text-[10px] font-mono text-cyber-muted">Medium</div>
                </div>
                <div className="p-3 rounded-xl bg-cyber-surface border border-cyber-border text-center">
                  <div className="text-lg font-bold font-display text-cyber-green">
                    {selectedReport.lowIssues}
                  </div>
                  <div className="text-[10px] font-mono text-cyber-muted">Low / Info</div>
                </div>
              </div>

              {/* Issues Logged in Report */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                  Audit Findings ({selectedReport.issues.length})
                </div>

                {selectedReport.issues.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-cyber-surface/50 border border-cyber-border/50 text-xs text-cyber-muted">
                    No active issues recorded in this scan. All vectors healthy.
                  </div>
                ) : (
                  selectedReport.issues.map((iss) => (
                    <div
                      key={iss.id}
                      className="p-3 rounded-lg bg-cyber-surface/80 border border-cyber-border/70 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="space-y-0.5 truncate mr-3">
                        <div className="text-white font-sans font-semibold truncate">{iss.title}</div>
                        <div className="text-[10px] text-cyber-muted truncate">
                          Target: {iss.targetPath || iss.targetResource || 'System'}
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-cyber-cyan px-2 py-0.5 rounded bg-cyber-cyan/10 flex-shrink-0">
                        {iss.remediationAction}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-cyber-card/50 border border-cyber-border text-xs text-cyber-muted">
              Select an audit report from the left sidebar to inspect telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
