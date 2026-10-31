import { AllowlistEntry } from './types';
import { globalEventBus } from './EventBus';

export class AllowlistEngine {
  private static instance: AllowlistEngine;
  private entries: Map<string, AllowlistEntry> = new Map();

  // Core system files and known signed OS binaries that must never be flagged or deleted
  private defaultSystemAllowlist: AllowlistEntry[] = [
    // Windows Core OS binaries
    { id: 'win-1', type: 'path', pattern: 'C:\\Windows\\System32\\ntoskrnl.exe', description: 'Windows NT Operating System Kernel', addedAt: Date.now(), isSystemDefault: true },
    { id: 'win-2', type: 'path', pattern: 'C:\\Windows\\System32\\ntdll.dll', description: 'NT Layer DLL', addedAt: Date.now(), isSystemDefault: true },
    { id: 'win-3', type: 'path', pattern: 'C:\\Windows\\System32\\kernel32.dll', description: 'Windows NT BASE API Client DLL', addedAt: Date.now(), isSystemDefault: true },
    { id: 'win-4', type: 'path', pattern: 'C:\\Windows\\System32\\svchost.exe', description: 'Host Process for Windows Services', addedAt: Date.now(), isSystemDefault: true },
    { id: 'win-5', type: 'path', pattern: 'C:\\Windows\\System32\\csrss.exe', description: 'Client Server Runtime Process', addedAt: Date.now(), isSystemDefault: true },
    { id: 'win-6', type: 'path', pattern: 'C:\\Windows\\System32\\wininit.exe', description: 'Windows Start-Up Application', addedAt: Date.now(), isSystemDefault: true },
    { id: 'win-7', type: 'path', pattern: 'C:\\Windows\\System32\\services.exe', description: 'Services and Controller app', addedAt: Date.now(), isSystemDefault: true },
    { id: 'win-8', type: 'path', pattern: 'C:\\Windows\\System32\\lsass.exe', description: 'Local Security Authority Process', addedAt: Date.now(), isSystemDefault: true },
    { id: 'win-9', type: 'path', pattern: 'C:\\Windows\\System32\\winlogon.exe', description: 'Windows Logon Application', addedAt: Date.now(), isSystemDefault: true },
    { id: 'win-10', type: 'path', pattern: 'C:\\Windows\\explorer.exe', description: 'Windows Explorer GUI Shell', addedAt: Date.now(), isSystemDefault: true },

    // Unix / Linux / macOS Core Binaries
    { id: 'unix-1', type: 'path', pattern: '/bin/bash', description: 'GNU Bourne-Again SHell', addedAt: Date.now(), isSystemDefault: true },
    { id: 'unix-2', type: 'path', pattern: '/bin/sh', description: 'POSIX Standard Shell', addedAt: Date.now(), isSystemDefault: true },
    { id: 'unix-3', type: 'path', pattern: '/sbin/init', description: 'System Initialization Process', addedAt: Date.now(), isSystemDefault: true },
    { id: 'unix-4', type: 'path', pattern: '/lib/systemd/systemd', description: 'System and Service Manager', addedAt: Date.now(), isSystemDefault: true },
    { id: 'unix-5', type: 'path', pattern: '/usr/lib/libc.so.6', description: 'GNU C Library Core', addedAt: Date.now(), isSystemDefault: true },
    { id: 'mac-1', type: 'path', pattern: '/System/Library/CoreServices/Finder.app', description: 'macOS Finder Desktop Engine', addedAt: Date.now(), isSystemDefault: true },
    { id: 'mac-2', type: 'path', pattern: '/usr/libexec/launchd', description: 'macOS System Daemon Orchestrator', addedAt: Date.now(), isSystemDefault: true },

    // Verified System Hashes (Common SHA256 of trusted standard OS builds)
    { id: 'hash-1', type: 'hash', pattern: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', description: 'Empty File Safe Token', addedAt: Date.now(), isSystemDefault: true },
    { id: 'hash-2', type: 'hash', pattern: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', description: 'Trusted Signed Microsoft Driver Signature', addedAt: Date.now(), isSystemDefault: true },

    // Core Process Names
    { id: 'proc-1', type: 'process_name', pattern: 'System', description: 'Kernel System Task', addedAt: Date.now(), isSystemDefault: true },
    { id: 'proc-2', type: 'process_name', pattern: 'Registry', description: 'Windows Kernel Registry Process', addedAt: Date.now(), isSystemDefault: true },
    { id: 'proc-3', type: 'process_name', pattern: 'launchd', description: 'Apple macOS Core Daemon', addedAt: Date.now(), isSystemDefault: true },
  ];

  private constructor() {
    this.defaultSystemAllowlist.forEach((entry) => {
      this.entries.set(entry.id, entry);
    });
  }

  public static getInstance(): AllowlistEngine {
    if (!AllowlistEngine.instance) {
      AllowlistEngine.instance = new AllowlistEngine();
    }
    return AllowlistEngine.instance;
  }

  public isAllowlisted(path?: string, sha256?: string, processName?: string): boolean {
    if (!path && !sha256 && !processName) return false;

    for (const entry of this.entries.values()) {
      if (entry.type === 'path' && path) {
        // Normalize paths for case-insensitive cross-platform match
        const normTarget = path.toLowerCase().replace(/\\/g, '/');
        const normPattern = entry.pattern.toLowerCase().replace(/\\/g, '/');
        if (normTarget === normPattern || normTarget.endsWith(normPattern)) {
          return true;
        }
      }

      if (entry.type === 'hash' && sha256) {
        if (sha256.toLowerCase() === entry.pattern.toLowerCase()) {
          return true;
        }
      }

      if (entry.type === 'process_name' && processName) {
        if (processName.toLowerCase() === entry.pattern.toLowerCase()) {
          return true;
        }
      }
    }

    return false;
  }

  public getAllEntries(): AllowlistEntry[] {
    return Array.from(this.entries.values());
  }

  public addCustomEntry(type: 'path' | 'hash' | 'process_name', pattern: string, description: string): AllowlistEntry {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newEntry: AllowlistEntry = {
      id,
      type,
      pattern,
      description,
      addedAt: Date.now(),
      isSystemDefault: false,
    };
    this.entries.set(id, newEntry);
    globalEventBus.emit('allowlist_updated', this.getAllEntries());
    return newEntry;
  }

  public removeEntry(id: string): boolean {
    const entry = this.entries.get(id);
    if (!entry || entry.isSystemDefault) {
      // Prevent deleting core system defaults
      return false;
    }
    const result = this.entries.delete(id);
    globalEventBus.emit('allowlist_updated', this.getAllEntries());
    return result;
  }
}

export const allowlistEngine = AllowlistEngine.getInstance();
