# Illness Name Alignment Fixes

This document summarizes the fixes made to align the backend illness names with the frontend questionnaire constants.

## Issue

The backend was using generic illness names that didn't match the exact questionnaire names from the frontend constants, causing potential mismatches in:

- Community creation and management
- Therapist recommendations
- Pre-assessment result processing
- Data consistency across the application

## Frontend Questionnaire Constants

From `mentara-client/constants/questionnaires.ts`:

```typescript
export const LIST_OF_QUESTIONNAIRES = [
  'Stress',
  'Anxiety',
  'Depression',
  'Insomnia',
  'Panic',
  'Bipolar disorder (BD)',
  'Obsessive compulsive disorder (OCD)',
  'Post-traumatic stress disorder (PTSD)',
  'Social anxiety',
  'Phobia',
  'Burnout',
  'Binge eating / Eating disorders',
  'ADD / ADHD',
  'Substance or Alcohol Use Issues',
] as const;
```

## Fixes Applied

### 1. Updated Illness Communities Configuration

**File**: `src/communities/illness-communities.config.ts`

**Changes**:

- Reduced from 30+ generic communities to exactly 14 communities
- Updated illness names to match frontend constants exactly
- Removed color and icon properties (not needed)
- Updated community descriptions to be more specific
- Fixed slug names for consistency

**Before**:

```typescript
{
  name: 'Anxiety Support',
  illness: 'Anxiety Disorders',
  color: '#4ECDC4',
  icon: '😰',
}
```

**After**:

```typescript
{
  name: 'Anxiety Warriors',
  illness: 'Anxiety',
  description: 'A safe space for individuals with anxiety disorders...',
  slug: 'anxiety-warriors',
}
```

### 2. Updated Seed Script

**File**: `prisma/seed.ts`

**Changes**:

- Updated sample therapist specializations to use correct illness names
- Enhanced sample posts to use specific illness communities
- Created posts in Stress, Anxiety, and Depression communities
- Added more relevant sample content for each community type
- Updated community finding logic to use exact illness names

**Sample Data Created**:

- **Stress Community**: "This community has been so supportive! 💖" with hearts and hierarchical comments
- **Anxiety Community**: "What coping strategies work best for you?" with discussion comments
- **Depression Community**: "Finding hope in dark times" with supportive comments

### 3. Verified Therapist Recommendation Service

**File**: `src/therapist/therapist-recommendation.service.ts`

**Status**: ✅ Already correctly mapped

- The service already had the correct mapping from questionnaire names to condition names
- No changes needed

### 4. Updated Documentation

**File**: `README_POSTS_COMMENTS.md`

**Changes**:

- Added section listing all 14 supported illness communities
- Updated examples to use correct illness names
- Added reference to frontend questionnaire constants

## Benefits of These Fixes

### 1. **Data Consistency**

- Backend and frontend now use identical illness names
- No more mismatches between questionnaire results and community assignments
- Consistent data across all modules

### 2. **Better User Experience**

- Users are automatically assigned to the correct communities based on their pre-assessment
- Therapist recommendations are more accurate
- Community content is more relevant to specific conditions

### 3. **Maintainability**

- Single source of truth for illness names (frontend constants)
- Easier to add new questionnaires in the future
- Reduced risk of data inconsistencies

### 4. **Sample Data Quality**

- More realistic and relevant sample posts
- Better demonstration of the platform's capabilities
- Community-specific content that matches the illness focus

## Testing the Fixes

### 1. Run Updated Seed Script

```bash
npm run db:seed
```

**Expected Output**:

- 14 communities created with correct illness names
- Sample posts in Stress, Anxiety, and Depression communities
- Hierarchical comments with hearts
- Proper community assignments

### 2. Verify Community Creation

```bash
# Check that communities match frontend constants
curl http://localhost:3000/communities
```

### 3. Test Post Creation

```bash
# Create a post in a specific community
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "content": "Test content",
    "communityId": "<community-id>"
  }'
```

## Future Considerations

### 1. **Adding New Questionnaires**

When adding new questionnaires to the frontend:

1. Update `LIST_OF_QUESTIONNAIRES` in `mentara-client/constants/questionnaires.ts`
2. Add corresponding community in `src/communities/illness-communities.config.ts`
3. Update therapist recommendation mapping if needed
4. Run seed script to create new community

### 2. **Community Management**

- Consider adding admin tools for community management
- Add community moderation features
- Implement community-specific rules and guidelines

### 3. **Analytics**

- Track community engagement by illness type
- Monitor which communities are most active
- Analyze user progression through communities

## Summary

The illness name alignment fixes ensure that:

- ✅ Backend and frontend use identical illness names
- ✅ Communities are created for all 14 questionnaires
- ✅ Sample data is relevant and realistic
- ✅ Therapist recommendations work correctly
- ✅ Documentation is accurate and up-to-date
- ✅ Future development is easier and more consistent

The system now properly supports all mental health conditions covered by the pre-assessment questionnaires, providing users with relevant communities and accurate therapist recommendations.
