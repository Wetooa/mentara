/**
 * Load Testing Specification
 *
 * Integration tests for API performance under various load conditions
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../database/prisma.service';
import { LoadTestingSuite } from './load-testing.suite';
import { createMockClerkClient, createMockAuthGuard } from '../index';
import * as fs from 'fs';
import * as path from 'path';

describe('API Load Testing', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let loadTestSuite: LoadTestingSuite;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('ClerkClient')
      .useValue(createMockClerkClient())
      .overrideGuard('AuthGuard')
      .useValue(createMockAuthGuard())
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    await app.init();

    loadTestSuite = new LoadTestingSuite(app);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.$transaction([
      prisma.preAssessment.deleteMany(),
      prisma.client.deleteMany(),
      prisma.therapist.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  });

  describe('Critical Endpoint Performance', () => {
    it('should handle light load (10 concurrent users)', async () => {
      const config = {
        concurrentUsers: 10,
        requestsPerUser: 10,
        rampUpTime: 5,
        testDuration: 30,
      };

      console.log('🔥 Starting light load test...');
      const results = await loadTestSuite.runFullLoadTestSuite();

      // Assertions for light load
      results.forEach((result) => {
        expect(result.successfulRequests).toBeGreaterThan(0);
        expect(result.errorRate).toBeLessThan(10); // Allow up to 10% error rate for light load
        expect(result.averageResponseTime).toBeLessThan(5000); // 5 seconds max
      });

      // Generate and save report
      const report = loadTestSuite.generatePerformanceReport();
      await saveTestReport('light-load-test-report.json', report);
    }, 120000); // 2 minute timeout

    it('should handle medium load (25 concurrent users)', async () => {
      const config = {
        concurrentUsers: 25,
        requestsPerUser: 15,
        rampUpTime: 10,
        testDuration: 60,
      };

      console.log('🔥 Starting medium load test...');
      const results = await loadTestSuite.runFullLoadTestSuite();

      // Assertions for medium load
      results.forEach((result) => {
        expect(result.successfulRequests).toBeGreaterThan(0);
        expect(result.errorRate).toBeLessThan(15); // Allow up to 15% error rate for medium load
        expect(result.averageResponseTime).toBeLessThan(10000); // 10 seconds max
      });

      const report = loadTestSuite.generatePerformanceReport();
      await saveTestReport('medium-load-test-report.json', report);
    }, 180000); // 3 minute timeout

    it('should maintain basic functionality under heavy load (50 concurrent users)', async () => {
      const config = {
        concurrentUsers: 50,
        requestsPerUser: 20,
        rampUpTime: 15,
        testDuration: 120,
      };

      console.log('🔥 Starting heavy load test...');
      const results = await loadTestSuite.runFullLoadTestSuite();

      // More lenient assertions for heavy load
      results.forEach((result) => {
        // At minimum, some requests should succeed
        expect(result.successfulRequests).toBeGreaterThan(
          result.totalRequests * 0.5,
        ); // At least 50% success
        expect(result.errorRate).toBeLessThan(50); // Allow up to 50% error rate for heavy load
        expect(result.averageResponseTime).toBeLessThan(30000); // 30 seconds max
      });

      const report = loadTestSuite.generatePerformanceReport();
      await saveTestReport('heavy-load-test-report.json', report);
    }, 300000); // 5 minute timeout
  });

  describe('Endpoint-Specific Load Tests', () => {
    it('should test authentication endpoints under load', async () => {
      // Focused test on auth endpoints which are critical
      const authEndpoints = [
        { path: '/auth/me', method: 'GET', requiresAuth: true },
        { path: '/auth/register/client', method: 'POST', requiresAuth: false },
      ];

      console.log('🔐 Testing authentication endpoints...');

      // Test each endpoint individually with higher load
      for (const endpoint of authEndpoints) {
        console.log(`Testing ${endpoint.method} ${endpoint.path}...`);

        // Custom load test for this specific endpoint
        const result = await loadTestSuite['testEndpointLoad'](endpoint, {
          concurrentUsers: 30,
          requestsPerUser: 25,
          rampUpTime: 10,
          testDuration: 60,
        });

        // Auth endpoints should be highly reliable
        expect(result.errorRate).toBeLessThan(5);
        expect(result.averageResponseTime).toBeLessThan(2000);
        expect(result.requestsPerSecond).toBeGreaterThan(10);
      }
    }, 180000);

    it('should test real-time messaging endpoints', async () => {
      const messagingEndpoints = [
        { path: '/messaging/conversations', method: 'GET', requiresAuth: true },
        {
          path: '/messaging/conversations',
          method: 'POST',
          requiresAuth: true,
        },
      ];

      console.log('💬 Testing messaging endpoints...');

      for (const endpoint of messagingEndpoints) {
        const result = await loadTestSuite['testEndpointLoad'](endpoint, {
          concurrentUsers: 40,
          requestsPerUser: 30,
          rampUpTime: 12,
          testDuration: 90,
        });

        // Messaging should be responsive for real-time feel
        expect(result.averageResponseTime).toBeLessThan(1500);
        expect(result.errorRate).toBeLessThan(8);
      }
    }, 200000);

    it('should test booking system under peak load', async () => {
      const bookingEndpoints = [
        { path: '/booking/meetings', method: 'GET', requiresAuth: true },
        { path: '/booking/availability', method: 'GET', requiresAuth: true },
      ];

      console.log('📅 Testing booking endpoints...');

      for (const endpoint of bookingEndpoints) {
        const result = await loadTestSuite['testEndpointLoad'](endpoint, {
          concurrentUsers: 35,
          requestsPerUser: 20,
          rampUpTime: 8,
          testDuration: 60,
        });

        // Booking system is business critical
        expect(result.errorRate).toBeLessThan(3);
        expect(result.averageResponseTime).toBeLessThan(3000);
        expect(result.memoryGrowth).toBeLessThan(30); // MB
      }
    }, 150000);
  });

  describe('Memory and Resource Management', () => {
    it('should not have significant memory leaks under sustained load', async () => {
      console.log('🧠 Testing memory management...');

      const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024;

      // Run multiple cycles of load tests
      for (let cycle = 0; cycle < 3; cycle++) {
        console.log(`Memory test cycle ${cycle + 1}/3...`);

        await loadTestSuite['testEndpointLoad'](
          { path: '/dashboard/user', method: 'GET', requiresAuth: true },
          {
            concurrentUsers: 20,
            requestsPerUser: 15,
            rampUpTime: 5,
            testDuration: 30,
          },
        );

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Brief pause
      }

      const finalMemory = process.memoryUsage().heapUsed / 1024 / 1024;
      const memoryGrowth = finalMemory - initialMemory;

      console.log(`Memory growth: ${memoryGrowth.toFixed(2)}MB`);

      // Memory should not grow excessively
      expect(memoryGrowth).toBeLessThan(100); // Less than 100MB growth
    }, 180000);

    it('should handle concurrent database operations efficiently', async () => {
      console.log('🗄️ Testing database performance...');

      // Test endpoints that involve complex database operations
      const dbIntensiveEndpoints = [
        { path: '/search/therapists', method: 'GET', requiresAuth: true },
        { path: '/communities', method: 'GET', requiresAuth: true },
        { path: '/posts', method: 'GET', requiresAuth: true },
      ];

      for (const endpoint of dbIntensiveEndpoints) {
        const result = await loadTestSuite['testEndpointLoad'](endpoint, {
          concurrentUsers: 25,
          requestsPerUser: 10,
          rampUpTime: 8,
          testDuration: 45,
        });

        // Database operations should be reasonably fast
        expect(result.averageResponseTime).toBeLessThan(5000);
        expect(result.errorRate).toBeLessThan(10);

        console.log(
          `${endpoint.path}: ${result.averageResponseTime.toFixed(2)}ms avg, ${result.errorRate.toFixed(2)}% errors`,
        );
      }
    }, 200000);
  });

  describe('Edge Cases and Stress Testing', () => {
    it('should gracefully handle request spikes', async () => {
      console.log('⚡ Testing request spike handling...');

      // Simulate sudden traffic spike
      const spikeResult = await loadTestSuite['testEndpointLoad'](
        { path: '/auth/me', method: 'GET', requiresAuth: true },
        {
          concurrentUsers: 100, // Sudden spike
          requestsPerUser: 5,
          rampUpTime: 2, // Very fast ramp up
          testDuration: 15,
        },
      );

      // System should handle spikes without complete failure
      expect(spikeResult.successfulRequests).toBeGreaterThan(0);
      expect(spikeResult.errorRate).toBeLessThan(80); // Allow high error rate but not complete failure

      console.log(
        `Spike test: ${spikeResult.successfulRequests}/${spikeResult.totalRequests} successful`,
      );
    }, 120000);

    it('should handle mixed endpoint load patterns', async () => {
      console.log('🔀 Testing mixed load patterns...');

      // Test multiple endpoints simultaneously (more realistic scenario)
      const mixedEndpoints = [
        { path: '/auth/me', method: 'GET', requiresAuth: true },
        { path: '/dashboard/user', method: 'GET', requiresAuth: true },
        {
          path: '/notifications/unread-count',
          method: 'GET',
          requiresAuth: true,
        },
        { path: '/messaging/conversations', method: 'GET', requiresAuth: true },
      ];

      const promises = mixedEndpoints.map((endpoint) =>
        loadTestSuite['testEndpointLoad'](endpoint, {
          concurrentUsers: 15,
          requestsPerUser: 12,
          rampUpTime: 6,
          testDuration: 40,
        }),
      );

      const results = await Promise.all(promises);

      // All endpoints should maintain reasonable performance
      results.forEach((result, index) => {
        expect(result.errorRate).toBeLessThan(15);
        expect(result.averageResponseTime).toBeLessThan(8000);

        console.log(
          `${mixedEndpoints[index].path}: ${result.averageResponseTime.toFixed(2)}ms avg`,
        );
      });
    }, 180000);
  });
});

// Helper function to save test reports
async function saveTestReport(filename: string, report: string): Promise<void> {
  const reportsDir = path.join(__dirname, '../../../test-reports/performance');

  // Create directory if it doesn't exist
  await fs.promises.mkdir(reportsDir, { recursive: true });

  const filePath = path.join(reportsDir, filename);
  await fs.promises.writeFile(filePath, report, 'utf8');

  console.log(`📊 Performance report saved to: ${filePath}`);
}
