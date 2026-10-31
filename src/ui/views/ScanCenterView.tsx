import React, { useState, useEffect } from 'react';
import {
  ScanLine,
  Play,
  Pause,
  Square,
  ShieldCheck,
  Layers,
  Wrench,
} from 'lucide-react';
import { RadarSweep } from '../components/RadarSweep';
import type { DiagnosticIssue, ScanMode, ScanProgressEvent, ScanState } from '../../core-engine/types';
import { scanOrchestrator } from '../../core-engine/ScanOrchestrator';
import { pluginRegistry } from '../../core-engine/PluginRegistry';
import { globalEventBus } from '../../core-engine/EventBus';
import { soundFx } from '../../services/SoundFxService';

interface ScanCenterViewProps {
  issues: DiagnosticIssue[];
  onFixSingle: (issue: DiagnosticIssue) => void;
  onNavigateToAutoFix: () => void;
}

export const ScanCenterView: React.FC<ScanCenterViewProps> = ({
  issues,
  onFixSingle,
  onNavigateToAutoFix,
}) => {
  const [selectedMode, setSelectedMode] = useState<ScanMode>('quick');
  const [scanState, setScanState] = useState<ScanState>(scanOrchestrator.getState());
  const [progress, setProgress] = useState<ScanProgressEvent>({
    scanId: '',
    mode: 'quick',
    state: 'idle',
    percent: 0,
    currentPhase: 'Ready to scan',
    currentPluginName: '',
    currentFilePath: '',
    scannedFilesCount: 0,
    scannedProcessesCount: 0,
    detectedIssuesCount: 0,
    elapsedSeconds: 0,
  });

  const [selectedPlugins, setSelectedPlugins] = useState<string[]>(
    pluginRegistry.getAllPlugins().map((p) => p.id)
  );

  useEffect(() => {
    const unsubProg = globalEventBus.on('scan_progress', (data: ScanProgressEvent) => {
      setProgress(data);
      setScanState('scanning');
      if (Math.random() < 0.25) soundFx.playRadarPing();
    });

    const unsubStart = globalEventBus.on('scan_started', () => {
      setScanState('scanning');
      soundFx.playRadarPing();
    });

    const unsubComp = globalEventBus.on('scan_completed', () => {
      setScanState('completed');
      soundFx.playSuccessChime();
    });

    const unsubCancel = globalEventBus.on('scan_cancelled', () => {
      setScanState('cancelled');
    });

    return () => {
      unsubProg();
      unsubStart();
      unsubComp();
      unsubCancel();
    };
  }, []);

  const handleStartScan = async () => {
    soundFx.playClick();
    try {
      await scanOrchestrator.startScan(
        selectedMode,
        selectedMode === 'custom' ? selectedPlugins : undefined
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handlePauseResume = () => {
    soundFx.playClick();
    if (scanState === 'scanning') {
      scanOrchestrator.pauseScan();
      setScanState('paused');
    } else if (scanState === 'paused') {
      scanOrchestrator.resumeScan();
      setScanState('scanning');
    }
  };

  const handleAbort = () => {
    soundFx.playClick();
    scanOrchestrator.cancelScan();
    setScanState('cancelled');
  };

  const togglePlugin = (pluginId: string) => {
    soundFx.playClick();
    if (selectedPlugins.includes(pluginId)) {
      setSelectedPlugins(selectedPlugins.filter((id) => id !== pluginId));
    } else {
      setSelectedPlugins([...selectedPlugins, pluginId]);
    }
  };

  const isScanning = scanState === 'scanning';
  const allPlugins = pluginRegistry.getAllPlugins();
  const activeDetectedIssues = issues.filter((i) => !i.isFixed);

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] pb-12">
      {/* Top Header & Scan Mode Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display tracking-wide text-white flex items-center space-x-2">
            <ScanLine className="w-5 h-5 text-cyber-cyan" />
            <span>CORE DIAGNOSTIC SCANNER</span>
          </h2>
          <p className="text-xs text-cyber-muted mt-1">
            Modular multi-vector scanner with real-time heuristic analysis and zero false-positive OS allowlist.
          </p>
        </div>

        {/* Scan Mode Pills */}
        <div className="flex items-center p-1 rounded-xl bg-cyber-card border border-cyber-border space-x-1">
          {[
            { id: 'quick', label: 'Quick Scan', desc: 'Active memory & critical hooks (2 mins)' },
            { id: 'deep', label: 'Deep Scan', desc: 'Full storage, registry & telemetry audit' },
            { id: 'custom', label: 'Custom Scan', desc: 'Selective modular checks' },
          ].map((mode) => (
            <button
              key={mode.id}
              disabled={isScanning}
              onClick={() => {
                soundFx.playClick();
                setSelectedMode(mode.id as ScanMode);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedMode === mode.id
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 shadow-neon-cyan/20'
                  : 'text-slate-400 hover:text-white disabled:opacity-50'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Scanner Visualizer Card */}
      <div className="p-6 rounded-2xl bg-cyber-card/90 border border-cyber-borderGlow relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Radar Visualizer */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-cyber-surface/70 border border-cyber-border/70">
            <RadarSweep
              isScanning={isScanning}
              detectedCount={progress.detectedIssuesCount}
              threatDetected={activeDetectedIssues.some((i) => i.category === 'malware')}
            />
          </div>

          {/* Right: Scan Controls, Progress & Ticker */}
          <div className="lg:col-span-7 space-y-4">
            {/* Phase & Percentage */}
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyber-cyan">
                  {scanState === 'scanning' ? 'CURRENT SCAN STAGE' : 'STATUS'}
                </span>
                <h3 className="text-lg font-bold font-display text-white truncate max-w-md">
                  {isScanning
                    ? progress.currentPhase
                    : scanState === 'completed'
                    ? 'Scan Complete: System Audit Finished'
                    : scanState === 'paused'
                    ? 'Scan Paused'
                    : scanState === 'cancelled'
                    ? 'Scan Aborted'
                    : 'Ready to Run'}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-3xl font-display font-bold text-cyber-cyan">
                  {progress.percent}%
                </span>
              </div>
            </div>

            {/* Glowing Cyber Progress Bar */}
            <div className="w-full bg-cyber-bg rounded-full h-3 p-0.5 border border-cyber-border/80 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-green transition-all duration-300 shadow-neon-cyan/50"
                style={{ width: `${Math.max(2, progress.percent)}%` }}
              />
            </div>

            {/* Live File/Process Ticker */}
            <div className="p-3 rounded-lg bg-cyber-surface/90 border border-cyber-border/80 font-mono text-[11px] text-slate-300 truncate flex items-center space-x-2">
              <span className="text-cyber-muted text-[10px]">SCANNING:</span>
              <span className="text-cyber-cyan truncate">
                {progress.currentFilePath || 'Standby for diagnostic stream...'}
              </span>
            </div>

            {/* Live Metrics Counts */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-cyber-border/60">
              <div className="text-center p-2 rounded-lg bg-cyber-surface/50 border border-cyber-border/40">
                <div className="text-[9px] font-mono text-cyber-muted">FILES SCANNED</div>
                <div className="text-sm font-bold font-mono text-white">
                  {progress.scannedFilesCount}
                </div>
              </div>
              <div className="text-center p-2 rounded-lg bg-cyber-surface/50 border border-cyber-border/40">
                <div className="text-[9px] font-mono text-cyber-muted">PROCESSES PROBED</div>
                <div className="text-sm font-bold font-mono text-white">
                  {progress.scannedProcessesCount}
                </div>
              </div>
              <div className="text-center p-2 rounded-lg bg-cyber-surface/50 border border-cyber-border/40">
                <div className="text-[9px] font-mono text-cyber-muted">ISSUES FLAGGED</div>
                <div className="text-sm font-bold font-mono text-cyber-crimson">
                  {progress.detectedIssuesCount}
                </div>
              </div>
              <div className="text-center p-2 rounded-lg bg-cyber-surface/50 border border-cyber-border/40">
                <div className="text-[9px] font-mono text-cyber-muted">ELAPSED TIME</div>
                <div className="text-sm font-bold font-mono text-white">
                  {progress.elapsedSeconds}s
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              {!isScanning && scanState !== 'paused' ? (
                <button
                  onClick={handleStartScan}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-neon-cyan transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>START {selectedMode.toUpperCase()} SCAN</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePauseResume}
                    className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-cyber-card hover:bg-cyber-cardHover border border-cyber-border text-white text-xs font-semibold transition-all"
                  >
                    {scanState === 'paused' ? (
                      <>
                        <Play className="w-4 h-4 text-cyber-cyan" />
                        <span>Resume Scan</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4 text-cyber-amber" />
                        <span>Pause Scan</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleAbort}
                    className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-cyber-crimson/15 hover:bg-cyber-crimson/25 border border-cyber-crimson/40 text-cyber-crimson text-xs font-semibold transition-all"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Cancel Scan</span>
                  </button>
                </>
              )}

              {activeDetectedIssues.length > 0 && (
                <button
                  onClick={onNavigateToAutoFix}
                  className="flex items-center space-x-2 py-2.5 px-4 rounded-xl bg-cyber-purple/20 hover:bg-cyber-purple/30 border border-cyber-purple/50 text-white text-xs font-semibold shadow-neon-purple/20 transition-all"
                >
                  <Wrench className="w-4 h-4 text-cyber-purple" />
                  <span>Review {activeDetectedIssues.length} Issues</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scan Module Selectors (If Custom mode selected) */}
      {selectedMode === 'custom' && (
        <div className="p-5 rounded-2xl bg-cyber-card/70 border border-cyber-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyber-cyan" />
              <span>Select Plug-in Detection Modules</span>
            </h3>
            <span className="text-[10px] font-mono text-cyber-muted">
              {selectedPlugins.length} of {allPlugins.length} enabled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allPlugins.map((plugin) => {
              const isChecked = selectedPlugins.includes(plugin.id);
              return (
                <div
                  key={plugin.id}
                  onClick={() => togglePlugin(plugin.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                    isChecked
                      ? 'bg-cyber-cyan/10 border-cyber-cyan/40 text-white'
                      : 'bg-cyber-surface/60 border-cyber-border text-slate-400 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-1 accent-cyber-cyan rounded"
                  />
                  <div>
                    <div className="text-xs font-semibold">{plugin.name}</div>
                    <div className="text-[10px] text-cyber-muted mt-0.5 leading-snug">
                      {plugin.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detected Issues Stream / Table */}
      <div className="p-5 rounded-2xl bg-cyber-card/70 border border-cyber-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white">
            Detected Issues & Threat Interceptions ({activeDetectedIssues.length})
          </h3>
          <span className="text-[10px] font-mono text-cyber-muted">Safe-list Verified</span>
        </div>

        {activeDetectedIssues.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-cyber-surface/50 border border-cyber-border/40">
            <ShieldCheck className="w-8 h-8 text-cyber-green mx-auto mb-2 opacity-80" />
            <div className="text-xs font-semibold text-white">Zero Active Threats Found</div>
            <p className="text-[11px] text-cyber-muted mt-0.5">
              Your system file integrity, processes, and network sockets are clean.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeDetectedIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-3.5 rounded-xl bg-cyber-surface/90 border border-cyber-border/80 flex items-center justify-between space-x-4 hover:border-cyber-borderGlow transition-colors"
              >
                <div className="space-y-1 flex-1 min-w-0">
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
                    <span className="text-xs font-bold text-white truncate">{issue.title}</span>
                  </div>
                  <p className="text-[11px] text-cyber-muted truncate">{issue.description}</p>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    Target: {issue.targetPath || issue.targetResource || 'System Module'}
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onFixSingle(issue);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyber-cyan/15 hover:bg-cyber-cyan/25 border border-cyber-cyan/40 text-cyber-cyan text-xs font-semibold transition-all"
                  >
                    {issue.remediationAction === 'quarantine' ? 'Quarantine' : 'Auto-Fix'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
