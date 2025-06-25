# Posts and Comments System with Hearts

This document describes the enhanced posts and comments system with heart (like) functionality and hierarchical comments support.

## Overview

The posts and comments system now includes:

- **Posts** with heart functionality (likes)
- **Hierarchical comments** with unlimited nesting levels
- **Comment hearts** for liking individual comments
- **Real-time heart counts** for both posts and comments
- **User authentication** and authorization for all operations
- **Illness-specific communities** based on the 14 questionnaires from the frontend

## Supported Illness Communities

The system supports communities for all 14 questionnaires from the frontend:

1. **Stress** - Stress Support Community
2. **Anxiety** - Anxiety Warriors
3. **Depression** - Depression Support Network
4. **Insomnia** - Sleep & Insomnia Support
5. **Panic** - Panic Disorder Support
6. **Bipolar disorder (BD)** - Bipolar Support Circle
7. **Obsessive compulsive disorder (OCD)** - OCD Support Community
8. **Post-traumatic stress disorder (PTSD)** - PTSD Support Network
9. **Social anxiety** - Social Anxiety Support
10. **Phobia** - Phobia Support Group
11. **Burnout** - Burnout Recovery
12. **Binge eating / Eating disorders** - Eating Disorder Recovery
13. **ADD / ADHD** - ADHD Support Community
14. **Substance or Alcohol Use Issues** - Substance Recovery Support

## Database Schema

### Post Model

```prisma
model Post {
  id          String   @id @default(uuid())
  title       String
  content     String
  heartCount  Int      @default(0) // Track total hearts
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  communityId String

  user      User       @relation(fields: [userId], references: [id])
  community Community  @relation(fields: [communityId], references: [id])
  comments  Comment[]
  files     PostFile[]
  hearts    PostHeart[] // Hearts given to this post
}
```

### PostHeart Model

```prisma
model PostHeart {
  id        String   @id @default(uuid())
  postId    String
  userId    String
  createdAt DateTime @default(now())

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId]) // Prevent duplicate hearts
  @@index([postId])
  @@index([userId])
}
```

### Comment Model

```prisma
model Comment {
  id         String   @id @default(uuid())
  content    String
  heartCount Int      @default(0) // Track total hearts
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  postId     String
  userId     String
  parentId   String?

  post    Post      @relation(fields: [postId], references: [id])
  user    User      @relation(fields: [userId], references: [id])
  parent  Comment?  @relation("CommentHierarchy", fields: [parentId], references: [id])
  replies Comment[] @relation("CommentHierarchy")

  files CommentFile[]
  hearts CommentHeart[] // Hearts given to this comment
}
```

### CommentHeart Model

```prisma
model CommentHeart {
  id        String   @id @default(uuid())
  commentId String
  userId    String
  createdAt DateTime @default(now())

  comment Comment @relation(fields: [commentId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([commentId, userId]) // Prevent duplicate hearts
  @@index([commentId])
  @@index([userId])
}
```

## API Endpoints

### Posts

#### Get All Posts

```http
GET /posts
Authorization: Bearer <token>
```

**Response includes:**

- Post details with heart count
- User information (name, avatar)
- Community information
- Hierarchical comments with replies
- Whether the current user has hearted the post

#### Get Single Post

```http
GET /posts/:id
Authorization: Bearer <token>
```

#### Create Post

```http
POST /posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Post Title",
  "content": "Post content...",
  "communityId": "community-uuid"
}
```

#### Update Post

```http
PUT /posts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### Delete Post

```http
DELETE /posts/:id
Authorization: Bearer <token>
```

#### Heart/Unheart Post

```http
POST /posts/:id/heart
Authorization: Bearer <token>
```

**Response:**

```json
{
  "hearted": true // or false
}
```

#### Check if Post is Hearted

```http
GET /posts/:id/hearted
Authorization: Bearer <token>
```

**Response:**

```json
{
  "hearted": true // or false
}
```

#### Get Posts by Community

```http
GET /posts/community/:communityId
Authorization: Bearer <token>
```

#### Get Posts by User

```http
GET /posts/user/:userId
Authorization: Bearer <token>
```

### Comments

#### Get All Comments

```http
GET /comments
Authorization: Bearer <token>
```

**Response includes:**

- Only top-level comments (parentId: null)
- Nested replies in hierarchical structure
- Heart counts for each comment
- Whether the current user has hearted each comment

#### Get Comments by Post

```http
GET /comments/post/:postId
Authorization: Bearer <token>
```

#### Get Single Comment

```http
GET /comments/:id
Authorization: Bearer <token>
```

#### Create Comment

```http
POST /comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Comment content...",
  "postId": "post-uuid",
  "parentId": "parent-comment-uuid" // Optional for replies
}
```

#### Update Comment

```http
PUT /comments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated comment content..."
}
```

#### Delete Comment

```http
DELETE /comments/:id
Authorization: Bearer <token>
```

#### Heart/Unheart Comment

```http
POST /comments/:id/heart
Authorization: Bearer <token>
```

**Response:**

```json
{
  "hearted": true // or false
}
```

#### Check if Comment is Hearted

```http
GET /comments/:id/hearted
Authorization: Bearer <token>
```

**Response:**

```json
{
  "hearted": true // or false
}
```

## Data Transfer Objects (DTOs)

### CreatePostDto

```typescript
export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  communityId: string;
}
```

### UpdatePostDto

```typescript
export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;
}
```

### CreateCommentDto

```typescript
export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  postId: string;

  @IsUUID()
  @IsOptional()
  parentId?: string; // For replies
}
```

### UpdateCommentDto

```typescript
export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
```

## Response Types

### PostResponseDto

```typescript
export class PostResponseDto {
  id: string;
  title: string;
  content: string;
  heartCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  communityId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  community: {
    id: string;
    name: string;
    slug: string;
  };
  comments: CommentResponseDto[];
  files: {
    id: string;
    url: string;
  }[];
  isHeartedByUser?: boolean;
}
```

### CommentResponseDto

```typescript
export class CommentResponseDto {
  id: string;
  content: string;
  heartCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  parentId?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  replies: CommentResponseDto[];
  files: {
    id: string;
    url: string;
  }[];
  isHeartedByUser?: boolean;
}
```

## Features

### Heart Functionality

- **Toggle hearts**: Users can heart/unheart posts and comments
- **Prevent duplicates**: Unique constraints prevent multiple hearts from the same user
- **Real-time counts**: Heart counts are updated immediately
- **User tracking**: API responses include whether the current user has hearted content

### Hierarchical Comments

- **Unlimited nesting**: Comments can have unlimited levels of replies
- **Parent-child relationships**: Comments can reply to other comments
- **Structured responses**: API returns comments in hierarchical structure
- **Top-level filtering**: Main endpoints return only top-level comments with nested replies

### Security & Authorization

- **Authentication required**: All endpoints require valid Clerk authentication
- **User ownership**: Users can only edit/delete their own posts and comments
- **Community validation**: Posts must belong to valid communities
- **Input validation**: All inputs are validated using class-validator

### Performance Optimizations

- **Selective includes**: Only necessary user and community data is fetched
- **Indexed queries**: Database indexes on frequently queried fields
- **Efficient joins**: Optimized Prisma queries with proper includes
- **Count tracking**: Heart counts are stored as integers for fast access

## Sample Data

The seed script creates sample data including:

- Posts with hearts from multiple users
- Hierarchical comments with multiple levels of replies
- Comments with hearts
- Various community posts for testing

### Sample Post with Hearts

```json
{
  "id": "post-uuid",
  "title": "This community has been so supportive! 💖",
  "content": "I just wanted to say thank you to everyone here...",
  "heartCount": 2,
  "isHeartedByUser": true,
  "comments": [
    {
      "id": "comment-uuid",
      "content": "I completely agree! This community has been a lifeline for me too.",
      "heartCount": 1,
      "isHeartedByUser": false,
      "replies": [
        {
          "id": "reply-uuid",
          "content": "Same here! The support is incredible.",
          "heartCount": 0,
          "isHeartedByUser": false
        }
      ]
    }
  ]
}
```

## Usage Examples

### Frontend Integration

#### Heart a Post

```typescript
const heartPost = async (postId: string) => {
  const response = await fetch(`/api/posts/${postId}/heart`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const { hearted } = await response.json();
  return hearted;
};
```

#### Create a Reply Comment

```typescript
const createReply = async (
  postId: string,
  parentId: string,
  content: string,
) => {
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      postId,
      parentId,
    }),
  });
  return response.json();
};
```

#### Get Posts with Hearts

```typescript
const getPosts = async () => {
  const response = await fetch('/api/posts', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const posts = await response.json();
  return posts.map((post) => ({
    ...post,
    isHearted: post.isHeartedByUser,
  }));
};
```

## Migration and Setup

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

### 4. Start Development Server

```bash
npm run start:dev
```

## Testing

Test the endpoints using the provided sample data:

1. **Get all posts**: `GET /posts`
2. **Heart a post**: `POST /posts/{post-id}/heart`
3. **Create a comment**: `POST /comments`
4. **Create a reply**: `POST /comments` with `parentId`
5. **Heart a comment**: `POST /comments/{comment-id}/heart`

## Next Steps

1. **Real-time updates**: Implement WebSocket connections for live heart updates
2. **Notification system**: Notify users when their posts/comments receive hearts
3. **Comment moderation**: Add admin tools for comment moderation
4. **File uploads**: Support for images and files in posts and comments
5. **Search functionality**: Add search capabilities for posts and comments
6. **Pagination**: Implement pagination for large comment threads
7. **Analytics**: Track engagement metrics for posts and comments

## Error Handling

The system includes comprehensive error handling:

- **404 Not Found**: Post/comment doesn't exist
- **403 Forbidden**: User doesn't have permission to edit/delete
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication
- **500 Internal Server Error**: Database or server errors

All errors include descriptive messages and appropriate HTTP status codes.
