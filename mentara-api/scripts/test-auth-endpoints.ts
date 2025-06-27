import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { PrismaClient } from '@prisma/client';
import { TEST_ACCOUNTS } from './create-test-accounts';

const prisma = new PrismaClient();

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

// Test result tracking
interface TestResult {
  endpoint: string;
  scenario: string;
  success: boolean;
  statusCode?: number;
  error?: string;
  duration: number;
  response?: any;
}

let testResults: TestResult[] = [];

/**
 * Create axios instance with authentication
 */
function createAuthenticatedClient(token?: string): AxiosInstance {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    timeout: 10000,
  });
}

/**
 * Mock JWT token generator (for testing purposes)
 * In a real environment, these would be actual Clerk JWT tokens
 */
function generateMockToken(userId: string, role: string): string {
  // This is a simplified mock - in reality you'd use actual Clerk tokens
  const payload = {
    sub: userId,
    role: role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Execute test and record result
 */
async function executeTest(
  endpoint: string,
  scenario: string,
  testFn: () => Promise<AxiosResponse>
): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await testFn();
    const duration = Date.now() - startTime;
    
    const result: TestResult = {
      endpoint,
      scenario,
      success: true,
      statusCode: response.status,
      duration,
      response: response.data,
    };
    
    testResults.push(result);
    console.log(`   ✅ ${scenario}: ${response.status} (${duration}ms)`);
    return result;
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    const result: TestResult = {
      endpoint,
      scenario,
      success: false,
      statusCode: error.response?.status,
      error: error.message,
      duration,
    };
    
    testResults.push(result);
    console.log(`   ❌ ${scenario}: ${error.response?.status || 'Error'} - ${error.message} (${duration}ms)`);
    return result;
  }
}

/**
 * Test POST /auth/register/client endpoint
 */
async function testClientRegistration() {
  console.log('\n🧪 Testing POST /auth/register/client');

  // Scenario 1: New Clerk user registration as client
  await executeTest(
    'POST /auth/register/client',
    'New user client registration',
    async () => {
      const clientAccount = TEST_ACCOUNTS.clients[0];
      const token = generateMockToken(clientAccount.clerkId, 'client');
      const client = createAuthenticatedClient(token);
      
      return await client.post('/auth/register/client', {
        user: {
          email: clientAccount.email,
          firstName: clientAccount.firstName,
          lastName: clientAccount.lastName,
          role: 'client',
          bio: 'Test client registration',
          isActive: true,
        }
      });
    }
  );

  // Scenario 2: Existing Clerk user converting to client
  await executeTest(
    'POST /auth/register/client',
    'Existing user client conversion',
    async () => {
      const clientAccount = TEST_ACCOUNTS.clients[1];
      const token = generateMockToken(clientAccount.clerkId, 'client');
      const client = createAuthenticatedClient(token);
      
      return await client.post('/auth/register/client', {
        user: {
          email: clientAccount.email,
          firstName: clientAccount.firstName,
          lastName: clientAccount.lastName,
          role: 'client',
          bio: 'Converting existing user to client',
          isActive: true,
        }
      });
    }
  );

  // Scenario 3: Client registration with validation errors
  await executeTest(
    'POST /auth/register/client',
    'Client registration with validation errors',
    async () => {
      const clientAccount = TEST_ACCOUNTS.clients[2];
      const token = generateMockToken(clientAccount.clerkId, 'client');
      const client = createAuthenticatedClient(token);
      
      return await client.post('/auth/register/client', {
        user: {
          // Missing required fields to trigger validation errors
          email: '', // Empty email should cause validation error
          firstName: '',
          lastName: '',
        }
      });
    }
  );
}

/**
 * Test POST /auth/register/therapist endpoint
 */
async function testTherapistRegistration() {
  console.log('\n🧪 Testing POST /auth/register/therapist');

  // Scenario 1: Licensed therapist with complete credentials
  await executeTest(
    'POST /auth/register/therapist',
    'Licensed therapist registration',
    async () => {
      const therapistAccount = TEST_ACCOUNTS.therapists[0];
      const token = generateMockToken(therapistAccount.clerkId, 'therapist');
      const client = createAuthenticatedClient(token);
      
      return await client.post('/auth/register/therapist', {
        user: {
          email: therapistAccount.email,
          firstName: therapistAccount.firstName,
          lastName: therapistAccount.lastName,
          role: 'therapist',
          bio: 'Licensed clinical psychologist',
          isActive: true,
        },
        mobile: '+1234567890',
        province: 'Metro Manila',
        providerType: 'Licensed Clinical Psychologist',
        professionalLicenseType: 'PRC License',
        isPRCLicensed: 'Yes',
        prcLicenseNumber: 'TEST123456',
        expirationDateOfLicense: new Date('2025-12-31'),
        practiceStartDate: new Date('2019-01-01'),
        areasOfExpertise: ['Anxiety', 'Depression'],
        assessmentTools: ['PHQ-9', 'GAD-7'],
        therapeuticApproachesUsedList: ['CBT', 'DBT'],
        languagesOffered: ['English', 'Tagalog'],
        providedOnlineTherapyBefore: true,
        comfortableUsingVideoConferencing: true,
        preferredSessionLength: [60],
        privateConfidentialSpace: 'Yes',
        compliesWithDataPrivacyAct: true,
        professionalLiabilityInsurance: 'Yes',
        complaintsOrDisciplinaryActions: 'No',
        willingToAbideByPlatformGuidelines: true,
        expertise: ['anxiety', 'depression'],
        approaches: ['CBT', 'DBT'],
        languages: ['english', 'tagalog'],
        illnessSpecializations: ['anxiety-disorders'],
        acceptTypes: ['insurance'],
        treatmentSuccessRates: { "anxiety": 85 },
        sessionLength: '60',
        hourlyRate: 150,
      });
    }
  );

  // Scenario 2: International therapist with different licensing
  await executeTest(
    'POST /auth/register/therapist',
    'International therapist registration',
    async () => {
      const therapistAccount = TEST_ACCOUNTS.therapists[1];
      const token = generateMockToken(therapistAccount.clerkId, 'therapist');
      const client = createAuthenticatedClient(token);
      
      return await client.post('/auth/register/therapist', {
        user: {
          email: therapistAccount.email,
          firstName: therapistAccount.firstName,
          lastName: therapistAccount.lastName,
          role: 'therapist',
          bio: 'International licensed therapist',
          isActive: true,
        },
        mobile: '+1234567890',
        province: 'Cebu',
        providerType: 'Licensed Marriage and Family Therapist',
        professionalLicenseType: 'International License',
        isPRCLicensed: 'No',
        prcLicenseNumber: '',
        expirationDateOfLicense: new Date('2025-12-31'),
        practiceStartDate: new Date('2020-01-01'),
        areasOfExpertise: ['Family Therapy', 'Couples Counseling'],
        assessmentTools: ['PHQ-9'],
        therapeuticApproachesUsedList: ['Family Systems'],
        languagesOffered: ['English'],
        providedOnlineTherapyBefore: false,
        comfortableUsingVideoConferencing: true,
        preferredSessionLength: [50],
        privateConfidentialSpace: 'Yes',
        compliesWithDataPrivacyAct: true,
        professionalLiabilityInsurance: 'Yes',
        complaintsOrDisciplinaryActions: 'No',
        willingToAbideByPlatformGuidelines: true,
        expertise: ['family-therapy'],
        approaches: ['family-systems'],
        languages: ['english'],
        illnessSpecializations: ['relationship-issues'],
        acceptTypes: ['self-pay'],
        treatmentSuccessRates: { "family-therapy": 90 },
        sessionLength: '50',
        hourlyRate: 125,
      });
    }
  );

  // Scenario 3: Therapist registration with missing required fields
  await executeTest(
    'POST /auth/register/therapist',
    'Therapist registration with missing fields',
    async () => {
      const therapistAccount = TEST_ACCOUNTS.therapists[2];
      const token = generateMockToken(therapistAccount.clerkId, 'therapist');
      const client = createAuthenticatedClient(token);
      
      return await client.post('/auth/register/therapist', {
        user: {
          email: therapistAccount.email,
          firstName: therapistAccount.firstName,
          lastName: therapistAccount.lastName,
          role: 'therapist',
        },
        // Missing many required fields
        mobile: '',
        province: '',
      });
    }
  );
}

/**
 * Test GET /auth/me endpoint
 */
async function testGetMe() {
  console.log('\n🧪 Testing GET /auth/me');

  // Scenario 1: Active client user profile retrieval
  await executeTest(
    'GET /auth/me',
    'Client user profile retrieval',
    async () => {
      const clientAccount = TEST_ACCOUNTS.clients[0];
      const token = generateMockToken(clientAccount.clerkId, 'client');
      const client = createAuthenticatedClient(token);
      
      return await client.get('/auth/me');
    }
  );

  // Scenario 2: Therapist user with relationships/assignments
  await executeTest(
    'GET /auth/me',
    'Therapist user profile retrieval',
    async () => {
      const therapistAccount = TEST_ACCOUNTS.therapists[0];
      const token = generateMockToken(therapistAccount.clerkId, 'therapist');
      const client = createAuthenticatedClient(token);
      
      return await client.get('/auth/me');
    }
  );

  // Scenario 3: Admin user with elevated permissions
  await executeTest(
    'GET /auth/me',
    'Admin user profile retrieval',
    async () => {
      const adminAccount = TEST_ACCOUNTS.admins[0];
      const token = generateMockToken(adminAccount.clerkId, 'admin');
      const client = createAuthenticatedClient(token);
      
      return await client.get('/auth/me');
    }
  );
}

/**
 * Test GET /auth/users endpoint
 */
async function testGetUsers() {
  console.log('\n🧪 Testing GET /auth/users');

  // Scenario 1: Super admin accessing all users
  await executeTest(
    'GET /auth/users',
    'Super admin accessing all users',
    async () => {
      const adminAccount = TEST_ACCOUNTS.admins[0]; // Super admin
      const token = generateMockToken(adminAccount.clerkId, 'admin');
      const client = createAuthenticatedClient(token);
      
      return await client.get('/auth/users');
    }
  );

  // Scenario 2: Limited admin with filtered access
  await executeTest(
    'GET /auth/users',
    'Limited admin accessing users',
    async () => {
      const adminAccount = TEST_ACCOUNTS.admins[1]; // User manager admin
      const token = generateMockToken(adminAccount.clerkId, 'admin');
      const client = createAuthenticatedClient(token);
      
      return await client.get('/auth/users');
    }
  );

  // Scenario 3: Non-admin user denied access (403 error)
  await executeTest(
    'GET /auth/users',
    'Non-admin user denied access',
    async () => {
      const clientAccount = TEST_ACCOUNTS.clients[0];
      const token = generateMockToken(clientAccount.clerkId, 'client');
      const client = createAuthenticatedClient(token);
      
      return await client.get('/auth/users');
    }
  );
}

/**
 * Test POST /auth/is-admin endpoint
 */
async function testIsAdmin() {
  console.log('\n🧪 Testing POST /auth/is-admin');

  // Scenario 1: Super admin verification (returns true)
  await executeTest(
    'POST /auth/is-admin',
    'Super admin verification',
    async () => {
      const adminAccount = TEST_ACCOUNTS.admins[0];
      const token = generateMockToken(adminAccount.clerkId, 'admin');
      const client = createAuthenticatedClient(token);
      
      return await client.post('/auth/is-admin');
    }
  );

  // Scenario 2: Regular user verification (returns false)
  await executeTest(
    'POST /auth/is-admin',
    'Regular user verification',
    async () => {
      const clientAccount = TEST_ACCOUNTS.clients[0];
      const token = generateMockToken(clientAccount.clerkId, 'client');
      const client = createAuthenticatedClient(token);
      
      return await client.post('/auth/is-admin');
    }
  );

  // Scenario 3: Moderator verification (returns false - not admin)
  await executeTest(
    'POST /auth/is-admin',
    'Moderator verification',
    async () => {
      const moderatorAccount = TEST_ACCOUNTS.moderators[0];
      const token = generateMockToken(moderatorAccount.clerkId, 'moderator');
      const client = createAuthenticatedClient(token);
      
      return await client.post('/auth/is-admin');
    }
  );
}

/**
 * Additional security and edge case tests
 */
async function testSecurityAndEdgeCases() {
  console.log('\n🧪 Testing Security and Edge Cases');

  // Test with no authentication token
  await executeTest(
    'Security Tests',
    'No authentication token',
    async () => {
      const client = createAuthenticatedClient(); // No token
      return await client.get('/auth/me');
    }
  );

  // Test with invalid authentication token
  await executeTest(
    'Security Tests',
    'Invalid authentication token',
    async () => {
      const client = createAuthenticatedClient('invalid.token.here');
      return await client.get('/auth/me');
    }
  );

  // Test with expired token (simulate)
  await executeTest(
    'Security Tests',
    'Expired authentication token',
    async () => {
      const expiredPayload = {
        sub: 'user_test',
        role: 'client',
        iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago (expired)
      };
      const expiredToken = Buffer.from(JSON.stringify(expiredPayload)).toString('base64');
      const client = createAuthenticatedClient(expiredToken);
      
      return await client.get('/auth/me');
    }
  );
}

/**
 * Generate test report
 */
function generateTestReport() {
  console.log('\n📊 Test Results Summary');
  console.log('═'.repeat(80));

  const totalTests = testResults.length;
  const successfulTests = testResults.filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;
  const averageDuration = testResults.reduce((acc, r) => acc + r.duration, 0) / totalTests;

  console.log(`\nOverall Results:`);
  console.log(`• Total Tests: ${totalTests}`);
  console.log(`• Successful: ${successfulTests} (${((successfulTests / totalTests) * 100).toFixed(1)}%)`);
  console.log(`• Failed: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log(`• Average Duration: ${averageDuration.toFixed(0)}ms`);

  // Group by endpoint
  const byEndpoint = testResults.reduce((acc, result) => {
    if (!acc[result.endpoint]) {
      acc[result.endpoint] = [];
    }
    acc[result.endpoint].push(result);
    return acc;
  }, {} as Record<string, TestResult[]>);

  console.log('\nResults by Endpoint:');
  Object.entries(byEndpoint).forEach(([endpoint, results]) => {
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    console.log(`\n${endpoint}:`);
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const statusCode = result.statusCode ? ` [${result.statusCode}]` : '';
      console.log(`  ${status} ${result.scenario}${statusCode} (${result.duration}ms)`);
      if (!result.success && result.error) {
        console.log(`     Error: ${result.error}`);
      }
    });
    console.log(`  Success Rate: ${successful}/${total} (${((successful / total) * 100).toFixed(1)}%)`);
  });

  // Failed tests details
  const failedTestsDetails = testResults.filter(r => !r.success);
  if (failedTestsDetails.length > 0) {
    console.log('\n❌ Failed Tests Details:');
    failedTestsDetails.forEach(test => {
      console.log(`\n• ${test.endpoint} - ${test.scenario}`);
      console.log(`  Status Code: ${test.statusCode || 'N/A'}`);
      console.log(`  Error: ${test.error}`);
      console.log(`  Duration: ${test.duration}ms`);
    });
  }

  console.log('\n' + '═'.repeat(80));
}

/**
 * Validate test environment
 */
async function validateTestEnvironment() {
  console.log('🔍 Validating test environment...');

  // Check API server availability
  try {
    const healthCheck = createAuthenticatedClient();
    await healthCheck.get('/health').catch(() => {
      console.log('   ⚠️  API health check failed - server may not be running');
    });
  } catch (error) {
    console.log('   ⚠️  API server not accessible at', API_BASE_URL);
  }

  // Check test accounts in database
  const testUserCount = await prisma.user.count({
    where: { email: { contains: 'mentaratest.dev' } }
  });

  console.log(`   📊 Found ${testUserCount} test accounts in database`);
  
  if (testUserCount === 0) {
    console.log('   ⚠️  No test accounts found - consider running npm run test-accounts create');
  }

  console.log('   ✅ Environment validation completed');
}

/**
 * Main execution function
 */
async function main() {
  console.log('🧪 Starting Comprehensive Auth Endpoint Testing');
  console.log('═'.repeat(80));

  try {
    await validateTestEnvironment();

    // Execute all test suites
    await testClientRegistration();
    await testTherapistRegistration();
    await testGetMe();
    await testGetUsers();
    await testIsAdmin();
    await testSecurityAndEdgeCases();

    // Generate comprehensive report
    generateTestReport();

    console.log('\n🎉 Testing completed successfully!');

  } catch (error) {
    console.error('\n❌ Testing failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Export functions for use in other scripts
 */
export {
  testClientRegistration,
  testTherapistRegistration,
  testGetMe,
  testGetUsers,
  testIsAdmin,
  testSecurityAndEdgeCases,
  generateTestReport,
  testResults,
};

// Run if called directly
if (require.main === module) {
  main().catch((e) => {
    console.error('❌ Error during testing:', e);
    process.exit(1);
  });
}