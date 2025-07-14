/**
 * Comprehensive Load Testing Suite for Critical API Endpoints
 *
 * This suite tests the performance and scalability of the most critical
 * endpoints under various load conditions.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as request from 'supertest';
import { performance } from 'perf_hooks';
import { TestDataFactory } from '../test-data.factory';
import { createMockClerkClient, createMockAuthGuard } from '../index';

interface LoadTestResult {
  endpoint: string;
  method: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  memoryUsageStart: number;
  memoryUsageEnd: number;
  memoryGrowth: number;
}

interface LoadTestConfig {
  concurrentUsers: number;
  requestsPerUser: number;
  rampUpTime: number; // seconds
  testDuration: number; // seconds
}

export class LoadTestingSuite {
  private app: INestApplication;
  private prisma: PrismaService;
  private testFactory: TestDataFactory;
  private results: LoadTestResult[] = [];

  constructor(app: INestApplication) {
    this.app = app;
    this.prisma = app.get(PrismaService);
    this.testFactory = new TestDataFactory(this.prisma);
  }

  /**
   * Critical endpoints to test based on business importance and expected traffic
   */
  private getCriticalEndpoints() {
    return [
      // Authentication & Core User Operations
      { path: '/auth/me', method: 'GET', requiresAuth: true },
      { path: '/auth/register/client', method: 'POST', requiresAuth: false },

      // Dashboard & Analytics (High Traffic)
      { path: '/dashboard/user', method: 'GET', requiresAuth: true },
      { path: '/dashboard/therapist', method: 'GET', requiresAuth: true },

      // Messaging (Real-time Critical)
      { path: '/messaging/conversations', method: 'GET', requiresAuth: true },
      { path: '/messaging/conversations', method: 'POST', requiresAuth: true },

      // Booking System (Business Critical)
      { path: '/booking/meetings', method: 'GET', requiresAuth: true },
      { path: '/booking/meetings', method: 'POST', requiresAuth: true },
      { path: '/booking/availability', method: 'GET', requiresAuth: true },

      // Search (High Volume)
      { path: '/search/therapists', method: 'GET', requiresAuth: true },
      { path: '/search/posts', method: 'GET', requiresAuth: true },

      // Communities (Social Features)
      { path: '/communities', method: 'GET', requiresAuth: true },
      { path: '/posts', method: 'GET', requiresAuth: true },

      // Pre-assessment (ML Integration Critical)
      { path: '/pre-assessment', method: 'GET', requiresAuth: true },
      { path: '/pre-assessment', method: 'POST', requiresAuth: true },

      // File Operations (Resource Intensive)
      { path: '/files', method: 'GET', requiresAuth: true },

      // Notifications (High Frequency)
      { path: '/notifications', method: 'GET', requiresAuth: true },
      {
        path: '/notifications/unread-count',
        method: 'GET',
        requiresAuth: true,
      },
    ];
  }

  /**
   * Run load tests for all critical endpoints
   */
  async runFullLoadTestSuite(): Promise<LoadTestResult[]> {
    console.log('🚀 Starting Comprehensive Load Test Suite...');

    const configs = [
      // Light Load
      {
        concurrentUsers: 10,
        requestsPerUser: 20,
        rampUpTime: 5,
        testDuration: 30,
      },
      // Medium Load
      {
        concurrentUsers: 50,
        requestsPerUser: 40,
        rampUpTime: 10,
        testDuration: 60,
      },
      // Heavy Load
      {
        concurrentUsers: 100,
        requestsPerUser: 50,
        rampUpTime: 15,
        testDuration: 120,
      },
    ];

    for (const config of configs) {
      console.log(
        `\n📊 Testing with ${config.concurrentUsers} concurrent users...`,
      );
      await this.runLoadTestWithConfig(config);
    }

    return this.results;
  }

  /**
   * Run load test with specific configuration
   */
  private async runLoadTestWithConfig(config: LoadTestConfig): Promise<void> {
    const endpoints = this.getCriticalEndpoints();

    for (const endpoint of endpoints) {
      console.log(`\n🎯 Load testing ${endpoint.method} ${endpoint.path}...`);

      const result = await this.testEndpointLoad(endpoint, config);
      this.results.push(result);

      // Brief pause between endpoint tests to avoid overwhelming the system
      await this.sleep(2000);
    }
  }

  /**
   * Test a specific endpoint under load
   */
  private async testEndpointLoad(
    endpoint: { path: string; method: string; requiresAuth: boolean },
    config: LoadTestConfig,
  ): Promise<LoadTestResult> {
    const startMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    const startTime = performance.now();

    const promises: Promise<any>[] = [];
    const responseTimes: number[] = [];
    let successfulRequests = 0;
    let failedRequests = 0;

    // Create test user for authenticated requests
    const testUser = endpoint.requiresAuth
      ? await this.testFactory.createUser()
      : null;

    // Generate concurrent requests
    for (let user = 0; user < config.concurrentUsers; user++) {
      for (let req = 0; req < config.requestsPerUser; req++) {
        const delay =
          (user * config.rampUpTime * 1000) / config.concurrentUsers;

        promises.push(
          this.sleep(delay).then(() =>
            this.makeRequest(endpoint, testUser)
              .then((responseTime) => {
                responseTimes.push(responseTime);
                successfulRequests++;
              })
              .catch(() => {
                failedRequests++;
              }),
          ),
        );
      }
    }

    // Wait for all requests to complete
    await Promise.allSettled(promises);

    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    const totalTime = (endTime - startTime) / 1000; // seconds
    const totalRequests = successfulRequests + failedRequests;

    const result: LoadTestResult = {
      endpoint: `${endpoint.method} ${endpoint.path}`,
      method: endpoint.method,
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime:
        responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : 0,
      minResponseTime:
        responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime:
        responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      requestsPerSecond: totalRequests / totalTime,
      errorRate: (failedRequests / totalRequests) * 100,
      memoryUsageStart: startMemory,
      memoryUsageEnd: endMemory,
      memoryGrowth: endMemory - startMemory,
    };

    this.logTestResult(result);
    return result;
  }

  /**
   * Make a single request to an endpoint
   */
  private async makeRequest(
    endpoint: { path: string; method: string; requiresAuth: boolean },
    testUser?: any,
  ): Promise<number> {
    const startTime = performance.now();

    let requestBuilder = request(this.app.getHttpServer())[
      endpoint.method.toLowerCase()
    ](endpoint.path);

    // Add authentication if required
    if (endpoint.requiresAuth && testUser) {
      requestBuilder = requestBuilder.set(
        'Authorization',
        `Bearer ${testUser.id}`,
      );
    }

    // Add test data based on endpoint
    if (endpoint.method === 'POST') {
      requestBuilder = requestBuilder.send(
        this.getTestDataForEndpoint(endpoint.path),
      );
    }

    try {
      await requestBuilder.expect((res) => {
        // Accept 2xx and 3xx status codes as successful
        if (res.status >= 200 && res.status < 400) {
          return;
        }
        // Accept 401/403 for auth endpoints as they might be testing invalid tokens
        if (
          (res.status === 401 || res.status === 403) &&
          endpoint.requiresAuth
        ) {
          return;
        }
        throw new Error(`Unexpected status: ${res.status}`);
      });

      return performance.now() - startTime;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get appropriate test data for POST endpoints
   */
  private getTestDataForEndpoint(path: string): any {
    switch (path) {
      case '/auth/register/client':
        return {
          email: `test${Date.now()}@example.com`,
          firstName: 'Test',
          lastName: 'User',
          password: 'TestPassword123!',
        };

      case '/messaging/conversations':
        return {
          participantId: 'test-participant-id',
          type: 'PRIVATE',
        };

      case '/booking/meetings':
        return {
          therapistId: 'test-therapist-id',
          date: new Date().toISOString(),
          duration: 60,
          notes: 'Test booking',
        };

      case '/pre-assessment':
        return {
          questionnaires: {
            PHQ9: [1, 2, 1, 0, 2, 1, 3, 2, 1],
            GAD7: [2, 1, 3, 2, 1, 2, 3],
          },
        };

      case '/posts':
        return {
          content: 'Test post content',
          roomId: 'test-room-id',
        };

      default:
        return {};
    }
  }

  /**
   * Log test result in a formatted way
   */
  private logTestResult(result: LoadTestResult): void {
    console.log(`
📈 Load Test Results for ${result.endpoint}:
   Total Requests: ${result.totalRequests}
   Success Rate: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(2)}%
   Error Rate: ${result.errorRate.toFixed(2)}%
   Avg Response Time: ${result.averageResponseTime.toFixed(2)}ms
   Min Response Time: ${result.minResponseTime.toFixed(2)}ms
   Max Response Time: ${result.maxResponseTime.toFixed(2)}ms
   Requests/Second: ${result.requestsPerSecond.toFixed(2)}
   Memory Growth: ${result.memoryGrowth.toFixed(2)}MB
    `);
  }

  /**
   * Generate comprehensive performance report
   */
  generatePerformanceReport(): string {
    const report = {
      summary: {
        totalEndpointsTested: this.results.length,
        overallSuccessRate: this.calculateOverallSuccessRate(),
        averageResponseTime: this.calculateAverageResponseTime(),
        highestMemoryGrowth: this.getHighestMemoryGrowth(),
        slowestEndpoint: this.getSlowestEndpoint(),
        fastestEndpoint: this.getFastestEndpoint(),
      },
      performanceThresholds: this.checkPerformanceThresholds(),
      recommendations: this.generateRecommendations(),
      detailedResults: this.results,
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * Check if endpoints meet performance thresholds
   */
  private checkPerformanceThresholds(): any {
    const thresholds = {
      maxAverageResponseTime: 2000, // 2 seconds
      maxErrorRate: 5, // 5%
      maxMemoryGrowth: 50, // 50MB
      minRequestsPerSecond: 10,
    };

    const failingEndpoints = this.results.filter(
      (result) =>
        result.averageResponseTime > thresholds.maxAverageResponseTime ||
        result.errorRate > thresholds.maxErrorRate ||
        result.memoryGrowth > thresholds.maxMemoryGrowth ||
        result.requestsPerSecond < thresholds.minRequestsPerSecond,
    );

    return {
      thresholds,
      passingEndpoints: this.results.length - failingEndpoints.length,
      failingEndpoints: failingEndpoints.map((r) => r.endpoint),
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check for slow endpoints
    const slowEndpoints = this.results.filter(
      (r) => r.averageResponseTime > 1000,
    );
    if (slowEndpoints.length > 0) {
      recommendations.push(
        `Optimize slow endpoints: ${slowEndpoints.map((r) => r.endpoint).join(', ')}`,
      );
    }

    // Check for high error rates
    const errorProneEndpoints = this.results.filter((r) => r.errorRate > 2);
    if (errorProneEndpoints.length > 0) {
      recommendations.push(
        `Investigate error-prone endpoints: ${errorProneEndpoints.map((r) => r.endpoint).join(', ')}`,
      );
    }

    // Check for memory leaks
    const memoryLeakEndpoints = this.results.filter((r) => r.memoryGrowth > 25);
    if (memoryLeakEndpoints.length > 0) {
      recommendations.push(
        `Check for memory leaks in: ${memoryLeakEndpoints.map((r) => r.endpoint).join(', ')}`,
      );
    }

    // Check for low throughput
    const lowThroughputEndpoints = this.results.filter(
      (r) => r.requestsPerSecond < 15,
    );
    if (lowThroughputEndpoints.length > 0) {
      recommendations.push(
        `Improve throughput for: ${lowThroughputEndpoints.map((r) => r.endpoint).join(', ')}`,
      );
    }

    return recommendations;
  }

  // Helper calculation methods
  private calculateOverallSuccessRate(): number {
    const total = this.results.reduce((sum, r) => sum + r.totalRequests, 0);
    const successful = this.results.reduce(
      (sum, r) => sum + r.successfulRequests,
      0,
    );
    return (successful / total) * 100;
  }

  private calculateAverageResponseTime(): number {
    return (
      this.results.reduce((sum, r) => sum + r.averageResponseTime, 0) /
      this.results.length
    );
  }

  private getHighestMemoryGrowth(): { endpoint: string; growth: number } {
    const highest = this.results.reduce((max, r) =>
      r.memoryGrowth > max.memoryGrowth ? r : max,
    );
    return { endpoint: highest.endpoint, growth: highest.memoryGrowth };
  }

  private getSlowestEndpoint(): { endpoint: string; time: number } {
    const slowest = this.results.reduce((max, r) =>
      r.averageResponseTime > max.averageResponseTime ? r : max,
    );
    return { endpoint: slowest.endpoint, time: slowest.averageResponseTime };
  }

  private getFastestEndpoint(): { endpoint: string; time: number } {
    const fastest = this.results.reduce((min, r) =>
      r.averageResponseTime < min.averageResponseTime ? r : min,
    );
    return { endpoint: fastest.endpoint, time: fastest.averageResponseTime };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
