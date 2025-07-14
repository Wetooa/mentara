#!/usr/bin/env ts-node
/**
 * Performance Testing Script (TypeScript)
 * 
 * Entry point for running comprehensive backend performance,
 * security, and optimization tests.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

console.log('🚀 Starting Backend Performance & Security Testing Suite...\n');

const args = process.argv.slice(2);
const isQuiet = args.includes('--quiet');
const isVerbose = args.includes('--verbose');

// Ensure test reports directory exists
const reportsDir = path.join(__dirname, '../test-reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

interface TestConfig {
  command: string;
  description: string;
  required: boolean;
}

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  output?: string;
  error?: string;
}

interface SummaryReport {
  timestamp: string;
  totalDuration: number;
  summary: {
    totalTests: number;
    successful: number;
    failed: number;
    successRate: string;
  };
  results: TestResult[];
  recommendations: string[];
}

const testCommands: Record<string, TestConfig> = {
  'Load Testing': {
    command: 'npm run test -- src/test-utils/performance/load-tests.spec.ts --testTimeout=600000',
    description: 'API endpoint load and stress testing',
    required: true
  },
  'Database Performance': {
    command: 'npm run test -- src/test-utils/performance/database-performance.spec.ts --testTimeout=300000',
    description: 'Database query performance and optimization',
    required: true
  },
  'Security Testing': {
    command: 'npm run test -- src/test-utils/security/security-tests.spec.ts --testTimeout=300000',
    description: 'Comprehensive security vulnerability assessment',
    required: true
  },
  'Performance Test Runner': {
    command: 'npx ts-node src/test-utils/performance/performance-test-runner.ts',
    description: 'Integrated performance test execution',
    required: false
  }
};

async function runTest(testName: string, testConfig: TestConfig): Promise<TestResult> {
  if (!isQuiet) {
    console.log(`\n📊 Running ${testName}...`);
    console.log(`   ${testConfig.description}`);
  }

  const startTime = Date.now();

  try {
    const output = execSync(testConfig.command, {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
      stdio: isVerbose ? 'inherit' : 'pipe',
      timeout: 600000 // 10 minutes max per test
    });
    
    const duration = (Date.now() - startTime) / 1000;
    
    if (!isQuiet) {
      console.log(`✅ ${testName} completed successfully in ${duration.toFixed(2)}s`);
    }
    
    return {
      name: testName,
      success: true,
      duration: Number(duration.toFixed(2)),
      output: isVerbose ? 'See console output' : output
    };
    
  } catch (error: any) {
    const duration = (Date.now() - startTime) / 1000;
    
    if (!isQuiet) {
      console.error(`❌ ${testName} failed after ${duration.toFixed(2)}s`);
      if (isVerbose) {
        console.error(`Error: ${error.message}`);
      }
    }
    
    return {
      name: testName,
      success: false,
      duration: Number(duration.toFixed(2)),
      error: error.message,
      output: error.stdout || error.stderr || 'No output available'
    };
  }
}

async function main(): Promise<void> {
  const results: TestResult[] = [];
  const startTime = Date.now();

  if (!isQuiet) {
    console.log('Backend Performance Testing Suite');
    console.log('==================================');
    console.log(`Date: ${new Date().toISOString()}`);
    console.log(`Mode: ${isVerbose ? 'Verbose' : 'Standard'}`);
    console.log(`Reports Directory: ${reportsDir}\n`);
  }

  // Run required tests
  for (const [testName, testConfig] of Object.entries(testCommands)) {
    if (testConfig.required || args.includes(`--${testName.toLowerCase().replace(/\s+/g, '-')}`)) {
      const result = await runTest(testName, testConfig);
      results.push(result);
    }
  }

  // Run optional integrated test runner if requested
  if (args.includes('--integrated') || args.includes('--all')) {
    const integratedResult = await runTest('Performance Test Runner', testCommands['Performance Test Runner']);
    results.push(integratedResult);
  }

  const totalDuration = (Date.now() - startTime) / 1000;
  const successfulTests = results.filter(r => r.success).length;
  const failedTests = results.length - successfulTests;

  // Generate summary report
  const summaryReport: SummaryReport = {
    timestamp: new Date().toISOString(),
    totalDuration: Number(totalDuration.toFixed(2)),
    summary: {
      totalTests: results.length,
      successful: successfulTests,
      failed: failedTests,
      successRate: ((successfulTests / results.length) * 100).toFixed(1)
    },
    results: results,
    recommendations: generateRecommendations(results)
  };

  // Save summary report
  const summaryPath = path.join(reportsDir, 'test-execution-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2));

  // Display final results
  if (!isQuiet) {
    console.log('\n' + '='.repeat(60));
    console.log('BACKEND TESTING SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Duration: ${totalDuration.toFixed(2)}s`);
    console.log(`Tests Run: ${results.length}`);
    console.log(`Successful: ${successfulTests} ✅`);
    console.log(`Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
    console.log(`Success Rate: ${summaryReport.summary.successRate}%`);
    console.log(`\nDetailed reports available in: ${reportsDir}`);

    if (summaryReport.recommendations.length > 0) {
      console.log('\nRecommendations:');
      summaryReport.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }

    console.log('\n📊 Test execution complete!');
  }

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

function generateRecommendations(results: TestResult[]): string[] {
  const recommendations: string[] = [];
  
  const failedTests = results.filter(r => !r.success);
  if (failedTests.length > 0) {
    recommendations.push(`Fix failing tests: ${failedTests.map(t => t.name).join(', ')}`);
  }

  const longRunningTests = results.filter(r => r.duration > 180); // 3 minutes
  if (longRunningTests.length > 0) {
    recommendations.push(`Optimize slow tests: ${longRunningTests.map(t => t.name).join(', ')}`);
  }

  if (results.find(r => r.name === 'Security Testing' && !r.success)) {
    recommendations.push('URGENT: Address security testing failures before deployment');
  }

  if (results.find(r => r.name === 'Load Testing' && !r.success)) {
    recommendations.push('Review and optimize API performance issues');
  }

  if (results.find(r => r.name === 'Database Performance' && !r.success)) {
    recommendations.push('Investigate database performance bottlenecks');
  }

  return recommendations;
}

// Handle CLI arguments
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Backend Performance Testing Suite

Usage: npx ts-node scripts/run-performance-tests.ts [options]

Options:
  --help, -h              Show this help message
  --quiet                 Minimal output
  --verbose               Detailed output with logs
  --integrated            Run integrated test runner
  --all                   Run all available tests
  --load-testing          Run only load testing
  --database-performance  Run only database performance tests
  --security-testing      Run only security tests

Examples:
  npx ts-node scripts/run-performance-tests.ts                    # Run all required tests
  npx ts-node scripts/run-performance-tests.ts --verbose          # Run with detailed output
  npx ts-node scripts/run-performance-tests.ts --security-testing # Run only security tests
  npx ts-node scripts/run-performance-tests.ts --all --verbose    # Run everything with detailed output
`);
  process.exit(0);
}

// Run the main function
main().catch(error => {
  console.error('❌ Fatal error in test execution:', error);
  process.exit(1);
});