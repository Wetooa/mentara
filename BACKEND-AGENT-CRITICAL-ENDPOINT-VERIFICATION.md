# 🚨 BACKEND AGENT - CRITICAL ENDPOINT VERIFICATION

## **IMMEDIATE PRIORITY**: Verify P0 Broken Endpoints

**CONTEXT**: Frontend Agent has identified **CRITICAL BROKEN ENDPOINTS** that will cause system failures
**DEADLINE**: 2 hours from now (Hour 3 checkpoint)
**IMPACT**: Production-blocking issues if not resolved

---

## 🔍 CRITICAL VERIFICATION TASKS

### **1. AUTH CONTROLLER VERIFICATION**
```bash
CONTROLLER: mentara-api/src/auth/auth.controller.ts
VERIFICATION NEEDED:

❌ MISSING ENDPOINT: /auth/is-first-signin
- Frontend calls: GET /auth/is-first-signin
- Backend has: [VERIFY IF EXISTS]
- Action: If missing, document for implementation

❌ MISSING ENDPOINT: /auth/admin
- Frontend calls: GET /auth/admin
- Backend has: [VERIFY IF EXISTS]
- Action: If missing, document for implementation
```

### **2. COMMUNITIES CONTROLLER VERIFICATION**
```bash
CONTROLLER: mentara-api/src/communities/communities.controller.ts
VERIFICATION NEEDED:

❌ MISSING ENDPOINT: /communities/assign-user
- Frontend calls: POST /communities/assign-user
- Backend has: [VERIFY IF EXISTS]
- Action: If missing, document for implementation
```

### **3. BOOKING CONTROLLER VERIFICATION**
```bash
CONTROLLER: mentara-api/src/booking/booking.controller.ts
VERIFICATION NEEDED:

❌ MISSING ENDPOINT: /booking/slots/range
- Frontend calls: GET /booking/slots/range
- Backend has: [VERIFY IF EXISTS]
- Action: If missing, document for implementation

❌ MISSING ENDPOINT: /booking/meetings/:id/complete
- Frontend calls: POST /booking/meetings/:id/complete
- Backend has: [VERIFY IF EXISTS]
- Action: If missing, document for implementation
```

### **4. THERAPIST RECOMMENDATION VERIFICATION**
```bash
CONTROLLER: mentara-api/src/therapist/therapist-recommendation.controller.ts
VERIFICATION NEEDED:

❌ ENDPOINT NAMING MISMATCH: /therapist-recommendations vs /therapist-recommendation
- Frontend calls: GET /therapist-recommendations (plural)
- Backend has: [VERIFY ACTUAL ENDPOINT NAME]
- Action: Document correct endpoint name and update needed
```

---

## 📋 VERIFICATION PROTOCOL

### **STEP 1: Controller Analysis**
```bash
# Use Serena to read each controller
mcp__serena__find_symbol:
- name_path: "AuthController"
- relative_path: "mentara-api/src/auth/auth.controller.ts"

# Document all endpoints found
# Compare with Frontend Agent's requirements
```

### **STEP 2: Endpoint Documentation**
```bash
# For each controller, document:
1. All existing endpoints with HTTP methods
2. Missing endpoints that Frontend requires
3. Endpoint naming mismatches
4. Required vs actual parameter structures
```

### **STEP 3: Gap Analysis**
```bash
# Create comprehensive gap analysis:
1. Missing endpoints that need implementation
2. Endpoint naming conflicts to resolve
3. Parameter structure mismatches
4. Priority order for fixes
```

---

## 📊 VERIFICATION REPORT FORMAT

### **CREATE: BACKEND_ENDPOINT_VERIFICATION_REPORT.md**
```markdown
# Backend Endpoint Verification Report

## Critical Verification Results

### AuthController (/auth)
**Status**: [VERIFIED/ISSUES FOUND]
**Existing Endpoints**:
- GET /auth/me ✅
- POST /auth/register/client ✅
- POST /auth/register/therapist ✅
- POST /auth/force-logout ✅

**Missing Endpoints**:
- ❌ GET /auth/is-first-signin - MISSING
- ❌ GET /auth/admin - MISSING

### CommunitiesController (/communities)
**Status**: [VERIFIED/ISSUES FOUND]
**Existing Endpoints**:
- [LIST ALL FOUND]

**Missing Endpoints**:
- ❌ POST /communities/assign-user - MISSING

### BookingController (/booking)
**Status**: [VERIFIED/ISSUES FOUND]
**Existing Endpoints**:
- [LIST ALL FOUND]

**Missing Endpoints**:
- ❌ GET /booking/slots/range - MISSING
- ❌ POST /booking/meetings/:id/complete - MISSING

### TherapistRecommendationController
**Status**: [VERIFIED/ISSUES FOUND]
**Endpoint Naming**:
- Actual: [DOCUMENT ACTUAL ENDPOINT]
- Frontend expects: /therapist-recommendations
- **Issue**: Singular vs plural mismatch

## Summary
- **Total Missing Endpoints**: [COUNT]
- **Critical Blockers**: [COUNT]
- **Naming Conflicts**: [COUNT]
- **Priority for Implementation**: [LIST]
```

---

## 🔧 IMPLEMENTATION COORDINATION

### **IMMEDIATE ACTIONS** (Next 2 Hours):
1. **Verify all 6 critical endpoints** using Serena tools
2. **Document exact findings** in verification report
3. **Coordinate with Frontend Agent** on endpoint expectations
4. **Priority-rank missing endpoints** for implementation

### **COORDINATION POINTS**:
- **Frontend Agent**: Confirm exact endpoint signatures expected
- **Manager Agent**: Report verification results at Hour 3 checkpoint
- **Implementation Plan**: Create action plan for missing endpoints

---

## 💡 VERIFICATION COMMANDS

### **Start Verification Immediately**:
```bash
# Sequential thinking for verification strategy
mcp__sequential-thinking__sequentialthinking:
- "Plan systematic endpoint verification approach"
- "Design efficient controller analysis method"
- "Identify all verification points needed"

# Read controllers systematically
mcp__serena__find_symbol:
- name_path: "AuthController"
- relative_path: "mentara-api/src/auth/auth.controller.ts"
- include_body: true

# Search for specific endpoints
mcp__serena__search_for_pattern:
- substring_pattern: "is-first-signin"
- relative_path: "mentara-api/src"
- restrict_search_to_code_files: true

# Document all findings
```

---

## 🎯 SUCCESS CRITERIA

### **Hour 3 Checkpoint Goals**:
- [ ] All 6 critical endpoints verified
- [ ] BACKEND_ENDPOINT_VERIFICATION_REPORT.md completed
- [ ] Missing endpoints documented with implementation priority
- [ ] Coordination with Frontend Agent on endpoint expectations
- [ ] Clear action plan for resolving endpoint gaps

### **Quality Standards**:
- 100% accuracy in endpoint verification
- Complete documentation of all findings
- Clear priority ranking for missing endpoints
- Actionable implementation recommendations

**DEADLINE**: 2 hours for complete verification
**COORDINATION**: Report findings to Manager Agent at Hour 3
**CRITICAL IMPORTANCE**: Production-blocking issues if not resolved

**START ENDPOINT VERIFICATION IMMEDIATELY!** 🚨