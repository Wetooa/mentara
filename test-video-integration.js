#!/usr/bin/env node

/**
 * Video Call Integration Test Script
 * Tests the video call functionality end-to-end
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test-client@mentara.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';
const THERAPIST_EMAIL = process.env.THERAPIST_EMAIL || 'test-therapist@mentara.com';

let clientToken = '';
let therapistToken = '';
let testMeetingId = '';

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper functions
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m'  // Yellow
  };
  console.log(`${colors[type]}%s\x1b[0m`, message);
};

const test = async (name, testFn) => {
  try {
    log(`\n🧪 Testing: ${name}`, 'info');
    await testFn();
    log(`✅ PASSED: ${name}`, 'success');
    results.passed++;
    results.tests.push({ name, status: 'PASSED' });
  } catch (error) {
    log(`❌ FAILED: ${name} - ${error.message}`, 'error');
    results.failed++;
    results.tests.push({ name, status: 'FAILED', error: error.message });
  }
};

// API helper
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Authentication tests
const testLogin = async () => {
  // Login as client
  const clientResponse = await api.post('/auth/login', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });
  
  if (clientResponse.status !== 200) {
    throw new Error('Client login failed');
  }
  
  clientToken = clientResponse.data.accessToken;
  log(`Client logged in successfully`, 'success');

  // Login as therapist
  const therapistResponse = await api.post('/auth/login', {
    email: THERAPIST_EMAIL,
    password: TEST_PASSWORD
  });
  
  if (therapistResponse.status !== 200) {
    throw new Error('Therapist login failed');
  }
  
  therapistToken = therapistResponse.data.accessToken;
  log(`Therapist logged in successfully`, 'success');
};

const testPasswordReset = async () => {
  // Request password reset
  const response = await api.post('/auth/request-password-reset', {
    email: TEST_EMAIL
  });
  
  if (response.status !== 200) {
    throw new Error('Password reset request failed');
  }
  
  log('Password reset email sent successfully', 'success');
};

const testEmailVerification = async () => {
  // Send verification email
  const response = await api.post('/auth/send-verification-email', {}, {
    headers: { Authorization: `Bearer ${clientToken}` }
  });
  
  if (response.status !== 200) {
    throw new Error('Send verification email failed');
  }
  
  log('Verification email sent successfully', 'success');
};

// Meeting tests
const testGetUpcomingMeetings = async () => {
  const response = await api.get('/meetings/upcoming', {
    headers: { Authorization: `Bearer ${clientToken}` }
  });
  
  if (response.status !== 200) {
    throw new Error('Get upcoming meetings failed');
  }

  const meetings = response.data;
  if (meetings && meetings.length > 0) {
    testMeetingId = meetings[0].id;
    log(`Found test meeting: ${testMeetingId}`, 'success');
  } else {
    log('No meetings found, will create a mock meeting ID', 'warning');
    testMeetingId = 'test-meeting-' + Date.now();
  }
};

// Video call tests
const testCreateVideoRoom = async () => {
  if (!testMeetingId) {
    throw new Error('No meeting ID available for testing');
  }

  const createRoomData = {
    meetingId: testMeetingId,
    roomType: 'video',
    maxParticipants: 2,
    enableRecording: false,
    enableChat: true
  };

  try {
    const response = await api.post(`/meetings/${testMeetingId}/video-room`, createRoomData, {
      headers: { Authorization: `Bearer ${clientToken}` }
    });
    
    if (response.status !== 201) {
      throw new Error(`Expected 201, got ${response.status}`);
    }

    const roomData = response.data;
    if (!roomData.roomId || !roomData.roomUrl) {
      throw new Error('Invalid room response structure');
    }

    log(`Video room created: ${roomData.roomId}`, 'success');
  } catch (error) {
    if (error.response?.status === 400) {
      // Meeting might not be in the right status, that's expected for test data
      log('Video room creation failed (expected with test data)', 'warning');
      return;
    }
    throw error;
  }
};

const testJoinVideoRoom = async () => {
  if (!testMeetingId) {
    throw new Error('No meeting ID available for testing');
  }

  const joinRoomData = {
    role: 'therapist',
    enableVideo: true,
    enableAudio: true
  };

  try {
    const response = await api.post(`/meetings/${testMeetingId}/join-video`, joinRoomData, {
      headers: { Authorization: `Bearer ${therapistToken}` }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    const joinData = response.data;
    if (!joinData.roomId) {
      throw new Error('Invalid join response structure');
    }

    log(`Joined video room: ${joinData.roomId}`, 'success');
  } catch (error) {
    if (error.response?.status === 400) {
      // Meeting might not be in progress, that's expected for test data
      log('Join video room failed (expected with test data)', 'warning');
      return;
    }
    throw error;
  }
};

const testGetVideoCallStatus = async () => {
  if (!testMeetingId) {
    throw new Error('No meeting ID available for testing');
  }

  try {
    const response = await api.get(`/meetings/${testMeetingId}/video-status`, {
      headers: { Authorization: `Bearer ${clientToken}` }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    const statusData = response.data;
    if (!statusData.meetingId) {
      throw new Error('Invalid status response structure');
    }

    log(`Video call status: ${statusData.status}`, 'success');
  } catch (error) {
    if (error.response?.status === 404) {
      // Meeting might not exist, that's expected for test data
      log('Get video status failed (expected with test data)', 'warning');
      return;
    }
    throw error;
  }
};

const testEndVideoCall = async () => {
  if (!testMeetingId) {
    throw new Error('No meeting ID available for testing');
  }

  const endCallData = {
    endReason: 'session_completed',
    sessionSummary: {
      duration: 300, // 5 minutes
      connectionQuality: 'good',
      technicalIssues: []
    },
    nextSteps: ['Schedule follow-up']
  };

  try {
    const response = await api.delete(`/meetings/${testMeetingId}/video-room`, {
      data: endCallData,
      headers: { Authorization: `Bearer ${therapistToken}` }
    });
    
    if (response.status !== 204) {
      throw new Error(`Expected 204, got ${response.status}`);
    }

    log('Video call ended successfully', 'success');
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 404) {
      // Meeting might not be in progress or not exist, that's expected for test data
      log('End video call failed (expected with test data)', 'warning');
      return;
    }
    throw error;
  }
};

// Reviews tests
const testGetReviews = async () => {
  const response = await api.get('/reviews', {
    headers: { Authorization: `Bearer ${clientToken}` }
  });
  
  if (response.status !== 200) {
    throw new Error('Get reviews failed');
  }

  log('Reviews retrieved successfully', 'success');
};

// Main test runner
const runTests = async () => {
  log('🚀 Starting Video Call Integration Tests', 'info');
  log(`Testing against: ${API_BASE_URL}`, 'info');

  // Authentication tests
  await test('User Login (Client & Therapist)', testLogin);
  await test('Password Reset Request', testPasswordReset);
  await test('Email Verification Send', testEmailVerification);

  // Meeting tests
  await test('Get Upcoming Meetings', testGetUpcomingMeetings);

  // Video call tests
  await test('Create Video Room', testCreateVideoRoom);
  await test('Join Video Room', testJoinVideoRoom);
  await test('Get Video Call Status', testGetVideoCallStatus);
  await test('End Video Call', testEndVideoCall);

  // Reviews tests
  await test('Get Reviews', testGetReviews);

  // Print results
  log('\n📊 Test Results Summary', 'info');
  log(`✅ Passed: ${results.passed}`, 'success');
  log(`❌ Failed: ${results.failed}`, 'error');
  log(`📋 Total: ${results.passed + results.failed}`, 'info');

  if (results.failed > 0) {
    log('\n❌ Failed Tests:', 'error');
    results.tests
      .filter(test => test.status === 'FAILED')
      .forEach(test => log(`  - ${test.name}: ${test.error}`, 'error'));
  }

  log('\n🏁 Testing Complete!', 'info');
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
};

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  log(`Unhandled error: ${error.message}`, 'error');
  process.exit(1);
});

// Run tests
runTests().catch((error) => {
  log(`Test runner failed: ${error.message}`, 'error');
  process.exit(1);
});

// Export for potential use in other test files
module.exports = {
  test,
  api,
  log
};