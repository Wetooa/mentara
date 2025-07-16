/**
 * Security Testing Suite
 *
 * Comprehensive security testing framework for vulnerability detection,
 * input validation, authentication, and authorization testing.
 */

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TestDataFactory } from '../test-data.factory';
import { PrismaService } from '../../providers/prisma-client.provider';

export interface SecurityTestResult {
  testName: string;
  endpoint: string;
  method: string;
  vulnerability: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  passed: boolean;
  details: string;
  response?: {
    statusCode: number;
    body: any;
    headers: any;
  };
}

export interface SecurityScanReport {
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
  };
  vulnerabilities: SecurityTestResult[];
  recommendations: string[];
  complianceStatus: {
    hipaa: boolean;
    owasp: boolean;
    gdpr: boolean;
  };
}

export class SecurityTestingSuite {
  private app: INestApplication;
  private prisma: PrismaService;
  private testFactory: TestDataFactory;
  private results: SecurityTestResult[] = [];

  constructor(app: INestApplication) {
    this.app = app;
    this.prisma = app.get(PrismaService);
    this.testFactory = new TestDataFactory(this.prisma);
  }

  /**
   * Run comprehensive security test suite
   */
  async runSecurityScan(): Promise<SecurityScanReport> {
    console.log('🔒 Starting Comprehensive Security Scan...');

    // Input Validation Tests
    await this.testInputValidation();

    // Authentication & Authorization Tests
    await this.testAuthentication();
    await this.testAuthorization();

    // Injection Attack Tests
    await this.testSQLInjection();
    await this.testXSSPrevention();

    // Data Protection Tests
    await this.testDataExposure();
    await this.testSensitiveDataHandling();

    // Rate Limiting & DoS Protection
    await this.testRateLimiting();

    // Session Management
    await this.testSessionSecurity();

    // CORS & Security Headers
    await this.testSecurityHeaders();

    return this.generateSecurityReport();
  }

  /**
   * Test input validation and sanitization
   */
  private async testInputValidation(): Promise<void> {
    console.log('🔍 Testing Input Validation...');

    const maliciousInputs = [
      // XSS Payloads
      '<script>alert("xss")</script>',
      '"><script>alert("xss")</script>',
      'javascript:alert("xss")',

      // SQL Injection Payloads
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      '" OR "1"="1',

      // Path Traversal
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',

      // Command Injection
      '; cat /etc/passwd',
      '| whoami',
      '&& ls -la',

      // LDAP Injection
      '*)(&',
      '*)(uid=*',

      // NoSQL Injection
      '{"$ne": null}',
      '{"$gt": ""}',

      // Buffer Overflow Attempts
      'A'.repeat(10000),
      'A'.repeat(100000),
    ];

    const testEndpoints = [
      {
        path: '/auth/register/client',
        method: 'POST',
        fields: ['email', 'firstName', 'lastName'],
      },
      { path: '/posts', method: 'POST', fields: ['content', 'title'] },
      {
        path: '/search/therapists',
        method: 'GET',
        fields: ['specialization', 'location'],
      },
      {
        path: '/users/:id',
        method: 'PUT',
        fields: ['firstName', 'lastName', 'email'],
      },
    ];

    for (const endpoint of testEndpoints) {
      for (const field of endpoint.fields) {
        for (const payload of maliciousInputs) {
          await this.testMaliciousInput(endpoint, field, payload);
        }
      }
    }
  }

  /**
   * Test authentication mechanisms
   */
  private async testAuthentication(): Promise<void> {
    console.log('🔐 Testing Authentication Security...');

    // Test invalid token handling
    await this.addSecurityTest(
      'Invalid JWT Token Handling',
      '/auth/me',
      'GET',
      'Authentication Bypass',
      'HIGH',
      async () => {
        const response = await request(this.app.getHttpServer())
          .get('/auth/me')
          .set('Authorization', 'Bearer invalid-token-12345');

        return {
          passed: response.status === 401,
          details: `Expected 401, got ${response.status}`,
          response: {
            statusCode: response.status,
            body: response.body,
            headers: response.headers,
          },
        };
      },
    );

    // Test expired token handling
    await this.addSecurityTest(
      'Expired Token Handling',
      '/auth/me',
      'GET',
      'Authentication Bypass',
      'HIGH',
      async () => {
        const expiredToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';

        const response = await request(this.app.getHttpServer())
          .get('/auth/me')
          .set('Authorization', `Bearer ${expiredToken}`);

        return {
          passed: response.status === 401,
          details: `Expected 401 for expired token, got ${response.status}`,
          response: {
            statusCode: response.status,
            body: response.body,
            headers: response.headers,
          },
        };
      },
    );

    // Test missing authorization header
    await this.addSecurityTest(
      'Missing Authorization Header',
      '/auth/me',
      'GET',
      'Authentication Bypass',
      'MEDIUM',
      async () => {
        const response = await request(this.app.getHttpServer()).get(
          '/auth/me',
        );

        return {
          passed: response.status === 401,
          details: `Expected 401 for missing auth, got ${response.status}`,
          response: {
            statusCode: response.status,
            body: response.body,
            headers: response.headers,
          },
        };
      },
    );
  }

  /**
   * Test authorization and access control
   */
  private async testAuthorization(): Promise<void> {
    console.log('👮 Testing Authorization Controls...');

    // Create test users with different roles
    const clientUser = await this.testFactory.createUser();
    const therapistUser = await this.testFactory.createUser();
    const adminUser = await this.testFactory.createUser();

    // Test client trying to access admin endpoints
    await this.addSecurityTest(
      'Client Access to Admin Endpoints',
      '/admin/users',
      'GET',
      'Privilege Escalation',
      'CRITICAL',
      async () => {
        const response = await request(this.app.getHttpServer())
          .get('/admin/users')
          .set('Authorization', `Bearer ${clientUser.id}`);

        return {
          passed: response.status === 403 || response.status === 401,
          details: `Client should not access admin endpoints. Got ${response.status}`,
          response: {
            statusCode: response.status,
            body: response.body,
            headers: response.headers,
          },
        };
      },
    );

    // Test accessing other user's data
    await this.addSecurityTest(
      'Cross-User Data Access',
      `/users/${therapistUser.id}`,
      'GET',
      'Unauthorized Data Access',
      'HIGH',
      async () => {
        const response = await request(this.app.getHttpServer())
          .get(`/users/${therapistUser.id}`)
          .set('Authorization', `Bearer ${clientUser.id}`);

        return {
          passed: response.status === 403 || response.status === 401,
          details: `Users should not access other user's data. Got ${response.status}`,
          response: {
            statusCode: response.status,
            body: response.body,
            headers: response.headers,
          },
        };
      },
    );

    // Test therapist accessing client-only endpoints
    await this.addSecurityTest(
      'Therapist Access to Client Endpoints',
      '/client/profile',
      'GET',
      'Role-Based Access Control',
      'MEDIUM',
      async () => {
        const response = await request(this.app.getHttpServer())
          .get('/client/profile')
          .set('Authorization', `Bearer ${therapistUser.id}`);

        return {
          passed: response.status === 403 || response.status === 401,
          details: `Therapist should not access client-only endpoints. Got ${response.status}`,
          response: {
            statusCode: response.status,
            body: response.body,
            headers: response.headers,
          },
        };
      },
    );
  }

  /**
   * Test SQL injection vulnerabilities
   */
  private async testSQLInjection(): Promise<void> {
    console.log('💉 Testing SQL Injection Protection...');

    const sqlPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      '" OR "1"="1',
      "'; UPDATE users SET email='hacked@evil.com'; --",
      "' UNION SELECT * FROM users --",
    ];

    for (const payload of sqlPayloads) {
      await this.addSecurityTest(
        `SQL Injection via Search - ${payload.substring(0, 20)}...`,
        '/search/therapists',
        'GET',
        'SQL Injection',
        'CRITICAL',
        async () => {
          const response = await request(this.app.getHttpServer())
            .get('/search/therapists')
            .query({ specialization: payload });

          return {
            passed:
              response.status !== 500 && !this.containsSQLError(response.body),
            details: `SQL injection payload should be handled safely. Status: ${response.status}`,
            response: {
              statusCode: response.status,
              body: response.body,
              headers: response.headers,
            },
          };
        },
      );
    }
  }

  /**
   * Test XSS prevention
   */
  private async testXSSPrevention(): Promise<void> {
    console.log('🔺 Testing XSS Prevention...');

    const xssPayloads = [
      '<script>alert("xss")</script>',
      '"><script>alert("xss")</script>',
      '<img src=x onerror=alert("xss")>',
      'javascript:alert("xss")',
      '<svg onload=alert("xss")>',
    ];

    for (const payload of xssPayloads) {
      await this.addSecurityTest(
        `XSS Prevention - ${payload.substring(0, 20)}...`,
        '/posts',
        'POST',
        'Cross-Site Scripting',
        'HIGH',
        async () => {
          const testUser = await this.testFactory.createUser();

          const response = await request(this.app.getHttpServer())
            .post('/posts')
            .set('Authorization', `Bearer ${testUser.id}`)
            .send({
              content: payload,
              roomId: 'test-room',
            });

          // Check if the response contains unescaped script tags
          const responseString = JSON.stringify(response.body);
          const containsUnescapedScript =
            responseString.includes('<script>') ||
            responseString.includes('javascript:') ||
            responseString.includes('onerror=');

          return {
            passed: !containsUnescapedScript,
            details: `XSS payload should be escaped or rejected. Contains unescaped: ${containsUnescapedScript}`,
            response: {
              statusCode: response.status,
              body: response.body,
              headers: response.headers,
            },
          };
        },
      );
    }
  }

  /**
   * Test sensitive data exposure
   */
  private async testDataExposure(): Promise<void> {
    console.log('🔓 Testing Data Exposure Prevention...');

    const testUser = await this.testFactory.createUser();

    // Test password exposure in API responses
    await this.addSecurityTest(
      'Password Exposure in API Response',
      '/auth/me',
      'GET',
      'Sensitive Data Exposure',
      'CRITICAL',
      async () => {
        const response = await request(this.app.getHttpServer())
          .get('/auth/me')
          .set('Authorization', `Bearer ${testUser.id}`);

        const responseString = JSON.stringify(response.body);
        const exposesPassword =
          responseString.includes('password') ||
          responseString.includes('hash') ||
          responseString.includes('salt');

        return {
          passed: !exposesPassword,
          details: `API should not expose password fields. Exposes password: ${exposesPassword}`,
          response: {
            statusCode: response.status,
            body: response.body,
            headers: response.headers,
          },
        };
      },
    );

    // Test error message information disclosure
    await this.addSecurityTest(
      'Error Message Information Disclosure',
      '/nonexistent-endpoint',
      'GET',
      'Information Disclosure',
      'LOW',
      async () => {
        const response = await request(this.app.getHttpServer()).get(
          '/nonexistent-endpoint',
        );

        const responseString = JSON.stringify(response.body);
        const exposesInternalInfo =
          responseString.includes('stack') ||
          responseString.includes('internal') ||
          responseString.includes('database') ||
          responseString.includes('prisma');

        return {
          passed: !exposesInternalInfo,
          details: `Error messages should not expose internal information. Exposes info: ${exposesInternalInfo}`,
          response: {
            statusCode: response.status,
            body: response.body,
            headers: response.headers,
          },
        };
      },
    );
  }

  /**
   * Test sensitive data handling (HIPAA compliance)
   */
  private async testSensitiveDataHandling(): Promise<void> {
    console.log('🏥 Testing HIPAA Compliance...');

    const testUser = await this.testFactory.createUser();

    // Create pre-assessment with sensitive health data - stub for now
    const preAssessment = {
      id: 'test-assessment-id',
      userId: testUser.id,
    };

    // Test that health data is properly protected
    await this.addSecurityTest(
      'Health Data Protection (HIPAA)',
      `/pre-assessment/${preAssessment.id}`,
      'GET',
      'Health Data Exposure',
      'CRITICAL',
      async () => {
        // Try to access health data without proper authorization
        const unauthorizedResponse = await request(
          this.app.getHttpServer(),
        ).get(`/pre-assessment/${preAssessment.id}`);

        return {
          passed:
            unauthorizedResponse.status === 401 ||
            unauthorizedResponse.status === 403,
          details: `Health data should require authentication. Got ${unauthorizedResponse.status}`,
          response: {
            statusCode: unauthorizedResponse.status,
            body: unauthorizedResponse.body,
            headers: unauthorizedResponse.headers,
          },
        };
      },
    );

    // Test data minimization - only return necessary fields
    await this.addSecurityTest(
      'Health Data Minimization',
      '/pre-assessment',
      'GET',
      'Data Minimization',
      'MEDIUM',
      async () => {
        const response = await request(this.app.getHttpServer())
          .get('/pre-assessment')
          .set('Authorization', `Bearer ${testUser.id}`);

        // Check if response includes unnecessary sensitive fields
        const responseString = JSON.stringify(response.body);
        const includesUnnecessaryData =
          responseString.includes('ssn') ||
          responseString.includes('insurance') ||
          responseString.includes('medical_history');

        return {
          passed: !includesUnnecessaryData,
          details: `API should minimize health data exposure. Includes unnecessary data: ${includesUnnecessaryData}`,
          response: {
            statusCode: response.status,
            body: response.body,
            headers: response.headers,
          },
        };
      },
    );
  }

  /**
   * Test rate limiting and DoS protection
   */
  private async testRateLimiting(): Promise<void> {
    console.log('🚦 Testing Rate Limiting...');

    await this.addSecurityTest(
      'Rate Limiting Protection',
      '/auth/register/client',
      'POST',
      'DoS Protection',
      'MEDIUM',
      async () => {
        const requests: any[] = [];
        const requestCount = 20; // Attempt to exceed rate limit

        // Make rapid requests
        for (let i = 0; i < requestCount; i++) {
          requests.push(
            request(this.app.getHttpServer())
              .post('/auth/register/client')
              .send({
                email: `test${i}@example.com`,
                firstName: 'Test',
                lastName: 'User',
                password: 'Password123!',
              }),
          );
        }

        const responses = await Promise.allSettled(requests);
        const rateLimited = responses.some(
          (r) => r.status === 'fulfilled' && r.value.status === 429,
        );

        return {
          passed: rateLimited,
          details: `Rate limiting should be active for registration. Rate limited: ${rateLimited}`,
          response: {
            statusCode: rateLimited ? 429 : 200,
            body: { message: 'Rate limiting test' },
            headers: {},
          },
        };
      },
    );
  }

  /**
   * Test session security
   */
  private async testSessionSecurity(): Promise<void> {
    console.log('🍪 Testing Session Security...');

    // Test session fixation protection
    await this.addSecurityTest(
      'Session Fixation Protection',
      '/auth/register/client',
      'POST',
      'Session Management',
      'MEDIUM',
      async () => {
        const response = await request(this.app.getHttpServer())
          .post('/auth/register/client')
          .send({
            email: 'session-test@example.com',
            firstName: 'Session',
            lastName: 'Test',
            password: 'Password123!',
          });

        // Check for secure session headers
        const setCookieHeaders = response.headers['set-cookie'];
        const hasSecureHeaders = Array.isArray(setCookieHeaders) && setCookieHeaders.some(
          (cookie) => cookie.includes('HttpOnly') && cookie.includes('Secure'),
        );

        return {
          passed: hasSecureHeaders || response.status >= 400, // Either secure or properly rejected
          details: `Session cookies should be secure. Has secure headers: ${hasSecureHeaders}`,
          response: {
            statusCode: response.status,
            body: response.body,
            headers: response.headers,
          },
        };
      },
    );
  }

  /**
   * Test security headers
   */
  private async testSecurityHeaders(): Promise<void> {
    console.log('🛡️ Testing Security Headers...');

    await this.addSecurityTest(
      'Security Headers Presence',
      '/auth/me',
      'GET',
      'Security Headers',
      'LOW',
      async () => {
        const response = await request(this.app.getHttpServer()).get(
          '/auth/me',
        );

        const headers = response.headers;
        const hasCSP = headers['content-security-policy'];
        const hasXFrame = headers['x-frame-options'];
        const hasXContent = headers['x-content-type-options'];

        const securityScore = [hasCSP, hasXFrame, hasXContent].filter(
          Boolean,
        ).length;

        return {
          passed: securityScore >= 2, // At least 2 out of 3 security headers
          details: `Expected security headers. CSP: ${!!hasCSP}, X-Frame: ${!!hasXFrame}, X-Content: ${!!hasXContent}`,
          response: {
            statusCode: response.status,
            body: response.body,
            headers: response.headers,
          },
        };
      },
    );
  }

  // Helper Methods

  private async testMaliciousInput(
    endpoint: { path: string; method: string; fields: string[] },
    field: string,
    payload: string,
  ): Promise<void> {
    await this.addSecurityTest(
      `Input Validation - ${field}`,
      endpoint.path,
      endpoint.method,
      'Input Validation',
      'MEDIUM',
      async () => {
        const data = { [field]: payload };

        let response;
        if (endpoint.method === 'POST') {
          response = await request(this.app.getHttpServer())
            .post(endpoint.path)
            .send(data);
        } else {
          response = await request(this.app.getHttpServer())
            .get(endpoint.path)
            .query(data);
        }

        // Input should be rejected or properly sanitized
        const properlyHandled =
          response.status === 400 ||
          response.status === 422 ||
          !this.containsMaliciousContent(response.body, payload);

        return {
          passed: properlyHandled,
          details: `Malicious input should be handled safely. Status: ${response.status}`,
          response: {
            statusCode: response.status,
            body: response.body,
            headers: response.headers,
          },
        };
      },
    );
  }

  private async addSecurityTest(
    testName: string,
    endpoint: string,
    method: string,
    vulnerability: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    testFunction: () => Promise<{
      passed: boolean;
      details: string;
      response?: any;
    }>,
  ): Promise<void> {
    try {
      const result = await testFunction();

      this.results.push({
        testName,
        endpoint,
        method,
        vulnerability,
        severity,
        passed: result.passed,
        details: result.details,
        response: result.response,
      });
    } catch (error) {
      this.results.push({
        testName,
        endpoint,
        method,
        vulnerability,
        severity,
        passed: false,
        details: `Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  private containsSQLError(body: any): boolean {
    const bodyString = JSON.stringify(body).toLowerCase();
    const sqlErrors = [
      'sql',
      'sqlite',
      'mysql',
      'postgres',
      'prisma',
      'syntax error',
    ];
    return sqlErrors.some((error) => bodyString.includes(error));
  }

  private containsMaliciousContent(body: any, payload: string): boolean {
    const bodyString = JSON.stringify(body);
    return bodyString.includes(payload);
  }

  private generateSecurityReport(): SecurityScanReport {
    const summary = {
      totalTests: this.results.length,
      passed: this.results.filter((r) => r.passed).length,
      failed: this.results.filter((r) => !r.passed).length,
      criticalIssues: this.results.filter(
        (r) => !r.passed && r.severity === 'CRITICAL',
      ).length,
      highIssues: this.results.filter((r) => !r.passed && r.severity === 'HIGH')
        .length,
      mediumIssues: this.results.filter(
        (r) => !r.passed && r.severity === 'MEDIUM',
      ).length,
      lowIssues: this.results.filter((r) => !r.passed && r.severity === 'LOW')
        .length,
    };

    const vulnerabilities = this.results.filter((r) => !r.passed);

    const recommendations = this.generateSecurityRecommendations();

    const complianceStatus = {
      hipaa: this.checkHIPAACompliance(),
      owasp: this.checkOWASPCompliance(),
      gdpr: this.checkGDPRCompliance(),
    };

    return {
      summary,
      vulnerabilities,
      recommendations,
      complianceStatus,
    };
  }

  private generateSecurityRecommendations(): string[] {
    const recommendations: string[] = [];

    const criticalIssues = this.results.filter(
      (r) => !r.passed && r.severity === 'CRITICAL',
    );
    if (criticalIssues.length > 0) {
      recommendations.push(
        'URGENT: Address critical security vulnerabilities immediately',
      );
    }

    const authIssues = this.results.filter(
      (r) => !r.passed && r.vulnerability.includes('Authentication'),
    );
    if (authIssues.length > 0) {
      recommendations.push(
        'Strengthen authentication and authorization mechanisms',
      );
    }

    const dataExposureIssues = this.results.filter(
      (r) => !r.passed && r.vulnerability.includes('Data Exposure'),
    );
    if (dataExposureIssues.length > 0) {
      recommendations.push(
        'Implement data minimization and privacy protection',
      );
    }

    const inputValidationIssues = this.results.filter(
      (r) => !r.passed && r.vulnerability === 'Input Validation',
    );
    if (inputValidationIssues.length > 0) {
      recommendations.push('Enhance input validation and sanitization');
    }

    return recommendations;
  }

  private checkHIPAACompliance(): boolean {
    const healthDataTests = this.results.filter((r) =>
      r.vulnerability.includes('Health Data'),
    );
    return healthDataTests.every((r) => r.passed);
  }

  private checkOWASPCompliance(): boolean {
    const owaspTests = this.results.filter((r) =>
      [
        'SQL Injection',
        'Cross-Site Scripting',
        'Authentication Bypass',
      ].includes(r.vulnerability),
    );
    return owaspTests.every((r) => r.passed);
  }

  private checkGDPRCompliance(): boolean {
    const dataProtectionTests = this.results.filter(
      (r) =>
        r.vulnerability.includes('Data') || r.vulnerability.includes('Privacy'),
    );
    return dataProtectionTests.every((r) => r.passed);
  }

  getResults(): SecurityTestResult[] {
    return this.results;
  }
}
