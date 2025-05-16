# Mentara NestJS API Routes

This document outlines the available NestJS API endpoints in the Mentara backend.

## Base URL

All API routes are prefixed with: `http://localhost:5000/api`

## Authentication

Most routes require authentication via Clerk JWT tokens. Add the token to request headers:
```
Authorization: Bearer <clerk_jwt_token>
```

## Available Routes

### Auth Routes
```typescript
// AuthController - /auth
POST /auth/admin - Check if user has admin privileges
```

### Users Routes
```typescript
// UsersController - /users
GET /users - Get all users
GET /users/:id - Get a specific user by ID
POST /users - Create a new user
PUT /users/:id - Update a user
DELETE /users/:id - Delete a user
GET /users/is-first-signin/:userId - Check if this is a user's first sign-in
```

### Communities Routes
```typescript
// CommunitiesController - /communities
GET /communities - Get all communities
GET /communities/:id - Get a specific community
POST /communities - Create a new community
PUT /communities/:id - Update a community
DELETE /communities/:id - Delete a community
GET /communities/user/:userId - Get communities for a specific user
```

### Posts Routes
```typescript
// PostsController - /posts
GET /posts - Get all posts
GET /posts/:id - Get a specific post
POST /posts - Create a new post
PUT /posts/:id - Update a post
DELETE /posts/:id - Delete a post
GET /posts/user/:userId - Get posts by a specific user
GET /posts/community/:communityId - Get posts in a specific community
```

### Comments Routes
```typescript
// CommentsController - /comments
GET /comments - Get all comments
GET /comments/:id - Get a specific comment
POST /comments - Create a new comment
PUT /comments/:id - Update a comment
DELETE /comments/:id - Delete a comment
```

### Therapist Application Routes
```typescript
// TherapistApplicationController - /therapist/application
GET /therapist/application - Get all therapist applications (admin only)
GET /therapist/application/:id - Get a specific application
POST /therapist/application - Submit a new therapist application
PUT /therapist/application/:id - Update an application
DELETE /therapist/application/:id - Delete an application
```

### Webhook Routes
```typescript
// WebhooksController - /webhooks
POST /webhooks/clerk - Handle Clerk webhook events (user created, updated, deleted)
```

## Request/Response Examples

### Admin Authentication
```
POST /api/auth/admin
Response: { "admin": { "id": "123", "role": "admin", "permissions": ["read", "write"] } }
```

### Get User
```
GET /api/users/123
Response: { "id": "123", "firstName": "John", "lastName": "Doe", "email": "john@example.com" }
```

### Create Community
```
POST /api/communities
Body: { "name": "Mental Health Support", "description": "A community for mental health support" }
Response: { "id": "456", "name": "Mental Health Support", "description": "A community for mental health support" }
```

### Submit Therapist Application
```
POST /api/therapist/application
Body: {
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "providerType": "Psychologist",
  ...
}
Response: {
  "success": true,
  "message": "Application submitted successfully",
  "applicationId": "789"
}
```