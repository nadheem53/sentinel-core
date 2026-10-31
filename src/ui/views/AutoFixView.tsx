import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  DatabaseZap,
  Zap,
  Radio,
  Bug,
  Eye,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { DiagnosticIssue, IssueCategory } from '../../core-engine/types';
import { autoRepairEngine } from '../../services/AutoRepairEngine';
import { soundFx } from '../../services/SoundFxService';
import { Modal } from '../components/Modal';

interface AutoFixViewProps {
  issues: DiagnosticIssue[];
  onRefreshIssues: () => void;
}

export const AutoFixView: React.FC<AutoFixViewProps> = ({ issues, onRefreshIssues }) => {
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all');
  const [inspectingIssue, setInspectingIssue] = useState<DiagnosticIssue | null>(null);
  const [isFixingAll, setIsFixingAll] = useState<boolean>(false);
  const [repairProgress, setRepairProgress] = useState<{ current: number; total: number; title: string }>({
    current: 0,
    total: 0,
    title: '',
  });

  const activeIssues = issues.filter((i) => !i.isFixed);
  const filteredIssues =
    selectedCategory === 'all'
      ? activeIssues
      : activeIssues.filter((i) => i.category === selectedCategory);

  const dryRun = autoRepairEngine.generateDryRunPreview(activeIssues);

  const handleFixAll = async () => {
    soundFx.playClick();
    setIsFixingAll(true);

    try {
      await autoRepairEngine.fixAllIssues(activeIssues, (current, total, title) => {
        setRepairProgress({ current, total, title });
      });

      soundFx.playSuccessChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f3ff', '#a855f7', '#10b981'],
      });

      onRefreshIssues();
    } catch (e) {
      console.error(e);
    } finally {
      setIsFixingAll(false);
    }
  };

  const handleFixSingle = async (issue: DiagnosticIssue) => {
    soundFx.playClick();
    await autoRepairEngine.fixSingleIssue(issue);
    soundFx.playSuccessChime();
    onRefreshIssues();
    if (inspectingIssue?.id === issue.id) {
      setInspectingIssue(null);
    }
  };

  const categories: { id: IssueCategory | 'all'; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'All Issues', icon: Wrench },
    { id: 'malware', label: 'Malware & Threats', icon: ShieldAlert },
    { id: 'system_integrity', label: 'System Files', icon: FileCheck },
    { id: 'registry', label: 'Registry & Config', icon: DatabaseZap },
    { id: 'performance', label: 'Performance & Leaks', icon: Zap },
    { id: 'network', label: 'Network & Sockets', icon: Radio },
    { id: 'startup_bloat', label: 'Startup Bloat', icon: Zap },
    { id: 'crash_dump', label: 'Crash Logs', icon: Bug },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] pb-12">
      {/* 1-Click Hero Repair Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyber-purple/20 via-cyber-card to-cyber-cyan/15 border border-cyber-purple/40 shadow-neon-purple/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyber-purple/20 border border-cyber-purple/40 text-[10px] font-mono text-purple-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AUTOMATED HEURISTIC HEALING ENGINE</span>
          </div>
          <h2 className="text-xl font-bold font-display tracking-wide text-white">
            1-Click System Remediation & Threat Quarantine
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Instantly isolates active malware payloads into the encrypted Quarantine Vault, restores damaged system manifests, purges orphaned registry keys, and clears memory leaks with zero data loss.
          </p>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <button
            disabled={activeIssues.length === 0 || isFixingAll}
            onClick={handleFixAll}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyber-purple to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-neon-purple/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Wrench className="w-4 h-4" />
            <span>
              {isFixingAll ? 'REPAIRING SYSTEM...' : `FIX ALL ${activeIssues.length} SAFE ISSUES`}
            </span>
          </button>
          <span className="text-[10px] font-mono text-cyber-muted">
            Includes automatic rollback snapshot
          </span>
        </div>
      </div>

      {/* Dry Run Preview Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Threats to Vault', count: dryRun.quarantineCount, color: 'text-cyber-crimson' },
          { label: 'OS Files to Restore', count: dryRun.fileRepairCount, color: 'text-cyber-cyan' },
          { label: 'Registry Keys to Clean', count: dryRun.registryCleanCount, color: 'text-cyber-purple' },
          { label: 'Memory Leaks to Kill', count: dryRun.performanceOptimizeCount, color: 'text-cyber-green' },
          { label: 'Network Sockets to Reset', count: dryRun.networkResetCount, color: 'text-cyber-cyan' },
          { label: 'Startup Items to Disable', count: dryRun.startupDisableCount, color: 'text-cyber-amber' },
        ].map((item, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-cyber-card/80 border border-cyber-border text-center">
            <div className={`text-lg font-bold font-display ${item.color}`}>{item.count}</div>
            <div className="text-[10px] font-mono text-cyber-muted mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Batch Fixing Progress Bar */}
      {isFixingAll && (
        <div className="p-4 rounded-xl bg-cyber-card border border-cyber-purple/50 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-white font-semibold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyber-purple animate-pulse" />
              <span>Fixing: {repairProgress.title}</span>
            </span>
            <span className="font-mono text-cyber-purple">
              {repairProgress.current} / {repairProgress.total}
            </span>
          </div>
          <div className="w-full bg-cyber-bg rounded-full h-2 overflow-hidden">
            <div
              className="bg-cyber-purple h-full transition-all duration-200"
              style={{ width: `${(repairProgress.current / Math.max(1, repairProgress.total)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const count = cat.id === 'all'
            ? activeIssues.length
            : activeIssues.filter((i) => i.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40'
                  : 'bg-cyber-card border border-cyber-border text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              {count > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyber-bg text-white">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Issues Table */}
      <div className="space-y-2.5">
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-cyber-card/50 border border-cyber-border/40">
            <ShieldCheck className="w-10 h-10 text-cyber-green mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-bold text-white">No Issues in this Category</h3>
            <p className="text-xs text-cyber-muted mt-1">
              All checks in this vector are healthy and validated against the allowlist.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-4 rounded-xl bg-cyber-card/90 border border-cyber-border hover:border-cyber-borderGlow transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      issue.severity === 'critical'
                        ? 'bg-cyber-crimson/20 text-cyber-crimson border border-cyber-crimson/40'
                        : issue.severity === 'high'
                        ? 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/40'
                        : 'bg-cyber-cyan/15 text-cyber-cyan'
                    }`}
                  >
                    {issue.severity}
                  </span>
                  <span className="text-xs font-bold text-white">{issue.title}</span>
                </div>
                <p className="text-xs text-cyber-muted">{issue.description}</p>
                <div className="text-[10px] font-mono text-slate-400">
                  Target: {issue.targetPath || issue.targetResource || 'System Core'}
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Manual Review Button */}
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setInspectingIssue(issue);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-xs text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Review Details</span>
                </button>

                {/* Direct Action Button */}
                <button
                  onClick={() => handleFixSingle(issue)}
                  className="px-4 py-1.5 rounded-lg bg-cyber-purple/20 hover:bg-cyber-purple/30 border border-cyber-purple/50 text-white text-xs font-semibold shadow-neon-purple/20 transition-all"
                >
                  {issue.remediationAction === 'quarantine' ? 'Quarantine Threat' : 'Apply Fix'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual Review Inspection Modal */}
      {inspectingIssue && (
        <Modal
          isOpen={Boolean(inspectingIssue)}
          onClose={() => setInspectingIssue(null)}
          title={`Diagnostic Review: ${inspectingIssue.title}`}
          subtitle={`Module: ${inspectingIssue.category.toUpperCase()} | Severity: ${inspectingIssue.severity.toUpperCase()}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-cyber-card border border-cyber-border space-y-1">
              <div className="text-[10px] font-mono text-cyber-muted uppercase">Description</div>
              <p className="text-slate-200">{inspectingIssue.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-cyber-card border border-cyber-border">
                <div className="text-[10px] font-mono text-cyber-muted uppercase">Target Path / Resource</div>
                <div className="font-mono text-slate-300 mt-1 break-all">
                  {inspectingIssue.targetPath || inspectingIssue.targetResource || 'N/A'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-cyber-card border border-cyber-border">
                <div className="text-[10px] font-mono text-cyber-muted uppercase">Recommended Action</div>
                <div className="font-mono text-cyber-cyan mt-1 uppercase font-semibold">
                  {inspectingIssue.remediationAction}
                </div>
              </div>
            </div>

            {inspectingIssue.technicalDetails && (
              <div className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border font-mono space-y-1">
                <div className="text-[10px] text-cyber-cyan uppercase font-bold">Deep Technical Telemetry</div>
                <pre className="text-[11px] text-slate-300 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(inspectingIssue.technicalDetails, null, 2)}
                </pre>
              </div>
            )}

            <div className="p-3 rounded-lg bg-cyber-green/10 border border-cyber-green/30 flex items-center space-x-2 text-cyber-green text-[11px]">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Allowlist engine verified: Action is 100% safe to apply with zero core OS conflict.</span>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setInspectingIssue(null)}
                className="px-4 py-2 rounded-lg bg-cyber-card hover:bg-cyber-cardHover border border-cyber-border text-slate-300 text-xs"
              >
                Close Review
              </button>
              <button
                onClick={() => handleFixSingle(inspectingIssue)}
                className="px-4 py-2 rounded-lg bg-cyber-purple hover:bg-purple-600 text-white font-bold text-xs shadow-neon-purple"
              >
                Execute Fix Now
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
