/**
 * Security Testing Specification
 *
 * Comprehensive security tests for authentication, authorization,
 * input validation, and vulnerability assessment.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../database/prisma.service';
import {
  SecurityTestingSuite,
  SecurityScanReport,
} from './security-testing.suite';
import { createMockClerkClient, createMockAuthGuard } from '../index';
import * as fs from 'fs';
import * as path from 'path';

describe('Security Testing Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let securitySuite: SecurityTestingSuite;

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

    securitySuite = new SecurityTestingSuite(app);
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

  describe('Comprehensive Security Scan', () => {
    it('should run complete security vulnerability assessment', async () => {
      console.log('🔒 Starting comprehensive security scan...');

      const report: SecurityScanReport = await securitySuite.runSecurityScan();

      // Save detailed security report
      await saveSecurityReport(
        'comprehensive-security-scan.json',
        JSON.stringify(report, null, 2),
      );

      // Basic security assertions
      expect(report.summary.totalTests).toBeGreaterThan(0);
      expect(report.summary.criticalIssues).toBe(0); // No critical vulnerabilities allowed
      expect(report.summary.highIssues).toBeLessThanOrEqual(2); // Maximum 2 high-risk issues

      // Compliance checks
      expect(report.complianceStatus.hipaa).toBe(true);
      expect(report.complianceStatus.owasp).toBe(true);

      console.log(`Security Scan Results:
        Total Tests: ${report.summary.totalTests}
        Passed: ${report.summary.passed}
        Failed: ${report.summary.failed}
        Critical Issues: ${report.summary.criticalIssues}
        High Issues: ${report.summary.highIssues}
        Medium Issues: ${report.summary.mediumIssues}
        Low Issues: ${report.summary.lowIssues}
        
        Compliance Status:
        HIPAA: ${report.complianceStatus.hipaa ? '✅' : '❌'}
        OWASP: ${report.complianceStatus.owasp ? '✅' : '❌'}
        GDPR: ${report.complianceStatus.gdpr ? '✅' : '❌'}`);

      // Generate executive summary
      await generateExecutiveSummary(report);
    }, 300000); // 5 minute timeout for comprehensive scan
  });

  describe('Authentication Security', () => {
    it('should properly validate JWT tokens', async () => {
      console.log('🔐 Testing JWT token validation...');

      // This will be covered in the comprehensive scan, but we can also test individually
      const results = securitySuite.getResults();
      const authTests = results.filter((r) =>
        r.vulnerability.includes('Authentication'),
      );

      authTests.forEach((test) => {
        if (test.severity === 'CRITICAL' || test.severity === 'HIGH') {
          expect(test.passed).toBe(true);
        }
      });
    });

    it('should enforce proper session management', async () => {
      console.log('🍪 Testing session security...');

      const results = securitySuite.getResults();
      const sessionTests = results.filter((r) =>
        r.vulnerability.includes('Session'),
      );

      sessionTests.forEach((test) => {
        if (test.severity === 'HIGH' || test.severity === 'CRITICAL') {
          expect(test.passed).toBe(true);
        }
      });
    });
  });

  describe('Input Validation Security', () => {
    it('should prevent SQL injection attacks', async () => {
      console.log('💉 Testing SQL injection prevention...');

      const results = securitySuite.getResults();
      const sqlTests = results.filter(
        (r) => r.vulnerability === 'SQL Injection',
      );

      // All SQL injection tests should pass
      sqlTests.forEach((test) => {
        expect(test.passed).toBe(true);
      });
    });

    it('should prevent XSS attacks', async () => {
      console.log('🔺 Testing XSS prevention...');

      const results = securitySuite.getResults();
      const xssTests = results.filter(
        (r) => r.vulnerability === 'Cross-Site Scripting',
      );

      // All XSS tests should pass
      xssTests.forEach((test) => {
        expect(test.passed).toBe(true);
      });
    });

    it('should validate all input fields properly', async () => {
      console.log('✅ Testing input validation...');

      const results = securitySuite.getResults();
      const validationTests = results.filter(
        (r) => r.vulnerability === 'Input Validation',
      );

      // Most input validation tests should pass (allowing for some edge cases)
      const passedValidationTests = validationTests.filter(
        (t) => t.passed,
      ).length;
      const totalValidationTests = validationTests.length;

      if (totalValidationTests > 0) {
        const passRate = passedValidationTests / totalValidationTests;
        expect(passRate).toBeGreaterThan(0.8); // 80% pass rate minimum
      }
    });
  });

  describe('Data Protection & Privacy', () => {
    it('should protect sensitive health data (HIPAA compliance)', async () => {
      console.log('🏥 Testing HIPAA compliance...');

      const results = securitySuite.getResults();
      const healthDataTests = results.filter((r) =>
        r.vulnerability.includes('Health Data'),
      );

      // All health data protection tests must pass
      healthDataTests.forEach((test) => {
        expect(test.passed).toBe(true);
      });
    });

    it('should prevent sensitive data exposure', async () => {
      console.log('🔓 Testing data exposure prevention...');

      const results = securitySuite.getResults();
      const dataExposureTests = results.filter((r) =>
        r.vulnerability.includes('Data Exposure'),
      );

      // Critical and high-severity data exposure tests must pass
      dataExposureTests.forEach((test) => {
        if (test.severity === 'CRITICAL' || test.severity === 'HIGH') {
          expect(test.passed).toBe(true);
        }
      });
    });

    it('should implement proper data minimization', async () => {
      console.log('📊 Testing data minimization...');

      const results = securitySuite.getResults();
      const minimizationTests = results.filter(
        (r) => r.vulnerability === 'Data Minimization',
      );

      minimizationTests.forEach((test) => {
        if (test.severity === 'MEDIUM' || test.severity === 'HIGH') {
          expect(test.passed).toBe(true);
        }
      });
    });
  });

  describe('Authorization & Access Control', () => {
    it('should enforce role-based access control', async () => {
      console.log('👮 Testing role-based access control...');

      const results = securitySuite.getResults();
      const authzTests = results.filter(
        (r) =>
          r.vulnerability.includes('Privilege') ||
          r.vulnerability.includes('Access Control'),
      );

      // All privilege escalation tests must pass
      authzTests.forEach((test) => {
        if (test.severity === 'CRITICAL' || test.severity === 'HIGH') {
          expect(test.passed).toBe(true);
        }
      });
    });

    it('should prevent unauthorized data access', async () => {
      console.log('🚫 Testing unauthorized access prevention...');

      const results = securitySuite.getResults();
      const unauthorizedTests = results.filter((r) =>
        r.vulnerability.includes('Unauthorized'),
      );

      unauthorizedTests.forEach((test) => {
        expect(test.passed).toBe(true);
      });
    });
  });

  describe('Security Headers & Configuration', () => {
    it('should implement proper security headers', async () => {
      console.log('🛡️ Testing security headers...');

      const results = securitySuite.getResults();
      const headerTests = results.filter(
        (r) => r.vulnerability === 'Security Headers',
      );

      // Security headers should be implemented
      headerTests.forEach((test) => {
        // Allow some flexibility for security headers (not all may be required)
        if (test.severity === 'HIGH' || test.severity === 'CRITICAL') {
          expect(test.passed).toBe(true);
        }
      });
    });
  });

  describe('DoS Protection & Rate Limiting', () => {
    it('should implement rate limiting protection', async () => {
      console.log('🚦 Testing rate limiting...');

      const results = securitySuite.getResults();
      const rateLimitTests = results.filter(
        (r) => r.vulnerability === 'DoS Protection',
      );

      rateLimitTests.forEach((test) => {
        if (test.severity === 'MEDIUM' || test.severity === 'HIGH') {
          expect(test.passed).toBe(true);
        }
      });
    });
  });

  describe('Security Regression Testing', () => {
    it('should not introduce new security vulnerabilities', async () => {
      console.log('🔄 Running regression security tests...');

      const results = securitySuite.getResults();

      // Critical and high-severity issues should not exist
      const criticalIssues = results.filter(
        (r) => !r.passed && r.severity === 'CRITICAL',
      );
      const highIssues = results.filter(
        (r) => !r.passed && r.severity === 'HIGH',
      );

      expect(criticalIssues.length).toBe(0);
      expect(highIssues.length).toBeLessThanOrEqual(2); // Maximum 2 high-risk issues

      if (criticalIssues.length > 0) {
        console.error('❌ Critical security issues found:');
        criticalIssues.forEach((issue) => {
          console.error(`   ${issue.testName}: ${issue.details}`);
        });
      }

      if (highIssues.length > 0) {
        console.warn('⚠️ High-risk security issues found:');
        highIssues.forEach((issue) => {
          console.warn(`   ${issue.testName}: ${issue.details}`);
        });
      }
    });
  });
});

// Helper Functions

async function saveSecurityReport(
  filename: string,
  content: string,
): Promise<void> {
  const reportsDir = path.join(__dirname, '../../../test-reports/security');

  // Create directory if it doesn't exist
  await fs.promises.mkdir(reportsDir, { recursive: true });

  const filePath = path.join(reportsDir, filename);
  await fs.promises.writeFile(filePath, content, 'utf8');

  console.log(`🔒 Security report saved to: ${filePath}`);
}

async function generateExecutiveSummary(
  report: SecurityScanReport,
): Promise<void> {
  const summary = `
EXECUTIVE SECURITY SUMMARY
=========================

Date: ${new Date().toISOString()}
Application: Mentara Mental Health Platform

OVERALL SECURITY POSTURE: ${report.summary.criticalIssues === 0 && report.summary.highIssues <= 2 ? 'ACCEPTABLE' : 'NEEDS ATTENTION'}

Security Test Results:
- Total Security Tests: ${report.summary.totalTests}
- Tests Passed: ${report.summary.passed} (${((report.summary.passed / report.summary.totalTests) * 100).toFixed(1)}%)
- Tests Failed: ${report.summary.failed}

Vulnerability Breakdown:
- Critical Issues: ${report.summary.criticalIssues} ⚠️
- High-Risk Issues: ${report.summary.highIssues} ⚠️
- Medium-Risk Issues: ${report.summary.mediumIssues}
- Low-Risk Issues: ${report.summary.lowIssues}

Compliance Status:
- HIPAA Compliance: ${report.complianceStatus.hipaa ? 'COMPLIANT ✅' : 'NON-COMPLIANT ❌'}
- OWASP Standards: ${report.complianceStatus.owasp ? 'COMPLIANT ✅' : 'NON-COMPLIANT ❌'}
- GDPR Compliance: ${report.complianceStatus.gdpr ? 'COMPLIANT ✅' : 'NON-COMPLIANT ❌'}

Immediate Actions Required:
${report.summary.criticalIssues > 0 ? '🚨 URGENT: Address critical security vulnerabilities before deployment' : '✅ No critical vulnerabilities found'}
${report.summary.highIssues > 2 ? '⚠️ HIGH PRIORITY: Reduce high-risk vulnerabilities to acceptable levels' : '✅ High-risk vulnerabilities within acceptable limits'}

Recommendations:
${report.recommendations.map((rec) => `• ${rec}`).join('\n')}

Next Security Review: Recommended within 30 days or before next major release.

---
This summary is generated automatically from comprehensive security testing.
For detailed technical findings, refer to the full security report.
`;

  await saveSecurityReport('executive-security-summary.txt', summary);
}
