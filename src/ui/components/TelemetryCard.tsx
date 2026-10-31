import React from 'react';
import { Cpu, Database, HardDrive, Wifi } from 'lucide-react';
import type { SystemMetrics } from '../../core-engine/types';

interface TelemetryCardProps {
  metrics: SystemMetrics;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({ metrics }) => {
  const cards = [
    {
      id: 'cpu',
      title: 'CPU Core Load',
      value: `${metrics.cpuUsagePercent}%`,
      subtitle: `${metrics.cpuTempCelsius}°C Core Temp`,
      percent: metrics.cpuUsagePercent,
      icon: Cpu,
      color: metrics.cpuUsagePercent > 80 ? 'text-cyber-crimson' : 'text-cyber-cyan',
      barColor: metrics.cpuUsagePercent > 80 ? 'bg-cyber-crimson shadow-neon-crimson/50' : 'bg-cyber-cyan shadow-neon-cyan/50',
    },
    {
      id: 'ram',
      title: 'RAM Utilization',
      value: `${metrics.ramUsagePercent}%`,
      subtitle: `${metrics.ramUsedGB} GB / ${metrics.ramTotalGB} GB`,
      percent: metrics.ramUsagePercent,
      icon: Database,
      color: metrics.ramUsagePercent > 85 ? 'text-cyber-amber' : 'text-cyber-purple',
      barColor: metrics.ramUsagePercent > 85 ? 'bg-cyber-amber' : 'bg-cyber-purple shadow-neon-purple/50',
    },
    {
      id: 'disk',
      title: 'System NVMe Drive',
      value: `${metrics.diskUsagePercent}%`,
      subtitle: `${metrics.diskFreeGB} GB Free`,
      percent: metrics.diskUsagePercent,
      icon: HardDrive,
      color: 'text-cyber-green',
      barColor: 'bg-cyber-green shadow-neon-green/50',
    },
    {
      id: 'net',
      title: 'Network Bandwidth',
      value: `↓ ${metrics.networkInKBps} KB/s`,
      subtitle: `↑ ${metrics.networkOutKBps} KB/s Outbound`,
      percent: Math.min(100, Math.round((metrics.networkInKBps / 1000) * 100)),
      icon: Wifi,
      color: 'text-cyber-cyan',
      barColor: 'bg-gradient-to-r from-cyber-cyan to-cyber-purple',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="p-3.5 rounded-xl bg-cyber-card/80 border border-cyber-border/70 hover:border-cyber-borderGlow transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xl font-bold font-display text-white tracking-tight">
                {card.value}
              </span>
              <span className="text-[10px] font-mono text-slate-400">{card.subtitle}</span>
            </div>

            <div className="w-full bg-cyber-bg rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${card.barColor}`}
                style={{ width: `${Math.max(4, Math.min(100, card.percent))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
