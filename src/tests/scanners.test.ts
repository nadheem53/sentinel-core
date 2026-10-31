import { allowlistEngine } from '../core-engine/AllowlistEngine';
import { threatDefinitionsManager } from '../core-engine/ThreatDefinitions';
import { MalwareScanner } from '../scanners/MalwareScanner';
import { SystemIntegrityScanner } from '../scanners/SystemIntegrityScanner';
import { RegistryConfigScanner } from '../scanners/RegistryConfigScanner';
import { PerformanceScanner } from '../scanners/PerformanceScanner';
import { NetworkScanner } from '../scanners/NetworkScanner';
import { StartupBloatScanner } from '../scanners/StartupBloatScanner';
import { CrashLogsScanner } from '../scanners/CrashLogsScanner';
import { QuarantineVaultService } from '../services/QuarantineVaultService';
import { AutoRepairEngine } from '../services/AutoRepairEngine';
import { ScanOrchestrator } from '../core-engine/ScanOrchestrator';
import { initializeSentinelCore } from '../core-engine/init';
import { ReportService } from '../services/ReportService';
import { SystemMetricsService } from '../services/SystemMetricsService';

/**
 * SentinelCore Automated Verification Suite
 * Tests detection accuracy, zero-false-positive safety, scanner plugins, orchestrator, and auto-repair.
 */
export async function runSentinelCoreTestSuite(): Promise<{ passed: number; failed: number; log: string[] }> {
  const log: string[] = [];
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      passed++;
      log.push(`[PASS] ${testName}`);
    } else {
      failed++;
      log.push(`[FAIL] ${testName}`);
    }
  };

  log.push('--- Starting SentinelCore Diagnostic Engine Tests ---');

  // Test 1: Allowlist Zero-False-Positive Test
  const isKernelProtected = allowlistEngine.isAllowlisted('C:\\Windows\\System32\\ntoskrnl.exe');
  const isNtdllProtected = allowlistEngine.isAllowlisted('C:\\Windows\\System32\\ntdll.dll');
  const isRandomPathProtected = allowlistEngine.isAllowlisted('C:\\Users\\Temp\\untrusted_miner.exe');

  assert(isKernelProtected === true, 'Allowlist Engine protects core Windows Kernel (ntoskrnl.exe)');
  assert(isNtdllProtected === true, 'Allowlist Engine protects system NT Layer (ntdll.dll)');
  assert(isRandomPathProtected === false, 'Allowlist Engine correctly ignores untrusted paths');

  // Test 2: Threat Definitions Manager
  const rules = threatDefinitionsManager.getRules();
  assert(rules.length >= 6, `Threat Definitions loaded ${rules.length} core malware signatures`);

  // Test 3: Malware Scanner Detection & Zero-False-Positive Filtering
  const malwareScanner = new MalwareScanner();
  const malwareIssues = await malwareScanner.scan('deep', () => {}, () => false);

  assert(malwareIssues.length > 0, `Malware Scanner identified ${malwareIssues.length} active threats`);
  assert(
    !malwareIssues.some((i) => i.targetPath?.includes('ntoskrnl.exe')),
    'Malware Scanner correctly excluded allowlisted core OS binaries'
  );

  // Test 4: Quarantine Isolation Vault
  const vault = QuarantineVaultService.getInstance();
  const initialVaultCount = vault.getVaultItems().length;
  if (malwareIssues.length > 0) {
    const quarantined = vault.quarantineThreat(malwareIssues[0] as any);
    assert(quarantined.id.startsWith('vault-'), 'Quarantine Vault successfully generated containment ID');
    assert(vault.getVaultItems().length === initialVaultCount + 1, 'Quarantine Vault incremented storage count');
  }

  // Test 5: System Integrity Scanner
  const integrityScanner = new SystemIntegrityScanner();
  const integrityIssues = await integrityScanner.scan('deep', () => {}, () => false);
  assert(integrityIssues.length > 0, `System Integrity Scanner detected ${integrityIssues.length} corrupted file/permission anomalies`);

  // Test 6: Registry Scanner
  const registryScanner = new RegistryConfigScanner();
  const registryIssues = await registryScanner.scan('deep', () => {}, () => false);
  assert(registryIssues.length > 0, `Registry Scanner identified ${registryIssues.length} orphaned keys/persistence hooks`);

  // Test 7: Performance & Memory Leak Scanner
  const perfScanner = new PerformanceScanner();
  const perfIssues = await perfScanner.scan('deep', () => {}, () => false);
  assert(perfIssues.length > 0, `Performance Scanner detected ${perfIssues.length} runaway memory/CPU bottlenecks`);

  // Test 8: Network Anomaly & Socket Inspector
  const netScanner = new NetworkScanner();
  const netIssues = await netScanner.scan('deep', () => {}, () => false);
  assert(netIssues.length > 0, `Network Scanner detected ${netIssues.length} suspicious sockets/DNS anomalies`);

  // Test 9: Startup Bloat Scanner
  const startupScanner = new StartupBloatScanner();
  const startupIssues = await startupScanner.scan('deep', () => {}, () => false);
  assert(startupIssues.length > 0, `Startup Bloat Scanner detected ${startupIssues.length} boot delay items`);

  // Test 10: Crash Logs & Minidump Scanner
  const crashScanner = new CrashLogsScanner();
  const crashIssues = await crashScanner.scan('deep', () => {}, () => false);
  assert(crashIssues.length > 0, `Crash Logs Scanner detected ${crashIssues.length} minidump bugchecks`);

  // Test 11: Auto-Repair Engine Dry Run
  const repairEngine = AutoRepairEngine.getInstance();
  const allTestIssues = [
    ...malwareIssues,
    ...integrityIssues,
    ...registryIssues,
    ...perfIssues,
    ...netIssues,
    ...startupIssues,
    ...crashIssues,
  ];
  const dryRun = repairEngine.generateDryRunPreview(allTestIssues);
  assert(dryRun.totalFixable > 0, `AutoRepair dry run preview correctly classified ${dryRun.totalFixable} fixable issues`);

  // Test 12: Full ScanOrchestrator Pipeline Execution
  initializeSentinelCore();
  const orchestrator = ScanOrchestrator.getInstance();
  const scanResult = await orchestrator.startScan('quick');
  assert(scanResult.issues.length > 0, `ScanOrchestrator executed quick scan and collected ${scanResult.issues.length} issues`);
  assert(orchestrator.getState() === 'completed', 'ScanOrchestrator successfully transitioned to completed state');

  // Test 13: Report Service Audit Generation
  const reportService = ReportService.getInstance();
  const newReport = reportService.generateReport('quick', 82, scanResult.issues);
  assert(newReport.id.startsWith('REP-'), `ReportService generated audit report with ID: ${newReport.id}`);

  // Test 14: System Metrics Telemetry Service
  const metricsService = SystemMetricsService.getInstance();
  const currentMetrics = metricsService.getMetrics();
  assert(currentMetrics.cpuUsagePercent >= 0 && currentMetrics.healthScore <= 100, `SystemMetricsService telemetry active (Health: ${currentMetrics.healthScore}%, CPU: ${currentMetrics.cpuUsagePercent}%)`);

  log.push(`--- Test Suite Finished: ${passed} Passed, ${failed} Failed ---`);
  return { passed, failed, log };
}
