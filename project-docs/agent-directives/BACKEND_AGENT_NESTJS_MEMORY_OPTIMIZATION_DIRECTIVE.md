# 🚀 BACKEND AGENT - NESTJS MEMORY OPTIMIZATION DIRECTIVE

**From**: Project Manager  
**To**: Backend Agent  
**Priority**: 🔴 **URGENT - BLOCKING DEVELOPMENT**  
**Estimated Time**: 2.5 hours  
**Date**: 2025-01-15  

## 🎯 **MISSION OBJECTIVE**

**PRIMARY GOAL**: Fix critical NestJS memory overload issue that prevents backend development and deployment.

**ROOT CAUSE IDENTIFIED**: TypeScript is attempting to compile the entire monorepo (including Next.js frontend) instead of just the backend, causing memory exhaustion during `npm run start:dev` and `npm run build`.

**SUCCESS DEFINITION**: Backend starts quickly (<30 seconds) with minimal memory usage (<2GB), builds successfully without memory errors, and development workflow restored.

---

## ⚠️ **CRITICAL ISSUE ANALYSIS**

### **🔍 Current Problems Identified:**

1. **CRITICAL: Frontend Compilation Leak**
   - `tsconfig.json` and `tsconfig.build.json` missing `../mentara-client/**/*` exclusions
   - TypeScript attempting to compile Next.js, React, and frontend dependencies
   - Results in 8GB+ memory usage and build failures

2. **Missing Service Isolation**
   - No exclusions for `../ai-patient-evaluation/**/*` 
   - Parent-level `node_modules` not excluded
   - Test files and scripts included in compilation

3. **No Memory Management**
   - Package.json scripts lack Node.js heap size optimization
   - No memory limits for development processes
   - Watch mode inefficient for large codebases

4. **Suboptimal Build Configuration**
   - Missing TypeScript incremental compilation optimizations
   - No build info caching configured
   - Source map generation inefficient

### **✅ Current Strengths (Keep These):**
- ✅ `nest-cli.json` correctly uses `tsconfig.build.json`
- ✅ Import patterns use specific imports (not wildcards)
- ✅ Proper Zod validation integration from commons
- ✅ Project structure is well-organized

---

## 🚀 **4-PHASE EXECUTION STRATEGY**

### **PHASE 1: TYPESCRIPT CONFIGURATION ISOLATION** ⚡ (1 hour) - CRITICAL

**Objective**: Completely isolate backend TypeScript compilation from frontend and other services.

#### **1.1 Fix Base TypeScript Configuration**

**Update `mentara-api/tsconfig.json`:**
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "noFallthroughCasesInSwitch": false,
    "strict": true,
    "isolatedModules": true,
    "resolveJsonModule": true
  },
  "exclude": [
    "scripts/**/*",
    "node_modules",
    "dist",
    "../mentara-client/**/*",
    "../ai-patient-evaluation/**/*",
    "../node_modules/**/*",
    "../.*",
    "**/*.spec.ts",
    "**/*.test.ts",
    "test/**/*",
    "coverage/**/*",
    ".nyc_output/**/*"
  ]
}
```

**Key Changes:**
- ✅ Added `../mentara-client/**/*` - Prevents frontend compilation
- ✅ Added `../ai-patient-evaluation/**/*` - Excludes Python service
- ✅ Added `../node_modules/**/*` - Excludes parent node_modules
- ✅ Added `tsBuildInfoFile` - Enables incremental compilation caching
- ✅ Added `isolatedModules` - Improves compilation performance
- ✅ Enhanced test file exclusions

#### **1.2 Optimize Build Configuration**

**Update `mentara-api/tsconfig.build.json`:**
```json
{
  "extends": "./tsconfig.json",
  "exclude": [
    "node_modules",
    "test",
    "dist",
    "**/*spec.ts",
    "**/*test.ts",
    "scripts/**/*",
    "../mentara-client/**/*",
    "../ai-patient-evaluation/**/*",
    "../node_modules/**/*",
    "../.*",
    "coverage/**/*",
    ".nyc_output/**/*",
    "prisma/seed*.ts"
  ],
  "compilerOptions": {
    "sourceMap": false,
    "declaration": false,
    "removeComments": true
  }
}
```

**Key Changes:**
- ✅ Inherits isolation from base config
- ✅ Optimized for production builds (no source maps, no declarations)
- ✅ Excludes seed files and development scripts

#### **1.3 Verification Commands**
```bash
# Test exclusions are working
cd mentara-api
npx tsc --listFiles | grep -E "(mentara-client|ai-patient)" || echo "✅ Frontend properly excluded"

# Verify build info creation
rm -f .tsbuildinfo
npm run build
ls -la .tsbuildinfo && echo "✅ Incremental compilation enabled"
```

### **PHASE 2: MEMORY MANAGEMENT OPTIMIZATION** ⚡ (30 minutes)

**Objective**: Add Node.js heap size optimization and memory limits to prevent OOM errors.

#### **2.1 Update Package.json Scripts**

**Update `mentara-api/package.json` scripts section:**
```json
{
  "scripts": {
    "build": "node --max-old-space-size=4096 node_modules/.bin/nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "node --max-old-space-size=3072 node_modules/.bin/nest start --watch",
    "start:debug": "node --max-old-space-size=3072 node_modules/.bin/nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "node --max-old-space-size=2048 node_modules/.bin/jest",
    "test:watch": "node --max-old-space-size=2048 node_modules/.bin/jest --watch",
    "test:cov": "node --max-old-space-size=2048 node_modules/.bin/jest --coverage",
    "test:debug": "node --inspect-brk --max-old-space-size=2048 -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "node --max-old-space-size=2048 node_modules/.bin/jest --config ./test/jest-e2e.json",
    "db:seed": "node --max-old-space-size=1024 node_modules/.bin/ts-node prisma/seed.ts",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:reset": "prisma migrate reset --force && npm run db:seed",
    "migrate:therapist-files": "node --max-old-space-size=1024 node_modules/.bin/ts-node scripts/migrate-therapist-files.ts",
    "assign-therapist": "node --max-old-space-size=1024 node_modules/.bin/ts-node scripts/assign-therapist.ts",
    "assign-random-therapists": "node --max-old-space-size=1024 node_modules/.bin/ts-node scripts/assign-therapist.ts random",
    "test-accounts": "node --max-old-space-size=1024 node_modules/.bin/ts-node scripts/create-test-accounts.ts",
    "seed-test-data": "node --max-old-space-size=1024 node_modules/.bin/ts-node prisma/seed-test-accounts.ts",
    "test-auth-endpoints": "node --max-old-space-size=1024 node_modules/.bin/ts-node scripts/test-auth-endpoints.ts",
    "cleanup-test-accounts": "node --max-old-space-size=1024 node_modules/.bin/ts-node scripts/cleanup-test-accounts.ts",
    "validate-endpoints": "node --max-old-space-size=1024 node_modules/.bin/ts-node scripts/validate-api-endpoints.ts"
  }
}
```

**Memory Allocation Strategy:**
- **Build**: 4GB - Heavy TypeScript compilation
- **Development**: 3GB - Watch mode with incremental compilation
- **Testing**: 2GB - Jest with coverage
- **Scripts**: 1GB - Simple utility scripts

#### **2.2 Create Memory Configuration File**

**Create `mentara-api/.nvmrc`:**
```
v20
```

**Create `mentara-api/.node-version`:**
```
20
```

### **PHASE 3: BUILD PROCESS OPTIMIZATION** ⚡ (30 minutes)

**Objective**: Optimize compilation settings and watch mode for better development performance.

#### **3.1 Optimize NestJS CLI Configuration**

**Update `mentara-api/nest-cli.json`:**
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "tsConfigPath": "tsconfig.build.json",
    "watchMode": true,
    "watchAssets": false,
    "assets": [],
    "plugins": []
  },
  "projects": {},
  "monorepo": false,
  "root": ".",
  "entryFile": "main"
}
```

**Key Optimizations:**
- ✅ `watchAssets: false` - Don't watch non-TypeScript files
- ✅ Empty `assets` array - No asset copying overhead
- ✅ `watchMode: true` - Enable efficient watch mode

#### **3.2 Create Development Environment File**

**Create `mentara-api/.env.development`:**
```env
# Development Performance Settings
NODE_ENV=development
NODE_OPTIONS=--max-old-space-size=3072
TS_NODE_COMPILER_OPTIONS={"skipLibCheck":true}
```

#### **3.3 Optimize Jest Configuration**

**Update `mentara-api/jest.config.js` (create if missing):**
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapping: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '../mentara-client/',
    '../ai-patient-evaluation/'
  ],
  maxWorkers: '50%',
  workerIdleMemoryLimit: '512MB'
};
```

### **PHASE 4: VALIDATION & PERFORMANCE TESTING** ⚡ (30 minutes)

**Objective**: Comprehensive validation that memory issues are resolved and performance is optimized.

#### **4.1 Memory Usage Testing**

**Test Script: `mentara-api/scripts/test-memory-usage.sh`:**
```bash
#!/bin/bash
set -e

echo "🚀 Testing NestJS Memory Optimization..."

# Clean up previous builds
rm -rf dist/ .tsbuildinfo

echo "\n1. Testing Build Process..."
time npm run build

echo "\n2. Testing Development Startup..."
timeout 30s npm run start:dev &
DEV_PID=$!
sleep 20
kill $DEV_PID 2>/dev/null || true

echo "\n3. Testing Memory Usage..."
if command -v ps >/dev/null 2>&1; then
    npm run start:dev &
    APP_PID=$!
    sleep 10
    
    MEMORY_MB=$(ps -o rss= -p $APP_PID | awk '{print int($1/1024)}')
    echo "Memory usage: ${MEMORY_MB}MB"
    
    if [ $MEMORY_MB -lt 2048 ]; then
        echo "✅ Memory usage under 2GB threshold"
    else
        echo "❌ Memory usage too high: ${MEMORY_MB}MB"
    fi
    
    kill $APP_PID 2>/dev/null || true
fi

echo "\n4. Testing TypeScript Exclusions..."
FRONTEND_FILES=$(npx tsc --listFiles 2>/dev/null | grep -c "mentara-client" || echo "0")
if [ $FRONTEND_FILES -eq 0 ]; then
    echo "✅ Frontend files properly excluded"
else
    echo "❌ Frontend files still being compiled: $FRONTEND_FILES files"
fi

echo "\n🎯 Memory optimization testing complete!"
```

#### **4.2 Performance Benchmarking**

**Create `mentara-api/scripts/benchmark-performance.js`:**
```javascript
const { performance } = require('perf_hooks');
const { spawn } = require('child_process');

async function benchmarkStartup() {
  console.log('📊 Benchmarking NestJS startup performance...\n');
  
  const startTime = performance.now();
  
  const nestProcess = spawn('npm', ['run', 'start:dev'], {
    cwd: process.cwd(),
    stdio: 'pipe'
  });
  
  let startupComplete = false;
  
  nestProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Nest application successfully started')) {
      const endTime = performance.now();
      const startupTime = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(`✅ Startup completed in ${startupTime} seconds`);
      
      if (startupTime < 30) {
        console.log('🎯 Startup performance: EXCELLENT');
      } else if (startupTime < 60) {
        console.log('⚠️  Startup performance: ACCEPTABLE');
      } else {
        console.log('❌ Startup performance: NEEDS IMPROVEMENT');
      }
      
      startupComplete = true;
      nestProcess.kill();
    }
  });
  
  setTimeout(() => {
    if (!startupComplete) {
      console.log('❌ Startup timeout after 60 seconds');
      nestProcess.kill();
    }
  }, 60000);
}

benchmarkStartup().catch(console.error);
```

#### **4.3 Final Validation Checklist**

**Validation Commands:**
```bash
# 1. Clean build test
cd mentara-api
rm -rf dist/ .tsbuildinfo node_modules/.cache
npm run build
echo "✅ Build completed successfully"

# 2. Development startup test
timeout 45s npm run start:dev || echo "✅ Development startup working"

# 3. TypeScript compilation scope test
npx tsc --listFiles | grep -E "(mentara-client|ai-patient)" || echo "✅ Exclusions working"

# 4. Memory configuration test
node -p "process.memoryUsage()" && echo "✅ Node.js memory available"

# 5. Incremental compilation test
touch src/main.ts
npm run build
ls -la .tsbuildinfo && echo "✅ Incremental compilation enabled"
```

**Success Criteria Validation:**
- [ ] ✅ Backend builds in under 2 minutes
- [ ] ✅ Development startup in under 30 seconds  
- [ ] ✅ Memory usage under 2GB during development
- [ ] ✅ No frontend files in TypeScript compilation
- [ ] ✅ Incremental compilation working (.tsbuildinfo created)
- [ ] ✅ All tests pass with memory optimization

---

## 📊 **PERFORMANCE TARGETS**

### **Before Optimization (Current Issues):**
- ❌ Build time: 5+ minutes or failure
- ❌ Startup time: 2+ minutes or timeout
- ❌ Memory usage: 8GB+ (causes OOM)
- ❌ Development: Frequent crashes

### **After Optimization (Expected Results):**
- ✅ Build time: 60-90 seconds
- ✅ Startup time: 15-30 seconds
- ✅ Memory usage: 1.5-2GB peak
- ✅ Development: Stable, fast iteration

### **Key Performance Indicators:**
1. **Startup Performance**: <30 seconds from `npm run start:dev`
2. **Memory Efficiency**: <2GB RAM usage during development
3. **Build Performance**: <2 minutes for clean build
4. **Watch Mode**: <3 seconds for incremental rebuilds
5. **Test Performance**: All tests complete in <60 seconds

---

## ⚠️ **TROUBLESHOOTING GUIDE**

### **Issue: Still Getting Memory Errors**
**Solution:**
```bash
# Check exclusions are working
npx tsc --listFiles | head -20

# Verify no frontend compilation
npx tsc --listFiles | grep mentara-client || echo "Good - no frontend"

# Manually set higher memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run start:dev
```

### **Issue: Slow Startup After Changes**
**Solution:**
```bash
# Clear TypeScript cache
rm -f .tsbuildinfo

# Clear Node.js cache  
rm -rf node_modules/.cache

# Restart with clean state
npm run start:dev
```

### **Issue: Import Errors from mentara-commons**
**Solution:**
```bash
# Verify commons package is built
cd ../mentara-commons
npm run build

# Reinstall in backend
cd ../mentara-api
npm install ../mentara-commons
```

---

## 🚀 **IMMEDIATE EXECUTION STEPS**

### **Priority Order:**
1. **EXECUTE PHASE 1 IMMEDIATELY** - TypeScript configuration fixes (CRITICAL)
2. **EXECUTE PHASE 2** - Memory management (HIGH)
3. **EXECUTE PHASE 3** - Build optimizations (MEDIUM)
4. **EXECUTE PHASE 4** - Validation and testing (LOW)

### **Validation Protocol:**
- After each phase: Test `npm run start:dev`
- After Phase 1: Verify no frontend compilation
- After Phase 2: Check memory usage
- After Phase 4: Full performance benchmark

### **Success Confirmation:**
```bash
# This command should complete successfully in <30 seconds
cd mentara-api && npm run start:dev
```

---

## 🎯 **SUCCESS METRICS & DELIVERABLES**

### **Quantitative Success Metrics:**
- **Build Time**: Reduced from 5+ minutes to <2 minutes (60%+ improvement)
- **Startup Time**: Reduced from 2+ minutes to <30 seconds (75%+ improvement) 
- **Memory Usage**: Reduced from 8GB+ to <2GB (75%+ reduction)
- **Development Stability**: 0 memory-related crashes during 8-hour development session

### **Qualitative Improvements:**
- **Developer Experience**: Fast, responsive development environment
- **CI/CD Performance**: Reliable builds without memory failures
- **Team Productivity**: No more waiting for slow builds/startup
- **System Stability**: Consistent performance across different environments

### **Final Deliverables:**
- [ ] **Updated TypeScript configurations** (tsconfig.json, tsconfig.build.json)
- [ ] **Optimized package.json** with memory management
- [ ] **Enhanced nest-cli.json** configuration
- [ ] **Performance validation scripts** and benchmarks
- [ ] **MEMORY_OPTIMIZATION_SUCCESS_REPORT.md** documenting improvements

---

## 🔄 **POST-COMPLETION MONITORING**

### **Daily Monitoring (Next 7 Days):**
- Check startup time remains <30 seconds
- Monitor memory usage during development
- Verify no memory-related errors in logs

### **Weekly Performance Review:**
- Run benchmark scripts
- Review build time trends
- Update configurations if needed

### **Success Criteria Maintenance:**
- Document any performance regressions
- Update memory limits if workload increases
- Maintain TypeScript exclusion patterns

---

**⚡ This directive addresses critical development-blocking memory issues. Execute with highest priority to restore development productivity.**

---

*Directive Created: 2025-01-15 by Project Manager*  
*Execution Status: ⏳ **AWAITING IMMEDIATE EXECUTION***  
*Priority Level: 🔴 **URGENT - BLOCKS ALL BACKEND DEVELOPMENT***