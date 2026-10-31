import React, { useState, useEffect } from 'react';
import { Header } from './ui/components/Header';
import { Sidebar, NavView } from './ui/components/Sidebar';
import { DashboardView } from './ui/views/DashboardView';
import { ScanCenterView } from './ui/views/ScanCenterView';
import { AutoFixView } from './ui/views/AutoFixView';
import { QuarantineView } from './ui/views/QuarantineView';
import { PerformanceView } from './ui/views/PerformanceView';
import { NetworkMapView } from './ui/views/NetworkMapView';
import { ReportsView } from './ui/views/ReportsView';
import { SettingsView } from './ui/views/SettingsView';
import { CommandPalette } from './ui/components/CommandPalette';
import { NotificationToast, ToastMessage } from './ui/components/NotificationToast';
import { initializeSentinelCore } from './core-engine/init';
import { systemMetricsService } from './services/SystemMetricsService';
import { quarantineVaultService } from './services/QuarantineVaultService';
import { scanOrchestrator } from './core-engine/ScanOrchestrator';
import { autoRepairEngine } from './services/AutoRepairEngine';
import { threatDefinitionsManager } from './core-engine/ThreatDefinitions';
import { globalEventBus } from './core-engine/EventBus';
import { soundFx } from './services/SoundFxService';
import type { DiagnosticIssue, SystemMetrics } from './core-engine/types';

// Initialize SentinelCore modular plugin engine
initializeSentinelCore();

export function App() {
  const [activeView, setActiveView] = useState<NavView>('dashboard');
  const [metrics, setMetrics] = useState<SystemMetrics>(systemMetricsService.getMetrics());
  const [issues, setIssues] = useState<DiagnosticIssue[]>([]);
  const [quarantineCount, setQuarantineCount] = useState<number>(
    quarantineVaultService.getVaultItems().length
  );
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    // 1. Subscribe to system metrics
    const unsubMetrics = globalEventBus.on('metrics_updated', (newMetrics: SystemMetrics) => {
      setMetrics(newMetrics);
    });

    // 2. Subscribe to new issue detections
    const unsubIssues = globalEventBus.on('issue_detected', (issue: DiagnosticIssue) => {
      setIssues((prev) => {
        if (prev.some((i) => i.id === issue.id)) return prev;
        const next = [...prev, issue];
        systemMetricsService.updateActiveThreatsCount(
          next.filter((i) => !i.isFixed && i.category === 'malware').length
        );
        return next;
      });

      if (issue.severity === 'critical') {
        soundFx.playAlert();
        addToast('error', `CRITICAL THREAT DETECTED`, issue.title);
      }
    });

    // 3. Subscribe to scan complete
    const unsubScanDone = globalEventBus.on('scan_completed', (result) => {
      setIssues(result.issues);
      const activeMalware = result.issues.filter((i: DiagnosticIssue) => !i.isFixed && i.category === 'malware').length;
      systemMetricsService.updateActiveThreatsCount(activeMalware);
      addToast(
        'success',
        'Scan Finished',
        `Completed in ${Math.round((result.completedAt - result.startedAt) / 1000)}s. Found ${result.issues.length} items.`
      );
    });

    // 4. Subscribe to vault updates
    const unsubVault = globalEventBus.on('vault_updated', (items) => {
      setQuarantineCount(items.length);
    });

    // 5. Subscribe to background watcher incident alerts
    const unsubWatcher = globalEventBus.on('watcher_event', (evt) => {
      if (evt.severity === 'critical') {
        soundFx.playAlert();
        addToast('error', 'Threat Intercepted', `${evt.source}: ${evt.actionTaken}`);
      }
    });

    // Initial Quick Scan on startup
    const timer = setTimeout(() => {
      scanOrchestrator.startScan('quick').catch(() => {});
    }, 600);

    return () => {
      unsubMetrics();
      unsubIssues();
      unsubScanDone();
      unsubVault();
      unsubWatcher();
      clearTimeout(timer);
    };
  }, []);

  const handleFixSingleIssue = async (issue: DiagnosticIssue) => {
    const res = await autoRepairEngine.fixSingleIssue(issue);
    if (res.success) {
      soundFx.playSuccessChime();
      addToast('success', 'Issue Resolved', res.message);
      setIssues([...issues]);
      systemMetricsService.updateActiveThreatsCount(
        issues.filter((i) => !i.isFixed && i.category === 'malware').length
      );
    }
  };

  const activeIssuesCount = issues.filter((i) => !i.isFixed).length;

  return (
    <div className="h-screen w-screen flex flex-col bg-cyber-bg text-cyber-text font-sans antialiased overflow-hidden cyber-grid-bg">
      {/* Top Cyber Command Header */}
      <Header
        metrics={metrics}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        activeView={activeView}
        isMobileNavOpen={isMobileNavOpen}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Sidebar (Desktop & Mobile Drawer) */}
        <Sidebar
          activeView={activeView}
          onSelectView={(v) => {
            setActiveView(v);
            setIsMobileNavOpen(false);
          }}
          unresolvedCount={activeIssuesCount}
          quarantineCount={quarantineCount}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Viewport Router */}
        <main className="flex-1 overflow-hidden bg-cyber-bg/95 backdrop-blur-sm relative">
          {activeView === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              issues={issues}
              onNavigate={(v) => setActiveView(v)}
              onTriggerQuickScan={() => scanOrchestrator.startScan('quick')}
              onTriggerAutoFix={() => autoRepairEngine.fixAllIssues(issues)}
            />
          )}

          {activeView === 'scan' && (
            <ScanCenterView
              issues={issues}
              onFixSingle={handleFixSingleIssue}
              onNavigateToAutoFix={() => setActiveView('autofix')}
            />
          )}

          {activeView === 'autofix' && (
            <AutoFixView
              issues={issues}
              onRefreshIssues={() => setIssues([...issues])}
            />
          )}

          {activeView === 'quarantine' && <QuarantineView />}

          {activeView === 'performance' && <PerformanceView />}

          {activeView === 'network' && <NetworkMapView />}

          {activeView === 'reports' && <ReportsView issues={issues} metrics={metrics} />}

          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(v) => {
          setActiveView(v);
          setIsMobileNavOpen(false);
        }}
        onTriggerQuickScan={() => scanOrchestrator.startScan('quick')}
        onTriggerDeepScan={() => scanOrchestrator.startScan('deep')}
        onTriggerAutoFix={() => autoRepairEngine.fixAllIssues(issues)}
        onCheckUpdates={() => threatDefinitionsManager.checkForUpdates()}
      />

      {/* Real-Time Toast Notifications */}
      <NotificationToast
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}

export default App;
