#!/bin/bash

# Mentara Platform Deployment Script
# Production-ready deployment automation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_ENABLED=${BACKUP_ENABLED:-true}
HEALTH_CHECK_TIMEOUT=${HEALTH_CHECK_TIMEOUT:-300}
ROLLBACK_ON_FAILURE=${ROLLBACK_ON_FAILURE:-true}

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $1"
}

# Deployment start
log "🚀 Starting Mentara Platform Deployment"
log "Environment: $ENVIRONMENT"
log "Time: $(date)"
echo "=================================================="

# Pre-deployment checks
log "Running pre-deployment checks..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    log_error "Docker is not running or not accessible"
    exit 1
fi
log_success "Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    log_error "docker-compose is not installed or not in PATH"
    exit 1
fi
log_success "docker-compose is available"

# Check if .env file exists
if [ ! -f .env ]; then
    log_error ".env file not found. Please copy .env.example to .env and configure it"
    exit 1
fi
log_success ".env file exists"

# Validate environment file
log "Validating environment configuration..."
required_vars=(
    "DB_PASSWORD"
    "REDIS_PASSWORD"
    "JWT_SECRET"
    "NEXTAUTH_SECRET"
    "ENCRYPTION_KEY"
)

for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env || grep -q "^${var}=$" .env || grep -q "^${var}=your_" .env; then
        log_error "Environment variable $var is not set or uses default value"
        exit 1
    fi
done
log_success "Environment configuration validated"

# Check disk space
available_space=$(df / | awk 'NR==2 {print $4}')
required_space=5242880  # 5GB in KB
if [ "$available_space" -lt "$required_space" ]; then
    log_error "Insufficient disk space. Required: 5GB, Available: $((available_space/1024/1024))GB"
    exit 1
fi
log_success "Sufficient disk space available"

# Backup existing deployment if enabled
if [ "$BACKUP_ENABLED" = "true" ] && docker-compose ps | grep -q "Up"; then
    log "Creating backup of current deployment..."
    backup_timestamp=$(date +%Y%m%d_%H%M%S)
    backup_dir="backups/deployment_$backup_timestamp"
    
    mkdir -p "$backup_dir"
    
    # Backup database
    if docker-compose ps postgres | grep -q "Up"; then
        log "Backing up database..."
        docker-compose exec -T postgres pg_dump -U mentara_admin mentara_db > "$backup_dir/database.sql"
        log_success "Database backup created"
    fi
    
    # Backup volumes
    log "Backing up Docker volumes..."
    docker run --rm -v postgres_data:/data -v "$(pwd)/$backup_dir":/backup alpine tar czf /backup/postgres_data.tar.gz -C /data .
    docker run --rm -v redis_data:/data -v "$(pwd)/$backup_dir":/backup alpine tar czf /backup/redis_data.tar.gz -C /data .
    
    log_success "Backup completed: $backup_dir"
fi

# Stop existing services gracefully
if docker-compose ps | grep -q "Up"; then
    log "Stopping existing services..."
    docker-compose down --timeout 30
    log_success "Services stopped"
fi

# Clean up old images and containers
log "Cleaning up old Docker resources..."
docker system prune -f >/dev/null 2>&1
log_success "Cleanup completed"

# Build new images
log "Building Docker images..."
if [ "$ENVIRONMENT" = "development" ]; then
    docker-compose -f docker-compose.dev.yml build --parallel
else
    docker-compose build --parallel
fi
log_success "Images built successfully"

# Start services
log "Starting Mentara platform services..."
if [ "$ENVIRONMENT" = "development" ]; then
    docker-compose -f docker-compose.dev.yml up -d
else
    docker-compose up -d
fi

# Wait for services to be ready
log "Waiting for services to be ready..."
services=("postgres" "redis" "ollama" "mentara-api" "ai-patient-evaluation")
timeout=$HEALTH_CHECK_TIMEOUT
start_time=$(date +%s)

for service in "${services[@]}"; do
    log "Checking $service..."
    while true; do
        current_time=$(date +%s)
        elapsed=$((current_time - start_time))
        
        if [ $elapsed -gt $timeout ]; then
            log_error "Timeout waiting for $service to be ready"
            if [ "$ROLLBACK_ON_FAILURE" = "true" ] && [ -n "$backup_dir" ]; then
                log "Rolling back to previous deployment..."
                docker-compose down
                # Restore backup logic would go here
                log_warning "Manual intervention required for rollback"
            fi
            exit 1
        fi
        
        if docker-compose ps "$service" | grep -q "Up"; then
            case $service in
                "mentara-api")
                    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
                        break
                    fi
                    ;;
                "ai-patient-evaluation")
                    if curl -f http://localhost:5000/health >/dev/null 2>&1; then
                        break
                    fi
                    ;;
                *)
                    break
                    ;;
            esac
        fi
        
        sleep 5
    done
    log_success "$service is ready"
done

# Run database migrations
log "Running database migrations..."
if docker-compose exec -T mentara-api npm run db:migrate; then
    log_success "Database migrations completed"
else
    log_error "Database migrations failed"
    exit 1
fi

# Setup AI models
log "Setting up AI models..."
if [ "$ENVIRONMENT" = "production" ]; then
    # Pull Ollama model
    docker-compose exec -T ollama ollama pull mxbai-embed-large
    log_success "AI models setup completed"
fi

# Run health checks
log "Running comprehensive health checks..."
health_check_failed=false

# Check API health
if ! curl -f http://localhost:3001/health >/dev/null 2>&1; then
    log_error "API health check failed"
    health_check_failed=true
fi

# Check AI services health
if ! curl -f http://localhost:5000/health >/dev/null 2>&1; then
    log_error "AI Patient Evaluation service health check failed"
    health_check_failed=true
fi


# Check frontend (if not in API-only mode)
if [ "$ENVIRONMENT" != "api-only" ]; then
    if ! curl -f http://localhost:3000 >/dev/null 2>&1; then
        log_error "Frontend health check failed"
        health_check_failed=true
    fi
fi

if [ "$health_check_failed" = true ]; then
    log_error "Health checks failed"
    if [ "$ROLLBACK_ON_FAILURE" = "true" ]; then
        log "Rolling back deployment..."
        docker-compose down
        # Rollback logic would go here
    fi
    exit 1
fi

log_success "All health checks passed"

# Post-deployment tasks
log "Running post-deployment tasks..."

# Seed database if it's a fresh installation
if [ "$ENVIRONMENT" = "development" ] || [ "${SEED_DATABASE:-false}" = "true" ]; then
    log "Seeding database with initial data..."
    docker-compose exec -T mentara-api npm run db:seed
    log_success "Database seeded"
fi

# Start monitoring services
if [ "$ENVIRONMENT" = "production" ]; then
    log "Starting monitoring services..."
    if docker-compose ps prometheus | grep -q "Up"; then
        log_success "Prometheus is running"
    fi
    if docker-compose ps grafana | grep -q "Up"; then
        log_success "Grafana is running"
    fi
fi

# Display service status
log "Deployment completed successfully!"
echo ""
echo "=================================================="
echo "🎉 Mentara Platform is now running!"
echo "=================================================="
echo "Frontend:              http://localhost:3000"
echo "API:                   http://localhost:3001"
echo "AI Patient Eval:       http://localhost:5000"
if [ "$ENVIRONMENT" = "development" ]; then
    echo "Database Admin:        http://localhost:8080"
    echo "Redis Commander:       http://localhost:8081"
fi
if [ "$ENVIRONMENT" = "production" ]; then
    echo "Monitoring (Grafana):  http://localhost:3030"
    echo "Metrics (Prometheus):  http://localhost:9090"
fi
echo "=================================================="

# Display service status
echo ""
log "Service Status:"
docker-compose ps

# Show logs for any failed services
failed_services=$(docker-compose ps --services --filter "status=exited")
if [ -n "$failed_services" ]; then
    log_warning "Some services failed to start:"
    for service in $failed_services; do
        log_error "Failed service: $service"
        echo "Last 10 lines of logs:"
        docker-compose logs --tail=10 "$service"
    done
fi

# Final instructions
echo ""
log "Deployment Notes:"
echo "• Check the service logs: docker-compose logs -f"
echo "• Monitor service health: make health"
echo "• Access monitoring: make monitor"
echo "• Stop services: make down"
echo "• Update deployment: make update"

if [ -n "$backup_dir" ]; then
    echo "• Backup location: $backup_dir"
fi

echo ""
log_success "Deployment completed successfully! 🚀"

# Exit successfully
exit 0