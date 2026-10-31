import React, { useState, useEffect } from 'react';
import {
  Zap,
  Activity,
  Trash2,
  Rocket,
  CheckCircle2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { nativeBridge } from '../../native/NativeBridge';
import type { MockJunkCategory, MockProcess, MockStartupItem } from '../../native/mockData';
import { soundFx } from '../../services/SoundFxService';

export const PerformanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'processes' | 'junk' | 'startup'>('processes');
  const [processes, setProcesses] = useState<MockProcess[]>([]);
  const [startupItems, setStartupItems] = useState<MockStartupItem[]>([]);
  const [junkCategories, setJunkCategories] = useState<MockJunkCategory[]>([]);
  const [processSearch, setProcessSearch] = useState('');
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanedStats, setCleanedStats] = useState<{ reclaimedBytes: number; itemsCleaned: number } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const procs = await nativeBridge.getProcesses();
    const startups = await nativeBridge.getStartupItems();
    const junks = await nativeBridge.getJunkCategories();
    setProcesses(procs);
    setStartupItems(startups);
    setJunkCategories(junks);
  };

  const handleKillProcess = async (pid: number) => {
    soundFx.playClick();
    await nativeBridge.terminateProcess(pid);
    soundFx.playSuccessChime();
    loadData();
  };

  const handleToggleStartup = async (id: string, currentEnabled: boolean) => {
    soundFx.playClick();
    await nativeBridge.toggleStartupItem(id, !currentEnabled);
    loadData();
  };

  const toggleJunkSelection = (id: string) => {
    soundFx.playClick();
    setJunkCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleCleanJunk = async () => {
    soundFx.playClick();
    setIsCleaning(true);
    const selectedIds = junkCategories.filter((c) => c.selected).map((c) => c.id);

    await new Promise((r) => setTimeout(r, 1200));
    const result = await nativeBridge.cleanJunk(selectedIds);
    setIsCleaning(false);
    setCleanedStats(result);
    soundFx.playSuccessChime();
    loadData();
  };

  const totalJunkBytes = junkCategories
    .filter((c) => c.selected)
    .reduce((acc, curr) => acc + curr.sizeBytes, 0);

  const filteredProcesses = processes.filter(
    (p) =>
      p.name.toLowerCase().includes(processSearch.toLowerCase()) ||
      p.pid.toString().includes(processSearch)
  );

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display tracking-wide text-white flex items-center space-x-2">
            <Zap className="w-5 h-5 text-cyber-green" />
            <span>PERFORMANCE & CLEANUP ENGINE</span>
          </h2>
          <p className="text-xs text-cyber-muted mt-1">
            Real-time memory leak terminator, junk disk reclamation, and startup latency optimizer.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-cyber-card border border-cyber-border space-x-1">
          {[
            { id: 'processes', label: 'Process Manager', icon: Activity },
            { id: 'junk', label: 'Junk & Disk Cleaner', icon: Trash2 },
            { id: 'startup', label: 'Startup Optimizer', icon: Rocket },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/40 shadow-neon-green/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Process Manager */}
      {activeTab === 'processes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-cyber-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search processes by name or PID..."
                value={processSearch}
                onChange={(e) => setProcessSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-cyber-card border border-cyber-border text-xs text-white placeholder-cyber-muted outline-none focus:border-cyber-green transition-colors"
              />
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                loadData();
              }}
              className="p-2 rounded-lg bg-cyber-card hover:bg-cyber-cardHover border border-cyber-border text-slate-300"
              title="Refresh Process List"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-cyber-card/80 border border-cyber-border space-y-2 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-[10px] text-cyber-muted uppercase border-b border-cyber-border/80">
                  <th className="pb-2">Process Name</th>
                  <th className="pb-2">PID</th>
                  <th className="pb-2">User Context</th>
                  <th className="pb-2">CPU %</th>
                  <th className="pb-2">RAM Footprint</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/40">
                {filteredProcesses.map((proc) => (
                  <tr key={proc.pid} className="hover:bg-cyber-surface/60 transition-colors">
                    <td className="py-2.5 font-sans font-medium text-white flex items-center space-x-2">
                      <span>{proc.name}</span>
                    </td>
                    <td className="py-2.5 text-slate-400">{proc.pid}</td>
                    <td className="py-2.5 text-slate-400">{proc.user}</td>
                    <td className="py-2.5">
                      <span className={proc.cpuPercent > 50 ? 'text-cyber-crimson font-bold' : 'text-slate-300'}>
                        {proc.cpuPercent}%
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={proc.memoryMB > 1500 ? 'text-cyber-amber font-bold' : 'text-slate-300'}>
                        {proc.memoryMB} MB
                      </span>
                    </td>
                    <td className="py-2.5">
                      {proc.status === 'leaking' ? (
                        <span className="px-2 py-0.5 rounded bg-cyber-crimson/20 text-cyber-crimson border border-cyber-crimson/40 text-[10px] uppercase font-bold animate-pulse">
                          Memory Leak
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-cyber-green/10 text-cyber-green text-[10px] uppercase">
                          Nominal
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      {proc.pid > 10 && (
                        <button
                          onClick={() => handleKillProcess(proc.pid)}
                          className="px-2.5 py-1 rounded bg-cyber-crimson/15 hover:bg-cyber-crimson/25 border border-cyber-crimson/40 text-cyber-crimson text-[11px] font-semibold transition-all"
                        >
                          Terminate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Junk Cleaner */}
      {activeTab === 'junk' && (
        <div className="space-y-6">
          {/* Cleaning Hero Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-cyber-green/15 via-cyber-card to-cyber-surface border border-cyber-green/40 shadow-neon-green/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase text-cyber-green tracking-wider font-semibold">
                STORAGE RECLAMATION CALCULATOR
              </div>
              <h3 className="text-2xl font-bold font-display text-white">
                {(totalJunkBytes / 1073741824).toFixed(2)} GB Selected for Safe Purge
              </h3>
              <p className="text-xs text-cyber-muted">
                Zero impact on personal files. All clean operations target temporary scratch caches and build artifacts.
              </p>
            </div>

            <button
              disabled={totalJunkBytes === 0 || isCleaning}
              onClick={handleCleanJunk}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyber-green to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-bold text-xs shadow-neon-green/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isCleaning ? 'PURGING DISK JUNK...' : 'PURGE SELECTED JUNK'}</span>
            </button>
          </div>

          {cleanedStats && (
            <div className="p-3.5 rounded-xl bg-cyber-green/10 border border-cyber-green/40 flex items-center space-x-3 text-xs text-cyber-green">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>
                Successfully reclaimed {(cleanedStats.reclaimedBytes / 1073741824).toFixed(2)} GB across {cleanedStats.itemsCleaned} discarded files!
              </span>
            </div>
          )}

          {/* Junk Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {junkCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => toggleJunkSelection(cat.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start space-x-3.5 ${
                  cat.selected
                    ? 'bg-cyber-card border-cyber-green/50 text-white'
                    : 'bg-cyber-surface/60 border-cyber-border text-slate-400 opacity-60'
                }`}
              >
                <input
                  type="checkbox"
                  checked={cat.selected}
                  onChange={() => {}}
                  className="mt-1 accent-cyber-green rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{cat.name}</span>
                    <span className="text-xs font-mono font-bold text-cyber-green">
                      {(cat.sizeBytes / 1048576).toFixed(0)} MB
                    </span>
                  </div>
                  <p className="text-[11px] text-cyber-muted mt-0.5">{cat.description}</p>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    {cat.itemCount} pending items
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Startup Optimizer */}
      {activeTab === 'startup' && (
        <div className="p-5 rounded-2xl bg-cyber-card/80 border border-cyber-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white">
              Startup Applications & Boot Delay Impact
            </h3>
            <span className="text-[10px] font-mono text-cyber-muted">
              {startupItems.filter((i) => i.enabled).length} of {startupItems.length} Enabled
            </span>
          </div>

          <div className="space-y-2.5">
            {startupItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-cyber-surface/90 border border-cyber-border/80 flex items-center justify-between space-x-4 hover:border-cyber-borderGlow transition-colors"
              >
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white truncate">{item.name}</span>
                    <span
                      className={`text-[9px] font-mono font-semibold px-2 py-0.2 rounded uppercase ${
                        item.impact === 'High'
                          ? 'bg-cyber-crimson/20 text-cyber-crimson border border-cyber-crimson/40'
                          : item.impact === 'Medium'
                          ? 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/40'
                          : 'bg-cyber-green/15 text-cyber-green'
                      }`}
                    >
                      {item.impact} Impact
                    </span>
                  </div>
                  <div className="text-[11px] text-cyber-muted">{item.publisher}</div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">{item.path}</div>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span className="text-[11px] font-mono text-slate-400">{item.status}</span>
                  <button
                    onClick={() => handleToggleStartup(item.id, item.enabled)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      item.enabled
                        ? 'bg-cyber-green/15 text-cyber-green border-cyber-green/40'
                        : 'bg-cyber-surface text-slate-500 border-cyber-border'
                    }`}
                  >
                    {item.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
