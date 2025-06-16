#!/usr/bin/env node

import { execSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 RepShield.io E2E Test Suite Runner');
console.log('=====================================');

// Ensure results directory exists
const resultsDir = path.join(__dirname, 'results');
const screenshotsDir = path.join(resultsDir, 'screenshots');
const logsDir = path.join(resultsDir, 'logs');

mkdirSync(resultsDir, { recursive: true });
mkdirSync(screenshotsDir, { recursive: true });
mkdirSync(logsDir, { recursive: true });

console.log('📁 Results directories created');

// Parse command line arguments
const args = process.argv.slice(2);
const isHeaded = args.includes('--headed');
const isUI = args.includes('--ui');
const specific = args.find(arg => arg.startsWith('--test='));

let command = 'npx playwright test tests/repshield-complete-e2e.spec.ts --project=chromium';

if (isHeaded) {
  command += ' --headed';
  console.log('🖥️  Running in headed mode (visible browser)');
}

if (isUI) {
  command += ' --ui';
  console.log('🎛️  Running with Playwright UI');
}

if (specific) {
  const testName = specific.split('=')[1];
  command += ` --grep "${testName}"`;
  console.log(`🎯 Running specific test: ${testName}`);
}

console.log('🏃 Starting E2E tests...');
console.log(`Command: ${command}`);
console.log('');

try {
  execSync(command, { 
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('');
  console.log('✅ E2E tests completed successfully!');
  console.log('📊 Check the following for results:');
  console.log(`   - HTML Report: playwright-report/index.html`);
  console.log(`   - Screenshots: results/screenshots/`);
  console.log(`   - Detailed Logs: results/logs/`);
  console.log(`   - JSON Report: results/test-results.json`);
  
} catch (error) {
  console.log('');
  console.log('❌ E2E tests failed or encountered errors');
  console.log('📊 Check the following for debugging:');
  console.log(`   - HTML Report: playwright-report/index.html`);
  console.log(`   - Screenshots: results/screenshots/`);
  console.log(`   - Error Logs: results/logs/`);
  
  process.exit(1);
}

console.log('');
console.log('💡 Usage examples:');
console.log('   node run-e2e-tests.js                    # Run all tests headless');
console.log('   node run-e2e-tests.js --headed           # Run with visible browser');
console.log('   node run-e2e-tests.js --ui               # Run with Playwright UI');
console.log('   node run-e2e-tests.js --test="Homepage"  # Run specific test'); 