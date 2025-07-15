# Mentara Platform - Main Makefile
# Production-ready build automation and development workflow

# Variables
COMPOSE_FILE := docker-compose.yml
COMPOSE_DEV_FILE := docker-compose.dev.yml
ENV_FILE := .env
PROJECT_NAME := mentara
SERVICES := frontend api ai-service ai-content-moderation ollama postgres redis nginx prometheus grafana

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

.PHONY: help build up down logs clean test install dev prod status health setup-env

# Default target
help: ## Show this help message
	@echo "$(GREEN)Mentara Platform - Build & Deployment Commands$(NC)"
	@echo "=================================================="
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(YELLOW)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Environment Setup
setup-env: ## Create environment configuration files
	@echo "$(GREEN)Setting up environment configuration...$(NC)"
	@if [ ! -f $(ENV_FILE) ]; then \
		cp .env.example $(ENV_FILE); \
		echo "$(YELLOW)Please edit $(ENV_FILE) with your configuration$(NC)"; \
	else \
		echo "$(YELLOW)Environment file already exists$(NC)"; \
	fi
	@echo "$(GREEN)Environment setup complete$(NC)"

install: ## Install dependencies for all services
	@echo "$(GREEN)Installing dependencies for all services...$(NC)"
	@$(MAKE) -C mentara-client install
	@$(MAKE) -C mentara-api install
	@$(MAKE) -C ai-patient-evaluation install
	@$(MAKE) -C ai-content-moderation install
	@echo "$(GREEN)All dependencies installed$(NC)"

# Development Commands
dev: ## Start development environment
	@echo "$(GREEN)Starting development environment...$(NC)"
	@if [ -f $(COMPOSE_DEV_FILE) ]; then \
		docker-compose -f $(COMPOSE_DEV_FILE) up -d; \
	else \
		$(MAKE) up; \
	fi
	@echo "$(GREEN)Development environment started$(NC)"
	@$(MAKE) status

dev-logs: ## Show development logs
	@docker-compose -f $(COMPOSE_DEV_FILE) logs -f

dev-down: ## Stop development environment
	@echo "$(GREEN)Stopping development environment...$(NC)"
	@if [ -f $(COMPOSE_DEV_FILE) ]; then \
		docker-compose -f $(COMPOSE_DEV_FILE) down; \
	else \
		$(MAKE) down; \
	fi

# Production Commands
build: ## Build all Docker images
	@echo "$(GREEN)Building all Docker images...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) build --parallel
	@echo "$(GREEN)All images built successfully$(NC)"

up: ## Start all services in production mode
	@echo "$(GREEN)Starting Mentara platform...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)Platform started successfully$(NC)"
	@$(MAKE) status

down: ## Stop all services
	@echo "$(GREEN)Stopping Mentara platform...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)Platform stopped$(NC)"

restart: ## Restart all services
	@echo "$(GREEN)Restarting Mentara platform...$(NC)"
	@$(MAKE) down
	@$(MAKE) up

# Service Management
up-%: ## Start specific service (e.g., make up-api)
	@echo "$(GREEN)Starting $* service...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) up -d $*

down-%: ## Stop specific service (e.g., make down-api)
	@echo "$(GREEN)Stopping $* service...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) stop $*

restart-%: ## Restart specific service (e.g., make restart-api)
	@echo "$(GREEN)Restarting $* service...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) restart $*

logs-%: ## Show logs for specific service (e.g., make logs-api)
	@docker-compose -f $(COMPOSE_FILE) logs -f $*

# Monitoring & Status
status: ## Show status of all services
	@echo "$(GREEN)Mentara Platform Status$(NC)"
	@echo "======================"
	@docker-compose -f $(COMPOSE_FILE) ps
	@echo ""
	@echo "$(GREEN)Service Health Status:$(NC)"
	@$(MAKE) health

health: ## Check health of all services
	@echo "$(YELLOW)Checking service health...$(NC)"
	@for service in frontend api ai-service ai-content-moderation; do \
		echo -n "$$service: "; \
		if curl -s http://localhost:$$(docker-compose -f $(COMPOSE_FILE) port $$service | cut -d: -f2)/health > /dev/null 2>&1; then \
			echo "$(GREEN)✓ Healthy$(NC)"; \
		else \
			echo "$(RED)✗ Unhealthy$(NC)"; \
		fi; \
	done

logs: ## Show logs for all services
	@docker-compose -f $(COMPOSE_FILE) logs -f

# Testing
test: ## Run tests for all services
	@echo "$(GREEN)Running tests for all services...$(NC)"
	@$(MAKE) -C mentara-client test
	@$(MAKE) -C mentara-api test
	@$(MAKE) -C ai-patient-evaluation test
	@$(MAKE) -C ai-content-moderation test
	@echo "$(GREEN)All tests completed$(NC)"

test-integration: ## Run integration tests
	@echo "$(GREEN)Running integration tests...$(NC)"
	@$(MAKE) -C mentara-api test-integration
	@python ai-content-moderation/test_service.py
	@echo "$(GREEN)Integration tests completed$(NC)"

test-e2e: ## Run end-to-end tests
	@echo "$(GREEN)Running end-to-end tests...$(NC)"
	@$(MAKE) -C mentara-client test-e2e
	@echo "$(GREEN)E2E tests completed$(NC)"

# Database Operations
db-migrate: ## Run database migrations
	@echo "$(GREEN)Running database migrations...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec api npm run db:migrate
	@echo "$(GREEN)Migrations completed$(NC)"

db-seed: ## Seed database with initial data
	@echo "$(GREEN)Seeding database...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec api npm run db:seed
	@echo "$(GREEN)Database seeded$(NC)"

db-reset: ## Reset database and reseed
	@echo "$(YELLOW)Resetting database...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec api npm run db:reset
	@echo "$(GREEN)Database reset completed$(NC)"

db-backup: ## Backup database
	@echo "$(GREEN)Creating database backup...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec postgres pg_dump -U mentara_admin mentara_db > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)Database backup created$(NC)"

# AI Services Management
ai-setup: ## Setup AI services (download models, etc.)
	@echo "$(GREEN)Setting up AI services...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec ollama ollama pull mxbai-embed-large
	@echo "$(GREEN)AI services setup completed$(NC)"

ai-models: ## List available AI models
	@echo "$(GREEN)Available AI models:$(NC)"
	@docker-compose -f $(COMPOSE_FILE) exec ollama ollama list

# Security & Maintenance
security-scan: ## Run security scans on images
	@echo "$(GREEN)Running security scans...$(NC)"
	@for service in $(SERVICES); do \
		if docker images | grep -q mentara-$$service; then \
			echo "Scanning $$service..."; \
			docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
				aquasec/trivy image mentara-$$service:latest; \
		fi; \
	done

clean: ## Clean up Docker resources
	@echo "$(GREEN)Cleaning up Docker resources...$(NC)"
	@docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans
	@docker system prune -f
	@docker volume prune -f
	@echo "$(GREEN)Cleanup completed$(NC)"

clean-all: ## Clean everything including images
	@echo "$(RED)WARNING: This will remove all images and data!$(NC)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	@docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans --rmi all
	@docker system prune -af
	@docker volume prune -af
	@echo "$(GREEN)Complete cleanup finished$(NC)"

# Deployment
deploy-staging: ## Deploy to staging environment
	@echo "$(GREEN)Deploying to staging...$(NC)"
	@$(MAKE) build
	@$(MAKE) up
	@$(MAKE) ai-setup
	@$(MAKE) db-migrate
	@$(MAKE) health
	@echo "$(GREEN)Staging deployment completed$(NC)"

deploy-prod: ## Deploy to production environment
	@echo "$(GREEN)Deploying to production...$(NC)"
	@$(MAKE) test
	@$(MAKE) security-scan
	@$(MAKE) build
	@$(MAKE) up
	@$(MAKE) ai-setup
	@$(MAKE) db-migrate
	@$(MAKE) health
	@echo "$(GREEN)Production deployment completed$(NC)"

# Monitoring
monitor: ## Open monitoring dashboard
	@echo "$(GREEN)Opening monitoring dashboard...$(NC)"
	@echo "Grafana: http://localhost:3030"
	@echo "Prometheus: http://localhost:9090"
	@echo "Kibana: http://localhost:5601"

# Development Utilities
shell-%: ## Open shell in specific service container (e.g., make shell-api)
	@docker-compose -f $(COMPOSE_FILE) exec $* /bin/sh

exec-%: ## Execute command in specific service (e.g., make exec-api-"npm install")
	@docker-compose -f $(COMPOSE_FILE) exec $* $(filter-out $@,$(MAKECMDGOALS))

# Quick shortcuts
quick-start: setup-env build up ai-setup db-migrate ## Quick start for new installations
	@echo "$(GREEN)🚀 Mentara platform is ready!$(NC)"
	@echo "Frontend: http://localhost:3000"
	@echo "API: http://localhost:3001"
	@echo "AI Services: http://localhost:5000, http://localhost:5001"
	@echo "Monitoring: http://localhost:3030"

update: ## Update all services and restart
	@echo "$(GREEN)Updating all services...$(NC)"
	@git pull
	@$(MAKE) build
	@$(MAKE) restart
	@$(MAKE) ai-setup
	@$(MAKE) db-migrate
	@echo "$(GREEN)Update completed$(NC)"

# Performance testing
perf-test: ## Run performance tests
	@echo "$(GREEN)Running performance tests...$(NC)"
	@$(MAKE) -C mentara-api test-performance
	@python ai-content-moderation/test_service.py
	@echo "$(GREEN)Performance tests completed$(NC)"

# Prevent make from treating filter arguments as targets
%:
	@:

# Make sure these targets are always executed
.PHONY: $(SERVICES)