// Node.js runner for ExplorerTN Phase 9 Data Quality Test Suite
import { runDataQualityTestSuite } from "../src/lib/data-quality.ts";

console.log("=================================================");
console.log("🛡️ EXPLORERTN PHASE 9 DATA QUALITY TEST SUITE");
console.log("=================================================");

const testResults = runDataQualityTestSuite();

testResults.results.forEach((res) => {
  console.log(res);
});

console.log("\n-------------------------------------------------");
console.log(`SUMMARY: ${testResults.passed} Passed | ${testResults.failed} Failed`);
console.log("-------------------------------------------------");

if (testResults.failed > 0) {
  process.exit(1);
} else {
  console.log("✅ ALL DATA QUALITY & SECURITY VERIFICATION TESTS PASSED!");
  process.exit(0);
}
