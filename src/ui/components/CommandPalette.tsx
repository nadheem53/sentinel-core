import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ScanLine,
  Wrench,
  Lock,
  Zap,
  Network,
  FileText,
  RefreshCw,
  X,
  ArrowRight,
} from 'lucide-react';
import type { NavView } from './Sidebar';
import { soundFx } from '../../services/SoundFxService';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: NavView) => void;
  onTriggerQuickScan: () => void;
  onTriggerDeepScan: () => void;
  onTriggerAutoFix: () => void;
  onCheckUpdates: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onTriggerQuickScan,
  onTriggerDeepScan,
  onTriggerAutoFix,
  onCheckUpdates,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'quick-scan',
      title: 'Run Quick Threat & Memory Scan',
      category: 'Scanner Engine',
      icon: ScanLine,
      run: () => {
        onTriggerQuickScan();
        onNavigate('scan');
      },
    },
    {
      id: 'deep-scan',
      title: 'Initiate Full Deep System Audit',
      category: 'Scanner Engine',
      icon: ScanLine,
      run: () => {
        onTriggerDeepScan();
        onNavigate('scan');
      },
    },
    {
      id: 'auto-fix',
      title: 'Execute 1-Click Auto-Repair on all Safe Issues',
      category: 'Auto-Fix',
      icon: Wrench,
      run: () => {
        onTriggerAutoFix();
        onNavigate('autofix');
      },
    },
    {
      id: 'view-quarantine',
      title: 'Open Quarantine Threat Isolation Vault',
      category: 'Security',
      icon: Lock,
      run: () => onNavigate('quarantine'),
    },
    {
      id: 'clean-junk',
      title: 'Clean Temporary Files & Clear System Cache',
      category: 'Performance',
      icon: Zap,
      run: () => onNavigate('performance'),
    },
    {
      id: 'inspect-network',
      title: 'Inspect Active Network Sockets & DNS Health',
      category: 'Network',
      icon: Network,
      run: () => onNavigate('network'),
    },
    {
      id: 'view-reports',
      title: 'Export Diagnostic Audit Reports (PDF/JSON)',
      category: 'Reports',
      icon: FileText,
      run: () => onNavigate('reports'),
    },
    {
      id: 'check-updates',
      title: 'Check for Threat Definition Updates',
      category: 'Definitions',
      icon: RefreshCw,
      run: () => onCheckUpdates(),
    },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-xl bg-cyber-surface border border-cyber-cyan/40 rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3 border-b border-cyber-border bg-cyber-card">
          <Search className="w-5 h-5 text-cyber-cyan mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-cyber-muted font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-cyber-muted hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-cyber-muted">
              No matching commands found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundFx.playClick();
                    item.run();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs hover:bg-cyber-cyan/10 hover:border-cyber-cyan/30 border border-transparent transition-all duration-150 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-md bg-cyber-card border border-cyber-border text-cyber-cyan group-hover:border-cyber-cyan/50">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-white font-medium group-hover:text-cyber-cyan transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-cyber-muted">{item.category}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-cyber-muted group-hover:text-cyber-cyan group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Guide */}
        <div className="px-4 py-2 bg-cyber-bg border-t border-cyber-border/60 flex items-center justify-between text-[10px] font-mono text-cyber-muted">
          <span>Navigation: ↑ ↓ Enter</span>
          <span>Close: ESC</span>
        </div>
      </div>
    </div>
  );
};
