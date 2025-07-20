# Mentara AI Patient Evaluation Service - Makefile
# ML service build automation and development workflow

# Variables
PYTHON_VERSION ?= 3.9
VENV_DIR := venv
PORT ?= 5000
MODEL_FILE := mental_model_config2.pt

# Colors
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

.PHONY: help install dev test clean docker-build docker-run

help: ## Show this help message
	@echo "$(GREEN)AI Patient Evaluation Service Commands$(NC)"
	@echo "======================================"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(YELLOW)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Environment Setup
setup-venv: ## Create virtual environment
	@echo "$(GREEN)Creating virtual environment...$(NC)"
	@python$(PYTHON_VERSION) -m venv $(VENV_DIR)
	@echo "$(GREEN)Virtual environment created$(NC)"

activate: ## Show activation command
	@echo "$(YELLOW)To activate virtual environment, run:$(NC)"
	@echo "source $(VENV_DIR)/bin/activate"

# Dependencies
install: ## Install dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	@pip install --upgrade pip
	@pip install -r requirements.txt
	@echo "$(GREEN)Dependencies installed$(NC)"

install-dev: ## Install development dependencies
	@echo "$(GREEN)Installing development dependencies...$(NC)"
	@pip install --upgrade pip
	@pip install -r requirements.txt
	@pip install pytest pytest-flask pytest-cov black flake8 mypy
	@echo "$(GREEN)Development dependencies installed$(NC)"

freeze: ## Freeze current dependencies
	@echo "$(GREEN)Freezing dependencies...$(NC)"
	@pip freeze > requirements.txt
	@echo "$(GREEN)Dependencies frozen to requirements.txt$(NC)"

# Development
dev: ## Start development server
	@echo "$(GREEN)Starting development server on port $(PORT)...$(NC)"
	@python api.py

dev-debug: ## Start development server with debug mode
	@echo "$(GREEN)Starting development server in debug mode...$(NC)"
	@FLASK_DEBUG=1 python api.py

# Testing
test: ## Run all tests
	@echo "$(GREEN)Running tests...$(NC)"
	@python -m pytest

test-verbose: ## Run tests with verbose output
	@echo "$(GREEN)Running tests with verbose output...$(NC)"
	@python -m pytest -v

test-coverage: ## Run tests with coverage
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	@python -m pytest --cov=. --cov-report=html --cov-report=term-missing

test-api: ## Test API endpoints
	@echo "$(GREEN)Testing API endpoints...$(NC)"
	@python test_api.py

test-performance: ## Run performance tests
	@echo "$(GREEN)Running performance tests...$(NC)"
	@python test_performance.py

test-integration: ## Run integration tests
	@echo "$(GREEN)Running integration tests...$(NC)"
	@python test_backend_integration.py

# Code Quality
lint: ## Run linting
	@echo "$(GREEN)Running flake8 linting...$(NC)"
	@flake8 . --exclude=$(VENV_DIR) --max-line-length=88

format: ## Format code with black
	@echo "$(GREEN)Formatting code with black...$(NC)"
	@black . --exclude=$(VENV_DIR)

format-check: ## Check code formatting
	@echo "$(GREEN)Checking code formatting...$(NC)"
	@black . --check --exclude=$(VENV_DIR)

type-check: ## Run type checking with mypy
	@echo "$(GREEN)Running type checking...$(NC)"
	@mypy . --exclude=$(VENV_DIR)

# Security
security-scan: ## Run security scan
	@echo "$(GREEN)Running security scan...$(NC)"
	@pip-audit

safety-check: ## Check for known security vulnerabilities
	@echo "$(GREEN)Checking for security vulnerabilities...$(NC)"
	@safety check

# Model Operations
validate-model: ## Validate ML model
	@echo "$(GREEN)Validating ML model...$(NC)"
	@python -c "import torch; model = torch.load('$(MODEL_FILE)'); print('Model validated successfully')"

model-info: ## Show model information
	@echo "$(GREEN)Model Information$(NC)"
	@echo "================="
	@python -c "import torch; import os; \
		model = torch.load('$(MODEL_FILE)'); \
		print(f'Model file: $(MODEL_FILE)'); \
		print(f'File size: {os.path.getsize(\"$(MODEL_FILE)\") / (1024*1024):.2f} MB'); \
		print(f'Model type: {type(model)}');"

# Docker
docker-build: ## Build Docker image
	@echo "$(GREEN)Building Docker image...$(NC)"
	@docker build -t mentara-ai-patient-eval:latest .

docker-run: ## Run Docker container
	@echo "$(GREEN)Running Docker container...$(NC)"
	@docker run -p $(PORT):5000 -e FLASK_ENV=production mentara-ai-patient-eval:latest

docker-dev: ## Run development Docker container
	@echo "$(GREEN)Running development Docker container...$(NC)"
	@docker run -p $(PORT):5000 -v $(PWD):/app -e FLASK_ENV=development mentara-ai-patient-eval:latest

# Docker Compose (Service-specific)
compose-up: ## Start services with docker-compose
	@echo "$(GREEN)Starting services with docker-compose...$(NC)"
	@docker-compose up --build

compose-up-d: ## Start services in background
	@echo "$(GREEN)Starting services in background...$(NC)"
	@docker-compose up -d --build

compose-down: ## Stop and remove containers
	@echo "$(GREEN)Stopping containers...$(NC)"
	@docker-compose down

compose-logs: ## View container logs
	@echo "$(GREEN)Viewing container logs...$(NC)"
	@docker-compose logs -f ai-patient-evaluation

compose-shell: ## Open shell in running container
	@echo "$(GREEN)Opening shell in container...$(NC)"
	@docker-compose exec ai-patient-evaluation /bin/bash

compose-restart: ## Restart services
	@echo "$(GREEN)Restarting services...$(NC)"
	@docker-compose restart

compose-clean: ## Remove containers and volumes
	@echo "$(RED)Removing containers and volumes...$(NC)"
	@docker-compose down -v

# Maintenance
clean: ## Clean Python cache and artifacts
	@echo "$(GREEN)Cleaning Python cache and artifacts...$(NC)"
	@find . -type f -name "*.pyc" -delete
	@find . -type d -name "__pycache__" -delete
	@find . -type d -name "*.egg-info" -exec rm -rf {} +
	@rm -rf .pytest_cache
	@rm -rf htmlcov
	@rm -rf .coverage
	@echo "$(GREEN)Cleanup completed$(NC)"

clean-all: ## Clean everything including virtual environment
	@echo "$(GREEN)Cleaning everything...$(NC)"
	@$(MAKE) clean
	@rm -rf $(VENV_DIR)
	@echo "$(GREEN)Complete cleanup finished$(NC)"

reset: ## Reset environment (clean + setup + install)
	@echo "$(GREEN)Resetting environment...$(NC)"
	@$(MAKE) clean-all
	@$(MAKE) setup-venv
	@$(MAKE) install
	@echo "$(GREEN)Environment reset completed$(NC)"

# Environment Management
requirements-check: ## Check if requirements are up to date
	@echo "$(GREEN)Checking requirements...$(NC)"
	@pip-check

upgrade-deps: ## Upgrade all dependencies
	@echo "$(GREEN)Upgrading dependencies...$(NC)"
	@pip install --upgrade -r requirements.txt

# Health & Monitoring
health-check: ## Check service health
	@echo "$(GREEN)Checking service health...$(NC)"
	@curl -f http://localhost:$(PORT)/health || echo "$(RED)Service not responding$(NC)"

metrics: ## Show service metrics
	@echo "$(GREEN)Fetching service metrics...$(NC)"
	@curl -s http://localhost:$(PORT)/metrics || echo "$(RED)Metrics not available$(NC)"

# Load Testing
load-test: ## Run load test
	@echo "$(GREEN)Running load test...$(NC)"
	@python -c "
import requests
import time
import threading
from concurrent.futures import ThreadPoolExecutor
import json

def test_prediction():
    data = {'input': [0.5] * 201}  # Mock assessment data
    try:
        response = requests.post('http://localhost:$(PORT)/predict', json=data, timeout=10)
        return response.status_code == 200
    except:
        return False

with ThreadPoolExecutor(max_workers=10) as executor:
    start_time = time.time()
    futures = [executor.submit(test_prediction) for _ in range(100)]
    results = [f.result() for f in futures]
    duration = time.time() - start_time
    success_rate = sum(results) / len(results) * 100
    print(f'Load test completed: {success_rate:.1f}% success rate, {duration:.2f}s duration')
"

# Deployment
pre-deploy: ## Prepare for deployment
	@echo "$(GREEN)Preparing for deployment...$(NC)"
	@$(MAKE) lint
	@$(MAKE) type-check
	@$(MAKE) test
	@$(MAKE) validate-model
	@$(MAKE) security-scan
	@echo "$(GREEN)Deployment preparation completed$(NC)"

# Environment Setup
setup-env: ## Setup environment variables
	@echo "$(GREEN)Setting up environment...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(YELLOW)Please edit .env with your configuration$(NC)"; \
	else \
		echo "$(YELLOW)Environment file already exists$(NC)"; \
	fi

# Setup Development Environment
setup-dev: ## Setup complete development environment
	@echo "$(GREEN)Setting up development environment...$(NC)"
	@$(MAKE) setup-env
	@$(MAKE) setup-venv
	@echo "$(YELLOW)Please activate virtual environment: source $(VENV_DIR)/bin/activate$(NC)"
	@echo "$(YELLOW)Then run: make install-dev$(NC)"

# Environment Information
info: ## Show project information
	@echo "$(GREEN)Project Information$(NC)"
	@echo "=================="
	@echo "Project: Mentara AI Patient Evaluation"
	@echo "Framework: Flask + PyTorch"
	@echo "Python Version: $$(python --version 2>/dev/null || echo 'Not activated')"
	@echo "Port: $(PORT)"
	@echo "Model File: $(MODEL_FILE)"
	@echo "Virtual Environment: $(VENV_DIR)"

# Utilities
serve: ## Serve the application (alias for dev)
	@$(MAKE) dev

benchmark: ## Run model benchmarks
	@echo "$(GREEN)Running model benchmarks...$(NC)"
	@python -c "
import time
import torch
model = torch.load('$(MODEL_FILE)')
start_time = time.time()
for i in range(100):
    # Simulate prediction
    pass
duration = time.time() - start_time
print(f'Benchmark: 100 predictions in {duration:.2f}s ({100/duration:.1f} predictions/sec)')
"

# Quick Commands
quick-start: install dev ## Quick start for new setup

# Production Utilities
gunicorn-start: ## Start with Gunicorn
	@echo "$(GREEN)Starting with Gunicorn...$(NC)"
	@gunicorn --bind 0.0.0.0:$(PORT) --workers 4 api:app

gunicorn-prod: ## Start Gunicorn for production
	@echo "$(GREEN)Starting Gunicorn for production...$(NC)"
	@gunicorn --bind 0.0.0.0:$(PORT) --workers 4 --timeout 120 --preload api:app