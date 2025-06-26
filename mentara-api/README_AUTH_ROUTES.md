# Auth Routes

## POST /auth/register/client

Registers a new client user. Requires Clerk authentication. Calls AuthService.registerClient.

## POST /auth/register/therapist

Registers a new therapist user. Requires Clerk authentication. Calls AuthService.registerTherapist.

## GET /auth/me

Returns the current authenticated user's profile. Requires Clerk authentication. Calls AuthService.getUser.

## GET /auth/users

Returns a list of all users. Requires Clerk authentication. Calls AuthService.getUsers.

## POST /auth/is-admin

Checks if the current user is an admin. Requires Clerk authentication. Calls AuthService.checkAdmin.

---

## Other Related Endpoints

- `/users` (GET, PUT, DELETE): User management
- `/client/profile` (GET): Get client profile
- `/therapist-management/profile` (GET): Get therapist profile
- `/pre-assessment` (GET): Get pre-assessment for user
- `/booking/meetings` (GET): Get meetings for user

See respective controllers for more details.
