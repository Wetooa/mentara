# Mentara API (NestJS) - Makefile
# Backend build automation and development workflow

# Variables
NODE_ENV ?= development
PORT ?= 3000
DB_NAME ?= mentara_db
BUILD_DIR := dist

# Colors
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

.PHONY: help install dev build start test lint clean docker-build docker-run

help: ## Show this help message
	@echo "$(GREEN)Mentara API - Backend Commands$(NC)"
	@echo "==============================="
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(YELLOW)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Dependencies
install: ## Install dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	@npm ci
	@echo "$(GREEN)Dependencies installed$(NC)"

install-dev: ## Install dependencies including dev dependencies
	@echo "$(GREEN)Installing all dependencies...$(NC)"
	@npm install
	@echo "$(GREEN)All dependencies installed$(NC)"

# Development
dev: ## Start development server
	@echo "$(GREEN)Starting development server...$(NC)"
	@npm run start:dev

dev-debug: ## Start development server with debugging
	@echo "$(GREEN)Starting development server with debugging...$(NC)"
	@npm run start:debug

# Building
build: ## Build for production
	@echo "$(GREEN)Building for production...$(NC)"
	@npm run build
	@echo "$(GREEN)Build completed$(NC)"

start: ## Start production server
	@echo "$(GREEN)Starting production server...$(NC)"
	@npm run start:prod

# Testing
test: ## Run unit tests
	@echo "$(GREEN)Running unit tests...$(NC)"
	@npm run test

test-watch: ## Run tests in watch mode
	@echo "$(GREEN)Running tests in watch mode...$(NC)"
	@npm run test:watch

test-coverage: ## Run tests with coverage
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	@npm run test:cov

test-e2e: ## Run end-to-end tests
	@echo "$(GREEN)Running e2e tests...$(NC)"
	@npm run test:e2e

test-debug: ## Run tests with debugging
	@echo "$(GREEN)Running tests with debugging...$(NC)"
	@npm run test:debug

test-integration: ## Run integration tests
	@echo "$(GREEN)Running integration tests...$(NC)"
	@npm run test:integration

test-performance: ## Run performance tests
	@echo "$(GREEN)Running performance tests...$(NC)"
	@npm run test:performance

# Code Quality
lint: ## Run ESLint
	@echo "$(GREEN)Running ESLint...$(NC)"
	@npm run lint

lint-fix: ## Fix ESLint issues
	@echo "$(GREEN)Fixing ESLint issues...$(NC)"
	@npm run lint:fix

format: ## Format code with Prettier
	@echo "$(GREEN)Formatting code...$(NC)"
	@npm run format

type-check: ## Run TypeScript type checking
	@echo "$(GREEN)Running type check...$(NC)"
	@npx tsc --noEmit

# Database Operations
db-generate: ## Generate Prisma client
	@echo "$(GREEN)Generating Prisma client...$(NC)"
	@npm run db:generate

db-migrate: ## Run database migrations
	@echo "$(GREEN)Running database migrations...$(NC)"
	@npm run db:migrate

db-migrate-dev: ## Create and apply new migration
	@echo "$(GREEN)Creating and applying new migration...$(NC)"
	@npm run db:migrate:dev

db-reset: ## Reset database
	@echo "$(GREEN)Resetting database...$(NC)"
	@npm run db:reset

db-seed: ## Seed database with initial data
	@echo "$(GREEN)Seeding database...$(NC)"
	@npm run db:seed

db-studio: ## Open Prisma Studio
	@echo "$(GREEN)Opening Prisma Studio...$(NC)"
	@npx prisma studio

db-deploy: ## Deploy migrations to production
	@echo "$(GREEN)Deploying migrations to production...$(NC)"
	@npm run db:deploy

db-backup: ## Backup database
	@echo "$(GREEN)Creating database backup...$(NC)"
	@pg_dump $(DB_NAME) > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)Database backup created$(NC)"

# Security & Auditing
audit: ## Run security audit
	@echo "$(GREEN)Running security audit...$(NC)"
	@npm audit --audit-level moderate

audit-fix: ## Fix security vulnerabilities
	@echo "$(GREEN)Fixing security vulnerabilities...$(NC)"
	@npm audit fix

security-scan: ## Run comprehensive security scan
	@echo "$(GREEN)Running security scan...$(NC)"
	@npm run security:scan

# Docker
docker-build: ## Build Docker image
	@echo "$(GREEN)Building Docker image...$(NC)"
	@docker build -t mentara-api:latest .

docker-run: ## Run Docker container
	@echo "$(GREEN)Running Docker container...$(NC)"
	@docker run -p $(PORT):3000 -e NODE_ENV=production mentara-api:latest

docker-dev: ## Run development Docker container
	@echo "$(GREEN)Running development Docker container...$(NC)"
	@docker run -p $(PORT):3000 -v $(PWD):/app -e NODE_ENV=development mentara-api:latest npm run start:dev

# Maintenance
clean: ## Clean build artifacts
	@echo "$(GREEN)Cleaning build artifacts...$(NC)"
	@rm -rf $(BUILD_DIR)
	@rm -rf node_modules/.cache
	@echo "$(GREEN)Cleanup completed$(NC)"

clean-all: ## Clean everything including node_modules
	@echo "$(GREEN)Cleaning everything...$(NC)"
	@rm -rf $(BUILD_DIR)
	@rm -rf node_modules
	@echo "$(GREEN)Complete cleanup finished$(NC)"

reset: ## Reset environment (clean + install)
	@echo "$(GREEN)Resetting environment...$(NC)"
	@$(MAKE) clean-all
	@$(MAKE) install
	@$(MAKE) db-generate
	@echo "$(GREEN)Environment reset completed$(NC)"

# Development Tools
docs: ## Generate API documentation
	@echo "$(GREEN)Generating API documentation...$(NC)"
	@npm run docs

docs-serve: ## Serve API documentation
	@echo "$(GREEN)Serving API documentation...$(NC)"
	@npm run docs:serve

# Monitoring & Health
health-check: ## Check API health
	@echo "$(GREEN)Checking API health...$(NC)"
	@curl -f http://localhost:$(PORT)/health || echo "$(RED)API not responding$(NC)"

metrics: ## Show API metrics
	@echo "$(GREEN)Fetching API metrics...$(NC)"
	@curl -s http://localhost:$(PORT)/metrics

logs: ## Show application logs
	@echo "$(GREEN)Showing application logs...$(NC)"
	@tail -f logs/application.log

# Load Testing
load-test: ## Run load tests
	@echo "$(GREEN)Running load tests...$(NC)"
	@npm run load:test

stress-test: ## Run stress tests
	@echo "$(GREEN)Running stress tests...$(NC)"
	@npm run stress:test

# Deployment
pre-deploy: ## Prepare for deployment
	@echo "$(GREEN)Preparing for deployment...$(NC)"
	@$(MAKE) lint
	@$(MAKE) type-check
	@$(MAKE) test
	@$(MAKE) test-e2e
	@$(MAKE) build
	@$(MAKE) security-scan
	@echo "$(GREEN)Deployment preparation completed$(NC)"

deploy-staging: ## Deploy to staging
	@echo "$(GREEN)Deploying to staging...$(NC)"
	@$(MAKE) pre-deploy
	@$(MAKE) db-migrate
	@echo "$(GREEN)Staging deployment completed$(NC)"

deploy-prod: ## Deploy to production
	@echo "$(GREEN)Deploying to production...$(NC)"
	@$(MAKE) pre-deploy
	@$(MAKE) db-deploy
	@echo "$(GREEN)Production deployment completed$(NC)"

# Environment Setup
setup-env: ## Setup environment variables
	@echo "$(GREEN)Setting up environment...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(YELLOW)Please edit .env with your configuration$(NC)"; \
	else \
		echo "$(YELLOW)Environment file already exists$(NC)"; \
	fi

setup-dev: ## Setup development environment
	@echo "$(GREEN)Setting up development environment...$(NC)"
	@$(MAKE) setup-env
	@$(MAKE) install
	@$(MAKE) db-generate
	@$(MAKE) db-migrate
	@$(MAKE) db-seed
	@echo "$(GREEN)Development environment ready$(NC)"

# Testing Utilities
test-auth: ## Test authentication endpoints
	@echo "$(GREEN)Testing authentication endpoints...$(NC)"
	@npm run test:auth

test-endpoints: ## Validate all API endpoints
	@echo "$(GREEN)Validating API endpoints...$(NC)"
	@npm run test:endpoints

# Production Utilities
start-pm2: ## Start with PM2
	@echo "$(GREEN)Starting with PM2...$(NC)"
	@pm2 start ecosystem.config.js

stop-pm2: ## Stop PM2 processes
	@echo "$(GREEN)Stopping PM2 processes...$(NC)"
	@pm2 stop all

restart-pm2: ## Restart PM2 processes
	@echo "$(GREEN)Restarting PM2 processes...$(NC)"
	@pm2 restart all

# Quick Commands
quick-start: setup-dev dev ## Quick start for new setup

info: ## Show project information
	@echo "$(GREEN)Project Information$(NC)"
	@echo "=================="
	@echo "Project: Mentara API"
	@echo "Framework: NestJS"
	@echo "Node Version: $$(node --version)"
	@echo "NPM Version: $$(npm --version)"
	@echo "Port: $(PORT)"
	@echo "Environment: $(NODE_ENV)"
	@echo "Database: $(DB_NAME)"

# Admin utilities
create-admin: ## Create admin user
	@echo "$(GREEN)Creating admin user...$(NC)"
	@npm run admin:create

assign-therapist: ## Assign therapist to users
	@echo "$(GREEN)Assigning therapists...$(NC)"
	@npm run admin:assign-therapist

# Performance monitoring
perf-monitor: ## Start performance monitoring
	@echo "$(GREEN)Starting performance monitoring...$(NC)"
	@npm run perf:monitor

analyze-performance: ## Analyze performance metrics
	@echo "$(GREEN)Analyzing performance...$(NC)"
	@npm run perf:analyze