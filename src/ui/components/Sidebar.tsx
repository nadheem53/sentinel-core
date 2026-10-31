import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  Wrench,
  Lock,
  Zap,
  Network,
  FileText,
  Settings,
  Server,
  X,
} from 'lucide-react';
import { soundFx } from '../../services/SoundFxService';

export type NavView =
  | 'dashboard'
  | 'scan'
  | 'autofix'
  | 'quarantine'
  | 'performance'
  | 'network'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  unresolvedCount: number;
  quarantineCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  unresolvedCount,
  quarantineCount,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems: { id: NavView; label: string; icon: React.FC<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Mission Control',
      icon: LayoutDashboard,
    },
    {
      id: 'scan',
      label: 'Scanner Engine',
      icon: ScanLine,
    },
    {
      id: 'autofix',
      label: 'Auto-Fix Center',
      icon: Wrench,
      badge: unresolvedCount > 0 ? unresolvedCount : undefined,
      badgeColor: 'bg-cyber-crimson text-white',
    },
    {
      id: 'quarantine',
      label: 'Quarantine Vault',
      icon: Lock,
      badge: quarantineCount > 0 ? quarantineCount : undefined,
      badgeColor: 'bg-cyber-amber text-black font-semibold',
    },
    {
      id: 'performance',
      label: 'Speed & Cleanup',
      icon: Zap,
    },
    {
      id: 'network',
      label: 'Network Monitor',
      icon: Network,
    },
    {
      id: 'reports',
      label: 'Audit Reports',
      icon: FileText,
    },
    {
      id: 'settings',
      label: 'Configuration',
      icon: Settings,
    },
  ];

  const handleNavClick = (viewId: NavView) => {
    soundFx.playClick();
    onSelectView(viewId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const content = (
    <div className="flex flex-col justify-between h-full select-none w-64 md:w-60 bg-cyber-surface border-r border-cyber-border/80">
      {/* Mobile Drawer Header */}
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 md:hidden border-b border-cyber-border/60 mb-2">
          <span className="text-xs font-bold font-display uppercase tracking-wider text-cyber-cyan">
            Navigation Menu
          </span>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-md text-cyber-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-cyber-muted">
          Defense Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-cyber-cyan/15 to-transparent text-white border-l-2 border-cyber-cyan shadow-neon-cyan/10'
                  : 'text-slate-400 hover:text-white hover:bg-cyber-card/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyber-cyan' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    item.badgeColor || 'bg-cyber-card text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer System Status Card */}
      <div className="p-3 m-3 rounded-lg bg-cyber-card/70 border border-cyber-border/60">
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="p-1.5 rounded-md bg-cyber-green/10 border border-cyber-green/30 text-cyber-green">
            <Server className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-semibold text-white">Universal Kernel</div>
            <div className="text-[10px] font-mono text-cyber-green flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
              <span>Cross-Platform Ready</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-cyber-bg rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-green h-full w-[100%]" />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-cyber-muted mt-1.5">
          <span>Win • macOS • Linux</span>
          <span>Web PWA</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block h-[calc(100vh-3.5rem)] flex-shrink-0">
        {content}
      </aside>

      {/* Mobile / Tablet Slide-out Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Body */}
          <div className="relative z-50 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
