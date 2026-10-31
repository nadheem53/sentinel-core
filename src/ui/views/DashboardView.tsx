import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ScanLine,
  Wrench,
  Activity,
  Lock,
  ArrowRight,
  Zap,
  Radio,
  FileCheck,
  DatabaseZap,
  Bug,
  CheckCircle2,
} from 'lucide-react';
import { HealthGauge } from '../components/HealthGauge';
import { TelemetryCard } from '../components/TelemetryCard';
import type { DiagnosticIssue, SystemMetrics } from '../../core-engine/types';
import { realtimeWatcherService, type WatcherEvent } from '../../services/RealtimeWatcherService';
import { globalEventBus } from '../../core-engine/EventBus';
import { soundFx } from '../../services/SoundFxService';
import type { NavView } from '../components/Sidebar';

interface DashboardViewProps {
  metrics: SystemMetrics;
  issues: DiagnosticIssue[];
  onNavigate: (view: NavView) => void;
  onTriggerQuickScan: () => void;
  onTriggerAutoFix: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  issues,
  onNavigate,
  onTriggerQuickScan,
  onTriggerAutoFix,
}) => {
  const [watcherEvents, setWatcherEvents] = useState<WatcherEvent[]>(
    realtimeWatcherService.getRecentEvents().slice(0, 5)
  );

  useEffect(() => {
    const unsub = globalEventBus.on('watcher_event', () => {
      setWatcherEvents(realtimeWatcherService.getRecentEvents().slice(0, 5));
    });
    return () => unsub();
  }, []);

  const activeIssues = issues.filter((i) => !i.isFixed);
  const criticalCount = activeIssues.filter((i) => i.severity === 'critical').length;
  const highCount = activeIssues.filter((i) => i.severity === 'high').length;

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] pb-12">
      {/* Hero Mission Control Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Overall Health Score Card */}
        <div className="p-6 rounded-2xl bg-cyber-card/90 border border-cyber-borderGlow flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyber-cyan via-cyber-purple to-cyber-green" />
          <div className="space-y-2 max-w-[55%]">
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-[10px] font-mono text-cyber-cyan">
              <Activity className="w-3 h-3" />
              <span>CORE HEALTH INDEX</span>
            </div>
            <h2 className="text-xl font-bold font-display tracking-tight text-white">
              {metrics.healthScore >= 80 ? 'System Guarded & Optimized' : 'Attention Required'}
            </h2>
            <p className="text-xs text-cyber-muted leading-relaxed">
              {activeIssues.length === 0
                ? 'All diagnostic probes report 100% nominal. Zero malware traces or system anomalies found.'
                : `${activeIssues.length} issues detected across modules (${criticalCount} critical, ${highCount} high).`}
            </p>
          </div>

          <div className="flex-shrink-0">
            <HealthGauge score={metrics.healthScore} size={130} />
          </div>
        </div>

        {/* Center: Quick Action Launchpad */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyber-card to-cyber-surface border border-cyber-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Quick Defense Actions
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-cyan"></span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                soundFx.playClick();
                onTriggerQuickScan();
                onNavigate('scan');
              }}
              className="p-3 rounded-xl bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/40 hover:border-cyber-cyan text-left transition-all duration-200 group"
            >
              <ScanLine className="w-5 h-5 text-cyber-cyan mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Quick Scan</div>
              <div className="text-[10px] text-cyber-muted mt-0.5">Scans memory & threats</div>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onTriggerAutoFix();
                onNavigate('autofix');
              }}
              className="p-3 rounded-xl bg-cyber-purple/10 hover:bg-cyber-purple/20 border border-cyber-purple/40 hover:border-cyber-purple text-left transition-all duration-200 group"
            >
              <Wrench className="w-5 h-5 text-cyber-purple mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">1-Click Auto-Fix</div>
              <div className="text-[10px] text-cyber-muted mt-0.5">Fixes safe issues</div>
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-cyber-border/60 text-[11px] font-mono text-cyber-muted">
            <span>Last Scan: 14 mins ago</span>
            <button
              onClick={() => onNavigate('scan')}
              className="text-cyber-cyan hover:underline flex items-center space-x-1"
            >
              <span>Scan Modes</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: Security & Threat Interception Summary */}
        <div className="p-6 rounded-2xl bg-cyber-card/90 border border-cyber-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Threat Defense Hub
              </span>
              <ShieldCheck className="w-4 h-4 text-cyber-green" />
            </div>

            <div className="grid grid-cols-2 gap-4 my-2">
              <div className="p-3 rounded-lg bg-cyber-bg border border-cyber-border">
                <div className="text-[10px] font-mono text-cyber-muted">ACTIVE THREATS</div>
                <div className="text-xl font-bold font-display text-cyber-crimson">
                  {criticalCount}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-cyber-bg border border-cyber-border">
                <div className="text-[10px] font-mono text-cyber-muted">INTERCEPTED TODAY</div>
                <div className="text-xl font-bold font-display text-cyber-green">
                  {realtimeWatcherService.getTotalBlocked()}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('quarantine')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-cyber-surface hover:bg-cyber-card border border-cyber-border text-xs text-white transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Lock className="w-3.5 h-3.5 text-cyber-amber" />
              <span>Quarantine Vault</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-cyber-muted" />
          </button>
        </div>
      </div>

      {/* Real-time Hardware Telemetry Meters */}
      <TelemetryCard metrics={metrics} />

      {/* Two Columns: Live Interception Feed & Modular Engine Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-Time Defense Event Stream */}
        <div className="p-5 rounded-2xl bg-cyber-card/70 border border-cyber-border/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white">
                Live Daemon Interception Feed
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyber-muted">Real-Time Event Stream</span>
          </div>

          <div className="space-y-2.5">
            {watcherEvents.length === 0 ? (
              <div className="p-6 text-center text-xs text-cyber-muted">
                Waiting for background telemetry events...
              </div>
            ) : (
              watcherEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded-lg bg-cyber-surface/90 border border-cyber-border/60 flex items-start justify-between text-xs space-x-3 hover:border-cyber-borderGlow transition-colors"
                >
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded uppercase ${
                          evt.severity === 'critical'
                            ? 'bg-cyber-crimson/20 text-cyber-crimson border border-cyber-crimson/40'
                            : evt.severity === 'warning'
                            ? 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/40'
                            : 'bg-cyber-cyan/15 text-cyber-cyan'
                        }`}
                      >
                        {evt.type.replace('_', ' ')}
                      </span>
                      <span className="font-mono text-slate-300 text-[11px] font-medium truncate max-w-[200px]">
                        {evt.source}
                      </span>
                    </div>
                    <p className="text-[11px] text-cyber-muted leading-tight">{evt.message}</p>
                  </div>

                  <span className="text-[10px] font-mono font-semibold text-cyber-green bg-cyber-green/10 px-2 py-0.5 rounded border border-cyber-green/20 flex-shrink-0">
                    {evt.actionTaken}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modular Diagnostics Probe Status */}
        <div className="p-5 rounded-2xl bg-cyber-card/70 border border-cyber-border/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white">
                Modular Diagnostics Matrix
              </h3>
              <span className="text-[10px] font-mono text-cyber-cyan">7 Active Engines</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { name: 'Malware & Heuristic Engine', icon: ShieldAlert, count: issues.filter(i => !i.isFixed && i.category === 'malware').length, color: 'text-cyber-crimson' },
                { name: 'OS Integrity & File Checker', icon: FileCheck, count: issues.filter(i => !i.isFixed && i.category === 'system_integrity').length, color: 'text-cyber-cyan' },
                { name: 'Registry & Config Hygiene', icon: DatabaseZap, count: issues.filter(i => !i.isFixed && i.category === 'registry').length, color: 'text-cyber-purple' },
                { name: 'Memory & CPU Leak Analyzer', icon: Zap, count: issues.filter(i => !i.isFixed && i.category === 'performance').length, color: 'text-cyber-green' },
                { name: 'Network Sockets & DNS Probe', icon: Radio, count: issues.filter(i => !i.isFixed && i.category === 'network').length, color: 'text-cyber-cyan' },
                { name: 'Crash Dump & Minidump Parser', icon: Bug, count: issues.filter(i => !i.isFixed && i.category === 'crash_dump').length, color: 'text-cyber-amber' },
              ].map((mod, idx) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => onNavigate('scan')}
                    className="p-3 rounded-lg bg-cyber-surface/90 border border-cyber-border/60 hover:border-cyber-cyan/40 cursor-pointer transition-all duration-150 flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${mod.color}`} />
                      <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate max-w-[130px]">
                        {mod.name}
                      </span>
                    </div>

                    {mod.count > 0 ? (
                      <span className="text-[10px] font-mono font-bold text-cyber-crimson px-1.5 py-0.2 rounded bg-cyber-crimson/15 border border-cyber-crimson/30">
                        {mod.count}
                      </span>
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyber-green" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-cyber-border/60 flex items-center justify-between text-xs">
            <span className="text-cyber-muted text-[11px]">Zero-False-Positive Allowlist active</span>
            <button
              onClick={() => onNavigate('settings')}
              className="text-cyber-cyan hover:underline text-[11px] font-medium"
            >
              Configure Engines
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
