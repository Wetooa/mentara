# Environment Variables Documentation

This document provides comprehensive documentation for all environment variables used in the Mentara API backend service.

## Table of Contents

- [Required Environment Variables](#required-environment-variables)
- [Optional Environment Variables](#optional-environment-variables)
- [Development Environment Setup](#development-environment-setup)
- [Production Environment Setup](#production-environment-setup)
- [Security Considerations](#security-considerations)
- [Validation](#validation)

## Required Environment Variables

These environment variables are **mandatory** and the application will not start without them.

### Database Configuration

#### `DATABASE_URL`
- **Type**: String (PostgreSQL connection string)
- **Format**: `postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]`
- **Example**: `postgresql://username:password@localhost:5432/mentara_db`
- **Description**: PostgreSQL database connection string for Prisma ORM
- **Validation**: Must start with `postgresql://`

### Authentication & Security

#### `JWT_SECRET`
- **Type**: String
- **Minimum Length**: 32 characters
- **Example**: `your-super-secret-jwt-key-at-least-32-chars-long`
- **Description**: Secret key for JWT token signing and verification
- **Security**: Use a cryptographically strong random string

### OAuth Configuration

#### `GOOGLE_CLIENT_ID`
- **Type**: String
- **Minimum Length**: 20 characters
- **Example**: `123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`
- **Description**: Google OAuth 2.0 client ID for authentication
- **Source**: Google Cloud Console

#### `GOOGLE_CLIENT_SECRET`
- **Type**: String
- **Minimum Length**: 20 characters
- **Example**: `GOCSPX-abcdefghijklmnopqrstuvwxyz`
- **Description**: Google OAuth 2.0 client secret
- **Security**: Keep this secret and never expose in client-side code

#### `MICROSOFT_CLIENT_ID`
- **Type**: String
- **Minimum Length**: 20 characters
- **Example**: `12345678-1234-1234-1234-123456789012`
- **Description**: Microsoft Azure AD application (client) ID
- **Source**: Azure Portal

#### `MICROSOFT_CLIENT_SECRET`
- **Type**: String
- **Minimum Length**: 20 characters
- **Example**: `abcdefghijklmnopqrstuvwxyz123456789012345`
- **Description**: Microsoft Azure AD client secret
- **Security**: Keep this secret and rotate regularly

### External Services

#### `SUPABASE_URL`
- **Type**: String (HTTPS URL)
- **Format**: Must start with `https://`
- **Example**: `https://abcdefghijklmnopqrst.supabase.co`
- **Description**: Supabase project URL for file storage
- **Source**: Supabase Dashboard

#### `SUPABASE_API_KEY`
- **Type**: String
- **Minimum Length**: 20 characters
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Description**: Supabase anon/service role API key
- **Security**: Use anon key for client-side, service key for server-side

#### `NODE_ENV`
- **Type**: Enum
- **Valid Values**: `development`, `production`, `test`
- **Example**: `production`
- **Description**: Application environment mode
- **Default**: `development`

## Optional Environment Variables

These environment variables enhance functionality but are not required for basic operation.

### Server Configuration

#### `PORT`
- **Type**: Number
- **Default**: `5000`
- **Example**: `3000`
- **Description**: Port number for the HTTP server
- **Validation**: Must be a valid port number (1-65535)

#### `FRONTEND_URL`
- **Type**: String (URL)
- **Example**: `https://mentara.app,https://app.mentara.com`
- **Description**: Frontend application URL(s) for CORS configuration
- **Notes**: Comma-separated list for multiple URLs in production

### External Service URLs

#### `AI_SERVICE_URL`
- **Type**: String (URL)
- **Default**: `http://localhost:5000`
- **Example**: `https://ai-service.mentara.app`
- **Description**: URL for the AI patient evaluation service
- **Notes**: Recommended for production deployments

### JWT Configuration

#### `JWT_EXPIRES_IN`
- **Type**: String (Time duration)
- **Default**: `1h`
- **Example**: `24h`, `7d`, `30m`
- **Description**: JWT access token expiration time
- **Format**: Numbers followed by time unit (s, m, h, d)

#### `JWT_REFRESH_EXPIRES_IN`
- **Type**: String (Time duration)
- **Default**: `7d`
- **Example**: `30d`, `90d`
- **Description**: JWT refresh token expiration time
- **Format**: Numbers followed by time unit (s, m, h, d)

### OAuth Callback URLs

#### `GOOGLE_CALLBACK_URL`
- **Type**: String (URL)
- **Example**: `https://api.mentara.app/auth/google/callback`
- **Description**: Google OAuth callback URL
- **Notes**: Must match URL configured in Google Cloud Console

#### `MICROSOFT_CALLBACK_URL`
- **Type**: String (URL)
- **Example**: `https://api.mentara.app/auth/microsoft/callback`
- **Description**: Microsoft OAuth callback URL
- **Notes**: Must match URL configured in Azure Portal

### Payment Processing

#### `STRIPE_SECRET_KEY`
- **Type**: String
- **Example**: `sk_test_...` (test) or `sk_live_...` (production)
- **Description**: Stripe secret key for payment processing
- **Security**: Keep this secret, never expose in client-side code
- **Notes**: Use test keys in development, live keys in production

#### `STRIPE_WEBHOOK_SECRET`
- **Type**: String
- **Example**: `whsec_...`
- **Description**: Stripe webhook endpoint secret for signature verification
- **Source**: Stripe Dashboard webhook configuration
- **Security**: Required for webhook security validation

### Database & Cache

#### `REDIS_URL`
- **Type**: String (Redis connection string)
- **Example**: `redis://localhost:6379` or `rediss://user:pass@host:port`
- **Description**: Redis connection string for caching and sessions
- **Notes**: Optional but recommended for production scaling

### File Storage (AWS S3)

#### `S3_BUCKET_NAME`
- **Type**: String
- **Example**: `mentara-prod-files`
- **Description**: AWS S3 bucket name for file storage
- **Notes**: Alternative to Supabase storage

#### `AWS_ACCESS_KEY_ID`
- **Type**: String
- **Example**: `AKIAIOSFODNN7EXAMPLE`
- **Description**: AWS access key ID for S3 operations
- **Security**: Use IAM roles in production when possible

#### `AWS_SECRET_ACCESS_KEY`
- **Type**: String
- **Example**: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`
- **Description**: AWS secret access key for S3 operations
- **Security**: Keep this secret, rotate regularly

#### `AWS_REGION`
- **Type**: String
- **Example**: `us-east-1`, `eu-west-1`
- **Description**: AWS region for S3 bucket and other services
- **Default**: `us-east-1`

### Email Configuration

#### `SMTP_HOST`
- **Type**: String
- **Example**: `smtp.gmail.com`, `smtp.sendgrid.net`
- **Description**: SMTP server hostname for email sending
- **Notes**: Required for email notifications

#### `SMTP_PORT`
- **Type**: Number
- **Default**: `587`
- **Example**: `465`, `587`, `25`
- **Description**: SMTP server port number
- **Notes**: 587 for TLS, 465 for SSL, 25 for unencrypted (not recommended)

#### `SMTP_USER`
- **Type**: String
- **Example**: `noreply@mentara.app`
- **Description**: SMTP authentication username (usually email address)

#### `SMTP_PASS`
- **Type**: String
- **Example**: `your-email-password-or-app-specific-password`
- **Description**: SMTP authentication password
- **Security**: Use app-specific passwords for Gmail and similar services

### AI Services

#### `SAMBANOVA_API_KEY`
- **Type**: String
- **Minimum Length**: 20 characters
- **Example**: `7cd0...e3ad`
- **Description**: SambaNova Cloud API key for AI-powered chatbot functionality
- **Source**: SambaNova Cloud Dashboard
- **Notes**: Required for pre-assessment chatbot feature

#### `SAMBANOVA_BASE_URL`
- **Type**: String (HTTPS URL)
- **Default**: `https://api.sambanova.ai/v1`
- **Example**: `https://api.sambanova.ai/v1`
- **Description**: SambaNova API base URL
- **Notes**: Usually the default value is correct

#### `SAMBANOVA_MODEL`
- **Type**: String
- **Default**: `Meta-Llama-3.1-8B-Instruct`
- **Example**: `Meta-Llama-3.1-8B-Instruct`, `Meta-Llama-3.1-70B-Instruct`, `Meta-Llama-3.2-1B-Instruct`
- **Description**: SambaNova model to use for chat completions
- **Recommended Models**:
  - `Meta-Llama-3.1-8B-Instruct` - Balanced performance (default)
  - `Meta-Llama-3.1-70B-Instruct` - Higher quality, slower
  - `Meta-Llama-3.2-1B-Instruct` - Faster, lower cost
  - `Meta-Llama-3.2-3B-Instruct` - Good balance
- **Notes**: Model availability depends on your API key access level. Avoid using Arabic-specific models like ALLaM for English conversations.

## Development Environment Setup

### Minimal Development Setup

For local development, you need at minimum:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/mentara_dev

# JWT
JWT_SECRET=your-dev-jwt-secret-at-least-32-characters-long

# Environment
NODE_ENV=development

# OAuth (use test credentials)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# Supabase (use test project)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your-supabase-anon-key
```

### Full Development Setup

```bash
# Add optional variables for full functionality
PORT=3001
FRONTEND_URL=http://localhost:3000
AI_SERVICE_URL=http://localhost:5000
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Stripe test keys
STRIPE_SECRET_KEY=sk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret

# Email (optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-dev-email@gmail.com
SMTP_PASS=your-app-specific-password
```

## Production Environment Setup

### Security Requirements

1. **Use strong, unique values** for all secrets
2. **Enable HTTPS** for all external URLs
3. **Use environment-specific OAuth apps** (separate from development)
4. **Enable proper logging and monitoring**
5. **Use managed services** where possible (Redis, database)

### Production Checklist

- [ ] `NODE_ENV=production`
- [ ] Strong `JWT_SECRET` (32+ characters, cryptographically random)
- [ ] Production OAuth credentials (Google, Microsoft)
- [ ] Production Supabase project
- [ ] Production Stripe live keys
- [ ] Proper `FRONTEND_URL` configuration
- [ ] SMTP configuration for email sending
- [ ] SSL/TLS certificates for HTTPS
- [ ] Database connection pooling enabled
- [ ] Redis for caching (recommended)
- [ ] Monitoring and logging configured

### Production Example

```bash
NODE_ENV=production
PORT=80

# Database (use connection pooling)
DATABASE_URL=postgresql://user:pass@db-cluster:5432/mentara?connection_limit=20

# Strong security
JWT_SECRET=cryptographically-strong-random-secret-32-plus-characters
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d

# Production OAuth
GOOGLE_CLIENT_ID=prod-google-client-id
GOOGLE_CLIENT_SECRET=prod-google-client-secret
MICROSOFT_CLIENT_ID=prod-microsoft-client-id
MICROSOFT_CLIENT_SECRET=prod-microsoft-client-secret

# Production services
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_API_KEY=prod-supabase-service-key
AI_SERVICE_URL=https://ai.mentara.app

# Frontend
FRONTEND_URL=https://mentara.app,https://app.mentara.com

# Payments
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret

# Caching
REDIS_URL=rediss://user:pass@redis-cluster:6380

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# AWS (if using)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=secret...
AWS_REGION=us-east-1
S3_BUCKET_NAME=mentara-prod-files
```

## Security Considerations

### Secrets Management

1. **Never commit secrets** to version control
2. **Use environment-specific secrets** (dev/staging/prod)
3. **Rotate secrets regularly**, especially in production
4. **Use secret management tools** (AWS Secrets Manager, HashiCorp Vault, etc.)
5. **Limit secret access** to necessary personnel only

### OAuth Security

1. **Use separate OAuth apps** for each environment
2. **Configure proper redirect URLs** in OAuth providers
3. **Enable additional security features** (2FA, app restrictions)
4. **Monitor OAuth usage** for suspicious activity

### Database Security

1. **Use strong database passwords**
2. **Enable SSL connections** to database
3. **Limit database user permissions** to minimum required
4. **Enable database connection pooling**
5. **Monitor database access logs**

### API Security

1. **Use HTTPS only** in production
2. **Configure proper CORS** settings
3. **Enable rate limiting**
4. **Monitor API usage** for abuse
5. **Use Web Application Firewall (WAF)** if available

## Validation

The application performs automatic validation of environment variables on startup:

### Validation Rules

1. **Required variables** must be present and non-empty
2. **URL variables** must use proper protocols (https:// for production)
3. **Minimum lengths** are enforced for security-critical values
4. **Format validation** for specific types (emails, URLs, connection strings)
5. **Development warnings** for missing optional production variables

### Validation Errors

If validation fails, the application will:
1. **Log specific error messages** for each invalid variable
2. **Exit with error code 1** to prevent startup
3. **Provide guidance** on fixing the issues

### Testing Configuration

Use the test environment for running automated tests:

```bash
NODE_ENV=test
DATABASE_URL=postgresql://postgres:password@localhost:5432/mentara_test
JWT_SECRET=test-jwt-secret-for-automated-testing-only
# ... other test-specific values
```

## Troubleshooting

### Common Issues

1. **Application won't start**: Check required environment variables are set
2. **OAuth login fails**: Verify client IDs/secrets and callback URLs
3. **Database connection fails**: Check DATABASE_URL format and connectivity
4. **File uploads fail**: Verify Supabase configuration and permissions
5. **Emails not sending**: Check SMTP configuration and credentials

### Debug Mode

Set `LOG_LEVEL=debug` for verbose logging during troubleshooting.

### Health Checks

The application provides health check endpoints to verify configuration:
- `/api/health` - Basic health check
- `/api/health/detailed` - Detailed service status including external dependencies

For more information about specific services and their configuration, refer to the individual service documentation in the codebase.

