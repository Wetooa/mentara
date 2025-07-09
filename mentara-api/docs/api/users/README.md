# User Management API

The User Management API handles user profiles, account management, role-based access control, and administrative user operations for the Mentara platform.

## 🏗️ Architecture

The user management system provides:
- **Profile Management**: User profile creation, updates, and retrieval
- **Role-Based Access Control**: Four user roles (client, therapist, moderator, admin)
- **Account Lifecycle**: Activation, deactivation, and reactivation
- **Administrative Controls**: Admin-only user management operations
- **Event-Driven**: Publishes events for profile changes and account status
- **Audit Trail**: Complete tracking of user account changes
- **HIPAA Compliance**: Soft deletes and data retention

## 👤 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **client** | Patients seeking therapy | Access sessions, communities, assessments |
| **therapist** | Licensed mental health professionals | Conduct sessions, manage availability, view client data |
| **moderator** | Community moderators | Moderate content, manage communities |
| **admin** | System administrators | Full platform access, user management, analytics |

## 📡 API Endpoints

### Base URL
```
/users
```

Most endpoints require authentication via Clerk JWT token.

---

## 👥 User Retrieval

### Get All Users
Retrieve all active users (admin only).

**Endpoint**: `GET /users`

**Headers**:
```
Authorization: Bearer <clerk_jwt_token>
```

**Authorization**: Admin only

**Response**: `200 OK`
```json
[
  {
    "id": "user_123",
    "email": "john.doe@example.com",
    "firstName": "John",
    "middleName": "Michael",
    "lastName": "Doe",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "address": "123 Main St, City, State 12345",
    "avatarUrl": "https://storage.example.com/avatars/user_123.jpg",
    "role": "client",
    "bio": "Looking for support with anxiety and stress management",
    "coverImageUrl": "https://storage.example.com/covers/user_123.jpg",
    "isActive": true,
    "phoneNumber": "+1234567890",
    "timezone": "America/New_York",
    "language": "en",
    "theme": "light",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  {
    "id": "user_456",
    "email": "jane.smith@example.com",
    "firstName": "Jane",
    "middleName": "Elizabeth",
    "lastName": "Smith",
    "birthDate": "1985-05-15T00:00:00.000Z",
    "address": "456 Professional Dr, City, State 67890",
    "avatarUrl": "https://storage.example.com/avatars/user_456.jpg",
    "role": "therapist",
    "bio": "Licensed clinical psychologist with 10 years experience",
    "coverImageUrl": "https://storage.example.com/covers/user_456.jpg",
    "isActive": true,
    "phoneNumber": "+1987654321",
    "timezone": "America/Los_Angeles",
    "language": "en",
    "theme": "dark",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
]
```

**Error Responses**:
- `403 Forbidden`: Insufficient permissions (non-admin)

### Get All Users Including Inactive
Retrieve all users including deactivated accounts (admin only).

**Endpoint**: `GET /users/all-including-inactive`

**Authorization**: Admin only

**Response**: `200 OK`
```json
[
  {
    "id": "user_789",
    "email": "inactive.user@example.com",
    "firstName": "Inactive",
    "lastName": "User",
    "role": "client",
    "isActive": false,
    "suspendedAt": "2024-01-15T10:30:00.000Z",
    "suspendedBy": "admin_123",
    "suspensionReason": "Account deactivated by administrator for policy violation",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### Get User by ID
Retrieve a specific user's profile.

**Endpoint**: `GET /users/:id`

**Authorization**: Users can only access their own profile unless they're admin

**Response**: `200 OK`
```json
{
  "id": "user_123",
  "email": "john.doe@example.com",
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "birthDate": "1990-01-01T00:00:00.000Z",
  "address": "123 Main St, City, State 12345",
  "avatarUrl": "https://storage.example.com/avatars/user_123.jpg",
  "role": "client",
  "bio": "Looking for support with anxiety and stress management",
  "coverImageUrl": "https://storage.example.com/covers/user_123.jpg",
  "isActive": true,
  "phoneNumber": "+1234567890",
  "timezone": "America/New_York",
  "language": "en",
  "theme": "light",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "therapist": null
}
```

**Admin Response** (includes related data):
```json
{
  "id": "user_456",
  "email": "jane.smith@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "therapist",
  "isActive": true,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "therapist": {
    "userId": "user_456",
    "status": "approved",
    "mobile": "+1987654321",
    "province": "California",
    "expertise": ["Anxiety", "Depression", "PTSD"],
    "hourlyRate": 150.00
  },
  "client": null,
  "admin": null,
  "moderator": null
}
```

**Error Responses**:
- `403 Forbidden`: Cannot access other user's profile
- `404 Not Found`: User not found

---

## ✏️ Profile Management

### Update User Profile
Update user profile information.

**Endpoint**: `PUT /users/:id`

**Authorization**: Users can only update their own profile unless they're admin

**Request Body** (Regular User):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio about my mental health journey",
  "avatarUrl": "https://storage.example.com/avatars/new_avatar.jpg",
  "phoneNumber": "+1234567890",
  "timezone": "America/Chicago",
  "language": "en",
  "theme": "dark"
}
```

**Request Body** (Admin - Can Update All Fields):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "newemail@example.com",
  "role": "client",
  "isActive": true,
  "bio": "Updated bio",
  "avatarUrl": "https://storage.example.com/avatars/new_avatar.jpg",
  "phoneNumber": "+1234567890",
  "timezone": "America/Chicago",
  "language": "es",
  "theme": "dark",
  "birthDate": "1990-01-01T00:00:00.000Z",
  "address": "456 New Address, City, State 12345"
}
```

**Allowed Fields for Regular Users**:
- `firstName`
- `lastName`
- `bio`
- `avatarUrl`
- `phoneNumber`
- `timezone`
- `language`
- `theme`

**Response**: `200 OK`
```json
{
  "id": "user_123",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio about my mental health journey",
  "avatarUrl": "https://storage.example.com/avatars/new_avatar.jpg",
  "phoneNumber": "+1234567890",
  "timezone": "America/Chicago",
  "language": "en",
  "theme": "dark",
  "role": "client",
  "isActive": true,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T14:30:00.000Z"
}
```

**Error Responses**:
- `403 Forbidden`: Cannot update other user's profile or restricted fields
- `404 Not Found`: User not found

---

## 🗑️ Account Management

### Deactivate Account (Self)
Deactivate your own account.

**Endpoint**: `DELETE /users/:id`

**Authorization**: Users can only deactivate their own account unless they're admin

**Response**: `200 OK`
```json
{
  "message": "User account deactivated successfully"
}
```

**Effects**:
- Account marked as inactive (`isActive: false`)
- Suspension timestamp recorded
- User data retained for compliance
- Triggers deactivation events

### Administrative Deactivation
Deactivate a user account (admin only).

**Endpoint**: `POST /users/:id/deactivate`

**Authorization**: Admin only

**Request Body**:
```json
{
  "reason": "Policy violation: inappropriate behavior in community discussions"
}
```

**Response**: `200 OK`
```json
{
  "message": "User account deactivated by administrator"
}
```

**Features**:
- Records administrator who performed action
- Includes reason for audit trail
- Preserves all user data
- Sends notification to user

### Reactivate Account
Reactivate a deactivated account (admin only).

**Endpoint**: `POST /users/:id/reactivate`

**Authorization**: Admin only

**Response**: `200 OK`
```json
{
  "message": "User account reactivated successfully"
}
```

**Features**:
- Restores account access
- Clears suspension information
- Calculates inactive duration
- Triggers reactivation events

---

## 📊 Data Models

### User Profile Fields
```typescript
{
  id: string;                    // Unique user identifier
  email: string;                 // User email address
  firstName: string;             // First name
  middleName?: string;           // Middle name (optional)
  lastName: string;              // Last name
  birthDate?: Date;              // Date of birth
  address?: string;              // Physical address
  avatarUrl?: string;            // Profile picture URL
  role: 'client' | 'therapist' | 'moderator' | 'admin';
  bio?: string;                  // User biography
  coverImageUrl?: string;        // Cover image URL
  isActive: boolean;             // Account status
  phoneNumber?: string;          // Phone number
  timezone?: string;             // User timezone
  language?: string;             // Preferred language
  theme?: string;                // UI theme preference
  
  // Account management fields
  suspendedAt?: Date;            // Suspension timestamp
  suspendedBy?: string;          // Who suspended the account
  suspensionReason?: string;     // Reason for suspension
  
  // Timestamps
  createdAt: Date;               // Account creation
  updatedAt: Date;               // Last update
}
```

### User Update Input
```typescript
{
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  timezone?: string;
  language?: string;
  theme?: string;
  
  // Admin-only fields
  email?: string;
  role?: string;
  isActive?: boolean;
  birthDate?: Date;
  address?: string;
  middleName?: string;
  coverImageUrl?: string;
}
```

### Deactivation Request
```typescript
{
  reason?: string;               // Optional reason for deactivation
}
```

---

## 🔄 Events Published

The user management service publishes events for downstream processing:

### UserRegisteredEvent
```typescript
{
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'therapist' | 'moderator' | 'admin';
  registrationMethod: string;
}
```

### UserProfileUpdatedEvent
```typescript
{
  userId: string;
  updatedFields: string[];
  previousValues: Record<string, any>;
  newValues: Record<string, any>;
}
```

### UserDeactivatedEvent
```typescript
{
  userId: string;
  reason: string;
  deactivatedBy: string;
  isTemporary: boolean;
}
```

### UserReactivatedEvent
```typescript
{
  userId: string;
  reactivatedBy: string;
  inactiveDuration: number;      // Days inactive
}
```

---

## 🛡️ Security Features

### Role-Based Access Control
- **Profile Access**: Users can only access their own profiles
- **Admin Override**: Admins can access any user profile
- **Field Restrictions**: Non-admins cannot modify sensitive fields
- **Audit Trail**: All administrative actions are logged

### Data Protection
- **Soft Deletes**: Account deactivation preserves data for compliance
- **HIPAA Compliance**: Medical data retention requirements
- **Event Logging**: Complete audit trail of account changes
- **Permission Validation**: Strict role-based permissions

### Account Security
- **Self-Service**: Users can manage their own profiles
- **Administrative Oversight**: Admin controls for policy enforcement
- **Suspension Tracking**: Complete suspension/reactivation history
- **Data Integrity**: Validation of all profile updates

---

## 🧪 Testing

### Unit Tests
```bash
npm run test users.service.spec.ts
npm run test users.controller.spec.ts
```

### Integration Tests
```bash
npm run test:e2e -- --grep "Users"
```

### Test Scenarios
```typescript
// Test profile update
const updateData = {
  firstName: "John",
  lastName: "Updated",
  bio: "New bio",
  theme: "dark"
};

// Test role-based access
const testAdminAccess = async (userId, adminId) => {
  // Test admin can access any profile
};

// Test account deactivation
const testDeactivation = async (userId, reason) => {
  // Test deactivation process
};
```

---

## 🚀 Frontend Integration

### React Hook Example
```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export function useUserManagement() {
  const { getToken, userId } = useAuth();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const getCurrentUser = async () => {
    if (!userId) return null;
    
    const token = await getToken();
    const response = await fetch(`/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const userData = await response.json();
      setUser(userData);
      setIsAdmin(userData.role === 'admin');
      return userData;
    }
    throw new Error('Failed to fetch user profile');
  };
  
  const updateProfile = async (updates) => {
    if (!userId) throw new Error('No user ID');
    
    const token = await getToken();
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (response.ok) {
      const updatedUser = await response.json();
      setUser(updatedUser);
      return updatedUser;
    }
    throw new Error('Failed to update profile');
  };
  
  const getAllUsers = async () => {
    const token = await getToken();
    const response = await fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const usersData = await response.json();
      setUsers(usersData);
      return usersData;
    }
    throw new Error('Failed to fetch users');
  };
  
  const deactivateUser = async (targetUserId, reason) => {
    const token = await getToken();
    const response = await fetch(`/api/users/${targetUserId}/deactivate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
    
    if (response.ok) {
      await getAllUsers(); // Refresh user list
      return true;
    }
    throw new Error('Failed to deactivate user');
  };
  
  const reactivateUser = async (targetUserId) => {
    const token = await getToken();
    const response = await fetch(`/api/users/${targetUserId}/reactivate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      await getAllUsers(); // Refresh user list
      return true;
    }
    throw new Error('Failed to reactivate user');
  };
  
  return {
    user,
    users,
    isAdmin,
    getCurrentUser,
    updateProfile,
    getAllUsers,
    deactivateUser,
    reactivateUser,
  };
}
```

### Profile Edit Component
```typescript
import React, { useState, useEffect } from 'react';
import { useUserManagement } from './useUserManagement';

export function ProfileEditForm() {
  const { user, updateProfile, getCurrentUser } = useUserManagement();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    phoneNumber: '',
    timezone: '',
    language: 'en',
    theme: 'light'
  });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    getCurrentUser();
  }, []);
  
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        phoneNumber: user.phoneNumber || '',
        timezone: user.timezone || '',
        language: user.language || 'en',
        theme: user.theme || 'light'
      });
    }
  }, [user]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateProfile(formData);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  if (!user) {
    return <div className="loading">Loading profile...</div>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h2>Edit Profile</h2>
      
      <div className="form-group">
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          placeholder="Tell us about yourself..."
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="phoneNumber">Phone Number</label>
        <input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="timezone">Timezone</label>
        <select
          id="timezone"
          name="timezone"
          value={formData.timezone}
          onChange={handleChange}
        >
          <option value="">Select timezone</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="language">Language</label>
        <select
          id="language"
          name="language"
          value={formData.language}
          onChange={handleChange}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="theme">Theme</label>
        <select
          id="theme"
          name="theme"
          value={formData.theme}
          onChange={handleChange}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>
      
      <button type="submit" disabled={loading} className="submit-button">
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
}
```

### Admin User Management Component
```typescript
import React, { useState, useEffect } from 'react';
import { useUserManagement } from './useUserManagement';

export function AdminUserManagement() {
  const { users, isAdmin, getAllUsers, deactivateUser, reactivateUser } = useUserManagement();
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  
  useEffect(() => {
    if (isAdmin) {
      getAllUsers();
    }
  }, [isAdmin]);
  
  const handleDeactivate = async (userId) => {
    if (!deactivationReason.trim()) {
      alert('Please provide a reason for deactivation');
      return;
    }
    
    try {
      setLoading(true);
      await deactivateUser(userId, deactivationReason);
      setDeactivationReason('');
      setSelectedUser(null);
      alert('User deactivated successfully');
    } catch (error) {
      alert('Failed to deactivate user');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReactivate = async (userId) => {
    try {
      setLoading(true);
      await reactivateUser(userId);
      alert('User reactivated successfully');
    } catch (error) {
      alert('Failed to reactivate user');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isAdmin) {
    return <div className="error">Access denied. Admin privileges required.</div>;
  }
  
  return (
    <div className="admin-user-management">
      <h2>User Management</h2>
      
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className={!user.isActive ? 'inactive' : ''}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  {user.isActive ? (
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="deactivate-button"
                      disabled={loading}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivate(user.id)}
                      className="reactivate-button"
                      disabled={loading}
                    >
                      Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selectedUser && (
        <div className="deactivation-modal">
          <div className="modal-content">
            <h3>Deactivate User: {selectedUser.firstName} {selectedUser.lastName}</h3>
            
            <div className="form-group">
              <label htmlFor="reason">Reason for deactivation:</label>
              <textarea
                id="reason"
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                placeholder="Provide a detailed reason for deactivation..."
                rows={4}
                required
              />
            </div>
            
            <div className="modal-actions">
              <button
                onClick={() => handleDeactivate(selectedUser.id)}
                className="confirm-button"
                disabled={loading || !deactivationReason.trim()}
              >
                {loading ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setDeactivationReason('');
                }}
                className="cancel-button"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 📈 Performance Considerations

### Database Optimization
- **Indexed Queries**: Efficient lookups by ID, email, and role
- **Selective Loading**: Include related data only when needed
- **Soft Deletes**: Preserve data while maintaining performance

### Caching Strategy
- **Profile Data**: Cache frequently accessed user profiles
- **Role Checks**: Cache role information for authorization
- **Admin Queries**: Cache admin user lists

### Event Processing
- **Async Events**: Non-blocking event publishing
- **Audit Trail**: Efficient logging of user actions
- **Notification System**: Real-time updates for account changes

---

## 🆘 Troubleshooting

### Common Issues

#### Profile Update Fails
**Cause**: Attempting to update restricted fields as non-admin
**Solution**: Only update allowed fields or use admin account

#### Access Denied Errors
**Cause**: Trying to access another user's profile
**Solution**: Ensure user is accessing their own profile or is admin

#### Deactivation Fails
**Cause**: User not found or already inactive
**Solution**: Verify user exists and current status

#### Event Publishing Issues
**Cause**: Event bus connectivity problems
**Solution**: Check event system configuration and connectivity

### Debug Commands
```bash
# Get user profile
curl http://localhost:5000/api/users/user_123 \
  -H "Authorization: Bearer <token>"

# Update profile
curl -X PUT http://localhost:5000/api/users/user_123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Updated", "bio": "New bio"}'

# Admin: Get all users
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer <admin_token>"

# Admin: Deactivate user
curl -X POST http://localhost:5000/api/users/user_123/deactivate \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Policy violation"}'
```

---

## 📚 Related Documentation

- [Authentication API](../auth/README.md)
- [Therapist Management API](../therapist/README.md)
- [Client Management API](../client/README.md)
- [Admin API](../admin/README.md)
- [Role-Based Access Control Guide](../../guides/rbac.md)