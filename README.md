# SentinelCore™ (v2.4 Pro)
### Advanced Cross-Platform System Diagnostics, Cyber-Defense & Auto-Repair Suite

> **SentinelCore** is a high-performance, local-first system diagnostics and cybersecurity desktop tool. It performs deep multi-vector scans for malware, system corruption, broken registry/config trees, memory leaks, rogue network sockets, and boot bloat — with 1-click automated healing, encrypted threat quarantine, and zero false-positive OS immunity.

---

## ⚡ Key Highlights & Architecture

- **Modular Scanner Engine**: Every detector is an isolated plugin implementing `IScannerPlugin`. Adding new malware heuristics, hardware probes, or OS config checkers requires zero core changes.
- **Zero False-Positive Engine**: Strict `AllowlistEngine` ensures core operating system binaries (`ntoskrnl.exe`, `ntdll.dll`, `/bin/bash`, `libc.so`, etc.) and signed vendor certificates are never erroneously flagged or deleted.
- **1-Click Auto-Repair**: Automated multi-issue remediation with dry-run previews, automatic rollback snapshots, and safe isolated quarantine.
- **Encrypted Quarantine Vault**: Isolates threat payloads with AES-256 containment, safe hex/text dump inspector, restoration safeguards, and DoD 5220.22-M multi-pass permanent shredding.
- **Cyber-Defense Mission-Control Aesthetic**: Dark space background (`#080a0f`), electric cyan, cyber purple, emerald green, and threat crimson neon accents, animated Canvas radar sweeps, real-time telemetry meters, and Web Audio API synthesized sound effects.
- **Dual-Mode Desktop Architecture**: Ready to run both as a native Electron desktop app (`electron/`) with native OS hooks, and in modern browsers with full simulated native adapters.

---

## 📂 Project Directory Structure

```
sentinel-core/
├── electron/
│   ├── main.ts                   # Electron main process & OS IPC handlers
│   └── preload.ts                # Context bridge exposing native system APIs
├── src/
│   ├── core-engine/              # Core Engine Layer
│   │   ├── types.ts              # System types, Threat, Issue & Metric models
│   │   ├── EventBus.ts           # Typed pub/sub bus for live telemetry & alerts
│   │   ├── AllowlistEngine.ts    # Zero false-positive system allowlist database
│   │   ├── ThreatDefinitions.ts  # Signature hashes, heuristic patterns & updater
│   │   ├── PluginRegistry.ts     # Plug-in registration & lifecycle manager
│   │   ├── ScanOrchestrator.ts   # Multi-phase scan dispatcher & live streaming
│   │   └── init.ts               # Core engine bootstrap & plugin auto-loader
│   ├── scanners/                 # Modular Scanner Plug-ins
│   │   ├── IScannerPlugin.ts     # Standard plugin interface for all detectors
│   │   ├── MalwareScanner.ts     # Signature hashing & behavioral heuristics
│   │   ├── SystemIntegrityScanner.ts # SFC / file corruption & permissions
│   │   ├── RegistryConfigScanner.ts  # Windows registry & system configs
│   │   ├── PerformanceScanner.ts # Memory leak profiler & runaway CPU killer
│   │   ├── NetworkScanner.ts     # Suspicious socket & DNS anomaly inspector
│   │   ├── StartupBloatScanner.ts# Boot delay impact & startup bloat analyzer
│   │   └── CrashLogsScanner.ts   # Minidump & BSOD event log parser
│   ├── services/                 # Background Services
│   │   ├── RealtimeWatcherService.ts # Background daemon monitoring files/network
│   │   ├── AutoRepairEngine.ts   # 1-Click repair engine & dry-run analyzer
│   │   ├── QuarantineVaultService.ts # Encrypted vault & DoD secure shredder
│   │   ├── SystemMetricsService.ts   # Live hardware CPU/RAM/Disk telemetry
│   │   ├── SoundFxService.ts     # Web Audio API futuristic sound synthesizer
│   │   ├── ReportService.ts      # Diagnostic audit reports (JSON/CSV/Print)
│   │   └── SchedulerService.ts   # Cron-like scan & update scheduler
│   ├── native/                   # Cross-Platform Abstraction
│   │   ├── NativeBridge.ts       # Unified OS bridge (Electron & Web fallback)
│   │   └── mockData.ts           # Realistic process, socket & cache datasets
│   ├── ui/                       # Frontend Command Center
│   │   ├── components/           # Header, Sidebar, RadarSweep, HealthGauge,
│   │   │                         # TelemetryCard, CommandPalette, Modals, Toasts
│   │   └── views/                # Mission Control, Scan Center, Auto-Fix,
│   │                             # Vault, Performance, Network, Reports, Settings
│   ├── tests/                    # Automated Verification Test Suites
│   │   ├── scanners.test.ts      # Unit tests for detectors & allowlists
│   │   └── run.ts                # Standalone test runner
│   ├── index.css                 # Cyberpunk styling, glassmorphism, radar glows
│   └── main.tsx                  # UI Entry Point
├── package.json
└── README.md
```

---

## 🛠️ How to Add a New Scanner Plug-in

SentinelCore uses an open plug-in model. To add a custom diagnostic probe:

1. Create a new file in `src/scanners/MyCustomScanner.ts` implementing `IScannerPlugin`:

```typescript
import { IScannerPlugin, ScannerProgressCallback } from './IScannerPlugin';
import { DiagnosticIssue, ScanMode } from '../core-engine/types';
import { allowlistEngine } from '../core-engine/AllowlistEngine';

export class MyCustomScanner implements IScannerPlugin {
  readonly id = 'scanner-my-custom';
  readonly name = 'Driver Vulnerability & Firmware Scanner';
  readonly category = 'system_integrity' as const;
  readonly description = 'Checks kernel drivers against vulnerable driver blocklists.';
  readonly iconName = 'Cpu';
  readonly version = '1.0.0';
  readonly author = 'SecOps Team';
  enabled = true;

  isSupported(): boolean {
    return true; // Check platform compatibility
  }

  async scan(
    mode: ScanMode,
    onProgress: ScannerProgressCallback,
    isCancelled: () => boolean
  ): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = [];

    // Stream live progress
    onProgress({
      scannedCount: 1,
      currentResource: 'C:\\Windows\\System32\\drivers\\custom_driver.sys',
      subPhase: 'Verifying Authenticode Signature',
      percent: 50,
    });

    // Verify against allowlist before flagging
    if (allowlistEngine.isAllowlisted('C:\\Windows\\System32\\drivers\\custom_driver.sys')) {
      return issues;
    }

    // Add detected issue
    issues.push({
      id: `driver-vuln-${Date.now()}`,
      pluginId: this.id,
      category: this.category,
      severity: 'high',
      title: 'Outdated Vulnerable Driver Detected',
      description: 'Driver contains known CVE memory flaw.',
      targetPath: 'C:\\Windows\\System32\\drivers\\custom_driver.sys',
      detectedAt: Date.now(),
      autoFixable: true,
      remediationAction: 'repair',
      safeToAutoFix: true,
    });

    return issues;
  }

  async repair(issue: DiagnosticIssue): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: `Driver updated and patched successfully.`,
    };
  }
}
```

2. Register the plugin in `src/core-engine/init.ts`:

```typescript
import { MyCustomScanner } from '../scanners/MyCustomScanner';

pluginRegistry.register(new MyCustomScanner());
```

---

## 🚀 Build & Run Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start in Development Mode (Live Command Center)
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Run Automated Unit Verification Test Suite
```bash
npm test
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## 💻 Cross-Platform Desktop Packaging

### Windows (.exe / MSI)
```bash
# Using electron-builder
npx electron-builder --win
```

### macOS (.dmg / .app - Apple Silicon & Intel)
```bash
npx electron-builder --mac
```

### Linux (.AppImage / .deb / .rpm)
```bash
npx electron-builder --linux
```

---

## 🛡️ Zero-False-Positive Guarantee
SentinelCore validates every suspicious path and process against `AllowlistEngine`. Any file that matches signed OS kernels, NT layers, or user exclusions is guaranteed immutable protection against accidental quarantine or deletion.
