import { runSentinelCoreTestSuite } from './scanners.test';

async function main() {
  console.log('🚀 Running SentinelCore Automated Verification Suite...\n');
  const result = await runSentinelCoreTestSuite();

  result.log.forEach((line) => console.log(line));
  console.log(`\nResults: ${result.passed} Passed, ${result.failed} Failed.`);

  if (result.failed > 0) {
    process.exit(1);
  } else {
    console.log('✨ ALL VERIFICATION SUITES PASSED SUCCESSFULLY!\n');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
