# Communities Feature Documentation

## Overview

The communities feature provides illness-specific support groups where users can connect, share experiences, and support each other. Each mental health condition has its own dedicated community with relevant discussions and resources.

## Features

### ✅ Illness-Based Communities

- **30+ Pre-configured Communities**: Each mental health condition has its own community
- **Automatic Creation**: Communities are created automatically during database seeding
- **Slug-based URLs**: SEO-friendly community URLs (e.g., `/communities/anxiety-warriors`)
- **Member Management**: Join/leave communities with role-based access

### ✅ Community Management

- **Member Count Tracking**: Automatic member count updates
- **Post Count Tracking**: Automatic post count updates
- **Privacy Settings**: Public and private community support
- **Active/Inactive Status**: Community moderation capabilities

### ✅ Enhanced Posts & Comments

- **Community-specific Posts**: All posts belong to specific communities
- **Nested Comments**: Support for threaded discussions
- **File Attachments**: Posts and comments can include files
- **Anonymous Posting**: Optional anonymous posting for sensitive topics

## Database Schema

### Community Model

```prisma
model Community {
    id          String   @id @default(uuid())
    name        String
    description String
    slug        String   @unique // URL-friendly identifier
    illness     String?  // Associated illness (null for general communities)
    isActive    Boolean  @default(true)
    isPrivate   Boolean  @default(false)
    memberCount Int      @default(0)
    postCount   Int      @default(0)
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt

    // Relations
    members Membership[]
    posts   Post[]

    @@index([illness])
    @@index([isActive])
    @@index([slug])
}
```

### Membership Model

```prisma
model Membership {
    id          String   @id @default(uuid())
    userId      String
    communityId String
    role        String // 'member', 'admin', 'moderator'
    joinedAt    DateTime @default(now())

    // Relations
    user      User      @relation(fields: [userId], references: [id])
    community Community @relation(fields: [communityId], references: [id])
}
```

## API Endpoints

### Communities

#### Get All Communities

```http
GET /communities
GET /communities?includeInactive=true
```

#### Get Community by ID

```http
GET /communities/:id
```

#### Get Community by Slug

```http
GET /communities/slug/:slug
```

#### Get Communities by Illness

```http
GET /communities/illness/:illness
```

#### Create Community

```http
POST /communities
Content-Type: application/json

{
  "name": "Community Name",
  "description": "Community description",
  "slug": "community-slug",
  "illness": "Anxiety",
  "isPrivate": false
}
```

#### Update Community

```http
PUT /communities/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "isActive": true
}
```

#### Delete Community

```http
DELETE /communities/:id
```

### Community Members

#### Get Community Members

```http
GET /communities/:id/members
GET /communities/:id/members?limit=20&offset=0
```

#### Join Community

```http
POST /communities/:id/join
Content-Type: application/json

{
  "role": "member"
}
```

#### Leave Community

```http
POST /communities/:id/leave
```

### Community Stats

```http
GET /communities/stats
```

## Supported Illness Communities

The system automatically creates communities for the following mental health conditions:

### Core Conditions (from Pre-Assessment)

- **Stress Support Community** - `stress-support`
- **Anxiety Warriors** - `anxiety-warriors`
- **Depression Support Network** - `depression-support`
- **Sleep & Insomnia Support** - `sleep-insomnia-support`
- **Panic Disorder Support** - `panic-disorder-support`
- **Bipolar Support Circle** - `bipolar-support`
- **OCD Support Community** - `ocd-support`
- **PTSD Support Network** - `ptsd-support`
- **Social Anxiety Support** - `social-anxiety-support`
- **Phobia Support Group** - `phobia-support`
- **Burnout Recovery** - `burnout-recovery`
- **Eating Disorder Recovery** - `eating-disorder-recovery`
- **ADHD Support Community** - `adhd-support`
- **Substance Recovery Support** - `substance-recovery`

### Additional Conditions

- **Grief & Loss Support** - `grief-loss-support`
- **Relationship Support** - `relationship-support`
- **Family Therapy Support** - `family-therapy-support`
- **Couples Therapy Support** - `couples-therapy-support`
- **Trauma Recovery** - `trauma-recovery`
- **Self-Esteem Support** - `self-esteem-support`
- **Anger Management Support** - `anger-management-support`
- **Workplace Mental Health** - `workplace-mental-health`
- **Life Transitions Support** - `life-transitions-support`
- **Chronic Illness Support** - `chronic-illness-support`
- **LGBTQ+ Mental Health** - `lgbtq-mental-health`
- **Cultural Mental Health** - `cultural-mental-health`
- **Addiction Recovery** - `addiction-recovery`
- **Personality Disorders Support** - `personality-disorders-support`
- **Mood Disorders Support** - `mood-disorders-support`
- **Psychotic Disorders Support** - `psychotic-disorders-support`

## Frontend Integration

### Step 1: Create API Service

```typescript
// lib/api/communities.ts
export async function getCommunities(includeInactive?: boolean) {
  const params = includeInactive ? '?includeInactive=true' : '';
  const response = await fetch(`/api/communities${params}`);
  return response.json();
}

export async function getCommunityBySlug(slug: string) {
  const response = await fetch(`/api/communities/slug/${slug}`);
  return response.json();
}

export async function getCommunitiesByIllness(illness: string) {
  const response = await fetch(`/api/communities/illness/${illness}`);
  return response.json();
}

export async function joinCommunity(communityId: string, role?: string) {
  const response = await fetch(`/api/communities/${communityId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: role || 'member' }),
  });
  return response.json();
}

export async function leaveCommunity(communityId: string) {
  const response = await fetch(`/api/communities/${communityId}/leave`, {
    method: 'POST',
  });
  return response.json();
}
```

### Step 2: Community List Component

```typescript
// components/communities/CommunityList.tsx
'use client';

import { useEffect, useState } from 'react';
import { getCommunities } from '@/lib/api/communities';
import { CommunityResponse } from '@/types';

export function CommunityList() {
  const [communities, setCommunities] = useState<CommunityResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await getCommunities();
        if (response.success) {
          setCommunities(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch communities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  if (loading) return <div>Loading communities...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {communities.map((community) => (
        <CommunityCard key={community.id} community={community} />
      ))}
    </div>
  );
}
```

### Step 3: Community Card Component

```typescript
// components/communities/CommunityCard.tsx
interface CommunityCardProps {
  community: CommunityResponse;
}

export function CommunityCard({ community }: CommunityCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{community.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{community.description}</p>

        {community.illness && (
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mb-3">
            {community.illness}
          </span>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          <span>{community.memberCount} members</span>
          <span className="mx-2">•</span>
          <span>{community.postCount} posts</span>
        </div>

        {community.isMember && (
          <span className="text-green-600 text-sm font-medium">
            ✓ Member
          </span>
        )}
      </div>

      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
        {community.isMember ? 'View Community' : 'Join Community'}
      </button>
    </div>
  );
}
```

## Database Setup

### 1. Run Migration

```bash
npm run db:migrate
```

### 2. Generate Prisma Client

```bash
npm run db:generate
```

### 3. Seed Database

```bash
npm run db:seed
```

### 4. Reset Database (if needed)

```bash
npm run db:reset
```

## Usage Examples

### Get User's Communities Based on Pre-Assessment

```typescript
// After user completes pre-assessment
const userConditions = preAssessment.severityLevels;
const userCommunities = [];

for (const [condition, severity] of Object.entries(userConditions)) {
  if (severity !== 'Minimal' && severity !== 'None') {
    const communities = await getCommunitiesByIllness(condition);
    userCommunities.push(...communities.data);
  }
}
```

### Auto-Join Communities Based on Assessment

```typescript
// Automatically join communities for user's conditions
for (const community of userCommunities) {
  if (!community.isMember) {
    await joinCommunity(community.id);
  }
}
```

## Benefits

- **Targeted Support**: Users connect with others facing similar challenges
- **Safe Environment**: Moderation and privacy controls
- **Scalable**: Easy to add new communities and conditions
- **Engagement**: Member and post counts encourage participation
- **SEO-Friendly**: Slug-based URLs for better discoverability
- **Moderation**: Role-based access control for community management

## Future Enhancements

- **Community Moderation Tools**: Advanced moderation features
- **Event Scheduling**: Community events and meetups
- **Resource Sharing**: Community-specific resources and links
- **Analytics**: Community engagement metrics
- **Mobile App**: Native mobile app for community access
