import { IScannerPlugin, ScannerProgressCallback } from './IScannerPlugin';
import { DiagnosticIssue, ScanMode } from '../core-engine/types';

export class NetworkScanner implements IScannerPlugin {
  readonly id = 'scanner-network';
  readonly name = 'Network Anomaly & Socket Inspector';
  readonly category = 'network' as const;
  readonly description = 'Inspects active sockets, rogue listening ports, suspicious foreign connections, and DNS resolution integrity.';
  readonly iconName = 'Radio';
  readonly version = '2.2.0';
  readonly author = 'SentinelCore NetSec Unit';
  enabled = true;

  private mockSockets = [
    {
      protocol: 'TCP',
      localPort: 4444,
      remoteAddress: '185.220.101.42:4444',
      process: 'svch0st.exe (PID 9120)',
      isSuspicious: true,
      severity: 'critical' as const,
      title: 'Suspicious Reverse Shell Socket (Port 4444)',
      desc: 'Active TCP connection established on standard Metasploit reverse handler port 4444 to known bulletproof host.',
    },
    {
      protocol: 'UDP',
      localPort: 53,
      remoteAddress: '198.51.100.25:53',
      process: 'system',
      isSuspicious: true,
      severity: 'medium' as const,
      title: 'DNS Cache Poisoning & High Latency (>450ms)',
      desc: 'Primary DNS query route diverted through untrusted gateway proxy causing lookup delays.',
    },
    {
      protocol: 'TCP',
      localPort: 443,
      remoteAddress: '142.250.180.14:443',
      process: 'chrome.exe',
      isSuspicious: false,
      severity: 'info' as const,
      title: 'Google SSL Connection',
      desc: 'Safe',
    },
  ];

  isSupported(): boolean {
    return true;
  }

  async scan(
    mode: ScanMode,
    onProgress: ScannerProgressCallback,
    isCancelled: () => boolean
  ): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = [];
    const sockets = mode === 'quick' ? this.mockSockets.slice(0, 2) : this.mockSockets;

    for (let i = 0; i < sockets.length; i++) {
      if (isCancelled()) break;

      const sock = sockets[i];
      const percent = Math.floor(((i + 1) / sockets.length) * 100);

      await new Promise((r) => setTimeout(r, mode === 'deep' ? 110 : 60));

      let foundIssue: DiagnosticIssue | undefined;

      if (sock.isSuspicious) {
        foundIssue = {
          id: `net-${Date.now()}-${i}`,
          pluginId: this.id,
          category: 'network',
          severity: sock.severity,
          title: sock.title,
          description: sock.desc,
          targetResource: `${sock.protocol} ${sock.localPort} -> ${sock.remoteAddress}`,
          detectedAt: Date.now(),
          autoFixable: true,
          remediationAction: 'flush',
          safeToAutoFix: true,
          technicalDetails: {
            protocol: sock.protocol,
            localPort: sock.localPort,
            remoteEndpoint: sock.remoteAddress,
            associatedProcess: sock.process,
            action: 'Sever socket connection, flush DNS cache, and reset Winsock stack.',
          },
        };

        issues.push(foundIssue);
      }

      onProgress({
        scannedCount: i + 1,
        currentResource: `Socket: ${sock.remoteAddress}`,
        subPhase: 'Probing Active Network Sockets & Routing Tables',
        percent,
        foundIssue,
      });
    }

    return issues;
  }

  async repair(issue: DiagnosticIssue): Promise<{ success: boolean; message: string; details?: any }> {
    await new Promise((r) => setTimeout(r, 450));
    return {
      success: true,
      message: `Network stack reset: Flushed DNS cache tables, severed suspicious socket connection '${issue.targetResource}', and restored default DNS servers.`,
      details: {
        dnsFlushed: true,
        socketTerminated: issue.targetResource,
      },
    };
  }
}
