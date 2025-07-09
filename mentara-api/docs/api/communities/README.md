# Communities API

The Communities API manages mental health support communities, enabling users to join illness-specific groups, participate in discussions, and receive peer support.

## 🏗️ Architecture

The communities system provides:
- **Illness-Specific Communities**: 30+ pre-configured mental health support groups
- **Membership Management**: Join/leave communities with role-based access
- **Structured Organization**: Room groups and rooms for organized discussions
- **Community Stats**: Analytics for engagement and participation
- **Member Management**: User profiles and participation tracking
- **SEO-Friendly URLs**: Slug-based community identification

## 🌟 Key Features

### ✅ Mental Health Communities
- **Pre-configured Communities**: Each mental health condition has its own support group
- **Automatic Creation**: Communities created during database seeding
- **Slug-based URLs**: SEO-friendly URLs (e.g., `/communities/anxiety-warriors`)
- **Member Tracking**: Automatic member count and engagement metrics

### ✅ Community Structure
- **Room Groups**: Organized discussion categories within communities
- **Rooms**: Specific discussion channels within room groups
- **Hierarchical Organization**: Communities → Room Groups → Rooms → Posts
- **Order Management**: Customizable ordering for groups and rooms

## 📡 API Endpoints

### Base URL
```
/communities
```

All endpoints require authentication via Clerk JWT token.

---

## 🏘️ Community Management

### Get All Communities
Retrieve all available communities.

**Endpoint**: `GET /communities`

**Headers**:
```
Authorization: Bearer <clerk_jwt_token>
```

**Response**: `200 OK`
```json
[
  {
    "id": "community_123",
    "name": "Anxiety Warriors",
    "slug": "anxiety-warriors",
    "description": "A supportive community for individuals dealing with anxiety disorders. Share your experiences, coping strategies, and find encouragement from others who understand your journey.",
    "imageUrl": "https://storage.example.com/communities/anxiety-warriors.jpg",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  {
    "id": "community_124",
    "name": "Depression Support Network",
    "slug": "depression-support",
    "description": "A safe space for those navigating depression. Connect with peers, share resources, and support each other through challenging times.",
    "imageUrl": "https://storage.example.com/communities/depression-support.jpg",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
]
```

### Get Community by ID
Retrieve a specific community by its ID.

**Endpoint**: `GET /communities/:id`

**Response**: `200 OK`
```json
{
  "id": "community_123",
  "name": "Anxiety Warriors",
  "slug": "anxiety-warriors",
  "description": "A supportive community for individuals dealing with anxiety disorders. Share your experiences, coping strategies, and find encouragement from others who understand your journey.",
  "imageUrl": "https://storage.example.com/communities/anxiety-warriors.jpg",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: Community not found

### Get Community by Slug
Retrieve a community using its URL-friendly slug.

**Endpoint**: `GET /communities/slug/:slug`

**Example**: `GET /communities/slug/anxiety-warriors`

**Response**: `200 OK`
```json
{
  "id": "community_123",
  "name": "Anxiety Warriors",
  "slug": "anxiety-warriors",
  "description": "A supportive community for individuals dealing with anxiety disorders. Share your experiences, coping strategies, and find encouragement from others who understand your journey.",
  "imageUrl": "https://storage.example.com/communities/anxiety-warriors.jpg",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### Create Community
Create a new community (admin only).

**Endpoint**: `POST /communities`

**Request Body**:
```json
{
  "name": "PTSD Support Circle",
  "slug": "ptsd-support-circle",
  "description": "A specialized community for individuals dealing with post-traumatic stress disorder. Share healing strategies and find understanding.",
  "imageUrl": "https://storage.example.com/communities/ptsd-support.jpg"
}
```

**Response**: `201 Created`
```json
{
  "id": "community_125",
  "name": "PTSD Support Circle",
  "slug": "ptsd-support-circle",
  "description": "A specialized community for individuals dealing with post-traumatic stress disorder. Share healing strategies and find understanding.",
  "imageUrl": "https://storage.example.com/communities/ptsd-support.jpg",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### Update Community
Update an existing community (admin only).

**Endpoint**: `PUT /communities/:id`

**Request Body**:
```json
{
  "name": "Anxiety Warriors - Updated",
  "slug": "anxiety-warriors-v2",
  "description": "Updated description for the anxiety support community with enhanced resources and guidelines.",
  "imageUrl": "https://storage.example.com/communities/anxiety-warriors-v2.jpg"
}
```

**Response**: `200 OK`
```json
{
  "id": "community_123",
  "name": "Anxiety Warriors - Updated",
  "slug": "anxiety-warriors-v2",
  "description": "Updated description for the anxiety support community with enhanced resources and guidelines.",
  "imageUrl": "https://storage.example.com/communities/anxiety-warriors-v2.jpg",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T14:30:00.000Z"
}
```

### Delete Community
Delete a community (admin only).

**Endpoint**: `DELETE /communities/:id`

**Response**: `200 OK`
```json
{
  "id": "community_125",
  "name": "PTSD Support Circle",
  "slug": "ptsd-support-circle",
  "description": "A specialized community for individuals dealing with post-traumatic stress disorder. Share healing strategies and find understanding.",
  "imageUrl": "https://storage.example.com/communities/ptsd-support.jpg",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

---

## 👥 Membership Management

### Join Community
Join a community as a member.

**Endpoint**: `POST /communities/:id/join`

**Response**: `200 OK`
```json
{
  "joined": true
}
```

**Error Responses**:
- `409 Conflict`: User is already a member of this community

### Leave Community
Leave a community.

**Endpoint**: `POST /communities/:id/leave`

**Response**: `200 OK`
```json
{
  "left": true
}
```

**Error Responses**:
- `404 Not Found`: Membership not found

### Get Community Members
Retrieve members of a specific community.

**Endpoint**: `GET /communities/:id/members`

**Query Parameters**:
- `limit` (optional): Number of members to return (default: 50, max: 100)
- `offset` (optional): Number of members to skip (default: 0)

**Example**: `GET /communities/community_123/members?limit=20&offset=0`

**Response**: `200 OK`
```json
{
  "id": "community_123",
  "name": "Anxiety Warriors",
  "slug": "anxiety-warriors",
  "description": "A supportive community for individuals dealing with anxiety disorders.",
  "imageUrl": "https://storage.example.com/communities/anxiety-warriors.jpg",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "members": [
    {
      "id": "membership_456",
      "userId": "user_789",
      "communityId": "community_123",
      "role": "member",
      "joinedAt": "2024-01-02T10:30:00.000Z",
      "user": {
        "id": "user_789",
        "firstName": "John",
        "lastName": "Doe",
        "avatarUrl": "https://storage.example.com/avatars/user_789.jpg"
      }
    },
    {
      "id": "membership_457",
      "userId": "user_790",
      "communityId": "community_123",
      "role": "moderator",
      "joinedAt": "2024-01-01T15:00:00.000Z",
      "user": {
        "id": "user_790",
        "firstName": "Jane",
        "lastName": "Smith",
        "avatarUrl": "https://storage.example.com/avatars/user_790.jpg"
      }
    }
  ]
}
```

### Get User's Communities
Get all communities a specific user has joined.

**Endpoint**: `GET /communities/user/:userId`

**Response**: `200 OK`
```json
[
  {
    "id": "community_123",
    "name": "Anxiety Warriors",
    "slug": "anxiety-warriors",
    "description": "A supportive community for individuals dealing with anxiety disorders.",
    "imageUrl": "https://storage.example.com/communities/anxiety-warriors.jpg",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  {
    "id": "community_124",
    "name": "Depression Support Network",
    "slug": "depression-support",
    "description": "A safe space for those navigating depression.",
    "imageUrl": "https://storage.example.com/communities/depression-support.jpg",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
]
```

---

## 🏗️ Community Structure

### Get Communities with Structure
Retrieve all communities with their room groups and rooms.

**Endpoint**: `GET /communities/with-structure`

**Response**: `200 OK`
```json
[
  {
    "id": "community_123",
    "name": "Anxiety Warriors",
    "slug": "anxiety-warriors",
    "description": "A supportive community for individuals dealing with anxiety disorders.",
    "imageUrl": "https://storage.example.com/communities/anxiety-warriors.jpg",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "roomGroups": [
      {
        "id": "roomgroup_456",
        "name": "General Discussion",
        "order": 1,
        "communityId": "community_123",
        "rooms": [
          {
            "id": "room_789",
            "name": "Welcome & Introductions",
            "order": 1,
            "roomGroupId": "roomgroup_456"
          },
          {
            "id": "room_790",
            "name": "Daily Check-ins",
            "order": 2,
            "roomGroupId": "roomgroup_456"
          }
        ]
      },
      {
        "id": "roomgroup_457",
        "name": "Coping Strategies",
        "order": 2,
        "communityId": "community_123",
        "rooms": [
          {
            "id": "room_791",
            "name": "Breathing Techniques",
            "order": 1,
            "roomGroupId": "roomgroup_457"
          },
          {
            "id": "room_792",
            "name": "Mindfulness & Meditation",
            "order": 2,
            "roomGroupId": "roomgroup_457"
          }
        ]
      }
    ]
  }
]
```

### Get Community with Structure
Retrieve a specific community with its room groups and rooms.

**Endpoint**: `GET /communities/:id/with-structure`

**Response**: `200 OK`
```json
{
  "id": "community_123",
  "name": "Anxiety Warriors",
  "slug": "anxiety-warriors",
  "description": "A supportive community for individuals dealing with anxiety disorders.",
  "imageUrl": "https://storage.example.com/communities/anxiety-warriors.jpg",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "roomGroups": [
    {
      "id": "roomgroup_456",
      "name": "General Discussion",
      "order": 1,
      "communityId": "community_123",
      "rooms": [
        {
          "id": "room_789",
          "name": "Welcome & Introductions",
          "order": 1,
          "roomGroupId": "roomgroup_456"
        },
        {
          "id": "room_790",
          "name": "Daily Check-ins",
          "order": 2,
          "roomGroupId": "roomgroup_456"
        }
      ]
    }
  ]
}
```

### Create Room Group
Create a new room group within a community (moderator/admin only).

**Endpoint**: `POST /communities/:id/room-group`

**Request Body**:
```json
{
  "name": "Resources & Support",
  "order": 3
}
```

**Response**: `201 Created`
```json
{
  "id": "roomgroup_458",
  "name": "Resources & Support",
  "order": 3,
  "communityId": "community_123",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### Create Room
Create a new room within a room group (moderator/admin only).

**Endpoint**: `POST /communities/room-group/:roomGroupId/room`

**Request Body**:
```json
{
  "name": "Helpful Articles & Links",
  "order": 1
}
```

**Response**: `201 Created`
```json
{
  "id": "room_793",
  "name": "Helpful Articles & Links",
  "order": 1,
  "roomGroupId": "roomgroup_458",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### Get Rooms by Group
Retrieve all rooms in a specific room group.

**Endpoint**: `GET /communities/room-group/:roomGroupId/rooms`

**Response**: `200 OK`
```json
[
  {
    "id": "room_789",
    "name": "Welcome & Introductions",
    "order": 1,
    "roomGroupId": "roomgroup_456",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  {
    "id": "room_790",
    "name": "Daily Check-ins",
    "order": 2,
    "roomGroupId": "roomgroup_456",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
]
```

---

## 📊 Community Statistics

### Get Community Stats
Retrieve platform-wide community statistics.

**Endpoint**: `GET /communities/stats`

**Response**: `200 OK`
```json
{
  "totalMembers": 15420,
  "totalPosts": 48392,
  "activeCommunities": 32,
  "illnessCommunities": [
    {
      "illness": "Anxiety",
      "communityCount": 5,
      "memberCount": 3240
    },
    {
      "illness": "Depression",
      "communityCount": 4,
      "memberCount": 2890
    },
    {
      "illness": "PTSD",
      "communityCount": 3,
      "memberCount": 1850
    }
  ]
}
```

---

## 🏥 Pre-configured Mental Health Communities

The system automatically creates communities for these mental health conditions:

### Core Conditions
- **Anxiety Warriors** (`anxiety-warriors`) - Anxiety disorders support
- **Depression Support Network** (`depression-support`) - Depression community
- **Stress Support Community** (`stress-support`) - Stress management
- **Sleep & Insomnia Support** (`sleep-insomnia-support`) - Sleep disorders
- **Panic Disorder Support** (`panic-disorder-support`) - Panic attacks
- **Bipolar Support Circle** (`bipolar-support`) - Bipolar disorder
- **OCD Support Community** (`ocd-support`) - Obsessive-compulsive disorder
- **PTSD Support Network** (`ptsd-support`) - Post-traumatic stress
- **Social Anxiety Support** (`social-anxiety-support`) - Social anxiety
- **Phobia Support Group** (`phobia-support`) - Specific phobias
- **Burnout Recovery** (`burnout-recovery`) - Professional burnout
- **Eating Disorder Recovery** (`eating-disorder-recovery`) - Eating disorders
- **ADHD Support Community** (`adhd-support`) - Attention deficit hyperactivity
- **Substance Recovery Support** (`substance-recovery`) - Addiction recovery

### Additional Support Communities
- **Grief & Loss Support** (`grief-loss-support`)
- **Relationship Support** (`relationship-support`)
- **Family Therapy Support** (`family-therapy-support`)
- **Couples Therapy Support** (`couples-therapy-support`)
- **Trauma Recovery** (`trauma-recovery`)
- **Self-Esteem Support** (`self-esteem-support`)
- **Anger Management Support** (`anger-management-support`)
- **Workplace Mental Health** (`workplace-mental-health`)
- **Life Transitions Support** (`life-transitions-support`)
- **Chronic Illness Support** (`chronic-illness-support`)
- **LGBTQ+ Mental Health** (`lgbtq-mental-health`)
- **Cultural Mental Health** (`cultural-mental-health`)
- **Addiction Recovery** (`addiction-recovery`)
- **Personality Disorders Support** (`personality-disorders-support`)
- **Mood Disorders Support** (`mood-disorders-support`)
- **Psychotic Disorders Support** (`psychotic-disorders-support`)

---

## 📊 Data Models

### CommunityCreateInputDto
```typescript
{
  name: string;                  // Community name
  slug: string;                  // URL-friendly identifier
  description: string;           // Community description
  imageUrl: string;             // Community image/logo URL
}
```

### CommunityUpdateInputDto
```typescript
{
  name?: string;                 // Updated name
  slug?: string;                 // Updated slug
  description?: string;          // Updated description
  imageUrl?: string;            // Updated image URL
}
```

### MembershipCreateInputDto
```typescript
{
  communityId: string;          // Community ID to join
  role: string;                 // Member role ('member', 'moderator', 'admin')
}
```

### CommunityResponse
```typescript
{
  id: string;                   // Unique community ID
  name: string;                 // Community name
  slug: string;                 // URL slug
  description: string;          // Description text
  imageUrl: string;            // Image URL
  createdAt: Date;             // Creation timestamp
  updatedAt: Date;             // Last update timestamp
}
```

### MembershipResponse
```typescript
{
  id: string;                   // Membership ID
  userId: string;               // User ID
  communityId: string;          // Community ID
  role: string;                 // User role in community
  joinedAt: Date;              // Join timestamp
  user: {                      // User details
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}
```

### RoomGroupResponse
```typescript
{
  id: string;                   // Room group ID
  name: string;                 // Group name
  order: number;                // Display order
  communityId: string;          // Parent community ID
  rooms: RoomResponse[];        // Rooms in this group
}
```

### RoomResponse
```typescript
{
  id: string;                   // Room ID
  name: string;                 // Room name
  order: number;                // Display order within group
  roomGroupId: string;          // Parent room group ID
}
```

---

## 🛡️ Security Features

### Role-Based Access Control
- **Members**: Can view content, post messages, join discussions
- **Moderators**: Can moderate content, manage rooms, moderate discussions
- **Admins**: Full access to community management and settings

### Content Moderation
- **Community Guidelines**: Enforced posting guidelines
- **Moderation Tools**: Report, hide, and remove inappropriate content
- **User Safety**: Block users, report violations, privacy controls

### Privacy Controls
- **Anonymous Posting**: Optional anonymous participation
- **Profile Privacy**: Control visibility of personal information
- **Safe Environment**: Moderated discussions with safety guidelines

---

## 🧪 Testing

### Unit Tests
```bash
npm run test communities.service.spec.ts
npm run test communities.controller.spec.ts
```

### Integration Tests
```bash
npm run test:e2e -- --grep "Communities"
```

### Test Scenarios
```typescript
// Test community creation
const communityData = {
  name: "Test Community",
  slug: "test-community",
  description: "A test community",
  imageUrl: "https://example.com/image.jpg"
};

// Test membership management
const joinCommunity = async (communityId, userId) => {
  // Test joining logic
};

// Test room structure
const createRoomGroup = async (communityId, groupData) => {
  // Test room group creation
};
```

---

## 🚀 Frontend Integration

### React Hook Example
```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export function useCommunities() {
  const { getToken } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  
  const getAllCommunities = async () => {
    const token = await getToken();
    const response = await fetch('/api/communities', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      setCommunities(data);
      return data;
    }
    throw new Error('Failed to fetch communities');
  };
  
  const joinCommunity = async (communityId) => {
    const token = await getToken();
    const response = await fetch(`/api/communities/${communityId}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      // Update local state
      await getUserCommunities();
      return true;
    }
    throw new Error('Failed to join community');
  };
  
  const leaveCommunity = async (communityId) => {
    const token = await getToken();
    const response = await fetch(`/api/communities/${communityId}/leave`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      // Update local state
      setUserCommunities(prev => 
        prev.filter(community => community.id !== communityId)
      );
      return true;
    }
    throw new Error('Failed to leave community');
  };
  
  const getUserCommunities = async () => {
    const token = await getToken();
    const response = await fetch('/api/communities/user/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      setUserCommunities(data);
      return data;
    }
    throw new Error('Failed to fetch user communities');
  };
  
  return {
    communities,
    userCommunities,
    getAllCommunities,
    joinCommunity,
    leaveCommunity,
    getUserCommunities,
  };
}
```

### Community List Component
```typescript
import React, { useState, useEffect } from 'react';
import { useCommunities } from './useCommunities';

export function CommunityList() {
  const { 
    communities, 
    userCommunities,
    getAllCommunities, 
    joinCommunity, 
    leaveCommunity 
  } = useCommunities();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadCommunities = async () => {
      try {
        await getAllCommunities();
      } catch (error) {
        console.error('Failed to load communities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCommunities();
  }, []);
  
  const isUserMember = (communityId) => {
    return userCommunities.some(uc => uc.id === communityId);
  };
  
  const handleJoinLeave = async (communityId) => {
    try {
      if (isUserMember(communityId)) {
        await leaveCommunity(communityId);
      } else {
        await joinCommunity(communityId);
      }
    } catch (error) {
      alert('Action failed. Please try again.');
    }
  };
  
  if (loading) {
    return <div className="loading">Loading communities...</div>;
  }
  
  return (
    <div className="community-list">
      <h2>Mental Health Support Communities</h2>
      
      <div className="communities-grid">
        {communities.map((community) => (
          <div key={community.id} className="community-card">
            <img 
              src={community.imageUrl} 
              alt={community.name}
              className="community-image"
            />
            
            <div className="community-content">
              <h3 className="community-name">{community.name}</h3>
              <p className="community-description">
                {community.description}
              </p>
              
              <div className="community-actions">
                <button
                  onClick={() => handleJoinLeave(community.id)}
                  className={`action-button ${
                    isUserMember(community.id) ? 'leave' : 'join'
                  }`}
                >
                  {isUserMember(community.id) ? 'Leave Community' : 'Join Community'}
                </button>
                
                <a 
                  href={`/communities/${community.slug}`}
                  className="view-button"
                >
                  View Community
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Community Detail Component
```typescript
import React, { useState, useEffect } from 'react';

export function CommunityDetail({ communitySlug }: { communitySlug: string }) {
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        const [communityRes, membersRes] = await Promise.all([
          fetch(`/api/communities/slug/${communitySlug}`),
          fetch(`/api/communities/slug/${communitySlug}/members`)
        ]);
        
        const communityData = await communityRes.json();
        const membersData = await membersRes.json();
        
        setCommunity(communityData);
        setMembers(membersData.members || []);
      } catch (error) {
        console.error('Failed to load community data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCommunityData();
  }, [communitySlug]);
  
  if (loading) {
    return <div className="loading">Loading community...</div>;
  }
  
  if (!community) {
    return <div className="error">Community not found</div>;
  }
  
  return (
    <div className="community-detail">
      <div className="community-header">
        <img 
          src={community.imageUrl} 
          alt={community.name}
          className="community-hero-image"
        />
        
        <div className="community-info">
          <h1>{community.name}</h1>
          <p className="community-description">
            {community.description}
          </p>
          
          <div className="community-stats">
            <span className="stat">
              {members.length} members
            </span>
          </div>
        </div>
      </div>
      
      <div className="community-content">
        <div className="community-rooms">
          <h2>Discussion Rooms</h2>
          {/* Render room structure */}
        </div>
        
        <div className="community-sidebar">
          <div className="recent-members">
            <h3>Recent Members</h3>
            {members.slice(0, 10).map(member => (
              <div key={member.id} className="member-card">
                <img 
                  src={member.user.avatarUrl || '/default-avatar.png'} 
                  alt={`${member.user.firstName} ${member.user.lastName}`}
                  className="member-avatar"
                />
                <span className="member-name">
                  {member.user.firstName} {member.user.lastName}
                </span>
                <span className="member-role">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 📈 Performance Considerations

### Database Optimization
- **Indexed Queries**: Efficient lookups by slug, user ID, and community ID
- **Pagination**: Limit query results with offset/limit parameters
- **Selective Loading**: Include only necessary related data

### Caching Strategy
- **Community Lists**: Cache frequently accessed community lists
- **Member Data**: Cache member counts and recent activity
- **Static Content**: Cache community images and descriptions

### Real-time Features
- **WebSocket Integration**: Real-time member activity and new posts
- **Live Updates**: Dynamic member counts and activity indicators
- **Notification System**: Real-time notifications for community events

---

## 🆘 Troubleshooting

### Common Issues

#### Failed to Join Community
**Cause**: User already a member or community not found
**Solution**: Check membership status and community existence

#### Slug Conflicts
**Cause**: Attempting to create community with existing slug
**Solution**: Use unique slug or update existing community

#### Permission Denied
**Cause**: Insufficient permissions for admin operations
**Solution**: Verify user role and permissions

#### Member Limit Exceeded
**Cause**: Too many members requested in single query
**Solution**: Use pagination with limit ≤ 100

### Debug Commands
```bash
# Get all communities
curl http://localhost:5000/api/communities \
  -H "Authorization: Bearer <token>"

# Join a community
curl -X POST http://localhost:5000/api/communities/community_123/join \
  -H "Authorization: Bearer <token>"

# Get community members
curl "http://localhost:5000/api/communities/community_123/members?limit=20" \
  -H "Authorization: Bearer <token>"

# Check community stats
curl http://localhost:5000/api/communities/stats \
  -H "Authorization: Bearer <token>"
```

---

## 📚 Related Documentation

- [Authentication API](../auth/README.md)
- [Messaging API](../messaging/README.md)
- [User Management API](../users/README.md)
- [Posts API](../posts/README.md)
- [Community Integration Guide](../../guides/community-integration.md)