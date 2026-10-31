import { QuarantinedItem, ThreatItem } from '../core-engine/types';
import { globalEventBus } from '../core-engine/EventBus';

export class QuarantineVaultService {
  private static instance: QuarantineVaultService;
  private vaultItems: Map<string, QuarantinedItem> = new Map();

  private constructor() {
    // Initial seeded quarantined items for realistic demonstration
    const initialItems: QuarantinedItem[] = [
      {
        id: 'vault-item-1',
        originalPath: 'C:\\Users\\User\\Downloads\\invoice_pdf_receipt.lockbit',
        fileName: 'invoice_pdf_receipt.lockbit',
        fileSizeBytes: 24576,
        threatFamily: 'LockBit.3 Ransomware Dropper',
        sha256: '8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a',
        quarantinedAt: Date.now() - 86400000 * 2, // 2 days ago
        encryptedContentPreview: '4D 5A 90 00 03 00 00 00 04 00 00 00 FF FF 00 00 B8 00 00 00 00 00 00 00 40 00 00 00 00 00 00 00 [ENCRYPTED_VAULT_PAYLOAD_LOCKED]',
        restored: false,
      },
      {
        id: 'vault-item-2',
        originalPath: 'C:\\ProgramData\\WindowsSystemHelper\\xmrig_host.exe',
        fileName: 'xmrig_host.exe',
        fileSizeBytes: 524288,
        threatFamily: 'CoinMiner:Win64/XMRig.Heur',
        sha256: '4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b',
        quarantinedAt: Date.now() - 3600000 * 18,
        encryptedContentPreview: '7F 45 4C 46 02 01 01 00 00 00 00 00 00 00 00 00 02 00 3E 00 01 00 00 00 70 04 40 00 00 00 00 00 [ENCRYPTED_VAULT_PAYLOAD_LOCKED]',
        restored: false,
      },
    ];

    initialItems.forEach((item) => this.vaultItems.set(item.id, item));
  }

  public static getInstance(): QuarantineVaultService {
    if (!QuarantineVaultService.instance) {
      QuarantineVaultService.instance = new QuarantineVaultService();
    }
    return QuarantineVaultService.instance;
  }

  public getVaultItems(): QuarantinedItem[] {
    return Array.from(this.vaultItems.values()).filter((i) => !i.restored);
  }

  public quarantineThreat(threat: ThreatItem): QuarantinedItem {
    const id = `vault-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const fileName = threat.targetPath ? threat.targetPath.split(/[\\/]/).pop() || 'unknown_payload.bin' : 'threat_payload.bin';

    const quarantinedItem: QuarantinedItem = {
      id,
      originalPath: threat.targetPath || 'C:\\Unknown\\Threat.exe',
      fileName,
      fileSizeBytes: Math.floor(Math.random() * 800000 + 15000),
      threatFamily: threat.threatFamily || 'Unknown Generic Threat',
      sha256: threat.hashSHA256 || 'SHA256_' + Math.random().toString(36).substr(2, 16),
      quarantinedAt: Date.now(),
      encryptedContentPreview: '4D 5A 90 00 03 00 00 00 04 00 00 00 [ENCRYPTED_VAULT_BLOB_CONTAINMENT_PASS]',
      restored: false,
    };

    this.vaultItems.set(id, quarantinedItem);
    globalEventBus.emit('vault_updated', this.getVaultItems());
    return quarantinedItem;
  }

  public restoreItem(id: string): boolean {
    const item = this.vaultItems.get(id);
    if (!item) return false;
    item.restored = true;
    this.vaultItems.delete(id);
    globalEventBus.emit('vault_updated', this.getVaultItems());
    return true;
  }

  public permanentShred(id: string): boolean {
    const item = this.vaultItems.get(id);
    if (!item) return false;
    // Multi-pass secure shred simulation (DoD 5220.22-M)
    this.vaultItems.delete(id);
    globalEventBus.emit('vault_updated', this.getVaultItems());
    return true;
  }

  public shredAll(): number {
    const count = this.vaultItems.size;
    this.vaultItems.clear();
    globalEventBus.emit('vault_updated', []);
    return count;
  }
}

export const quarantineVaultService = QuarantineVaultService.getInstance();
