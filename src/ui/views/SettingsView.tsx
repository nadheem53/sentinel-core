import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  RefreshCw,
  Clock,
  Plus,
  Trash2,
  Lock,
  Cloud,
  CheckCircle2,
} from 'lucide-react';
import { allowlistEngine } from '../../core-engine/AllowlistEngine';
import { threatDefinitionsManager } from '../../core-engine/ThreatDefinitions';
import { schedulerService, type ScheduledTask } from '../../services/SchedulerService';
import { soundFx } from '../../services/SoundFxService';
import type { AllowlistEntry } from '../../core-engine/types';
import { globalEventBus } from '../../core-engine/EventBus';
import { Modal } from '../components/Modal';

export const SettingsView: React.FC = () => {
  const [allowlist, setAllowlist] = useState<AllowlistEntry[]>(allowlistEngine.getAllEntries());
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>(schedulerService.getTasks());
  const [defVersion, setDefVersion] = useState(threatDefinitionsManager.getVersion());
  const [totalSigs, setTotalSigs] = useState(threatDefinitionsManager.getTotalSignatures());
  const [isUpdatingDefs, setIsUpdatingDefs] = useState(false);
  const [cloudIntel, setCloudIntel] = useState(threatDefinitionsManager.isCloudIntelligenceEnabled());

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEntryType, setNewEntryType] = useState<'path' | 'hash' | 'process_name'>('path');
  const [newEntryPattern, setNewEntryPattern] = useState('');
  const [newEntryDesc, setNewEntryDesc] = useState('');

  useEffect(() => {
    const unsubAllow = globalEventBus.on('allowlist_updated', (entries: AllowlistEntry[]) => {
      setAllowlist(entries);
    });

    const unsubDefs = globalEventBus.on('definitions_updated', ({ newVersion, count }) => {
      setDefVersion(newVersion);
      setTotalSigs(count);
    });

    const unsubSched = globalEventBus.on('scheduler_updated', (tasks: ScheduledTask[]) => {
      setScheduledTasks(tasks);
    });

    return () => {
      unsubAllow();
      unsubDefs();
      unsubSched();
    };
  }, []);

  const handleUpdateDefinitions = async () => {
    soundFx.playClick();
    setIsUpdatingDefs(true);
    await threatDefinitionsManager.checkForUpdates();
    setIsUpdatingDefs(false);
    soundFx.playSuccessChime();
  };

  const handleToggleCloudIntel = () => {
    soundFx.playClick();
    const nextVal = !cloudIntel;
    setCloudIntel(nextVal);
    threatDefinitionsManager.setCloudIntelligence(nextVal);
  };

  const handleToggleTask = (id: string) => {
    soundFx.playClick();
    schedulerService.toggleTask(id);
  };

  const handleAddAllowlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryPattern.trim()) return;

    soundFx.playClick();
    allowlistEngine.addCustomEntry(newEntryType, newEntryPattern.trim(), newEntryDesc.trim() || 'Custom Allowlist Rule');
    setIsAddModalOpen(false);
    setNewEntryPattern('');
    setNewEntryDesc('');
    soundFx.playSuccessChime();
  };

  const handleRemoveAllowlist = (id: string) => {
    soundFx.playClick();
    allowlistEngine.removeEntry(id);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display tracking-wide text-white flex items-center space-x-2">
          <Settings className="w-5 h-5 text-cyber-cyan" />
          <span>SYSTEM CONFIGURATION & SCHEDULES</span>
        </h2>
        <p className="text-xs text-cyber-muted mt-1">
          Threat signature sync feeds, zero-false-positive allowlists, and scheduled background sweeps.
        </p>
      </div>

      {/* Row 1: Threat Definitions & Cloud Intel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Threat Definitions Sync Card */}
        <div className="p-5 rounded-2xl bg-cyber-card/90 border border-cyber-border space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Threat Intelligence Database
              </span>
              <span className="text-[10px] font-mono text-cyber-green px-2 py-0.5 rounded bg-cyber-green/15">
                Up to Date
              </span>
            </div>

            <div className="mt-3 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-cyber-muted">Signature Version:</span>
                <span className="text-white font-bold">{defVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-muted">Total Signatures:</span>
                <span className="text-cyber-cyan font-bold">{totalSigs.toLocaleString()} Rules</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-muted">Heuristic Engine:</span>
                <span className="text-slate-300">Active (Entropy + PE Inspector)</span>
              </div>
            </div>
          </div>

          <button
            disabled={isUpdatingDefs}
            onClick={handleUpdateDefinitions}
            className="w-full py-2.5 rounded-xl bg-cyber-cyan/15 hover:bg-cyber-cyan/25 border border-cyber-cyan/40 text-cyber-cyan text-xs font-bold transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isUpdatingDefs ? 'animate-spin' : ''}`} />
            <span>{isUpdatingDefs ? 'UPDATING SIGNATURES...' : 'CHECK FOR UPDATES NOW'}</span>
          </button>
        </div>

        {/* Cloud Intelligence & Privacy Toggle */}
        <div className="p-5 rounded-2xl bg-cyber-card/90 border border-cyber-border space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Privacy & Telemetry Mode
              </span>
              <Cloud className="w-4 h-4 text-cyber-cyan" />
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-cyber-surface/90 border border-cyber-border/70 flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Local-First Threat Scanning</div>
                  <div className="text-[11px] text-cyber-muted">
                    100% of hashing & heuristic checks run on your physical device.
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-cyber-green flex-shrink-0" />
              </div>

              <div className="p-3 rounded-lg bg-cyber-surface/90 border border-cyber-border/70 flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Cloud Threat Intel Lookup (Opt-in)</div>
                  <div className="text-[11px] text-cyber-muted">
                    Queries anonymized SHA256 hashes against global threat feeds.
                  </div>
                </div>
                <button
                  onClick={handleToggleCloudIntel}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    cloudIntel
                      ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/40'
                      : 'bg-cyber-card text-slate-500 border-cyber-border'
                  }`}
                >
                  {cloudIntel ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-cyber-muted">
            Zero telemetry logs leave your machine without explicit consent.
          </div>
        </div>
      </div>

      {/* Row 2: Scheduled Background Scans */}
      <div className="p-5 rounded-2xl bg-cyber-card/80 border border-cyber-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyber-cyan" />
            <span>Automated Background Scan Schedules</span>
          </h3>
          <span className="text-[10px] font-mono text-cyber-muted">Cron Daemon Active</span>
        </div>

        <div className="space-y-2.5">
          {scheduledTasks.map((task) => (
            <div
              key={task.id}
              className="p-3.5 rounded-xl bg-cyber-surface/90 border border-cyber-border/80 flex items-center justify-between space-x-4 hover:border-cyber-borderGlow transition-colors"
            >
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white truncate">{task.name}</span>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.2 rounded bg-cyber-cyan/15 text-cyber-cyan">
                    {task.frequency}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Scheduled Time: {task.time}
                </div>
              </div>

              <div className="flex items-center space-x-3 flex-shrink-0">
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    task.enabled
                      ? 'bg-cyber-green/15 text-cyber-green border-cyber-green/40'
                      : 'bg-cyber-surface text-slate-500 border-cyber-border'
                  }`}
                >
                  {task.enabled ? 'Active' : 'Paused'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Zero-False-Positive Allowlist Engine */}
      <div className="p-5 rounded-2xl bg-cyber-card/80 border border-cyber-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyber-green" />
              <span>Zero-False-Positive Allowlist & Safe Exclusions</span>
            </h3>
            <p className="text-[11px] text-cyber-muted mt-0.5">
              Core system files, signed Windows/macOS/Linux binaries, and custom user exclusion rules.
            </p>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setIsAddModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-cyber-cyan/15 hover:bg-cyber-cyan/25 border border-cyber-cyan/40 text-cyber-cyan text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Rule</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-[10px] text-cyber-muted uppercase border-b border-cyber-border/80">
                <th className="pb-2">Rule Type</th>
                <th className="pb-2">Pattern / Path / Hash</th>
                <th className="pb-2">Description</th>
                <th className="pb-2">Protection Class</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {allowlist.map((entry) => (
                <tr key={entry.id} className="hover:bg-cyber-surface/60 transition-colors">
                  <td className="py-2.5">
                    <span className="text-[10px] uppercase font-bold text-cyber-cyan px-2 py-0.5 rounded bg-cyber-cyan/10">
                      {entry.type}
                    </span>
                  </td>
                  <td className="py-2.5 text-white font-semibold max-w-xs truncate">{entry.pattern}</td>
                  <td className="py-2.5 text-slate-400">{entry.description}</td>
                  <td className="py-2.5">
                    {entry.isSystemDefault ? (
                      <span className="text-[10px] uppercase font-mono text-cyber-green flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>Core OS Lock</span>
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-mono text-slate-400">
                        User Custom
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-right">
                    {!entry.isSystemDefault ? (
                      <button
                        onClick={() => handleRemoveAllowlist(entry.id)}
                        className="p-1 rounded text-cyber-crimson hover:bg-cyber-crimson/20 transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-cyber-muted font-mono">Immutable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Allowlist Rule Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Custom Allowlist Exclusion Rule"
        >
          <form onSubmit={handleAddAllowlist} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-cyber-muted font-mono uppercase text-[10px]">Rule Type</label>
              <select
                value={newEntryType}
                onChange={(e) => setNewEntryType(e.target.value as any)}
                className="w-full p-2 rounded-lg bg-cyber-card border border-cyber-border text-white text-xs outline-none focus:border-cyber-cyan"
              >
                <option value="path">File / Directory Path</option>
                <option value="hash">SHA256 File Hash</option>
                <option value="process_name">Process Binary Name</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-cyber-muted font-mono uppercase text-[10px]">
                Pattern / Exact Match
              </label>
              <input
                type="text"
                placeholder={
                  newEntryType === 'path'
                    ? 'C:\\MyCompany\\InternalTool.exe'
                    : newEntryType === 'hash'
                    ? 'SHA-256 Hash string...'
                    : 'custom_daemon.exe'
                }
                value={newEntryPattern}
                onChange={(e) => setNewEntryPattern(e.target.value)}
                required
                className="w-full p-2 rounded-lg bg-cyber-card border border-cyber-border text-white text-xs outline-none focus:border-cyber-cyan"
              />
            </div>

            <div className="space-y-1">
              <label className="text-cyber-muted font-mono uppercase text-[10px]">
                Description / Purpose
              </label>
              <input
                type="text"
                placeholder="e.g. Proprietary company internal build tool"
                value={newEntryDesc}
                onChange={(e) => setNewEntryDesc(e.target.value)}
                className="w-full p-2 rounded-lg bg-cyber-card border border-cyber-border text-white text-xs outline-none focus:border-cyber-cyan"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-cyber-card hover:bg-cyber-cardHover border border-cyber-border text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyber-cyan hover:bg-cyan-400 text-black font-bold text-xs"
              >
                Save Exclusion Rule
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
