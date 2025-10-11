# Email Service Setup Guide

This guide explains how to set up the EmailJS email service and all required environment variables for the Mentara API backend.

## Overview

The email service has been migrated from the frontend to the backend using `@emailjs/nodejs`. This provides better security, centralized email logic, and easier management of email functionality.

## Complete Environment Variables Guide

The Mentara API backend requires several environment variables for proper functionality. Below is a comprehensive guide for all required and optional variables.

### Required Environment Variables

Add the following **required** environment variables to your `.env` file:

```bash
# Application Environment
NODE_ENV=development

# JWT Configuration (Authentication)
JWT_SECRET=your_64_character_jwt_secret_key_here_minimum_32_chars_required
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Message Encryption (Chat/Messaging Security)
MESSAGE_ENCRYPTION_KEY=your_32_character_encryption_key_here_minimum_length_required

# OAuth Configuration - Google
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# OAuth Configuration - Microsoft
MICROSOFT_CLIENT_ID=your_microsoft_oauth_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_oauth_client_secret

# Supabase Configuration (Database & Storage)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_API_KEY=your_supabase_anon_public_key

# Database Configuration (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/postgres"
```

### EmailJS Configuration (Email Service)

```bash
# EmailJS Configuration
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### Application URLs

```bash
# Application Configuration
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
PORT=8000
```

### AI Service Configuration

```bash
# AI Service Configuration
AI_SERVICE_URL=http://localhost:5001
AI_SERVICE_TIMEOUT_MS=30000
AI_SERVICE_MAX_RETRIES=3
AI_SERVICE_RATE_LIMIT_PER_MINUTE=60
```

## Important: Database URL Configuration (Prisma)

### DATABASE_URL vs DIRECT_URL

Mentara uses **Supabase** as the PostgreSQL database provider. Prisma requires two different connection URLs:

1. **DATABASE_URL**: Used for general application database operations
   - **Port 6543**: Connection pooling via PgBouncer
   - **Purpose**: Optimized for application queries with connection pooling
   - **Format**: `postgresql://user:pass@host:6543/postgres?pgbouncer=true`

2. **DIRECT_URL**: Used for migrations and schema operations
   - **Port 5432**: Direct PostgreSQL connection (bypasses pooling)
   - **Purpose**: Required for schema migrations, introspection, and database management operations
   - **Format**: `postgresql://user:pass@host:5432/postgres`

**Why both are needed:**
- Connection pooling (port 6543) is efficient for app queries but doesn't support all PostgreSQL features
- Direct connection (port 5432) is required for schema operations but less efficient for regular queries
- Prisma automatically uses the appropriate connection based on the operation

### Optional Environment Variables

```bash
# Redis Configuration (Caching & Sessions)
REDIS_URL=redis://localhost:6379

# AWS S3 Configuration (File Storage)
S3_BUCKET_NAME=your_s3_bucket_name
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# SMTP Configuration (Alternative Email Service)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Stripe Configuration (Payment Processing)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Clerk Configuration (Alternative Auth Provider)
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Security Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Testing Configuration
TEST_DATABASE_URL=postgresql://test_user:test_pass@localhost:5432/mentara_test
```

## How to Get Required Credentials

### EmailJS Credentials

1. **Sign up for EmailJS**: Go to [EmailJS.com](https://www.emailjs.com/) and create an account
2. **Create a Service**: Add an email service (Gmail, Outlook, etc.)
3. **Create a Template**: Design your email template with placeholders
4. **Get Credentials**:
   - `EMAILJS_SERVICE_ID`: Found in your EmailJS dashboard under "Email Services"
   - `EMAILJS_TEMPLATE_ID`: Found in your EmailJS dashboard under "Email Templates"
   - `EMAILJS_PUBLIC_KEY`: Found in your EmailJS dashboard under "Account" → "API Keys"

### Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google+ API or Google People API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URIs: `http://localhost:8000/auth/google/callback`
7. Copy the Client ID and Client Secret

### Microsoft OAuth Credentials

1. Go to [Microsoft Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Set redirect URI: `http://localhost:8000/auth/microsoft/callback`
5. Go to "Certificates & secrets" → create new client secret
6. Copy the Application (client) ID and client secret value

### Supabase Configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing project
3. Go to "Settings" → "API"
4. Copy:
   - Project URL (for `SUPABASE_URL`)
   - Anon public key (for `SUPABASE_API_KEY`)
5. Go to "Settings" → "Database"
6. Copy connection strings:
   - Connection pooling URL (port 6543) for `DATABASE_URL`
   - Direct connection URL (port 5432) for `DIRECT_URL`

### Security Keys Generation

Generate secure keys for encryption:

```bash
# Generate JWT Secret (64 characters recommended)
openssl rand -base64 48

# Generate Message Encryption Key (32 characters minimum)
openssl rand -base64 32
```

## Environment Setup Checklist

Before running the application, ensure you have:

- [ ] Set `NODE_ENV` (development/production/test)
- [ ] Generated and set `JWT_SECRET` (minimum 32 characters)
- [ ] Generated and set `MESSAGE_ENCRYPTION_KEY` (minimum 32 characters)
- [ ] Configured Google OAuth credentials
- [ ] Configured Microsoft OAuth credentials
- [ ] Set up Supabase project and copied URLs/keys
- [ ] Set up EmailJS service and copied credentials
- [ ] Set correct `DATABASE_URL` and `DIRECT_URL` for Prisma
- [ ] Configured application URLs (`APP_URL`, `FRONTEND_URL`)
- [ ] Set appropriate `PORT` for the backend service

## Development vs Production

### Development Environment
- Use `NODE_ENV=development`
- Use `http://localhost` URLs
- OAuth callback URLs should point to localhost
- Less strict security requirements

### Production Environment
- Set `NODE_ENV=production`
- Use HTTPS URLs for all external endpoints
- Update OAuth callback URLs to production domains
- Ensure all security keys are properly generated
- Set proper `ALLOWED_ORIGINS` for CORS

## Common Issues and Solutions

### Environment Variable Missing Errors

If you see errors like "Missing required environment variables", check:

1. **File location**: Ensure `.env` file is in the root of `mentara-api/` directory
2. **Syntax**: No spaces around the `=` sign
3. **Quotes**: Use quotes for values with special characters
4. **Case sensitivity**: Variable names are case-sensitive

### Database Connection Issues

- **Connection refused**: Check if Supabase project is active
- **Authentication failed**: Verify database credentials
- **Migration errors**: Ensure `DIRECT_URL` is set correctly (port 5432)
- **Query errors**: Verify `DATABASE_URL` uses connection pooling (port 6543)

### OAuth Setup Issues

- **Invalid client**: Check client ID and secret are correct
- **Redirect URI mismatch**: Ensure callback URLs match in OAuth provider settings
- **Scope errors**: Verify required permissions are granted in OAuth provider

### EmailJS Issues

- **Emails not sending**: Verify service ID, template ID, and public key
- **Template errors**: Check template exists and is published in EmailJS dashboard
- **Rate limiting**: EmailJS has sending limits, check your quota
   - `EMAILJS_TEMPLATE_ID`: Found in your EmailJS dashboard under "Email Templates"
   - `EMAILJS_PUBLIC_KEY`: Found in your EmailJS dashboard under "Account" → "API Keys"

## API Endpoints

The email service provides the following REST endpoints:

### Send OTP Email
```
POST /email/send-otp
Content-Type: application/json

{
  "to_email": "user@example.com",
  "to_name": "John Doe",
  "otp_code": "123456",
  "expires_in": "10 minutes",
  "type": "registration"
}
```

### Send OTP Email with Auto-Generated Code
```
POST /email/send-otp-auto
Content-Type: application/json

{
  "to_email": "user@example.com",
  "to_name": "John Doe",
  "type": "registration",
  "expires_in_minutes": 10
}
```

### Send Therapist Application Notification
```
POST /email/send-therapist-notification
Content-Type: application/json

{
  "to": "therapist@example.com",
  "name": "Dr. Jane Smith",
  "status": "approved",
  "adminNotes": "Welcome to Mentara!",
  "credentials": {
    "email": "dr.jane@mentara.com",
    "password": "temp123"
  }
}
```

### Test Email Configuration
```
GET /email/test
```

### Check Email Service Status
```
GET /email/status
```

### Generate OTP (Development Only)
```
GET /email/generate-otp
```

## Email Templates

### OTP Email Templates

The service supports three types of OTP emails:

1. **Registration**: Welcome email with verification code
2. **Password Reset**: Password reset verification
3. **Login Verification**: Two-factor authentication

Each template includes:
- Beautiful HTML design with Mentara branding
- Responsive layout for mobile devices
- Security warnings and instructions
- Plain text fallback

### Therapist Notification Templates

- **Approval Email**: Includes login credentials and welcome message
- **Rejection Email**: Professional rejection with feedback

## Features

### Security Features
- Rate limiting on email sending
- Environment-based configuration
- Secure credential handling
- Email validation

### Development Features
- Development-only OTP generation endpoint
- Configuration testing endpoint
- Detailed logging
- Error handling with meaningful messages

### Production Features
- Robust error handling
- Retry logic for failed emails
- Email delivery tracking
- Performance monitoring

## Usage in Other Modules

To use the email service in other modules:

1. **Import the EmailModule**:
```typescript
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  // ...
})
export class YourModule {}
```

2. **Inject the EmailService**:
```typescript
import { EmailService } from '../email/email.service';

@Injectable()
export class YourService {
  constructor(private readonly emailService: EmailService) {}

  async sendEmail() {
    await this.emailService.sendOtpEmail({
      to_email: 'user@example.com',
      to_name: 'User Name',
      otp_code: '123456',
      expires_in: '10 minutes',
      type: 'registration'
    });
  }
}
```

## Troubleshooting

### Common Issues

1. **Email not sending**:
   - Check environment variables are set correctly
   - Verify EmailJS service is active
   - Check EmailJS template exists and is published

2. **Configuration errors**:
   - Use `/email/test` endpoint to verify setup
   - Check `/email/status` for service status

3. **Template issues**:
   - Ensure EmailJS template has correct placeholders
   - Verify template ID matches the one in your dashboard

### Error Messages

- `EmailJS not properly initialized`: Missing environment variables
- `EmailJS service ID or template ID not configured`: Check your EmailJS dashboard
- `Failed to send email`: Network or EmailJS service issue

## Migration from Frontend

The following functionality has been moved from frontend to backend:

- **Frontend**: `lib/emailjs.ts` → **Backend**: `src/email/email.service.ts`
- **Frontend**: `lib/services/email.service.ts` → **Backend**: `src/email/email.controller.ts`
- **Frontend**: Email templates → **Backend**: Built into service methods

### Breaking Changes

- Frontend no longer needs EmailJS browser dependencies
- Frontend should call backend API endpoints instead of EmailJS directly
- Environment variables moved from `NEXT_PUBLIC_*` to backend `.env`

## Security Considerations

1. **Environment Variables**: Never expose EmailJS credentials in frontend
2. **Rate Limiting**: Backend implements proper rate limiting
3. **Validation**: All email inputs are validated server-side
4. **Sanitization**: HTML content is properly escaped
5. **Audit Logging**: Email sending activities are logged

## Performance

- Email sending is asynchronous
- Failed emails are logged but don't block the application
- Template generation is optimized for minimal processing time
- Email queue can be implemented for high-volume scenarios

