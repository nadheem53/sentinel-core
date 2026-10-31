import React, { useState, useEffect } from 'react';
import {
  Lock,
  Trash2,
  RotateCcw,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Binary,
} from 'lucide-react';
import type { QuarantinedItem } from '../../core-engine/types';
import { quarantineVaultService } from '../../services/QuarantineVaultService';
import { globalEventBus } from '../../core-engine/EventBus';
import { soundFx } from '../../services/SoundFxService';
import { Modal } from '../components/Modal';

export const QuarantineView: React.FC = () => {
  const [vaultItems, setVaultItems] = useState<QuarantinedItem[]>(
    quarantineVaultService.getVaultItems()
  );
  const [inspectingItem, setInspectingItem] = useState<QuarantinedItem | null>(null);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = globalEventBus.on('vault_updated', (items: QuarantinedItem[]) => {
      setVaultItems(items);
    });
    return () => unsub();
  }, []);

  const handleRestore = (id: string) => {
    soundFx.playClick();
    quarantineVaultService.restoreItem(id);
    setConfirmRestoreId(null);
    if (inspectingItem?.id === id) setInspectingItem(null);
  };

  const handleShred = (id: string) => {
    soundFx.playClick();
    quarantineVaultService.permanentShred(id);
    if (inspectingItem?.id === id) setInspectingItem(null);
  };

  const handleShredAll = () => {
    soundFx.playClick();
    quarantineVaultService.shredAll();
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] pb-12">
      {/* Header & Vault Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display tracking-wide text-white flex items-center space-x-2">
            <Lock className="w-5 h-5 text-cyber-amber" />
            <span>ENCRYPTED QUARANTINE VAULT</span>
          </h2>
          <p className="text-xs text-cyber-muted mt-1">
            Isolated threat container with hardware memory detachment and encrypted disk isolation.
          </p>
        </div>

        {vaultItems.length > 0 && (
          <button
            onClick={handleShredAll}
            className="px-4 py-2 rounded-xl bg-cyber-crimson/15 hover:bg-cyber-crimson/25 border border-cyber-crimson/40 text-cyber-crimson text-xs font-bold transition-all flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>PERMANENTLY SHRED ALL ({vaultItems.length})</span>
          </button>
        )}
      </div>

      {/* Vault Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-cyber-card/80 border border-cyber-border">
          <div className="text-[10px] font-mono text-cyber-muted uppercase">Contained Payloads</div>
          <div className="text-2xl font-bold font-display text-cyber-amber mt-1">
            {vaultItems.length}
          </div>
          <div className="text-[11px] text-cyber-muted mt-0.5">Isolated from OS Execution</div>
        </div>

        <div className="p-4 rounded-xl bg-cyber-card/80 border border-cyber-border">
          <div className="text-[10px] font-mono text-cyber-muted uppercase">Encryption Standard</div>
          <div className="text-2xl font-bold font-display text-white mt-1">AES-256-GCM</div>
          <div className="text-[11px] text-cyber-muted mt-0.5">Zero Payload Decryption</div>
        </div>

        <div className="p-4 rounded-xl bg-cyber-card/80 border border-cyber-border">
          <div className="text-[10px] font-mono text-cyber-muted uppercase">Wipe Protocol</div>
          <div className="text-2xl font-bold font-display text-cyber-green mt-1">DoD 5220.22-M</div>
          <div className="text-[11px] text-cyber-muted mt-0.5">3-Pass Magnetic Overwrite</div>
        </div>
      </div>

      {/* Vault Table */}
      <div className="p-5 rounded-2xl bg-cyber-card/70 border border-cyber-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white">
            Isolated Threat Binaries ({vaultItems.length})
          </h3>
          <span className="text-[10px] font-mono text-cyber-muted">Sandbox Sandboxed</span>
        </div>

        {vaultItems.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-cyber-surface/50 border border-cyber-border/40">
            <ShieldCheck className="w-10 h-10 text-cyber-green mx-auto mb-2 opacity-80" />
            <div className="text-sm font-bold text-white">Quarantine Vault is Empty</div>
            <p className="text-xs text-cyber-muted mt-1">
              No isolated threats currently stored in containment.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {vaultItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-cyber-surface/90 border border-cyber-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-cyber-amber/40 transition-colors"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/40">
                      CONTAINED
                    </span>
                    <span className="text-xs font-bold text-white truncate">{item.fileName}</span>
                  </div>
                  <div className="text-xs font-mono text-cyber-crimson">{item.threatFamily}</div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    Original Path: {item.originalPath}
                  </div>
                  <div className="text-[10px] font-mono text-cyber-muted truncate">
                    SHA256: {item.sha256}
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setInspectingItem(item);
                    }}
                    className="p-2 rounded-lg bg-cyber-card hover:bg-cyber-cardHover border border-cyber-border text-slate-300 hover:text-white transition-colors"
                    title="View Safe Byte & Hex Inspector"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setConfirmRestoreId(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-cyber-cyan/15 hover:bg-cyber-cyan/25 border border-cyber-cyan/40 text-cyber-cyan text-xs font-semibold flex items-center space-x-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>

                  <button
                    onClick={() => handleShred(item.id)}
                    className="p-2 rounded-lg bg-cyber-crimson/15 hover:bg-cyber-crimson/25 border border-cyber-crimson/40 text-cyber-crimson hover:text-white transition-colors"
                    title="Permanent Secure Shred"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hex & Binary Inspection Modal */}
      {inspectingItem && (
        <Modal
          isOpen={Boolean(inspectingItem)}
          onClose={() => setInspectingItem(null)}
          title={`Safe Byte Containment: ${inspectingItem.fileName}`}
          subtitle={`Threat: ${inspectingItem.threatFamily}`}
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-cyber-card border border-cyber-border">
                <div className="text-[10px] text-cyber-muted uppercase">Size on Disk</div>
                <div className="text-white mt-0.5">{(inspectingItem.fileSizeBytes / 1024).toFixed(1)} KB</div>
              </div>
              <div className="p-3 rounded-lg bg-cyber-card border border-cyber-border">
                <div className="text-[10px] text-cyber-muted uppercase">Quarantine Date</div>
                <div className="text-white mt-0.5">{new Date(inspectingItem.quarantinedAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border space-y-2">
              <div className="flex items-center justify-between text-[10px] text-cyber-cyan uppercase font-bold">
                <div className="flex items-center space-x-1.5">
                  <Binary className="w-3.5 h-3.5" />
                  <span>Sandbox Encrypted Hex Dump Preview</span>
                </div>
                <span>OFFSET 0x00000000</span>
              </div>
              <div className="p-3 rounded bg-black/60 font-mono text-[11px] text-emerald-400 break-all leading-relaxed select-text">
                {inspectingItem.encryptedContentPreview}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleShred(inspectingItem.id)}
                className="px-4 py-2 rounded-lg bg-cyber-crimson/20 hover:bg-cyber-crimson/30 border border-cyber-crimson text-cyber-crimson text-xs font-bold"
              >
                Permanently Shred Payload
              </button>
              <button
                onClick={() => setInspectingItem(null)}
                className="px-4 py-2 rounded-lg bg-cyber-card hover:bg-cyber-cardHover border border-cyber-border text-white text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Safety Restore Warning Confirmation Modal */}
      {confirmRestoreId && (
        <Modal
          isOpen={Boolean(confirmRestoreId)}
          onClose={() => setConfirmRestoreId(null)}
          title="CAUTION: Confirm Payload Restoration"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-cyber-crimson/15 border border-cyber-crimson/40 flex items-start space-x-2.5 text-cyber-crimson">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Restoring this quarantined file will return it to its original disk directory. Make sure you trust this application before executing.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setConfirmRestoreId(null)}
                className="px-4 py-2 rounded-lg bg-cyber-card hover:bg-cyber-cardHover border border-cyber-border text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRestore(confirmRestoreId)}
                className="px-4 py-2 rounded-lg bg-cyber-cyan hover:bg-cyan-400 text-black font-bold text-xs"
              >
                Yes, Restore File
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
