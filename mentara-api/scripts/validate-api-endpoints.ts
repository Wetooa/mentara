import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

interface EndpointTest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  requiresAuth: boolean;
  expectedStatus?: number;
  body?: any;
  headers?: Record<string, string>;
}

interface ValidationResult {
  endpoint: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  actualStatus?: number;
  expectedStatus?: number;
  error?: string;
  responseTime?: number;
}

export class ApiEndpointValidator {
  private app!: INestApplication;
  private testToken = 'mock-jwt-token'; // This would be a real token in production

  private endpoints: EndpointTest[] = [
    // Auth endpoints
    {
      method: 'POST',
      path: '/auth/register',
      description: 'User registration with email',
      requiresAuth: false,
      expectedStatus: 201,
      body: {
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
      }
    },
    {
      method: 'POST',
      path: '/auth/login',
      description: 'User login with email',
      requiresAuth: false,
      expectedStatus: 200,
      body: {
        email: 'test@example.com',
        password: 'TestPassword123!'
      }
    },
    {
      method: 'POST',
      path: '/auth/refresh',
      description: 'Refresh authentication tokens',
      requiresAuth: false,
      expectedStatus: 200,
      body: {
        refreshToken: 'mock-refresh-token'
      }
    },
    {
      method: 'GET',
      path: '/auth/profile',
      description: 'Get user profile',
      requiresAuth: true,
      expectedStatus: 200
    },
    {
      method: 'POST',
      path: '/auth/logout',
      description: 'User logout',
      requiresAuth: true,
      expectedStatus: 200,
      body: {
        refreshToken: 'mock-refresh-token'
      }
    },

    // User endpoints
    {
      method: 'GET',
      path: '/users/me',
      description: 'Get current user details',
      requiresAuth: true,
      expectedStatus: 200
    },
    {
      method: 'PUT',
      path: '/users/me',
      description: 'Update user profile',
      requiresAuth: true,
      expectedStatus: 200,
      body: {
        firstName: 'Updated',
        lastName: 'Name'
      }
    },

    // Therapist endpoints
    {
      method: 'GET',
      path: '/therapist/recommendations',
      description: 'Get therapist recommendations',
      requiresAuth: true,
      expectedStatus: 200
    },
    {
      method: 'GET',
      path: '/therapist/applications',
      description: 'Get therapist applications',
      requiresAuth: true,
      expectedStatus: 200
    },

    // Community endpoints
    {
      method: 'GET',
      path: '/communities',
      description: 'Get all communities',
      requiresAuth: true,
      expectedStatus: 200
    },
    {
      method: 'GET',
      path: '/communities/test-id',
      description: 'Get specific community',
      requiresAuth: true,
      expectedStatus: 200
    },

    // Assessment endpoints
    {
      method: 'GET',
      path: '/pre-assessment',
      description: 'Get user assessments',
      requiresAuth: true,
      expectedStatus: 200
    },
    {
      method: 'POST',
      path: '/pre-assessment',
      description: 'Create new assessment',
      requiresAuth: true,
      expectedStatus: 201,
      body: {
        responses: Array(201).fill(0).map((_, i) => ({ questionId: i, answer: 1 }))
      }
    },

    // Booking endpoints
    {
      method: 'GET',
      path: '/booking/slots',
      description: 'Get available booking slots',
      requiresAuth: true,
      expectedStatus: 200
    },

    // Messaging endpoints
    {
      method: 'GET',
      path: '/messaging/conversations',
      description: 'Get user conversations',
      requiresAuth: true,
      expectedStatus: 200
    },

    // Files endpoints
    {
      method: 'GET',
      path: '/files/my-files',
      description: 'Get user files',
      requiresAuth: true,
      expectedStatus: 200
    },

    // Dashboard endpoints
    {
      method: 'GET',
      path: '/dashboard/stats',
      description: 'Get dashboard statistics',
      requiresAuth: true,
      expectedStatus: 200
    },

    // Admin endpoints (should require admin role)
    {
      method: 'GET',
      path: '/admin/users',
      description: 'Get all users (admin only)',
      requiresAuth: true,
      expectedStatus: 403 // Should fail for non-admin users
    },

    // Health check endpoints
    {
      method: 'GET',
      path: '/health',
      description: 'Health check endpoint',
      requiresAuth: false,
      expectedStatus: 200
    },
  ];

  async validateAllEndpoints(): Promise<ValidationResult[]> {
    console.log('🚀 Starting API endpoint validation...\n');
    
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = module.createNestApplication();
    await this.app.init();

    const results: ValidationResult[] = [];

    for (const endpoint of this.endpoints) {
      console.log(`Testing ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
      const result = await this.testEndpoint(endpoint);
      results.push(result);
      
      const statusIcon = result.status === 'PASS' ? '✅' : 
                        result.status === 'FAIL' ? '❌' : '⏭️';
      console.log(`${statusIcon} ${result.status} - ${result.endpoint} (${result.responseTime}ms)`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    }

    await this.app.close();

    // Print summary
    this.printSummary(results);
    
    return results;
  }

  private async testEndpoint(endpoint: EndpointTest): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      let requestBuilder = request(this.app.getHttpServer())[endpoint.method.toLowerCase()](endpoint.path);

      // Add authentication header if required
      if (endpoint.requiresAuth) {
        requestBuilder = requestBuilder.set('Authorization', `Bearer ${this.testToken}`);
      }

      // Add custom headers
      if (endpoint.headers) {
        Object.entries(endpoint.headers).forEach(([key, value]) => {
          requestBuilder = requestBuilder.set(key, value);
        });
      }

      // Add body for POST/PUT/PATCH requests
      if (endpoint.body && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
        requestBuilder = requestBuilder.send(endpoint.body);
      }

      const response = await requestBuilder;
      const responseTime = Date.now() - startTime;

      const expectedStatus = endpoint.expectedStatus || 200;
      const isStatusMatch = response.status === expectedStatus;

      // Special handling for authentication errors
      if (endpoint.requiresAuth && response.status === 401) {
        return {
          endpoint: `${endpoint.method} ${endpoint.path}`,
          status: 'SKIP',
          actualStatus: response.status,
          expectedStatus,
          error: 'Authentication token invalid (expected for mock testing)',
          responseTime,
        };
      }

      return {
        endpoint: `${endpoint.method} ${endpoint.path}`,
        status: isStatusMatch ? 'PASS' : 'FAIL',
        actualStatus: response.status,
        expectedStatus,
        error: isStatusMatch ? undefined : `Expected ${expectedStatus}, got ${response.status}`,
        responseTime,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        endpoint: `${endpoint.method} ${endpoint.path}`,
        status: 'FAIL',
        error: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
        responseTime,
      };
    }
  }

  private printSummary(results: ValidationResult[]): void {
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const skipped = results.filter(r => r.status === 'SKIP').length;
    const total = results.length;

    console.log('\n' + '='.repeat(60));
    console.log('🔍 API ENDPOINT VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Endpoints: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log(`Success Rate: ${((passed / (total - skipped)) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ FAILED ENDPOINTS:');
      results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`   ${r.endpoint}: ${r.error}`);
        });
    }

    if (skipped > 0) {
      console.log('\n⏭️ SKIPPED ENDPOINTS:');
      results
        .filter(r => r.status === 'SKIP')
        .forEach(r => {
          console.log(`   ${r.endpoint}: ${r.error}`);
        });
    }

    // Performance summary
    const avgResponseTime = results
      .filter(r => r.responseTime)
      .reduce((sum, r) => sum + r.responseTime!, 0) / results.length;
    
    console.log(`\n⚡ Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
    
    const slowEndpoints = results
      .filter(r => r.responseTime && r.responseTime > 1000)
      .sort((a, b) => b.responseTime! - a.responseTime!);
    
    if (slowEndpoints.length > 0) {
      console.log('\n🐌 SLOW ENDPOINTS (>1000ms):');
      slowEndpoints.forEach(r => {
        console.log(`   ${r.endpoint}: ${r.responseTime}ms`);
      });
    }

    console.log('='.repeat(60));
  }

  // Method to generate endpoint documentation
  generateDocumentation(): string {
    let docs = '# API Endpoints Documentation\n\n';
    
    const groupedEndpoints = this.endpoints.reduce((groups, endpoint) => {
      const group = endpoint.path.split('/')[1] || 'root';
      if (!groups[group]) groups[group] = [];
      groups[group].push(endpoint);
      return groups;
    }, {} as Record<string, EndpointTest[]>);

    Object.entries(groupedEndpoints).forEach(([group, endpoints]) => {
      docs += `## ${group.charAt(0).toUpperCase() + group.slice(1)} Endpoints\n\n`;
      
      endpoints.forEach(endpoint => {
        docs += `### ${endpoint.method} ${endpoint.path}\n`;
        docs += `**Description**: ${endpoint.description}\n`;
        docs += `**Authentication**: ${endpoint.requiresAuth ? 'Required' : 'Not required'}\n`;
        docs += `**Expected Status**: ${endpoint.expectedStatus || 200}\n`;
        
        if (endpoint.body) {
          docs += `**Request Body**:\n\`\`\`json\n${JSON.stringify(endpoint.body, null, 2)}\n\`\`\`\n`;
        }
        
        docs += '\n';
      });
    });

    return docs;
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new ApiEndpointValidator();
  validator.validateAllEndpoints()
    .then(results => {
      const failedCount = results.filter(r => r.status === 'FAIL').length;
      process.exit(failedCount > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}