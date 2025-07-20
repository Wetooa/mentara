# Mentara Production Deployment Guide
**Complete deployment infrastructure supporting Backend Agent's Phase 1 completion**

## 🎯 Overview

This guide provides comprehensive instructions for deploying the Mentara mental health platform to production, with enterprise-grade infrastructure specifically designed to support Backend Agent's systematic controller audit and testing requirements.

## 🏗️ Infrastructure Architecture

### Production Stack
```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer (Nginx)                  │
├─────────────────────────────────────────────────────────────┤
│  🎯 API Gateway    │  📊 Monitoring     │  🔒 Security       │
│  - Rate Limiting   │  - Prometheus      │  - SSL/TLS         │
│  - Health Checks   │  - Grafana         │  - WAF             │
│  - Load Balancing  │  - Alerts          │  - CORS            │
├──────────────────────┬──────────────────────┬─────────────────┤
│   🚀 NestJS API      │  📈 Performance      │  📋 Logging     │
│   - Container Pool   │  - Real-time         │  - ELK Stack    │
│   - Auto Scaling     │  - Dashboards        │  - Centralized  │
│   - Health Checks    │  - Alerting          │  - Structured   │
├──────────────────────┼──────────────────────┼─────────────────┤
│  🗄️ PostgreSQL      │  ⚡ Redis Cache      │  📊 Metrics     │
│  - Primary/Replica   │  - Session Store     │  - Business     │
│  - Backup Strategy   │  - Pub/Sub           │  - Technical    │
│  - Connection Pool   │  - Rate Limiting     │  - Security     │
└──────────────────────┴──────────────────────┴─────────────────┘
```

## 🚀 Deployment Methods

### Method 1: Docker Compose (Recommended for Development/Staging)

#### Prerequisites
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Environment Setup
```bash
# Create production environment file
cp .env.example .env.production

# Configure required environment variables
vim .env.production
```

**Required Environment Variables:**
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@postgres:5432/mentara_prod
DIRECT_URL=postgresql://username:password@postgres:5432/mentara_prod
POSTGRES_DB=mentara_prod
POSTGRES_USER=mentara_user
POSTGRES_PASSWORD=secure_password_here

# Authentication (Clerk)
CLERK_SECRET_KEY=sk_live_your_secret_key
CLERK_PUBLISHABLE_KEY=pk_live_your_publishable_key

# Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@mentara.com

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=mentara-prod-files

# File Storage (Supabase - Alternative)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Redis Configuration
REDIS_URL=redis://:redis_password@redis:6379
REDIS_PASSWORD=secure_redis_password

# Monitoring
GRAFANA_ADMIN_PASSWORD=secure_grafana_password

# Security
JWT_SECRET=your_jwt_secret_256_bit_key
API_KEY=your_secure_api_key
```

#### Deployment Commands
```bash
# 1. Build and start all services
docker-compose -f docker-compose.production.yml up -d

# 2. Run database migrations
docker-compose -f docker-compose.production.yml exec api npm run db:migrate

# 3. Seed initial data
docker-compose -f docker-compose.production.yml exec api npm run db:seed

# 4. Verify deployment
docker-compose -f docker-compose.production.yml ps
```

### Method 2: Kubernetes (Recommended for Production)

#### Prerequisites
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://get.helm.sh/helm-v3.12.0-linux-amd64.tar.gz | tar xz
sudo mv linux-amd64/helm /usr/local/bin/helm
```

#### Kubernetes Deployment
```bash
# 1. Create namespace
kubectl create namespace mentara-prod

# 2. Create secrets
kubectl create secret generic mentara-secrets \
  --from-env-file=.env.production \
  --namespace=mentara-prod

# 3. Deploy using Helm
helm install mentara ./k8s/helm-chart \
  --namespace mentara-prod \
  --values k8s/values.production.yaml

# 4. Verify deployment
kubectl get pods -n mentara-prod
kubectl get services -n mentara-prod
```

### Method 3: CI/CD Pipeline (GitHub Actions)

The included GitHub Actions workflow (`backend-production-deployment.yml`) provides automated deployment:

#### Pipeline Stages
1. **Quality Assurance**
   - Code linting and type checking
   - Unit and integration tests
   - Test coverage analysis

2. **Security & Performance**
   - Security vulnerability scanning
   - Performance testing
   - OWASP dependency checks

3. **Build & Container**
   - Docker image building
   - Multi-architecture support
   - Container registry push

4. **Staging Deployment**
   - Automated staging deployment
   - Smoke tests
   - Performance benchmarking

5. **Production Deployment**
   - Manual approval required
   - Blue-green deployment
   - Health checks and monitoring

#### Trigger Deployment
```bash
# Automatic deployment on master branch push
git push origin master

# Manual deployment via workflow dispatch
gh workflow run "Backend Production Deployment" \
  --ref master \
  -f environment=production
```

## 📊 Monitoring & Observability

### Monitoring Stack Access
```bash
# Grafana Dashboard
http://your-domain:3001
Username: admin
Password: [GRAFANA_ADMIN_PASSWORD]

# Prometheus Metrics
http://your-domain:9090

# Kibana Logs
http://your-domain:5601

# API Health Check
http://your-domain/health
```

### Key Metrics Dashboards
1. **API Performance Dashboard**
   - Response times (95th/99th percentile)
   - Request rates and throughput
   - Error rates by endpoint
   - Database query performance

2. **System Resources Dashboard**
   - CPU and memory utilization
   - Disk usage and I/O
   - Network traffic
   - Container health

3. **Business Metrics Dashboard**
   - User registrations
   - Session bookings
   - Message volume
   - File uploads

### Alert Configuration
Critical alerts are pre-configured for:
- API downtime (>1 minute)
- High error rates (>10%)
- Slow response times (>5 seconds)
- Database connection issues
- Memory/CPU exhaustion (>90%)

## 🔒 Security Hardening

### SSL/TLS Configuration
```bash
# Generate SSL certificates (Let's Encrypt)
sudo apt install certbot
sudo certbot certonly --standalone -d api.mentara.com

# Copy certificates to Nginx
sudo cp /etc/letsencrypt/live/api.mentara.com/fullchain.pem /path/to/nginx/ssl/
sudo cp /etc/letsencrypt/live/api.mentara.com/privkey.pem /path/to/nginx/ssl/
```

### Firewall Configuration
```bash
# Configure UFW firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable
```

### Security Headers
All security headers are pre-configured in Nginx:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security
- Content-Security-Policy

## 🗄️ Database Management

### Backup Strategy
```bash
# Automated daily backups
docker-compose -f docker-compose.production.yml exec postgres \
  pg_dump -U mentara_user mentara_prod > backup_$(date +%Y%m%d).sql

# Restore from backup
docker-compose -f docker-compose.production.yml exec -T postgres \
  psql -U mentara_user mentara_prod < backup_20240101.sql
```

### Migration Management
```bash
# Run migrations
docker-compose -f docker-compose.production.yml exec api npm run db:migrate

# Reset database (DANGER: Production use only with extreme caution)
docker-compose -f docker-compose.production.yml exec api npm run db:reset
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.production.yml logs api

# Check resource usage
docker stats

# Restart specific service
docker-compose -f docker-compose.production.yml restart api
```

#### 2. Database Connection Issues
```bash
# Test database connectivity
docker-compose -f docker-compose.production.yml exec api \
  npx prisma db pull

# Check database logs
docker-compose -f docker-compose.production.yml logs postgres
```

#### 3. High Memory Usage
```bash
# Monitor memory usage
docker-compose -f docker-compose.production.yml exec api \
  node -e "console.log(process.memoryUsage())"

# Restart API service
docker-compose -f docker-compose.production.yml restart api
```

#### 4. SSL Certificate Issues
```bash
# Renew Let's Encrypt certificates
sudo certbot renew

# Test SSL configuration
openssl s_client -connect api.mentara.com:443
```

### Performance Optimization

#### 1. Database Optimization
```sql
-- Run database performance analysis
EXPLAIN ANALYZE SELECT * FROM "User" WHERE email = 'user@example.com';

-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

#### 2. API Optimization
```bash
# Monitor API performance
curl -w "@curl-format.txt" -o /dev/null -s "http://api.mentara.com/health"

# Check for memory leaks
docker-compose -f docker-compose.production.yml exec api \
  node --expose-gc -e "
    setInterval(() => {
      global.gc();
      console.log(process.memoryUsage());
    }, 5000);
  "
```

## 📈 Scaling Strategies

### Horizontal Scaling
```bash
# Scale API containers
docker-compose -f docker-compose.production.yml up -d --scale api=3

# Configure load balancer for multiple instances
# (Update nginx.conf upstream configuration)
```

### Database Scaling
```bash
# Setup read replicas
# Configure PostgreSQL streaming replication
# Update connection strings for read-only queries
```

### Caching Strategy
```bash
# Monitor Redis performance
docker-compose -f docker-compose.production.yml exec redis redis-cli info memory

# Implement application-level caching
# Add Redis cache for frequently accessed data
```

## ✅ Post-Deployment Checklist

### Immediate Verification
- [ ] All containers are running and healthy
- [ ] Database migrations completed successfully
- [ ] API health check returns 200 OK
- [ ] SSL certificates are valid and properly configured
- [ ] Monitoring dashboards are accessible
- [ ] Log aggregation is working
- [ ] Backup system is operational

### Performance Validation
- [ ] API response times <500ms for 95th percentile
- [ ] Database query performance within thresholds
- [ ] Memory usage <80% under normal load
- [ ] CPU usage <70% under normal load
- [ ] No error spikes in monitoring

### Security Validation
- [ ] All security headers are present
- [ ] Authentication is working properly
- [ ] Rate limiting is functioning
- [ ] File upload security is enforced
- [ ] Database access is properly restricted

### Business Logic Validation
- [ ] User registration/login flow
- [ ] Therapist application process
- [ ] Booking system functionality
- [ ] Messaging system operation
- [ ] File upload/download
- [ ] Email notifications

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- **Daily**: Monitor system health and performance metrics
- **Weekly**: Review logs for errors and security issues
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Full system backup verification and disaster recovery testing

### Emergency Contacts
- **System Administrator**: [Contact Information]
- **Database Administrator**: [Contact Information]
- **Security Team**: [Contact Information]
- **Development Team**: Backend Agent (Primary)

### Documentation Updates
This deployment guide should be updated whenever:
- Infrastructure changes are made
- New monitoring tools are added
- Security configurations are modified
- Performance optimizations are implemented

---

**Last Updated**: [Current Date]  
**Version**: 1.0  
**Maintained by**: AI/DevOps Agent (Supporting Backend Agent Phase 1)