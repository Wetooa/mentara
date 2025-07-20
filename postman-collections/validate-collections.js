#!/usr/bin/env node

/**
 * Mentara Postman Collections Validation Script
 * 
 * This script validates all Postman collections to ensure they:
 * - Have proper JSON structure
 * - Follow naming conventions
 * - Include required authentication
 * - Have consistent variable usage
 * - Include proper test scripts
 * - Follow the established patterns
 */

const fs = require('fs');
const path = require('path');

// Configuration
const COLLECTIONS_DIR = __dirname;
const REQUIRED_COLLECTIONS = [
  'Auth.postman_collection.json',
  'Admin.postman_collection.json',
  'Therapist.postman_collection.json',
  'Users.postman_collection.json',
  'Booking.postman_collection.json',
  'Messaging.postman_collection.json',
  'Pre-Assessment.postman_collection.json',
  'Communities.postman_collection.json',
  'Posts.postman_collection.json',
  'Comments.postman_collection.json',
  'Worksheets.postman_collection.json',
  'Sessions.postman_collection.json',
  'Notifications.postman_collection.json',
  'Reviews.postman_collection.json',
  'Files.postman_collection.json',
  'Analytics.postman_collection.json',
  'Audit-Logs.postman_collection.json',
  'Billing.postman_collection.json',
  'Search.postman_collection.json'
];

const VALIDATION_RULES = {
  auth: {
    required: true,
    expectedType: 'bearer',
    expectedToken: '{{accessToken}}'
  },
  naming: {
    pattern: /^Mentara - .+$/,
    exporterPattern: /^mentara-.+$/
  },
  variables: {
    required: ['baseUrl'],
    expectedBaseUrl: 'http://localhost:3001/api'
  },
  structure: {
    requiredFields: ['info', 'auth', 'event', 'variable', 'item'],
    requiredInfoFields: ['name', 'description', 'schema', '_exporter_id']
  },
  tests: {
    globalErrorHandling: true,
    responseTimeTest: true,
    zodValidation: true
  }
};

// Validation results
const validationResults = {
  passed: [],
  failed: [],
  warnings: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

/**
 * Main validation function
 */
function validateCollections() {
  console.log('🔍 Starting Mentara Postman Collections Validation...\n');
  
  // Check if all required collections exist
  const missingCollections = checkRequiredCollections();
  if (missingCollections.length > 0) {
    console.log('❌ Missing required collections:');
    missingCollections.forEach(file => console.log(`   - ${file}`));
    console.log();
  }
  
  // Validate each collection
  const existingCollections = REQUIRED_COLLECTIONS.filter(file => 
    fs.existsSync(path.join(COLLECTIONS_DIR, file))
  );
  
  existingCollections.forEach(file => {
    console.log(`📋 Validating ${file}...`);
    validateCollection(file);
  });
  
  // Validate environment file
  console.log('🌍 Validating environment file...');
  validateEnvironment();
  
  // Display results
  displayResults();
}

/**
 * Check if all required collections exist
 */
function checkRequiredCollections() {
  return REQUIRED_COLLECTIONS.filter(file => 
    !fs.existsSync(path.join(COLLECTIONS_DIR, file))
  );
}

/**
 * Validate a single collection
 */
function validateCollection(filename) {
  const filePath = path.join(COLLECTIONS_DIR, filename);
  const result = {
    file: filename,
    errors: [],
    warnings: [],
    passed: true
  };
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const collection = JSON.parse(content);
    
    // Validate structure
    validateStructure(collection, result);
    
    // Validate authentication
    validateAuth(collection, result);
    
    // Validate naming conventions
    validateNaming(collection, result);
    
    // Validate variables
    validateVariables(collection, result);
    
    // Validate test scripts
    validateTestScripts(collection, result);
    
    // Validate endpoints
    validateEndpoints(collection, result);
    
    validationResults.summary.total++;
    
    if (result.errors.length > 0) {
      result.passed = false;
      validationResults.failed.push(result);
      validationResults.summary.failed++;
    } else {
      validationResults.passed.push(result);
      validationResults.summary.passed++;
    }
    
    if (result.warnings.length > 0) {
      validationResults.warnings.push(result);
      validationResults.summary.warnings++;
    }
    
  } catch (error) {
    result.errors.push(`Failed to parse JSON: ${error.message}`);
    result.passed = false;
    validationResults.failed.push(result);
    validationResults.summary.total++;
    validationResults.summary.failed++;
  }
}

/**
 * Validate collection structure
 */
function validateStructure(collection, result) {
  VALIDATION_RULES.structure.requiredFields.forEach(field => {
    if (!collection[field]) {
      result.errors.push(`Missing required field: ${field}`);
    }
  });
  
  if (collection.info) {
    VALIDATION_RULES.structure.requiredInfoFields.forEach(field => {
      if (!collection.info[field]) {
        result.errors.push(`Missing required info field: ${field}`);
      }
    });
  }
}

/**
 * Validate authentication configuration
 */
function validateAuth(collection, result) {
  if (!collection.auth) {
    result.errors.push('Missing authentication configuration');
    return;
  }
  
  if (collection.auth.type !== VALIDATION_RULES.auth.expectedType) {
    result.errors.push(`Expected auth type '${VALIDATION_RULES.auth.expectedType}', got '${collection.auth.type}'`);
  }
  
  if (collection.auth.bearer) {
    const tokenConfig = collection.auth.bearer.find(item => item.key === 'token');
    if (!tokenConfig || tokenConfig.value !== VALIDATION_RULES.auth.expectedToken) {
      result.errors.push(`Expected auth token '${VALIDATION_RULES.auth.expectedToken}'`);
    }
  }
}

/**
 * Validate naming conventions
 */
function validateNaming(collection, result) {
  if (collection.info) {
    if (!VALIDATION_RULES.naming.pattern.test(collection.info.name)) {
      result.errors.push(`Collection name '${collection.info.name}' doesn't match pattern '${VALIDATION_RULES.naming.pattern}'`);
    }
    
    if (collection.info._exporter_id && !VALIDATION_RULES.naming.exporterPattern.test(collection.info._exporter_id)) {
      result.warnings.push(`Exporter ID '${collection.info._exporter_id}' doesn't match pattern '${VALIDATION_RULES.naming.exporterPattern}'`);
    }
  }
}

/**
 * Validate variables
 */
function validateVariables(collection, result) {
  if (!collection.variable || !Array.isArray(collection.variable)) {
    result.errors.push('Missing or invalid variables array');
    return;
  }
  
  const variableKeys = collection.variable.map(v => v.key);
  
  VALIDATION_RULES.variables.required.forEach(requiredVar => {
    if (!variableKeys.includes(requiredVar)) {
      result.errors.push(`Missing required variable: ${requiredVar}`);
    }
  });
  
  const baseUrlVar = collection.variable.find(v => v.key === 'baseUrl');
  if (baseUrlVar && baseUrlVar.value !== VALIDATION_RULES.variables.expectedBaseUrl) {
    result.warnings.push(`BaseUrl variable value '${baseUrlVar.value}' doesn't match expected '${VALIDATION_RULES.variables.expectedBaseUrl}'`);
  }
}

/**
 * Validate test scripts
 */
function validateTestScripts(collection, result) {
  if (!collection.event || !Array.isArray(collection.event)) {
    result.errors.push('Missing global event handlers');
    return;
  }
  
  const testEvent = collection.event.find(e => e.listen === 'test');
  if (!testEvent) {
    result.errors.push('Missing global test event handler');
    return;
  }
  
  const testScript = testEvent.script.exec.join('\n');
  
  if (!testScript.includes('Response time is acceptable')) {
    result.warnings.push('Missing response time test in global handler');
  }
  
  if (!testScript.includes('Zod validation errors')) {
    result.warnings.push('Missing Zod validation error handling');
  }
}

/**
 * Validate endpoints
 */
function validateEndpoints(collection, result) {
  if (!collection.item || !Array.isArray(collection.item)) {
    result.errors.push('Missing or invalid items array');
    return;
  }
  
  let endpointCount = 0;
  
  function countEndpoints(items) {
    items.forEach(item => {
      if (item.request) {
        endpointCount++;
      }
      if (item.item && Array.isArray(item.item)) {
        countEndpoints(item.item);
      }
    });
  }
  
  countEndpoints(collection.item);
  
  if (endpointCount === 0) {
    result.errors.push('No endpoints found in collection');
  } else if (endpointCount < 5) {
    result.warnings.push(`Only ${endpointCount} endpoints found, expected more for comprehensive coverage`);
  }
}

/**
 * Validate environment file
 */
function validateEnvironment() {
  const envFile = path.join(COLLECTIONS_DIR, 'Mentara.postman_environment.json');
  const result = {
    file: 'Mentara.postman_environment.json',
    errors: [],
    warnings: [],
    passed: true
  };
  
  if (!fs.existsSync(envFile)) {
    result.errors.push('Environment file not found');
    result.passed = false;
    validationResults.failed.push(result);
    validationResults.summary.total++;
    validationResults.summary.failed++;
    return;
  }
  
  try {
    const content = fs.readFileSync(envFile, 'utf8');
    const environment = JSON.parse(content);
    
    if (!environment.name || !environment.name.includes('Mentara')) {
      result.errors.push('Environment name should include "Mentara"');
    }
    
    if (!environment.values || !Array.isArray(environment.values)) {
      result.errors.push('Missing or invalid values array in environment');
    } else {
      const requiredVars = ['baseUrl', 'accessToken', 'userId', 'clientId', 'therapistId'];
      const envVars = environment.values.map(v => v.key);
      
      requiredVars.forEach(reqVar => {
        if (!envVars.includes(reqVar)) {
          result.errors.push(`Missing required environment variable: ${reqVar}`);
        }
      });
      
      if (environment.values.length < 20) {
        result.warnings.push(`Only ${environment.values.length} environment variables found, expected more for comprehensive testing`);
      }
    }
    
    validationResults.summary.total++;
    
    if (result.errors.length > 0) {
      result.passed = false;
      validationResults.failed.push(result);
      validationResults.summary.failed++;
    } else {
      validationResults.passed.push(result);
      validationResults.summary.passed++;
    }
    
    if (result.warnings.length > 0) {
      validationResults.warnings.push(result);
      validationResults.summary.warnings++;
    }
    
  } catch (error) {
    result.errors.push(`Failed to parse environment JSON: ${error.message}`);
    result.passed = false;
    validationResults.failed.push(result);
    validationResults.summary.total++;
    validationResults.summary.failed++;
  }
}

/**
 * Display validation results
 */
function displayResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION RESULTS');
  console.log('='.repeat(60));
  
  console.log(`\n📈 Summary:`);
  console.log(`   Total Files: ${validationResults.summary.total}`);
  console.log(`   ✅ Passed: ${validationResults.summary.passed}`);
  console.log(`   ❌ Failed: ${validationResults.summary.failed}`);
  console.log(`   ⚠️  Warnings: ${validationResults.summary.warnings}`);
  
  if (validationResults.failed.length > 0) {
    console.log('\n❌ FAILED VALIDATIONS:');
    validationResults.failed.forEach(result => {
      console.log(`\n   ${result.file}:`);
      result.errors.forEach(error => console.log(`     - ${error}`));
    });
  }
  
  if (validationResults.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    validationResults.warnings.forEach(result => {
      console.log(`\n   ${result.file}:`);
      result.warnings.forEach(warning => console.log(`     - ${warning}`));
    });
  }
  
  if (validationResults.passed.length > 0) {
    console.log('\n✅ PASSED VALIDATIONS:');
    validationResults.passed.forEach(result => {
      console.log(`   - ${result.file}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (validationResults.summary.failed === 0) {
    console.log('🎉 All validations passed! Collections are ready for use.');
  } else {
    console.log('🚨 Some validations failed. Please fix the issues above.');
  }
  
  console.log('='.repeat(60));
}

// Run validation
if (require.main === module) {
  validateCollections();
}

module.exports = {
  validateCollections,
  validationResults
};