#!/usr/bin/env node
/**
 * Performance Test Runner
 *
 * Comprehensive test runner for backend performance, load testing,
 * security scanning, and database optimization testing.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../database/prisma.service';
import { LoadTestingSuite } from './load-testing.suite';
import { SecurityTestingSuite } from '../security/security-testing.suite';
import { createMockClerkClient, createMockAuthGuard } from '../index';
import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';

interface TestRunnerConfig {
  runLoadTests: boolean;
  runSecurityTests: boolean;
  runDatabaseTests: boolean;
  runMemoryTests: boolean;
  outputDir: string;
  verbose: boolean;
}

interface TestSuiteResult {
  suiteName: string;
  duration: number;
  success: boolean;
  results: any;
  error?: string;
}

export class PerformanceTestRunner {
  private app: INestApplication;
  private prisma: PrismaService;
  private config: TestRunnerConfig;
  private suiteResults: TestSuiteResult[] = [];

  constructor(config: Partial<TestRunnerConfig> = {}) {
    this.config = {
      runLoadTests: true,
      runSecurityTests: true,
      runDatabaseTests: true,
      runMemoryTests: true,
      outputDir: './test-reports',
      verbose: true,
      ...config,
    };
  }

  /**
   * Initialize the test environment
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Performance Test Runner...');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('ClerkClient')
      .useValue(createMockClerkClient())
      .overrideGuard('AuthGuard')
      .useValue(createMockAuthGuard())
      .compile();

    this.app = moduleFixture.createNestApplication();
    this.prisma = this.app.get<PrismaService>(PrismaService);

    await this.app.init();

    // Ensure output directory exists
    await fs.promises.mkdir(this.config.outputDir, { recursive: true });

    console.log('✅ Test environment initialized successfully');
  }

  /**
   * Run all enabled test suites
   */
  async runAllTests(): Promise<void> {
    console.log('\n🧪 Starting Comprehensive Backend Testing Suite...\n');

    const startTime = performance.now();

    try {
      if (this.config.runLoadTests) {
        await this.runLoadTestSuite();
      }

      if (this.config.runSecurityTests) {
        await this.runSecurityTestSuite();
      }

      if (this.config.runDatabaseTests) {
        await this.runDatabaseTestSuite();
      }

      if (this.config.runMemoryTests) {
        await this.runMemoryTestSuite();
      }

      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      // Generate comprehensive report
      await this.generateComprehensiveReport(totalDuration);

      console.log(
        `\n🎉 All tests completed in ${(totalDuration / 1000).toFixed(2)} seconds`,
      );
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw error;
    }
  }

  /**
   * Run load testing suite
   */
  private async runLoadTestSuite(): Promise<void> {
    console.log('📊 Running Load Testing Suite...');

    const startTime = performance.now();

    try {
      const loadTestSuite = new LoadTestingSuite(this.app);
      const results = await loadTestSuite.runFullLoadTestSuite();
      const report = loadTestSuite.generatePerformanceReport();

      const endTime = performance.now();

      // Save load test report
      await this.saveReport('load-test-results.json', report);

      this.suiteResults.push({
        suiteName: 'Load Testing',
        duration: endTime - startTime,
        success: true,
        results: JSON.parse(report),
      });

      console.log('✅ Load testing completed successfully');
    } catch (error) {
      const endTime = performance.now();

      this.suiteResults.push({
        suiteName: 'Load Testing',
        duration: endTime - startTime,
        success: false,
        results: null,
        error: error.message,
      });

      console.error('❌ Load testing failed:', error.message);
    }
  }

  /**
   * Run security testing suite
   */
  private async runSecurityTestSuite(): Promise<void> {
    console.log('🔒 Running Security Testing Suite...');

    const startTime = performance.now();

    try {
      const securitySuite = new SecurityTestingSuite(this.app);
      const report = await securitySuite.runSecurityScan();

      const endTime = performance.now();

      // Save security report
      await this.saveReport(
        'security-scan-results.json',
        JSON.stringify(report, null, 2),
      );

      this.suiteResults.push({
        suiteName: 'Security Testing',
        duration: endTime - startTime,
        success:
          report.summary.criticalIssues === 0 &&
          report.summary.highIssues === 0,
        results: report,
      });

      console.log('✅ Security testing completed successfully');
      console.log(`   Critical Issues: ${report.summary.criticalIssues}`);
      console.log(`   High Issues: ${report.summary.highIssues}`);
      console.log(`   Medium Issues: ${report.summary.mediumIssues}`);
      console.log(`   Low Issues: ${report.summary.lowIssues}`);
    } catch (error) {
      const endTime = performance.now();

      this.suiteResults.push({
        suiteName: 'Security Testing',
        duration: endTime - startTime,
        success: false,
        results: null,
        error: error.message,
      });

      console.error('❌ Security testing failed:', error.message);
    }
  }

  /**
   * Run database performance testing
   */
  private async runDatabaseTestSuite(): Promise<void> {
    console.log('🗄️ Running Database Performance Suite...');

    const startTime = performance.now();

    try {
      // Run database performance tests by executing the spec file
      const { execSync } = require('child_process');

      // Execute database performance tests
      const output = execSync(
        'npm run test src/test-utils/performance/database-performance.spec.ts',
        {
          cwd: path.join(__dirname, '../../..'),
          encoding: 'utf8',
          timeout: 120000, // 2 minutes
        },
      );

      const endTime = performance.now();

      this.suiteResults.push({
        suiteName: 'Database Performance',
        duration: endTime - startTime,
        success: !output.includes('FAIL'),
        results: { output },
      });

      console.log('✅ Database performance testing completed successfully');
    } catch (error) {
      const endTime = performance.now();

      this.suiteResults.push({
        suiteName: 'Database Performance',
        duration: endTime - startTime,
        success: false,
        results: null,
        error: error.message,
      });

      console.log('⚠️ Database performance testing completed with issues');
    }
  }

  /**
   * Run memory testing suite
   */
  private async runMemoryTestSuite(): Promise<void> {
    console.log('🧠 Running Memory Testing Suite...');

    const startTime = performance.now();
    const initialMemory = process.memoryUsage();

    try {
      // Simulate memory-intensive operations
      const memoryResults = await this.performMemoryTests();

      const endTime = performance.now();
      const finalMemory = process.memoryUsage();

      const memoryReport = {
        initialMemory: this.formatMemoryUsage(initialMemory),
        finalMemory: this.formatMemoryUsage(finalMemory),
        memoryGrowth: this.calculateMemoryGrowth(initialMemory, finalMemory),
        testResults: memoryResults,
      };

      await this.saveReport(
        'memory-test-results.json',
        JSON.stringify(memoryReport, null, 2),
      );

      this.suiteResults.push({
        suiteName: 'Memory Testing',
        duration: endTime - startTime,
        success: memoryReport.memoryGrowth.heapUsedMB < 100, // Less than 100MB growth
        results: memoryReport,
      });

      console.log('✅ Memory testing completed successfully');
      console.log(
        `   Memory Growth: ${memoryReport.memoryGrowth.heapUsedMB.toFixed(2)}MB`,
      );
    } catch (error) {
      const endTime = performance.now();

      this.suiteResults.push({
        suiteName: 'Memory Testing',
        duration: endTime - startTime,
        success: false,
        results: null,
        error: error.message,
      });

      console.error('❌ Memory testing failed:', error.message);
    }
  }

  /**
   * Perform memory-specific tests
   */
  private async performMemoryTests(): Promise<any[]> {
    const results = [];

    // Test 1: Large data processing
    const largeDataResult = await this.testLargeDataProcessing();
    results.push(largeDataResult);

    // Test 2: Concurrent operations memory usage
    const concurrentResult = await this.testConcurrentMemoryUsage();
    results.push(concurrentResult);

    // Test 3: Memory cleanup after operations
    const cleanupResult = await this.testMemoryCleanup();
    results.push(cleanupResult);

    return results;
  }

  private async testLargeDataProcessing(): Promise<any> {
    const startMemory = process.memoryUsage().heapUsed;

    // Simulate processing large amounts of data
    const largeArray = new Array(100000).fill(0).map((_, i) => ({
      id: i,
      data: `test-data-${i}`.repeat(10),
      timestamp: new Date(),
    }));

    // Process the data
    const processed = largeArray.map((item) => ({
      ...item,
      processed: true,
      processedAt: new Date(),
    }));

    const endMemory = process.memoryUsage().heapUsed;
    const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // MB

    return {
      test: 'Large Data Processing',
      itemsProcessed: processed.length,
      memoryUsedMB: memoryUsed,
      success: memoryUsed < 50, // Should use less than 50MB
    };
  }

  private async testConcurrentMemoryUsage(): Promise<any> {
    const startMemory = process.memoryUsage().heapUsed;

    // Simulate concurrent operations
    const promises = Array.from({ length: 20 }, async (_, i) => {
      const data = new Array(1000).fill(0).map((j) => `concurrent-${i}-${j}`);
      return data.reduce((acc, item) => acc + item.length, 0);
    });

    await Promise.all(promises);

    const endMemory = process.memoryUsage().heapUsed;
    const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // MB

    return {
      test: 'Concurrent Memory Usage',
      concurrentOperations: promises.length,
      memoryUsedMB: memoryUsed,
      success: memoryUsed < 30, // Should use less than 30MB
    };
  }

  private async testMemoryCleanup(): Promise<any> {
    const startMemory = process.memoryUsage().heapUsed;

    // Create and then clean up large objects
    let largeObjects = [];
    for (let i = 0; i < 1000; i++) {
      largeObjects.push({
        id: i,
        data: new Array(1000).fill(`cleanup-test-${i}`),
      });
    }

    const peakMemory = process.memoryUsage().heapUsed;

    // Clean up
    largeObjects = null;

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Wait a bit for cleanup
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const endMemory = process.memoryUsage().heapUsed;
    const memoryReclaimed = (peakMemory - endMemory) / 1024 / 1024; // MB

    return {
      test: 'Memory Cleanup',
      peakMemoryMB: (peakMemory - startMemory) / 1024 / 1024,
      memoryReclaimedMB: memoryReclaimed,
      success: memoryReclaimed > 0, // Should reclaim some memory
    };
  }

  /**
   * Generate comprehensive report combining all test results
   */
  private async generateComprehensiveReport(
    totalDuration: number,
  ): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      totalDuration: Math.round(totalDuration),
      summary: {
        totalSuites: this.suiteResults.length,
        successfulSuites: this.suiteResults.filter((r) => r.success).length,
        failedSuites: this.suiteResults.filter((r) => !r.success).length,
        overallSuccess: this.suiteResults.every((r) => r.success),
      },
      suiteResults: this.suiteResults,
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps(),
    };

    await this.saveReport(
      'comprehensive-test-report.json',
      JSON.stringify(report, null, 2),
    );

    // Also generate a human-readable summary
    await this.generateTextSummary(report);

    console.log('\n📊 Comprehensive test report generated');
    console.log(
      `   Overall Success: ${report.summary.overallSuccess ? '✅' : '❌'}`,
    );
    console.log(
      `   Successful Suites: ${report.summary.successfulSuites}/${report.summary.totalSuites}`,
    );
  }

  private generateRecommendations(): string[] {
    const recommendations = [];

    const failedSuites = this.suiteResults.filter((r) => !r.success);
    if (failedSuites.length > 0) {
      recommendations.push(
        `Priority: Fix failing test suites: ${failedSuites.map((s) => s.suiteName).join(', ')}`,
      );
    }

    const securitySuite = this.suiteResults.find(
      (r) => r.suiteName === 'Security Testing',
    );
    if (securitySuite?.results?.summary?.criticalIssues > 0) {
      recommendations.push(
        'URGENT: Address critical security vulnerabilities immediately',
      );
    }

    const loadTestSuite = this.suiteResults.find(
      (r) => r.suiteName === 'Load Testing',
    );
    if (loadTestSuite?.results?.summary?.averageResponseTime > 2000) {
      recommendations.push('Performance: Optimize slow API endpoints');
    }

    const memorySuite = this.suiteResults.find(
      (r) => r.suiteName === 'Memory Testing',
    );
    if (memorySuite?.results?.memoryGrowth?.heapUsedMB > 50) {
      recommendations.push('Memory: Investigate potential memory leaks');
    }

    return recommendations;
  }

  private generateNextSteps(): string[] {
    return [
      'Review detailed test reports in the output directory',
      'Address any critical security issues before deployment',
      'Optimize performance bottlenecks identified in load tests',
      'Set up CI/CD integration for automated testing',
      'Schedule regular performance and security testing',
    ];
  }

  private async generateTextSummary(report: any): Promise<void> {
    const summary = `
Backend Performance & Security Test Summary
==========================================

Test Execution Date: ${report.timestamp}
Total Duration: ${(report.totalDuration / 1000).toFixed(2)} seconds

Overall Status: ${report.summary.overallSuccess ? 'PASSED ✅' : 'FAILED ❌'}
Successful Test Suites: ${report.summary.successfulSuites}/${report.summary.totalSuites}

Test Suite Results:
${this.suiteResults
  .map(
    (suite) =>
      `  ${suite.suiteName}: ${suite.success ? 'PASSED ✅' : 'FAILED ❌'} (${(suite.duration / 1000).toFixed(2)}s)`,
  )
  .join('\n')}

Recommendations:
${report.recommendations.map((rec) => `  • ${rec}`).join('\n')}

Next Steps:
${report.nextSteps.map((step) => `  • ${step}`).join('\n')}

For detailed results, check the individual test reports in ${this.config.outputDir}/
`;

    await this.saveReport('test-summary.txt', summary);
  }

  // Helper Methods

  private async saveReport(filename: string, content: string): Promise<void> {
    const filePath = path.join(this.config.outputDir, filename);
    await fs.promises.writeFile(filePath, content, 'utf8');

    if (this.config.verbose) {
      console.log(`   📄 Report saved: ${filePath}`);
    }
  }

  private formatMemoryUsage(memUsage: NodeJS.MemoryUsage): any {
    return {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    };
  }

  private calculateMemoryGrowth(
    initial: NodeJS.MemoryUsage,
    final: NodeJS.MemoryUsage,
  ): any {
    return {
      rssMB: Math.round((final.rss - initial.rss) / 1024 / 1024),
      heapTotalMB: Math.round(
        (final.heapTotal - initial.heapTotal) / 1024 / 1024,
      ),
      heapUsedMB: Math.round((final.heapUsed - initial.heapUsed) / 1024 / 1024),
      externalMB: Math.round((final.external - initial.external) / 1024 / 1024),
    };
  }

  /**
   * Cleanup and shutdown
   */
  async cleanup(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }

    if (this.app) {
      await this.app.close();
    }

    console.log('🧹 Test environment cleaned up');
  }
}

// CLI Entry Point
if (require.main === module) {
  async function main() {
    const args = process.argv.slice(2);

    const config: Partial<TestRunnerConfig> = {
      runLoadTests: !args.includes('--no-load'),
      runSecurityTests: !args.includes('--no-security'),
      runDatabaseTests: !args.includes('--no-database'),
      runMemoryTests: !args.includes('--no-memory'),
      verbose: !args.includes('--quiet'),
      outputDir: './test-reports/performance',
    };

    const runner = new PerformanceTestRunner(config);

    try {
      await runner.initialize();
      await runner.runAllTests();

      console.log('\n🎉 All performance tests completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('\n❌ Performance test execution failed:', error);
      process.exit(1);
    } finally {
      await runner.cleanup();
    }
  }

  main().catch(console.error);
}
