import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Volume2,
  VolumeX,
  Search,
  Minus,
  Square,
  X,
  Activity,
  Menu,
} from 'lucide-react';
import { realtimeWatcherService } from '../../services/RealtimeWatcherService';
import { soundFx } from '../../services/SoundFxService';
import { globalEventBus } from '../../core-engine/EventBus';
import type { SystemMetrics } from '../../core-engine/types';

interface HeaderProps {
  metrics: SystemMetrics;
  onOpenCommandPalette: () => void;
  activeView: string;
  isMobileNavOpen: boolean;
  onToggleMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metrics,
  onOpenCommandPalette,
  isMobileNavOpen,
  onToggleMobileNav,
}) => {
  const [isProtected, setIsProtected] = useState(realtimeWatcherService.isActive());
  const [isMuted, setIsMuted] = useState(soundFx.getMuted());

  useEffect(() => {
    const unsub = globalEventBus.on('watcher_state_changed', ({ isRunning }) => {
      setIsProtected(isRunning);
    });
    return () => unsub();
  }, []);

  const handleToggleWatcher = () => {
    soundFx.playClick();
    const newState = realtimeWatcherService.toggle();
    setIsProtected(newState);
  };

  const handleToggleAudio = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) soundFx.playClick();
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-cyber-green border-cyber-green/40 bg-cyber-green/10';
    if (score >= 50) return 'text-cyber-amber border-cyber-amber/40 bg-cyber-amber/10';
    return 'text-cyber-crimson border-cyber-crimson/40 bg-cyber-crimson/10';
  };

  return (
    <header className="h-14 bg-cyber-surface/90 backdrop-blur-md border-b border-cyber-border/80 flex items-center justify-between px-3 sm:px-4 select-none z-40 relative">
      {/* Brand & Mobile Hamburger Toggle */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onToggleMobileNav();
          }}
          className="md:hidden p-1.5 rounded-lg bg-cyber-card border border-cyber-border text-slate-300 hover:text-white"
          title="Toggle Navigation Menu"
        >
          {isMobileNavOpen ? <X className="w-5 h-5 text-cyber-cyan" /> : <Menu className="w-5 h-5 text-cyber-cyan" />}
        </button>

        <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyber-card border border-cyber-cyan/40 shadow-neon-cyan/20">
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-cyan animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyber-cyan animate-ping" />
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <span className="font-display font-bold text-base sm:text-lg tracking-wider text-white bg-gradient-to-r from-white via-slate-200 to-cyber-cyan bg-clip-text text-transparent">
            SENTINEL<span className="text-cyber-cyan">CORE</span>
          </span>
          <span className="hidden xs:inline-block text-[9px] sm:text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
            v2.4
          </span>
        </div>
      </div>

      {/* Global Status & Quick Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Command Palette Trigger */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenCommandPalette();
          }}
          className="hidden sm:flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-md bg-cyber-card/80 hover:bg-cyber-cardHover border border-cyber-border text-xs text-cyber-muted hover:text-white transition-all duration-200"
          title="Search commands, tools & actions (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-cyber-cyan" />
          <span className="hidden md:inline">Quick Actions</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyber-bg border border-cyber-border text-slate-400">
            Ctrl+K
          </kbd>
        </button>

        {/* Real-time Defense Switch */}
        <button
          onClick={handleToggleWatcher}
          className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1 rounded-md text-xs font-medium border transition-all duration-200 ${
            isProtected
              ? 'bg-cyber-green/10 border-cyber-green/40 text-cyber-green shadow-neon-green/20'
              : 'bg-cyber-crimson/10 border-cyber-crimson/40 text-cyber-crimson'
          }`}
          title="Toggle Real-Time Background Daemon"
        >
          {isProtected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
              <span className="hidden sm:inline">Real-Time: Active</span>
              <span className="sm:hidden">Active</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-cyber-crimson" />
              <span className="hidden sm:inline">Real-Time: Paused</span>
              <span className="sm:hidden">Paused</span>
            </>
          )}
        </button>

        {/* System Health Score Pill */}
        <div
          className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${getHealthColor(
            metrics.healthScore
          )}`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{metrics.healthScore}%</span>
        </div>

        {/* Audio Synthesizer FX Toggle */}
        <button
          onClick={handleToggleAudio}
          className={`p-1.5 rounded-md border transition-colors ${
            isMuted
              ? 'bg-cyber-card border-cyber-border text-cyber-muted hover:text-white'
              : 'bg-cyber-cyan/10 border-cyber-cyan/40 text-cyber-cyan'
          }`}
          title={isMuted ? 'Unmute Cyber SFX' : 'Mute Cyber SFX'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Window Controls (Simulated / Electron bridge) */}
        <div className="hidden lg:flex items-center pl-2 border-l border-cyber-border space-x-1">
          <button
            onClick={() => soundFx.playClick()}
            className="p-1 hover:bg-cyber-card rounded text-cyber-muted hover:text-white"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => soundFx.playClick()}
            className="p-1 hover:bg-cyber-card rounded text-cyber-muted hover:text-white"
            title="Maximize"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => soundFx.playClick()}
            className="p-1 hover:bg-cyber-crimson/30 rounded text-cyber-muted hover:text-cyber-crimson"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
