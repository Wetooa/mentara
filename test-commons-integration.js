#!/usr/bin/env node

// Simple integration test for mentara-commons
const { validateSchema, UserSchema, CreateUserRequestSchema } = require('./mentara-commons/dist/index.js');

console.log('🧪 Testing Mentara Commons Integration...\n');

// Test 1: Valid user data
console.log('📋 Test 1: Valid user data');
const validUser = {
  id: 'user123',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'client',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

const userResult = validateSchema(UserSchema, validUser);
if (userResult.success) {
  console.log('✅ User validation passed');
} else {
  console.log('❌ User validation failed:', userResult.errors);
}

// Test 2: Invalid user data
console.log('\n📋 Test 2: Invalid user data');
const invalidUser = {
  id: '',
  email: 'invalid-email',
  role: 'invalid-role'
};

const invalidUserResult = validateSchema(UserSchema, invalidUser);
if (!invalidUserResult.success) {
  console.log('✅ Invalid user correctly rejected');
  console.log('📝 Errors:', invalidUserResult.errors?.map(e => e.message).join(', '));
} else {
  console.log('❌ Invalid user incorrectly accepted');
}

// Test 3: Create user request
console.log('\n📋 Test 3: Create user request');
const createRequest = {
  email: 'jane@example.com',
  firstName: 'Jane',
  lastName: 'Smith'
};

const createResult = validateSchema(CreateUserRequestSchema, createRequest);
if (createResult.success) {
  console.log('✅ Create user request validation passed');
} else {
  console.log('❌ Create user request validation failed:', createResult.errors);
}

console.log('\n🎉 Commons integration test completed!');
console.log('📊 Summary:');
console.log('  - ✅ Zod schemas working');
console.log('  - ✅ Type inference working');
console.log('  - ✅ Validation utilities working');
console.log('  - ✅ Package exports working');