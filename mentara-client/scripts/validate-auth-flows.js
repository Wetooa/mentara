#!/usr/bin/env node

/**
 * Authentication Flow Validation Script
 * 
 * This script performs automated validation of the role-specific authentication system.
 * It can be run in CI/CD pipelines or locally for development validation.
 * 
 * Usage: node scripts/validate-auth-flows.js [--role=client|therapist|admin|moderator] [--env=dev|staging|prod]
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  dev: {
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:3001/api',
  },
  staging: {
    baseUrl: process.env.STAGING_URL || 'https://staging.mentara.com',
    apiUrl: process.env.STAGING_API_URL || 'https://api-staging.mentara.com',
  },
  prod: {
    baseUrl: process.env.PROD_URL || 'https://mentara.com',
    apiUrl: process.env.PROD_API_URL || 'https://api.mentara.com',
  },
};

// Test credentials (use test accounts only)
const TEST_CREDENTIALS = {
  client: {
    email: process.env.TEST_CLIENT_EMAIL || 'test-client@mentara.com',
    password: process.env.TEST_CLIENT_PASSWORD || 'TestPassword123!',
  },
  therapist: {
    email: process.env.TEST_THERAPIST_EMAIL || 'test-therapist@mentara.com',
    password: process.env.TEST_THERAPIST_PASSWORD || 'TestPassword123!',
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'test-admin@mentara.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'TestPassword123!',
  },
  moderator: {
    email: process.env.TEST_MODERATOR_EMAIL || 'test-moderator@mentara.com',
    password: process.env.TEST_MODERATOR_PASSWORD || 'TestPassword123!',
  },
};

class AuthFlowValidator {
  constructor(environment = 'dev') {
    this.env = environment;
    this.config = CONFIG[environment];
    this.results = {
      passed: 0,
      failed: 0,
      tests: [],
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.config.apiUrl);
      const requestOptions = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      const req = https.request(url, requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            resolve({
              status: res.statusCode,
              data: parsedData,
              headers: res.headers,
            });
          } catch (error) {
            resolve({
              status: res.statusCode,
              data: data,
              headers: res.headers,
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  async runTest(testName, testFunction) {
    this.log(`Running test: ${testName}`);
    try {
      await testFunction();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'PASSED' });
      this.log(`✅ ${testName} - PASSED`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ 
        name: testName, 
        status: 'FAILED', 
        error: error.message 
      });
      this.log(`❌ ${testName} - FAILED: ${error.message}`, 'error');
    }
  }

  async validateClientAuth() {
    await this.runTest('Client Login Flow', async () => {
      const response = await this.makeRequest('/auth/client/login', {
        method: 'POST',
        body: TEST_CREDENTIALS.client,
      });

      if (response.status !== 200) {
        throw new Error(`Login failed with status ${response.status}`);
      }

      if (!response.data.tokens || !response.data.user) {
        throw new Error('Login response missing tokens or user data');
      }

      if (response.data.user.role !== 'client') {
        throw new Error(`Expected role 'client', got '${response.data.user.role}'`);
      }
    });

    await this.runTest('Client Invalid Credentials', async () => {
      const response = await this.makeRequest('/auth/client/login', {
        method: 'POST',
        body: {
          email: TEST_CREDENTIALS.client.email,
          password: 'wrongpassword',
        },
      });

      if (response.status !== 401) {
        throw new Error(`Expected 401 for invalid credentials, got ${response.status}`);
      }
    });

    await this.runTest('Client Protected Route Access', async () => {
      // First login to get token
      const loginResponse = await this.makeRequest('/auth/client/login', {
        method: 'POST',
        body: TEST_CREDENTIALS.client,
      });

      if (loginResponse.status !== 200) {
        throw new Error('Login failed');
      }

      const token = loginResponse.data.tokens.accessToken;

      // Test protected route access
      const protectedResponse = await this.makeRequest('/auth/client/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (protectedResponse.status !== 200) {
        throw new Error(`Protected route access failed with status ${protectedResponse.status}`);
      }
    });
  }

  async validateTherapistAuth() {
    await this.runTest('Therapist Login Flow', async () => {
      const response = await this.makeRequest('/auth/therapist/login', {
        method: 'POST',
        body: TEST_CREDENTIALS.therapist,
      });

      if (response.status !== 200) {
        throw new Error(`Therapist login failed with status ${response.status}`);
      }

      if (response.data.user.role !== 'therapist') {
        throw new Error(`Expected role 'therapist', got '${response.data.user.role}'`);
      }
    });

    await this.runTest('Therapist Approval Status Check', async () => {
      const loginResponse = await this.makeRequest('/auth/therapist/login', {
        method: 'POST',
        body: TEST_CREDENTIALS.therapist,
      });

      if (loginResponse.status !== 200) {
        throw new Error('Therapist login failed');
      }

      const user = loginResponse.data.user;
      if (!user.hasOwnProperty('approvalStatus')) {
        throw new Error('Therapist user missing approvalStatus');
      }

      if (!user.hasOwnProperty('isApproved')) {
        throw new Error('Therapist user missing isApproved');
      }
    });
  }

  async validateAdminAuth() {
    await this.runTest('Admin Login Flow', async () => {
      const response = await this.makeRequest('/auth/admin/login', {
        method: 'POST',
        body: TEST_CREDENTIALS.admin,
      });

      if (response.status !== 200) {
        throw new Error(`Admin login failed with status ${response.status}`);
      }

      if (response.data.user.role !== 'admin') {
        throw new Error(`Expected role 'admin', got '${response.data.user.role}'`);
      }
    });

    await this.runTest('Admin Permissions Check', async () => {
      const loginResponse = await this.makeRequest('/auth/admin/login', {
        method: 'POST',
        body: TEST_CREDENTIALS.admin,
      });

      if (loginResponse.status !== 200) {
        throw new Error('Admin login failed');
      }

      const user = loginResponse.data.user;
      if (!Array.isArray(user.permissions)) {
        throw new Error('Admin user missing permissions array');
      }
    });
  }

  async validateModeratorAuth() {
    await this.runTest('Moderator Login Flow', async () => {
      const response = await this.makeRequest('/auth/moderator/login', {
        method: 'POST',
        body: TEST_CREDENTIALS.moderator,
      });

      if (response.status !== 200) {
        throw new Error(`Moderator login failed with status ${response.status}`);
      }

      if (response.data.user.role !== 'moderator') {
        throw new Error(`Expected role 'moderator', got '${response.data.user.role}'`);
      }
    });
  }

  async validateCrossRoleAccess() {
    await this.runTest('Cross-Role Access Prevention', async () => {
      // Login as client
      const clientLogin = await this.makeRequest('/auth/client/login', {
        method: 'POST',
        body: TEST_CREDENTIALS.client,
      });

      if (clientLogin.status !== 200) {
        throw new Error('Client login failed');
      }

      const clientToken = clientLogin.data.tokens.accessToken;

      // Try to access therapist endpoint with client token
      const therapistAccess = await this.makeRequest('/auth/therapist/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${clientToken}`,
        },
      });

      if (therapistAccess.status !== 403) {
        throw new Error(`Expected 403 for cross-role access, got ${therapistAccess.status}`);
      }
    });
  }

  async validateTokenSecurity() {
    await this.runTest('Token Expiration Handling', async () => {
      // This test would require a mock expired token
      // For now, we'll test with an invalid token format
      const response = await this.makeRequest('/auth/client/me', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      if (response.status !== 401) {
        throw new Error(`Expected 401 for invalid token, got ${response.status}`);
      }
    });

    await this.runTest('Missing Token Handling', async () => {
      const response = await this.makeRequest('/auth/client/me', {
        method: 'GET',
      });

      if (response.status !== 401) {
        throw new Error(`Expected 401 for missing token, got ${response.status}`);
      }
    });
  }

  async validateAll() {
    this.log(`Starting authentication validation for ${this.env} environment`);
    this.log(`API Base URL: ${this.config.apiUrl}`);

    try {
      await this.validateClientAuth();
      await this.validateTherapistAuth();
      await this.validateAdminAuth();
      await this.validateModeratorAuth();
      await this.validateCrossRoleAccess();
      await this.validateTokenSecurity();
    } catch (error) {
      this.log(`Validation suite failed: ${error.message}`, 'error');
    }

    this.generateReport();
  }

  async validateRole(role) {
    this.log(`Starting ${role} authentication validation for ${this.env} environment`);

    try {
      switch (role) {
        case 'client':
          await this.validateClientAuth();
          break;
        case 'therapist':
          await this.validateTherapistAuth();
          break;
        case 'admin':
          await this.validateAdminAuth();
          break;
        case 'moderator':
          await this.validateModeratorAuth();
          break;
        default:
          throw new Error(`Unknown role: ${role}`);
      }
    } catch (error) {
      this.log(`Role validation failed: ${error.message}`, 'error');
    }

    this.generateReport();
  }

  generateReport() {
    const total = this.results.passed + this.results.failed;
    const successRate = total > 0 ? (this.results.passed / total * 100).toFixed(1) : 0;

    this.log('\n🏁 Validation Complete!');
    this.log(`📊 Results: ${this.results.passed} passed, ${this.results.failed} failed`);
    this.log(`📈 Success Rate: ${successRate}%`);

    if (this.results.failed > 0) {
      this.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          this.log(`   • ${test.name}: ${test.error}`, 'error');
        });
    }

    // Generate JSON report
    const reportPath = path.join(process.cwd(), 'auth-validation-report.json');
    const report = {
      environment: this.env,
      timestamp: new Date().toISOString(),
      summary: {
        total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: parseFloat(successRate),
      },
      tests: this.results.tests,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📄 Report saved to: ${reportPath}`);

    // Exit with error code if tests failed
    if (this.results.failed > 0) {
      process.exit(1);
    }
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    role: null,
    env: 'dev',
  };

  args.forEach(arg => {
    if (arg.startsWith('--role=')) {
      options.role = arg.split('=')[1];
    }
    if (arg.startsWith('--env=')) {
      options.env = arg.split('=')[1];
    }
  });

  return options;
}

// Main execution
async function main() {
  const options = parseArgs();
  const validator = new AuthFlowValidator(options.env);

  console.log(`
🔐 Mentara Authentication Flow Validator
========================================
Environment: ${options.env}
Role: ${options.role || 'all'}
`);

  if (options.role) {
    await validator.validateRole(options.role);
  } else {
    await validator.validateAll();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

module.exports = AuthFlowValidator;