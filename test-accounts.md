# Test Accounts - Mentara Development

This document contains test account credentials for development and testing purposes. These accounts are created by the ultra-fast seed script (`npm run db:seed`).

## 🔑 Universal Password

All test accounts use the same password for development convenience:

```
password123
```

## 👤 Client Accounts

### Client 1

- **Email:** `client1@mentaratest.dev`
- **Name:** Client 1
- **Role:** Client
- **ID:** `dev_client_1`
- **Features:** Full client access, community memberships, can book therapy sessions

### Client 2

- **Email:** `client2@mentaratest.dev`
- **Name:** Client 2
- **Role:** Client
- **ID:** `dev_client_2`
- **Features:** Full client access, community memberships, can book therapy sessions

### Client 3

- **Email:** `client3@mentaratest.dev`
- **Name:** Client 3
- **Role:** Client
- **ID:** `dev_client_3`
- **Features:** Full client access, community memberships, can book therapy sessions

## 👨‍⚕️ Therapist Accounts

### Therapist 1

- **Email:** `therapist1@mentaratest.dev`
- **Name:** Dr. Therapist 1
- **Role:** Therapist
- **ID:** `dev_therapist_1`
- **Status:** APPROVED
- **Specializations:** Anxiety, Depression
- **Hourly Rate:** $100.00
- **Features:** Can view assigned clients, conduct sessions, manage availability

### Therapist 2

- **Email:** `therapist2@mentaratest.dev`
- **Name:** Dr. Therapist 2
- **Role:** Therapist
- **ID:** `dev_therapist_2`
- **Status:** APPROVED
- **Specializations:** Anxiety, Depression
- **Hourly Rate:** $100.00
- **Features:** Can view assigned clients, conduct sessions, manage availability

### Therapist 3

- **Email:** `therapist3@mentaratest.dev`
- **Name:** Dr. Therapist 3
- **Role:** Therapist
- **ID:** `dev_therapist_3`
- **Status:** APPROVED
- **Specializations:** Anxiety, Depression
- **Hourly Rate:** $100.00
- **Features:** Can view assigned clients, conduct sessions, manage availability

## 👑 Admin Accounts

### Admin 1

- **Email:** `admin1@mentaratest.dev`
- **Name:** Admin 1
- **Role:** Admin
- **ID:** `dev_admin_1`
- **Permissions:** user_management, therapist_approval, system_admin
- **Features:** Full platform administration, user management, therapist approval

### Admin 2

- **Email:** `admin2@mentaratest.dev`
- **Name:** Admin 2
- **Role:** Admin
- **ID:** `dev_admin_2`
- **Permissions:** user_management, therapist_approval, system_admin
- **Features:** Full platform administration, user management, therapist approval

### Admin 3

- **Email:** `admin3@mentaratest.dev`
- **Name:** Admin 3
- **Role:** Admin
- **ID:** `dev_admin_3`
- **Permissions:** user_management, therapist_approval, system_admin
- **Features:** Full platform administration, user management, therapist approval

## 👮 Moderator Accounts

### Moderator 1

- **Email:** `moderator1@mentaratest.dev`
- **Name:** Moderator 1
- **Role:** Moderator
- **ID:** `dev_moderator_1`
- **Permissions:** content_moderation, community_management
- **Communities:** All communities (ADHD Support, Anxiety Support, Depression Support)
- **Features:** Content moderation, community management

### Moderator 2

- **Email:** `moderator2@mentaratest.dev`
- **Name:** Moderator 2
- **Role:** Moderator
- **ID:** `dev_moderator_2`
- **Permissions:** content_moderation, community_management
- **Communities:** All communities (ADHD Support, Anxiety Support, Depression Support)
- **Features:** Content moderation, community management

### Moderator 3

- **Email:** `moderator3@mentaratest.dev`
- **Name:** Moderator 3
- **Role:** Moderator
- **ID:** `dev_moderator_3`
- **Permissions:** content_moderation, community_management
- **Communities:** All communities (ADHD Support, Anxiety Support, Depression Support)
- **Features:** Content moderation, community management

## 🏘️ Communities

### ADHD Support

- **Name:** ADHD Support
- **Slug:** `adhd-support`
- **ID:** `dev_comm_adhd-support`
- **Description:** A supportive community for individuals with ADHD.

### Anxiety Support

- **Name:** Anxiety Support
- **Slug:** `anxiety-support`
- **ID:** `dev_comm_anxiety-support`
- **Description:** A supportive community for individuals with anxiety.

### Depression Support

- **Name:** Depression Support
- **Slug:** `depression-support`
- **ID:** `dev_comm_depression-support`
- **Description:** A supportive community for individuals with depression.

## 📊 Database Tables Populated

The seed script creates entries in the following tables:

- ✅ **User** - Base user accounts for all roles
- ✅ **Client** - Client-specific data and relationships
- ✅ **Therapist** - Therapist profiles with full professional details
- ✅ **Admin** - Admin accounts with permissions
- ✅ **Moderator** - Moderator accounts with permissions
- ✅ **Community** - Mental health support communities
- ✅ **Membership** - Client community memberships
- ✅ **ModeratorCommunity** - Moderator-community assignments

## 🚀 Quick Start

1. **Seed the database:**

   ```bash
   cd mentara-api
   npm run db:seed
   ```

2. **Login to the application:**

   - Use any email from above with password `password123`
   - Test different role-specific features

3. **Reset if needed:**
   ```bash
   npm run db:reset  # Resets and re-seeds
   ```

## 📝 Notes

- All accounts are active and email-verified for immediate use
- Therapists are pre-approved for development convenience
- All clients are members of all communities
- All moderators can moderate all communities
- All data uses predictable IDs for easy debugging and testing

## 🔧 Development Commands

- `npm run db:seed` - Ultra-fast seeding (seconds)
- `npm run db:seed:full` - Comprehensive seeding (slower, more data)
- `npm run db:reset` - Reset database and re-seed
- `npm run db:migrate` - Run migrations
- `npm run db:generate` - Generate Prisma client
