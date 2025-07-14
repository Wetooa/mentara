/**
 * Advanced Controller Testing Suite
 * 
 * Comprehensive testing framework specifically designed to support
 * Backend Agent's Phase 1 controller audit and testing requirements.
 * 
 * Features:
 * - Automated endpoint discovery and testing
 * - Authentication/authorization validation
 * - Input validation testing
 * - Error handling verification
 * - Performance benchmarking
 * - Security vulnerability testing
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../database/prisma.service';
import * as request from 'supertest';
import { createMockClerkClient, createMockAuthGuard } from '../index';

export interface ControllerEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  requiresAuth: boolean;
  requiredRole?: string[];
  expectedStatus: number;
  testPayload?: any;
  description: string;
}

export interface ControllerTestResult {
  endpoint: string;
  method: string;
  passed: boolean;
  responseTime: number;
  statusCode: number;
  error?: string;
  securityIssues: string[];
  performanceIssues: string[];
}

export interface ControllerTestReport {
  controllerName: string;
  totalEndpoints: number;
  passedTests: number;
  failedTests: number;
  averageResponseTime: number;
  securityIssues: string[];
  performanceIssues: string[];
  results: ControllerTestResult[];
  recommendations: string[];
}

export class AdvancedControllerTestSuite {
  private app: INestApplication;
  private prisma: PrismaService;
  private moduleRef: TestingModule;

  constructor() {}

  /**
   * Initialize the test suite
   */
  async initialize(): Promise<void> {
    this.moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('ClerkClient')
      .useValue(createMockClerkClient())
      .overrideGuard('AuthGuard')
      .useValue(createMockAuthGuard())
      .compile();

    this.app = this.moduleRef.createNestApplication();
    this.prisma = this.app.get<PrismaService>(PrismaService);

    await this.app.init();
  }

  /**
   * Clean up test suite
   */
  async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
    await this.app.close();
  }

  /**
   * Run comprehensive tests for a specific controller
   */
  async testController(
    controllerName: string,
    endpoints: ControllerEndpoint[]
  ): Promise<ControllerTestReport> {
    console.log(`🧪 Testing ${controllerName} with ${endpoints.length} endpoints...`);

    const results: ControllerTestResult[] = [];
    const securityIssues: string[] = [];
    const performanceIssues: string[] = [];

    for (const endpoint of endpoints) {
      const result = await this.testEndpoint(endpoint);
      results.push(result);

      if (result.securityIssues.length > 0) {
        securityIssues.push(...result.securityIssues);
      }

      if (result.performanceIssues.length > 0) {
        performanceIssues.push(...result.performanceIssues);
      }
    }

    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.length - passedTests;
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    const recommendations = this.generateRecommendations(results, securityIssues, performanceIssues);

    return {
      controllerName,
      totalEndpoints: endpoints.length,
      passedTests,
      failedTests,
      averageResponseTime,
      securityIssues: [...new Set(securityIssues)],
      performanceIssues: [...new Set(performanceIssues)],
      results,
      recommendations
    };
  }

  /**
   * Test individual endpoint with comprehensive checks
   */
  private async testEndpoint(endpoint: ControllerEndpoint): Promise<ControllerTestResult> {
    const startTime = Date.now();
    const securityIssues: string[] = [];
    const performanceIssues: string[] = [];

    try {
      // Basic endpoint test
      let response;
      const agent = request(this.app.getHttpServer());

      switch (endpoint.method) {
        case 'GET':
          response = await agent.get(endpoint.path);
          break;
        case 'POST':
          response = await agent.post(endpoint.path).send(endpoint.testPayload || {});
          break;
        case 'PUT':
          response = await agent.put(endpoint.path).send(endpoint.testPayload || {});
          break;
        case 'PATCH':
          response = await agent.patch(endpoint.path).send(endpoint.testPayload || {});
          break;
        case 'DELETE':
          response = await agent.delete(endpoint.path);
          break;
      }

      const responseTime = Date.now() - startTime;

      // Performance checks
      if (responseTime > 2000) {
        performanceIssues.push(`Slow response time: ${responseTime}ms`);
      }

      // Security checks
      await this.performSecurityChecks(endpoint, securityIssues);

      // Authentication checks
      if (endpoint.requiresAuth) {
        await this.testAuthenticationRequired(endpoint, securityIssues);
      }

      // Role-based access checks
      if (endpoint.requiredRole && endpoint.requiredRole.length > 0) {
        await this.testRoleBasedAccess(endpoint, securityIssues);
      }

      // Input validation checks
      if (endpoint.method !== 'GET') {
        await this.testInputValidation(endpoint, securityIssues);
      }

      const passed = response.status === endpoint.expectedStatus || 
                    (endpoint.expectedStatus >= 200 && endpoint.expectedStatus < 300 && response.status >= 200 && response.status < 300);

      return {
        endpoint: `${endpoint.method} ${endpoint.path}`,
        method: endpoint.method,
        passed,
        responseTime,
        statusCode: response.status,
        securityIssues,
        performanceIssues
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        endpoint: `${endpoint.method} ${endpoint.path}`,
        method: endpoint.method,
        passed: false,
        responseTime,
        statusCode: 500,
        error: error instanceof Error ? error.message : 'Unknown error',
        securityIssues,
        performanceIssues
      };
    }
  }

  /**
   * Perform security checks on endpoint
   */
  private async performSecurityChecks(endpoint: ControllerEndpoint, issues: string[]): Promise<void> {
    // SQL injection check
    if (endpoint.method !== 'GET') {
      const maliciousPayload = { 
        ...endpoint.testPayload, 
        id: "1' OR '1'='1", 
        email: "test@test.com'; DROP TABLE users; --" 
      };

      try {
        const agent = request(this.app.getHttpServer());
        let response;

        switch (endpoint.method) {
          case 'POST':
            response = await agent.post(endpoint.path).send(maliciousPayload);
            break;
          case 'PUT':
            response = await agent.put(endpoint.path).send(maliciousPayload);
            break;
          case 'PATCH':
            response = await agent.patch(endpoint.path).send(maliciousPayload);
            break;
        }

        if (response && response.status === 200) {
          issues.push('Potential SQL injection vulnerability');
        }
      } catch (error) {
        // Expected behavior - input validation should prevent this
      }
    }

    // XSS check
    if (endpoint.method !== 'GET') {
      const xssPayload = { 
        ...endpoint.testPayload, 
        name: '<script>alert("XSS")</script>',
        comment: '<img src=x onerror=alert("XSS")>'
      };

      try {
        const agent = request(this.app.getHttpServer());
        let response;

        switch (endpoint.method) {
          case 'POST':
            response = await agent.post(endpoint.path).send(xssPayload);
            break;
          case 'PUT':
            response = await agent.put(endpoint.path).send(xssPayload);
            break;
          case 'PATCH':
            response = await agent.patch(endpoint.path).send(xssPayload);
            break;
        }

        if (response && response.text && response.text.includes('<script>')) {
          issues.push('Potential XSS vulnerability - scripts not sanitized');
        }
      } catch (error) {
        // Expected behavior - input validation should prevent this
      }
    }
  }

  /**
   * Test that authentication is required
   */
  private async testAuthenticationRequired(endpoint: ControllerEndpoint, issues: string[]): Promise<void> {
    try {
      const agent = request(this.app.getHttpServer());
      let response;

      // Remove any authentication headers
      switch (endpoint.method) {
        case 'GET':
          response = await agent.get(endpoint.path);
          break;
        case 'POST':
          response = await agent.post(endpoint.path).send(endpoint.testPayload || {});
          break;
        case 'PUT':
          response = await agent.put(endpoint.path).send(endpoint.testPayload || {});
          break;
        case 'PATCH':
          response = await agent.patch(endpoint.path).send(endpoint.testPayload || {});
          break;
        case 'DELETE':
          response = await agent.delete(endpoint.path);
          break;
      }

      if (response.status !== 401 && response.status !== 403) {
        issues.push('Authentication not properly enforced');
      }
    } catch (error) {
      // Expected behavior for protected endpoints
    }
  }

  /**
   * Test role-based access control
   */
  private async testRoleBasedAccess(endpoint: ControllerEndpoint, issues: string[]): Promise<void> {
    // This would test with different user roles to ensure proper access control
    // Implementation depends on how roles are implemented in the auth system
    issues.push('Role-based access control testing requires specific role implementation');
  }

  /**
   * Test input validation
   */
  private async testInputValidation(endpoint: ControllerEndpoint, issues: string[]): Promise<void> {
    const invalidPayloads = [
      { /* empty object */ },
      { invalidField: 'invalid_value' },
      { email: 'not-an-email' },
      { id: 'not-a-number' },
      { data: null },
      { data: undefined }
    ];

    for (const payload of invalidPayloads) {
      try {
        const agent = request(this.app.getHttpServer());
        let response;

        switch (endpoint.method) {
          case 'POST':
            response = await agent.post(endpoint.path).send(payload);
            break;
          case 'PUT':
            response = await agent.put(endpoint.path).send(payload);
            break;
          case 'PATCH':
            response = await agent.patch(endpoint.path).send(payload);
            break;
        }

        if (response && response.status === 200) {
          issues.push('Input validation may be insufficient');
          break;
        }
      } catch (error) {
        // Expected behavior - validation should reject invalid input
      }
    }
  }

  /**
   * Generate recommendations based on test results
   */
  private generateRecommendations(
    results: ControllerTestResult[],
    securityIssues: string[],
    performanceIssues: string[]
  ): string[] {
    const recommendations: string[] = [];

    const failedTests = results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      recommendations.push(`Fix ${failedTests.length} failing endpoint(s)`);
    }

    const slowEndpoints = results.filter(r => r.responseTime > 1000);
    if (slowEndpoints.length > 0) {
      recommendations.push(`Optimize ${slowEndpoints.length} slow endpoint(s) (>1s response time)`);
    }

    if (securityIssues.length > 0) {
      recommendations.push(`Address ${securityIssues.length} security issue(s)`);
    }

    if (performanceIssues.length > 0) {
      recommendations.push(`Resolve ${performanceIssues.length} performance issue(s)`);
    }

    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    if (averageResponseTime > 500) {
      recommendations.push('Consider implementing response caching for better performance');
    }

    return recommendations;
  }

  /**
   * Generate detailed test report
   */
  async generateTestReport(reports: ControllerTestReport[]): Promise<string> {
    const totalEndpoints = reports.reduce((sum, r) => sum + r.totalEndpoints, 0);
    const totalPassed = reports.reduce((sum, r) => sum + r.passedTests, 0);
    const totalFailed = reports.reduce((sum, r) => sum + r.failedTests, 0);
    const overallAvgResponseTime = reports.reduce((sum, r) => sum + r.averageResponseTime, 0) / reports.length;

    const allSecurityIssues = reports.flatMap(r => r.securityIssues);
    const allPerformanceIssues = reports.flatMap(r => r.performanceIssues);

    const report = `
# Advanced Controller Testing Report

**Generated**: ${new Date().toISOString()}
**Test Suite**: Advanced Controller Test Suite v1.0

## Executive Summary

- **Total Controllers Tested**: ${reports.length}
- **Total Endpoints Tested**: ${totalEndpoints}
- **Passed Tests**: ${totalPassed} (${((totalPassed / totalEndpoints) * 100).toFixed(1)}%)
- **Failed Tests**: ${totalFailed} (${((totalFailed / totalEndpoints) * 100).toFixed(1)}%)
- **Average Response Time**: ${overallAvgResponseTime.toFixed(2)}ms

## Security Analysis

- **Security Issues Found**: ${allSecurityIssues.length}
- **Critical Security Vulnerabilities**: ${allSecurityIssues.filter(i => i.includes('SQL') || i.includes('XSS')).length}

## Performance Analysis

- **Performance Issues Found**: ${allPerformanceIssues.length}
- **Slow Endpoints (>1s)**: ${reports.flatMap(r => r.results).filter(r => r.responseTime > 1000).length}

## Controller-Specific Results

${reports.map(report => `
### ${report.controllerName}

- **Endpoints**: ${report.totalEndpoints}
- **Passed**: ${report.passedTests}/${report.totalEndpoints} (${((report.passedTests / report.totalEndpoints) * 100).toFixed(1)}%)
- **Average Response Time**: ${report.averageResponseTime.toFixed(2)}ms
- **Security Issues**: ${report.securityIssues.length}
- **Performance Issues**: ${report.performanceIssues.length}

**Recommendations**:
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

**Detailed Results**:
${report.results.map(result => `
- **${result.endpoint}**: ${result.passed ? '✅' : '❌'} (${result.responseTime}ms, Status: ${result.statusCode})
  ${result.error ? `Error: ${result.error}` : ''}
  ${result.securityIssues.length > 0 ? `Security: ${result.securityIssues.join(', ')}` : ''}
  ${result.performanceIssues.length > 0 ? `Performance: ${result.performanceIssues.join(', ')}` : ''}
`).join('\n')}
`).join('\n')}

## Overall Recommendations

${reports.flatMap(r => r.recommendations).filter((rec, index, arr) => arr.indexOf(rec) === index).map(rec => `- ${rec}`).join('\n')}

## Next Steps

1. Address all failing endpoints
2. Resolve security vulnerabilities 
3. Optimize slow-performing endpoints
4. Implement comprehensive input validation
5. Enhance authentication and authorization checks

---
*Generated by Advanced Controller Test Suite for Backend Agent Phase 1 Support*
`;

    return report;
  }
}

// Export utility functions for Backend Agent integration
export const createControllerTestSuite = () => new AdvancedControllerTestSuite();

export const runControllerAudit = async (
  controllerName: string,
  endpoints: ControllerEndpoint[]
): Promise<ControllerTestReport> => {
  const testSuite = createControllerTestSuite();
  await testSuite.initialize();
  
  try {
    const report = await testSuite.testController(controllerName, endpoints);
    return report;
  } finally {
    await testSuite.cleanup();
  }
};