#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read all test results from test-results/ folder
const resultsDir = process.argv[2] || 'test-results';

if (!fs.existsSync(resultsDir)) {
  console.error(`Error: Directory ${resultsDir} does not exist`);
  process.exit(1);
}

const packages = fs.readdirSync(resultsDir);

let summary = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  packages: {}
};

packages.forEach(pkg => {
  const resultsFile = path.join(resultsDir, pkg, 'test-results.json');

  if (fs.existsSync(resultsFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
      const pkgName = pkg.replace('test-results-', '');

      summary.packages[pkgName] = {
        total: data.numTotalTests || 0,
        passed: data.numPassedTests || 0,
        failed: data.numFailedTests || 0,
        skipped: data.numPendingTests || 0
      };

      summary.total += summary.packages[pkgName].total;
      summary.passed += summary.packages[pkgName].passed;
      summary.failed += summary.packages[pkgName].failed;
      summary.skipped += summary.packages[pkgName].skipped;
    } catch (err) {
      console.error(`Error reading ${resultsFile}:`, err.message);
    }
  }
});

// Print summary
console.log('\n=== Test Summary ===\n');
console.log(`Total Tests:  ${summary.total}`);
console.log(`✅ Passed:    ${summary.passed}`);
console.log(`❌ Failed:    ${summary.failed}`);
console.log(`⏭️  Skipped:   ${summary.skipped}`);
console.log('\n=== Per Package ===\n');

Object.entries(summary.packages).forEach(([pkg, stats]) => {
  console.log(`${pkg}:`);
  console.log(`  Total: ${stats.total}, Passed: ${stats.passed}, Failed: ${stats.failed}`);
});

// Output JSON
console.log('\n' + JSON.stringify(summary, null, 2));
