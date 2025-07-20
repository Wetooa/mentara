# Mentara Platform - Root Makefile
# Orchestrates all microservices for the mental health platform

# Variables
PROJECT_NAME := mentara
SERVICES := mentara-api mentara-client ai-patient-evaluation

# Colors
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
BLUE := \033[0;34m
NC := \033[0m

.PHONY: help install dev build start stop clean test lint status

help: ## Show this help message
	@echo "$(GREEN)Mentara Platform - Service Orchestration$(NC)"
	@echo "========================================"
	@echo ""
	@echo "$(BLUE)Available Services:$(NC)"
	@echo "  • mentara-api          - NestJS backend service"
	@echo "  • mentara-client       - Next.js frontend service"
	@echo "  • ai-patient-evaluation - Python ML service for assessments"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(YELLOW)%-25s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# =============================================================================
# Development Commands
# =============================================================================

install: ## Install dependencies for all services
	@echo "$(GREEN)Installing dependencies for all services...$(NC)"
	@$(MAKE) -C mentara-api install
	@$(MAKE) -C mentara-client install
	@$(MAKE) -C ai-patient-evaluation install
	@echo "$(GREEN)All dependencies installed$(NC)"

dev: ## Start all services in development mode
	@echo "$(GREEN)Starting all services in development mode...$(NC)"
	@echo "$(YELLOW)This will start services in parallel. Use Ctrl+C to stop all.$(NC)"
	@trap 'echo "$(RED)Stopping all services...$(NC)"; $(MAKE) stop; exit 0' INT; \
	$(MAKE) -C mentara-api compose-up-d & \
	$(MAKE) -C mentara-client compose-up-d & \
	$(MAKE) -C ai-patient-evaluation compose-up-d & \
	echo "$(GREEN)All services starting...$(NC)"; \
	echo "$(YELLOW)Waiting for services to be ready...$(NC)"; \
	sleep 30; \
	$(MAKE) status; \
	wait

dev-local: ## Start all services locally (no Docker)
	@echo "$(GREEN)Starting all services locally...$(NC)"
	@echo "$(YELLOW)Make sure dependencies are installed first$(NC)"
	@trap 'echo "$(RED)Stopping all services...$(NC)"; exit 0' INT; \
	cd mentara-api && npm run start:dev & \
	cd mentara-client && npm run dev & \
	cd ai-patient-evaluation && python api.py & \
	echo "$(GREEN)All services started$(NC)"; \
	wait

# =============================================================================
# Docker Compose Orchestration
# =============================================================================

build: ## Build all Docker images
	@echo "$(GREEN)Building all Docker images...$(NC)"
	@$(MAKE) -C mentara-api docker-build
	@$(MAKE) -C mentara-client docker-build
	@$(MAKE) -C ai-patient-evaluation docker-build
	@echo "$(GREEN)All images built$(NC)"

start: ## Start all services with Docker Compose
	@echo "$(GREEN)Starting all services with Docker Compose...$(NC)"
	@$(MAKE) -C mentara-api compose-up-d
	@$(MAKE) -C mentara-client compose-up-d
	@$(MAKE) -C ai-patient-evaluation compose-up-d
	@echo "$(GREEN)All services started in background$(NC)"
	@echo "$(YELLOW)Use 'make status' to check service health$(NC)"

stop: ## Stop all services
	@echo "$(GREEN)Stopping all services...$(NC)"
	@$(MAKE) -C mentara-api compose-down 2>/dev/null || true
	@$(MAKE) -C mentara-client compose-down 2>/dev/null || true
	@$(MAKE) -C ai-patient-evaluation compose-down 2>/dev/null || true
	@echo "$(GREEN)All services stopped$(NC)"

restart: ## Restart all services
	@echo "$(GREEN)Restarting all services...$(NC)"
	@$(MAKE) stop
	@sleep 5
	@$(MAKE) start
	@echo "$(GREEN)All services restarted$(NC)"

# =============================================================================
# Service Management
# =============================================================================

status: ## Check status of all services
	@echo "$(GREEN)Checking service status...$(NC)"
	@echo ""
	@echo "$(BLUE)Backend API (mentara-api):$(NC)"
	@curl -s http://localhost:3001/health 2>/dev/null | grep -q "healthy" && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(RED)✗ Not responding$(NC)"
	@echo ""
	@echo "$(BLUE)Frontend (mentara-client):$(NC)"
	@curl -s http://localhost:3000/api/health 2>/dev/null && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(RED)✗ Not responding$(NC)"
	@echo ""
	@echo "$(BLUE)AI Patient Evaluation:$(NC)"
	@curl -s http://localhost:5000/health 2>/dev/null | grep -q "healthy" && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(RED)✗ Not responding$(NC)"
	@echo ""
	@echo "$(BLUE)AI Content Moderation:$(NC)"
	@curl -s http://localhost:5001/health 2>/dev/null | grep -q "healthy" && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(RED)✗ Not responding$(NC)"
	@echo ""

logs: ## View logs from all services
	@echo "$(GREEN)Viewing logs from all services...$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to stop following logs$(NC)"
	@docker-compose -f mentara-api/docker-compose.yml logs -f mentara-api & \
	docker-compose -f mentara-client/docker-compose.yml logs -f mentara-client & \
	docker-compose -f ai-patient-evaluation/docker-compose.yml logs -f ai-patient-evaluation & \
	wait

logs-api: ## View logs from backend API
	@$(MAKE) -C mentara-api compose-logs

logs-client: ## View logs from frontend
	@$(MAKE) -C mentara-client compose-logs

logs-ai-eval: ## View logs from AI patient evaluation
	@$(MAKE) -C ai-patient-evaluation compose-logs


# =============================================================================
# Testing & Quality
# =============================================================================

test: ## Run tests for all services
	@echo "$(GREEN)Running tests for all services...$(NC)"
	@$(MAKE) -C mentara-api test || echo "$(RED)API tests failed$(NC)"
	@$(MAKE) -C mentara-client test || echo "$(RED)Client tests failed$(NC)"
	@$(MAKE) -C ai-patient-evaluation test || echo "$(RED)AI evaluation tests failed$(NC)"
	@echo "$(GREEN)All tests completed$(NC)"

test-e2e: ## Run end-to-end tests
	@echo "$(GREEN)Running end-to-end tests...$(NC)"
	@$(MAKE) -C mentara-api test-e2e || echo "$(RED)API e2e tests failed$(NC)"
	@$(MAKE) -C mentara-client test-e2e || echo "$(RED)Client e2e tests failed$(NC)"
	@echo "$(GREEN)E2E tests completed$(NC)"

lint: ## Run linting for all services
	@echo "$(GREEN)Running linting for all services...$(NC)"
	@$(MAKE) -C mentara-api lint || echo "$(RED)API linting failed$(NC)"
	@$(MAKE) -C mentara-client lint || echo "$(RED)Client linting failed$(NC)"
	@$(MAKE) -C ai-patient-evaluation lint || echo "$(RED)AI evaluation linting failed$(NC)"
	@echo "$(GREEN)All linting completed$(NC)"

format: ## Format code for all services
	@echo "$(GREEN)Formatting code for all services...$(NC)"
	@$(MAKE) -C mentara-api format || echo "$(RED)API formatting failed$(NC)"
	@$(MAKE) -C mentara-client format || echo "$(RED)Client formatting failed$(NC)"
	@$(MAKE) -C ai-patient-evaluation format || echo "$(RED)AI evaluation formatting failed$(NC)"
	@echo "$(GREEN)All formatting completed$(NC)"

# =============================================================================
# Environment Setup
# =============================================================================

setup-env: ## Setup environment files for all services
	@echo "$(GREEN)Setting up environment files for all services...$(NC)"
	@$(MAKE) -C mentara-api setup-env
	@$(MAKE) -C mentara-client setup-env
	@$(MAKE) -C ai-patient-evaluation setup-env
	@echo "$(GREEN)Environment setup completed$(NC)"
	@echo "$(YELLOW)Please edit .env files in each service directory$(NC)"

setup-dev: ## Complete development environment setup
	@echo "$(GREEN)Setting up complete development environment...$(NC)"
	@$(MAKE) setup-env
	@$(MAKE) install
	@echo "$(GREEN)Development environment ready$(NC)"
	@echo "$(YELLOW)You can now run 'make dev' to start all services$(NC)"

# =============================================================================
# Database Operations
# =============================================================================

db-setup: ## Setup and migrate databases
	@echo "$(GREEN)Setting up databases...$(NC)"
	@$(MAKE) -C mentara-api db-migrate
	@$(MAKE) -C mentara-api db-generate
	@$(MAKE) -C mentara-api db-seed
	@echo "$(GREEN)Database setup completed$(NC)"

db-reset: ## Reset all databases
	@echo "$(GREEN)Resetting databases...$(NC)"
	@$(MAKE) -C mentara-api db-reset
	@echo "$(GREEN)Database reset completed$(NC)"

# =============================================================================
# Cleanup
# =============================================================================

clean: ## Clean build artifacts for all services
	@echo "$(GREEN)Cleaning build artifacts...$(NC)"
	@$(MAKE) -C mentara-api clean
	@$(MAKE) -C mentara-client clean
	@$(MAKE) -C ai-patient-evaluation clean
	@echo "$(GREEN)Cleanup completed$(NC)"

clean-docker: ## Remove all Docker containers and volumes
	@echo "$(RED)Removing all Docker containers and volumes...$(NC)"
	@$(MAKE) -C mentara-api compose-clean
	@$(MAKE) -C mentara-client compose-clean
	@$(MAKE) -C ai-patient-evaluation compose-clean
	@echo "$(GREEN)Docker cleanup completed$(NC)"

# =============================================================================
# Production Deployment
# =============================================================================

deploy-prep: ## Prepare for deployment
	@echo "$(GREEN)Preparing for deployment...$(NC)"
	@$(MAKE) lint
	@$(MAKE) test
	@$(MAKE) build
	@echo "$(GREEN)Deployment preparation completed$(NC)"

deploy-staging: ## Deploy to staging environment
	@echo "$(GREEN)Deploying to staging...$(NC)"
	@$(MAKE) deploy-prep
	@$(MAKE) start
	@$(MAKE) status
	@echo "$(GREEN)Staging deployment completed$(NC)"

# =============================================================================
# Information & Monitoring
# =============================================================================

info: ## Show project information
	@echo "$(GREEN)Mentara Platform Information$(NC)"
	@echo "============================"
	@echo "Project: $(PROJECT_NAME)"
	@echo "Services: $(SERVICES)"
	@echo ""
	@echo "$(BLUE)Service Endpoints:$(NC)"
	@echo "  • Frontend:           http://localhost:3000"
	@echo "  • Backend API:        http://localhost:3001"
	@echo "  • AI Patient Eval:    http://localhost:5000"
	@echo "  • AI Content Mod:     http://localhost:5001"
	@echo ""
	@echo "$(BLUE)Health Check Endpoints:$(NC)"
	@echo "  • Backend API:        http://localhost:3001/health"
	@echo "  • AI Patient Eval:    http://localhost:5000/health"
	@echo "  • AI Content Mod:     http://localhost:5001/health"
	@echo ""

health: ## Comprehensive health check
	@echo "$(GREEN)Running comprehensive health check...$(NC)"
	@$(MAKE) status
	@echo ""
	@echo "$(BLUE)Docker Status:$(NC)"
	@docker ps --filter "name=mentara" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "$(RED)Docker not available$(NC)"

quick-start: setup-dev start status ## Quick start for new setup

# =============================================================================
# Utility Commands
# =============================================================================

ports: ## Check if required ports are available
	@echo "$(GREEN)Checking port availability...$(NC)"
	@for port in 3000 3001 5000 5001 6379 11434; do \
		if lsof -Pi :$$port -sTCP:LISTEN -t >/dev/null 2>&1; then \
			echo "$(RED)✗ Port $$port is in use$(NC)"; \
		else \
			echo "$(GREEN)✓ Port $$port is available$(NC)"; \
		fi; \
	done

update: ## Update all dependencies
	@echo "$(GREEN)Updating dependencies for all services...$(NC)"
	@$(MAKE) -C mentara-api install
	@$(MAKE) -C mentara-client install
	@$(MAKE) -C ai-patient-evaluation install
	@echo "$(GREEN)All dependencies updated$(NC)"

# =============================================================================
# Development Shortcuts
# =============================================================================

api: ## Start only the backend API
	@$(MAKE) -C mentara-api compose-up

client: ## Start only the frontend
	@$(MAKE) -C mentara-client compose-up

ai-eval: ## Start only AI patient evaluation service
	@$(MAKE) -C ai-patient-evaluation compose-up


# =============================================================================
# Help Text
# =============================================================================

usage: ## Show detailed usage information
	@echo "$(GREEN)Mentara Platform - Detailed Usage$(NC)"
	@echo "=================================="
	@echo ""
	@echo "$(BLUE)Quick Start:$(NC)"
	@echo "  1. make setup-dev    # Setup environment and install dependencies"
	@echo "  2. make start        # Start all services"
	@echo "  3. make status       # Check service health"
	@echo ""
	@echo "$(BLUE)Development Workflow:$(NC)"
	@echo "  • make dev           # Start in development mode"
	@echo "  • make logs          # View all service logs"
	@echo "  • make test          # Run all tests"
	@echo "  • make lint          # Check code quality"
	@echo ""
	@echo "$(BLUE)Individual Services:$(NC)"
	@echo "  • make api           # Start only backend API"
	@echo "  • make client        # Start only frontend"
	@echo "  • make ai-eval       # Start only AI evaluation"
	@echo ""
	@echo "$(BLUE)Cleanup:$(NC)"
	@echo "  • make stop          # Stop all services"
	@echo "  • make clean         # Clean build artifacts"
	@echo "  • make clean-docker  # Remove Docker containers/volumes"
	@echo ""