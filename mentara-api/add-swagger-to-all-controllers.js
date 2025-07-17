#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Controller mappings with their API tags
const controllerMappings = {
  'audit-logs.controller.ts': 'audit-logs',
  'communities.controller.ts': 'communities',
  'messaging.controller.ts': 'messaging',
  'sessions.controller.ts': 'sessions',
  'booking.controller.ts': 'booking',
  'meetings.controller.ts': 'meetings',
  'posts.controller.ts': 'posts',
  'reviews.controller.ts': 'reviews',
  'worksheets.controller.ts': 'worksheets',
  'comments.controller.ts': 'comments',
  'notifications.controller.ts': 'notifications',
  'client.controller.ts': 'clients',
  'therapist-management.controller.ts': 'therapists',
  'pre-assessment.controller.ts': 'pre-assessment',
  'search.controller.ts': 'search',
  'analytics.controller.ts': 'analytics',
  'dashboard.controller.ts': 'dashboard',
  'admin.controller.ts': 'admin',
  'moderator.controller.ts': 'moderator',
  'onboarding.controller.ts': 'onboarding'
};

// HTTP method patterns and their Swagger operation summaries
const httpMethodPatterns = {
  '@Get(': {
    operation: 'Retrieve',
    status: 200,
    description: 'Retrieved successfully'
  },
  '@Post(': {
    operation: 'Create',
    status: 201,
    description: 'Created successfully'
  },
  '@Put(': {
    operation: 'Update',
    status: 200,
    description: 'Updated successfully'
  },
  '@Patch(': {
    operation: 'Partially update',
    status: 200,
    description: 'Updated successfully'
  },
  '@Delete(': {
    operation: 'Delete',
    status: 200,
    description: 'Deleted successfully'
  }
};

function findControllerFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findControllerFiles(fullPath));
    } else if (item.endsWith('.controller.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function addSwaggerImports(content) {
  const swaggerImports = `import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';`;

  // Check if swagger imports already exist
  if (content.includes('@nestjs/swagger')) {
    return content;
  }

  // Find the last import statement and add swagger imports after it
  const importRegex = /import\s+.*?from\s+['"].*?['"];/g;
  let lastImportIndex = 0;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    lastImportIndex = match.index + match[0].length;
  }
  
  return content.slice(0, lastImportIndex) + '\n' + swaggerImports + content.slice(lastImportIndex);
}

function addSwaggerToController(content, tag) {
  // Add ApiTags and ApiBearerAuth to controller class
  const controllerRegex = /(@Controller\([^)]*\)[\s\S]*?)export class/;
  const match = content.match(controllerRegex);
  
  if (match) {
    const controllerDecorators = match[1];
    
    // Check if ApiTags already exists
    if (!controllerDecorators.includes('@ApiTags')) {
      const newDecorators = `@ApiTags('${tag}')\n@ApiBearerAuth('JWT-auth')\n${controllerDecorators}`;
      content = content.replace(controllerRegex, newDecorators + 'export class');
    }
  }
  
  return content;
}

function addSwaggerToEndpoints(content) {
  // Find all HTTP method decorators and add basic Swagger documentation
  for (const [methodPattern, config] of Object.entries(httpMethodPatterns)) {
    const regex = new RegExp(`(\\s*)(${methodPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^)]*\\))([\\s\\S]*?)(async\\s+\\w+)`, 'g');
    
    content = content.replace(regex, (match, indent, decorator, middleContent, methodName) => {
      // Skip if already has ApiOperation
      if (middleContent.includes('@ApiOperation')) {
        return match;
      }
      
      const methodNameClean = methodName.replace('async ', '').trim();
      const operationName = `${config.operation} ${methodNameClean.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
      
      const swaggerDecorators = `${indent}@ApiOperation({ 
${indent}  summary: '${operationName}',
${indent}  description: '${operationName}' 
${indent}})
${indent}@ApiResponse({ 
${indent}  status: ${config.status}, 
${indent}  description: '${config.description}' 
${indent}})
${indent}@ApiResponse({ status: 401, description: 'Unauthorized' })
${indent}`;
      
      return indent + decorator + '\n' + swaggerDecorators + middleContent + methodName;
    });
  }
  
  return content;
}

function processController(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const tag = controllerMappings[fileName] || fileName.replace('.controller.ts', '');
  
  // Skip if this is one of the controllers we already manually updated
  const manuallyUpdated = [
    'auth.controller.ts',
    'users.controller.ts',
    'billing.controller.ts' // We partially updated this one
  ];
  
  if (manuallyUpdated.some(name => fileName.includes(name))) {
    console.log(`  Skipping ${fileName} - manually updated`);
    return;
  }
  
  try {
    // Add swagger imports
    content = addSwaggerImports(content);
    
    // Add controller-level decorators
    content = addSwaggerToController(content, tag);
    
    // Add endpoint-level decorators
    content = addSwaggerToEndpoints(content);
    
    // Write back to file
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Updated ${fileName}`);
    
  } catch (error) {
    console.error(`  ❌ Error processing ${fileName}:`, error.message);
  }
}

function main() {
  const srcDir = __dirname.endsWith('src') ? __dirname : path.join(__dirname, 'src');
  const controllerFiles = findControllerFiles(srcDir);
  
  console.log(`Found ${controllerFiles.length} controller files:`);
  controllerFiles.forEach(file => console.log(`  - ${path.relative(srcDir, file)}`));
  console.log('\nProcessing controllers...\n');
  
  let processed = 0;
  let errors = 0;
  
  for (const file of controllerFiles) {
    try {
      processController(file);
      processed++;
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
      errors++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  - Controllers processed: ${processed}`);
  console.log(`  - Errors: ${errors}`);
  console.log(`  - Total controllers: ${controllerFiles.length}`);
  
  if (errors === 0) {
    console.log('\n🎉 All controllers successfully updated with Swagger documentation!');
  }
}

if (require.main === module) {
  main();
}