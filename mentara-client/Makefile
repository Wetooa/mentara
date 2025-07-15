# Mentara Client (Next.js) - Makefile
# Frontend build automation and development workflow

# Variables
NODE_ENV ?= development
PORT ?= 3000
BUILD_DIR := .next
DIST_DIR := dist

# Colors
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

.PHONY: help install dev build start test lint clean docker-build docker-run

help: ## Show this help message
	@echo "$(GREEN)Mentara Client - Frontend Commands$(NC)"
	@echo "=================================="
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(YELLOW)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

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
	@echo "$(GREEN)Starting development server on port $(PORT)...$(NC)"
	@npm run dev

dev-turbo: ## Start development server with turbopack
	@echo "$(GREEN)Starting development server with Turbopack...$(NC)"
	@npm run dev -- --turbo

# Building
build: ## Build for production
	@echo "$(GREEN)Building for production...$(NC)"
	@npm run build
	@echo "$(GREEN)Build completed$(NC)"

start: ## Start production server
	@echo "$(GREEN)Starting production server...$(NC)"
	@npm run start

# Testing
test: ## Run all tests
	@echo "$(GREEN)Running tests...$(NC)"
	@npm run test

test-watch: ## Run tests in watch mode
	@echo "$(GREEN)Running tests in watch mode...$(NC)"
	@npm run test:watch

test-coverage: ## Run tests with coverage
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	@npm run test:coverage

test-e2e: ## Run end-to-end tests
	@echo "$(GREEN)Running e2e tests...$(NC)"
	@npx playwright test

test-e2e-ui: ## Run e2e tests with UI
	@echo "$(GREEN)Running e2e tests with UI...$(NC)"
	@npx playwright test --ui

# Code Quality
lint: ## Run ESLint
	@echo "$(GREEN)Running ESLint...$(NC)"
	@npm run lint

lint-fix: ## Fix ESLint issues
	@echo "$(GREEN)Fixing ESLint issues...$(NC)"
	@npm run lint:fix

format: ## Format code with Prettier
	@echo "$(GREEN)Formatting code...$(NC)"
	@npx prettier --write .

type-check: ## Run TypeScript type checking
	@echo "$(GREEN)Running type check...$(NC)"
	@npx tsc --noEmit

# Analysis
analyze: ## Analyze bundle size
	@echo "$(GREEN)Analyzing bundle size...$(NC)"
	@npm run analyze

audit: ## Run security audit
	@echo "$(GREEN)Running security audit...$(NC)"
	@npm audit --audit-level moderate

audit-fix: ## Fix security vulnerabilities
	@echo "$(GREEN)Fixing security vulnerabilities...$(NC)"
	@npm audit fix

# Docker
docker-build: ## Build Docker image
	@echo "$(GREEN)Building Docker image...$(NC)"
	@docker build -t mentara-client:latest .

docker-run: ## Run Docker container
	@echo "$(GREEN)Running Docker container...$(NC)"
	@docker run -p $(PORT):3000 -e NODE_ENV=production mentara-client:latest

docker-dev: ## Run development Docker container
	@echo "$(GREEN)Running development Docker container...$(NC)"
	@docker run -p $(PORT):3000 -v $(PWD):/app -e NODE_ENV=development mentara-client:latest npm run dev

# Maintenance
clean: ## Clean build artifacts
	@echo "$(GREEN)Cleaning build artifacts...$(NC)"
	@rm -rf $(BUILD_DIR)
	@rm -rf $(DIST_DIR)
	@rm -rf node_modules/.cache
	@echo "$(GREEN)Cleanup completed$(NC)"

clean-all: ## Clean everything including node_modules
	@echo "$(GREEN)Cleaning everything...$(NC)"
	@rm -rf $(BUILD_DIR)
	@rm -rf $(DIST_DIR)
	@rm -rf node_modules
	@rm -rf .turbo
	@echo "$(GREEN)Complete cleanup finished$(NC)"

reset: ## Reset environment (clean + install)
	@echo "$(GREEN)Resetting environment...$(NC)"
	@$(MAKE) clean-all
	@$(MAKE) install
	@echo "$(GREEN)Environment reset completed$(NC)"

# Deployment preparation
pre-deploy: ## Prepare for deployment
	@echo "$(GREEN)Preparing for deployment...$(NC)"
	@$(MAKE) lint
	@$(MAKE) type-check
	@$(MAKE) test
	@$(MAKE) build
	@echo "$(GREEN)Deployment preparation completed$(NC)"

# Environment setup
setup-env: ## Setup environment variables
	@echo "$(GREEN)Setting up environment...$(NC)"
	@if [ ! -f .env.local ]; then \
		cp .env.example .env.local; \
		echo "$(YELLOW)Please edit .env.local with your configuration$(NC)"; \
	else \
		echo "$(YELLOW)Environment file already exists$(NC)"; \
	fi

# Performance
lighthouse: ## Run Lighthouse audit
	@echo "$(GREEN)Running Lighthouse audit...$(NC)"
	@npx lighthouse http://localhost:$(PORT) --output html --output-path lighthouse-report.html
	@echo "$(GREEN)Lighthouse report generated: lighthouse-report.html$(NC)"

# Database integration
db-generate: ## Generate Prisma client
	@echo "$(GREEN)Generating Prisma client...$(NC)"
	@npx prisma generate

# Development utilities
dev-tools: ## Install development tools
	@echo "$(GREEN)Installing development tools...$(NC)"
	@npm install -g @next/bundle-analyzer lighthouse

storybook: ## Start Storybook
	@echo "$(GREEN)Starting Storybook...$(NC)"
	@npm run storybook

build-storybook: ## Build Storybook
	@echo "$(GREEN)Building Storybook...$(NC)"
	@npm run build-storybook

# API integration testing
test-api: ## Test API integration
	@echo "$(GREEN)Testing API integration...$(NC)"
	@npm run test:api

# Production utilities
start-pm2: ## Start with PM2
	@echo "$(GREEN)Starting with PM2...$(NC)"
	@pm2 start npm --name "mentara-client" -- start

stop-pm2: ## Stop PM2 process
	@echo "$(GREEN)Stopping PM2 process...$(NC)"
	@pm2 stop mentara-client

restart-pm2: ## Restart PM2 process
	@echo "$(GREEN)Restarting PM2 process...$(NC)"
	@pm2 restart mentara-client

# Quick commands
quick-start: install build start ## Quick start for new setup

health-check: ## Check if application is running
	@echo "$(GREEN)Checking application health...$(NC)"
	@curl -f http://localhost:$(PORT)/api/health || echo "$(RED)Application not responding$(NC)"

info: ## Show project information
	@echo "$(GREEN)Project Information$(NC)"
	@echo "=================="
	@echo "Project: Mentara Client"
	@echo "Framework: Next.js"
	@echo "Node Version: $$(node --version)"
	@echo "NPM Version: $$(npm --version)"
	@echo "Port: $(PORT)"
	@echo "Environment: $(NODE_ENV)"