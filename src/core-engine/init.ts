import { pluginRegistry } from './PluginRegistry';
import { MalwareScanner } from '../scanners/MalwareScanner';
import { SystemIntegrityScanner } from '../scanners/SystemIntegrityScanner';
import { RegistryConfigScanner } from '../scanners/RegistryConfigScanner';
import { PerformanceScanner } from '../scanners/PerformanceScanner';
import { NetworkScanner } from '../scanners/NetworkScanner';
import { StartupBloatScanner } from '../scanners/StartupBloatScanner';
import { CrashLogsScanner } from '../scanners/CrashLogsScanner';

let isInitialized = false;

export function initializeSentinelCore(): void {
  if (isInitialized) return;

  // Register all modular scanner plugins
  pluginRegistry.register(new MalwareScanner());
  pluginRegistry.register(new SystemIntegrityScanner());
  pluginRegistry.register(new RegistryConfigScanner());
  pluginRegistry.register(new PerformanceScanner());
  pluginRegistry.register(new NetworkScanner());
  pluginRegistry.register(new StartupBloatScanner());
  pluginRegistry.register(new CrashLogsScanner());

  isInitialized = true;
  console.log('[SentinelCore] Engine initialized with 7 modular scanner plugins.');
}
