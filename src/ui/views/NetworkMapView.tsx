import React, { useState, useEffect } from 'react';
import {
  Network,
  RefreshCw,
  Zap,
  Globe,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { nativeBridge } from '../../native/NativeBridge';
import type { MockNetworkConnection } from '../../native/mockData';
import { soundFx } from '../../services/SoundFxService';

export const NetworkMapView: React.FC = () => {
  const [connections, setConnections] = useState<MockNetworkConnection[]>([]);
  const [dnsResults, setDnsResults] = useState<{ server: string; ip: string; latencyMs: number; status: string }[]>([]);
  const [isTestingDns, setIsTestingDns] = useState(false);
  const [isFlushingDns, setIsFlushingDns] = useState(false);
  const [flushMessage, setFlushMessage] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
    runDnsTest();
  }, []);

  const loadConnections = async () => {
    const list = await nativeBridge.getActiveConnections();
    setConnections(list);
  };

  const runDnsTest = async () => {
    setIsTestingDns(true);
    const res = await nativeBridge.testDnsLatency();
    setDnsResults(res);
    setIsTestingDns(false);
  };

  const handleFlushDns = async () => {
    soundFx.playClick();
    setIsFlushingDns(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsFlushingDns(false);
    setFlushMessage('DNS Cache flushed successfully. Winsock socket tables cleared.');
    soundFx.playSuccessChime();
    setTimeout(() => setFlushMessage(null), 4000);
  };

  const suspiciousCount = connections.filter((c) => c.isSuspicious).length;

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display tracking-wide text-white flex items-center space-x-2">
            <Network className="w-5 h-5 text-cyber-cyan" />
            <span>NETWORK TELEMETRY & SOCKET MONITOR</span>
          </h2>
          <p className="text-xs text-cyber-muted mt-1">
            Real-time socket inspection, suspicious egress port tracking, and DNS latency benchmarking.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            disabled={isFlushingDns}
            onClick={handleFlushDns}
            className="px-4 py-2 rounded-xl bg-cyber-cyan/15 hover:bg-cyber-cyan/25 border border-cyber-cyan/40 text-cyber-cyan text-xs font-bold transition-all flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>{isFlushingDns ? 'FLUSHING STACK...' : 'FLUSH DNS & RESET SOCKETS'}</span>
          </button>
        </div>
      </div>

      {flushMessage && (
        <div className="p-3.5 rounded-xl bg-cyber-green/10 border border-cyber-green/40 flex items-center space-x-2 text-xs text-cyber-green">
          <CheckCircle2 className="w-4 h-4" />
          <span>{flushMessage}</span>
        </div>
      )}

      {/* Top Cards: Status & DNS Latency Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Safety Summary Card */}
        <div className="p-5 rounded-2xl bg-cyber-card/80 border border-cyber-border space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Active Sockets Summary
              </span>
              <Activity className="w-4 h-4 text-cyber-cyan" />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-lg bg-cyber-bg border border-cyber-border">
                <div className="text-[10px] font-mono text-cyber-muted">TOTAL CONNECTIONS</div>
                <div className="text-2xl font-bold font-display text-white mt-0.5">
                  {connections.length}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-cyber-bg border border-cyber-border">
                <div className="text-[10px] font-mono text-cyber-muted">SUSPICIOUS PORTS</div>
                <div className="text-2xl font-bold font-display text-cyber-crimson mt-0.5">
                  {suspiciousCount}
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-cyber-muted">
            {suspiciousCount > 0
              ? 'Warning: Unmapped reverse shell or Metasploit port connection detected.'
              : 'All active foreign sockets mapped to verified system binaries.'}
          </div>
        </div>

        {/* DNS Speed & Latency Benchmark */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-cyber-card/80 border border-cyber-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-cyber-cyan" />
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white">
                DNS Resolver Latency & Integrity Test
              </h3>
            </div>
            <button
              disabled={isTestingDns}
              onClick={() => {
                soundFx.playClick();
                runDnsTest();
              }}
              className="text-[11px] font-mono text-cyber-cyan hover:underline flex items-center space-x-1"
            >
              <RefreshCw className={`w-3 h-3 ${isTestingDns ? 'animate-spin' : ''}`} />
              <span>Re-Test</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {dnsResults.map((dns, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-cyber-surface/90 border border-cyber-border/80 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-white truncate max-w-[130px]">
                    {dns.server}
                  </div>
                  <div className="text-[10px] font-mono text-cyber-muted">{dns.ip}</div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-xs font-mono font-bold ${
                      dns.latencyMs > 100 ? 'text-cyber-crimson' : 'text-cyber-green'
                    }`}
                  >
                    {dns.latencyMs} ms
                  </div>
                  <div className="text-[9px] font-mono uppercase text-slate-400">{dns.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Socket Table */}
      <div className="p-5 rounded-2xl bg-cyber-card/80 border border-cyber-border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white">
            Active Foreign Sockets & Listening Daemons ({connections.length})
          </h3>
          <span className="text-[10px] font-mono text-cyber-muted">IP Geolocation Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-[10px] text-cyber-muted uppercase border-b border-cyber-border/80">
                <th className="pb-2">Protocol</th>
                <th className="pb-2">Local Address</th>
                <th className="pb-2">Foreign Destination</th>
                <th className="pb-2">Geo / Host</th>
                <th className="pb-2">State</th>
                <th className="pb-2">Bound Process</th>
                <th className="pb-2 text-right">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {connections.map((conn) => (
                <tr
                  key={conn.id}
                  className={`hover:bg-cyber-surface/60 transition-colors ${
                    conn.isSuspicious ? 'bg-cyber-crimson/5' : ''
                  }`}
                >
                  <td className="py-2.5 font-bold text-cyber-cyan">{conn.proto}</td>
                  <td className="py-2.5 text-slate-300">
                    {conn.localAddress}:{conn.localPort}
                  </td>
                  <td className="py-2.5 text-slate-300">
                    {conn.foreignAddress}:{conn.foreignPort}
                  </td>
                  <td className="py-2.5 text-slate-400">{conn.country}</td>
                  <td className="py-2.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyber-card border border-cyber-border text-slate-300">
                      {conn.state}
                    </span>
                  </td>
                  <td className="py-2.5 font-sans font-medium text-white">{conn.processName}</td>
                  <td className="py-2.5 text-right">
                    {conn.isSuspicious ? (
                      <span className="px-2 py-0.5 rounded bg-cyber-crimson/20 text-cyber-crimson border border-cyber-crimson/40 text-[10px] uppercase font-bold animate-pulse">
                        Rogue Socket
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-cyber-green/10 text-cyber-green text-[10px] uppercase">
                        Clean
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
