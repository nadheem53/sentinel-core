import { ThreatDefinitionRule } from './types';
import { globalEventBus } from './EventBus';

export class ThreatDefinitionsManager {
  private static instance: ThreatDefinitionsManager;
  private version: string = '2026.09.02-REL';
  private totalSignatures: number = 142850;
  private lastUpdatedAt: number = Date.now() - 3600000 * 4; // 4 hours ago
  private isUpdating: boolean = false;
  private cloudIntelligenceEnabled: boolean = false;

  private knownMalwareSignatures: ThreatDefinitionRule[] = [
    {
      id: 'sig-trojan-wacatac',
      name: 'Trojan:Win32/Wacatac.B!ml',
      category: 'Trojan',
      family: 'Wacatac',
      severity: 'critical',
      hashMatch: 'e2c2f6d0f62d1a3c7e7b51b3a2a7f5c9e1e3b5d7f9a1c3e5a7b9d1f3e5a7b9d1',
      patternRegex: 'payload\\.exe|miner_init\\.bat|shadow_dropper\\.vbs',
      heuristicIndicators: ['masquerade_system_binary', 'unusual_child_process_powershell', 'suspicious_rundll32'],
      description: 'Severe Trojan backdoor capable of harvesting credentials and executing remote C2 payloads.',
    },
    {
      id: 'sig-ransom-lockbit',
      name: 'Ransom:Win64/LockBit.3',
      category: 'Ransomware',
      family: 'LockBit',
      severity: 'critical',
      hashMatch: '8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a',
      patternRegex: '\\.lockbit|LockBit_README\\.txt|vssadmin delete shadows',
      heuristicIndicators: ['shadow_copy_deletion', 'mass_file_renaming', 'encrypted_file_header'],
      description: 'High-impact ransomware that encrypts user documents and destroys volume shadow copies.',
    },
    {
      id: 'sig-miner-xmrig',
      name: 'CoinMiner:Win64/XMRig.Heur',
      category: 'CryptoMiner',
      family: 'XMRig',
      severity: 'high',
      hashMatch: '4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b',
      patternRegex: 'xmrig\\.exe|stratum\\+tcp|pool\\.supportxmr\\.com',
      heuristicIndicators: ['sustained_high_cpu_avx2', 'stratum_tcp_socket', 'hidden_console_window'],
      description: 'Unauthorized cryptocurrency miner consuming 90%+ CPU cycles in the background.',
    },
    {
      id: 'sig-adware-browsefox',
      name: 'Adware:Win32/BrowseFox.Agent',
      category: 'Adware',
      family: 'BrowseFox',
      severity: 'medium',
      hashMatch: '112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00',
      patternRegex: 'SearchHelper\\.dll|BrowserHijack\\.dat|offers_installer\\.exe',
      heuristicIndicators: ['browser_proxy_redirection', 'injected_dll_into_chrome', 'startup_registry_injection'],
      description: 'Adware injecting unwanted popup overlays and redirecting search engine traffic.',
    },
    {
      id: 'sig-spyware-keylogger',
      name: 'Spyware:Generic/KeyCapture.Alpha',
      category: 'Spyware',
      family: 'KeyCapture',
      severity: 'critical',
      hashMatch: '998877665544332211ffeeddccbbaa998877665544332211ffeeddccbbaa99',
      patternRegex: 'keylog\\.dat|win_hook_hooker\\.dll|svch0st\\.exe',
      heuristicIndicators: ['setwindowshookex_keyboard', 'hidden_log_in_appdata', 'periodic_post_http'],
      description: 'Malicious background hook recording keystrokes and clipboard data.',
    },
    {
      id: 'sig-botnet-mirai',
      name: 'Backdoor:Linux/Mirai.Variant',
      category: 'Backdoor',
      family: 'Mirai',
      severity: 'critical',
      hashMatch: 'deadbeefcafe0123456789abcdef0123456789abcdef0123456789abcdef0123',
      patternRegex: '\\.arm7|\\.mips|busybox_kill',
      heuristicIndicators: ['raw_socket_flood', 'telnet_scanner_port_23', 'daemon_fork_orphan'],
      description: 'Botnet implant attempting brute-force lateral movement and DDoS command reception.',
    },
  ];

  private constructor() {}

  public static getInstance(): ThreatDefinitionsManager {
    if (!ThreatDefinitionsManager.instance) {
      ThreatDefinitionsManager.instance = new ThreatDefinitionsManager();
    }
    return ThreatDefinitionsManager.instance;
  }

  public getRules(): ThreatDefinitionRule[] {
    return this.knownMalwareSignatures;
  }

  public getVersion(): string {
    return this.version;
  }

  public getTotalSignatures(): number {
    return this.totalSignatures;
  }

  public getLastUpdated(): number {
    return this.lastUpdatedAt;
  }

  public isCloudIntelligenceEnabled(): boolean {
    return this.cloudIntelligenceEnabled;
  }

  public setCloudIntelligence(enabled: boolean): void {
    this.cloudIntelligenceEnabled = enabled;
    globalEventBus.emit('settings_updated', { cloudIntelligence: enabled });
  }

  public async checkForUpdates(): Promise<{ updated: boolean; newVersion: string; count: number }> {
    this.isUpdating = true;
    globalEventBus.emit('definitions_updating', { state: 'downloading' });

    // Simulate network definition package retrieval & signature unpacking
    await new Promise((res) => setTimeout(res, 1800));

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    this.version = `${dateStr}-REV${Math.floor(Math.random() * 50 + 10)}`;
    this.totalSignatures += Math.floor(Math.random() * 450 + 120);
    this.lastUpdatedAt = Date.now();
    this.isUpdating = false;

    const result = {
      updated: true,
      newVersion: this.version,
      count: this.totalSignatures,
    };

    globalEventBus.emit('definitions_updated', result);
    return result;
  }
}

export const threatDefinitionsManager = ThreatDefinitionsManager.getInstance();
