# Mentara AI Content Moderation Service - Makefile
# AI moderation service build automation and development workflow

# Variables
PYTHON_VERSION ?= 3.9
VENV_DIR := venv
PORT ?= 5001
OLLAMA_HOST ?= http://localhost:11434
EMBEDDING_MODEL := mxbai-embed-large

# Colors
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

.PHONY: help install dev test clean docker-build docker-run ollama-setup

help: ## Show this help message
	@echo "$(GREEN)AI Content Moderation Service Commands$(NC)"
	@echo "====================================="
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

# Ollama Setup
ollama-check: ## Check if Ollama is running
	@echo "$(GREEN)Checking Ollama status...$(NC)"
	@curl -s $(OLLAMA_HOST)/api/version > /dev/null && echo "$(GREEN)✓ Ollama is running$(NC)" || echo "$(RED)✗ Ollama is not running$(NC)"

ollama-models: ## List available Ollama models
	@echo "$(GREEN)Available Ollama models:$(NC)"
	@curl -s $(OLLAMA_HOST)/api/tags | python -m json.tool || echo "$(RED)Failed to fetch models$(NC)"

ollama-pull: ## Pull required embedding model
	@echo "$(GREEN)Pulling $(EMBEDDING_MODEL) model...$(NC)"
	@curl -X POST $(OLLAMA_HOST)/api/pull -d '{"name":"$(EMBEDDING_MODEL)"}' || echo "$(RED)Failed to pull model$(NC)"

ollama-setup: ## Complete Ollama setup
	@echo "$(GREEN)Setting up Ollama for content moderation...$(NC)"
	@$(MAKE) ollama-check
	@$(MAKE) ollama-pull
	@echo "$(GREEN)Ollama setup completed$(NC)"

# Development
dev: ## Start development server
	@echo "$(GREEN)Starting development server on port $(PORT)...$(NC)"
	@python api.py

dev-debug: ## Start development server with debug mode
	@echo "$(GREEN)Starting development server in debug mode...$(NC)"
	@FLASK_DEBUG=1 python api.py

dev-with-ollama: ## Start development server and check Ollama
	@echo "$(GREEN)Starting development with Ollama integration...$(NC)"
	@$(MAKE) ollama-check
	@$(MAKE) dev

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

test-service: ## Test service endpoints (requires running service)
	@echo "$(GREEN)Testing service endpoints...$(NC)"
	@python test_service.py

test-moderation: ## Test content moderation functionality
	@echo "$(GREEN)Testing content moderation...$(NC)"
	@python -c "
import requests
import json

test_cases = [
    {'content': 'Hello, this is a friendly message!', 'expected': 'safe'},
    {'content': 'I am feeling depressed and need help', 'expected': 'mental_health'},
    {'content': 'I want to hurt myself', 'expected': 'crisis'},
]

for case in test_cases:
    try:
        response = requests.post('http://localhost:$(PORT)/moderate/content', 
                               json=case, timeout=10)
        if response.status_code == 200:
            result = response.json()
            print(f'✓ {case[\"expected\"]}: {result.get(\"action_taken\", \"unknown\")}')
        else:
            print(f'✗ Failed: {response.status_code}')
    except Exception as e:
        print(f'✗ Error: {e}')
"

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

# Docker
docker-build: ## Build Docker image
	@echo "$(GREEN)Building Docker image...$(NC)"
	@docker build -t mentara-ai-content-mod:latest .

docker-run: ## Run Docker container
	@echo "$(GREEN)Running Docker container...$(NC)"
	@docker run -p $(PORT):5001 -e FLASK_ENV=production mentara-ai-content-mod:latest

docker-dev: ## Run development Docker container
	@echo "$(GREEN)Running development Docker container...$(NC)"
	@docker run -p $(PORT):5001 -v $(PWD):/app -e FLASK_ENV=development mentara-ai-content-mod:latest

# Setup & Installation
setup: ## Complete setup process
	@echo "$(GREEN)Running complete setup...$(NC)"
	@python setup.py
	@echo "$(GREEN)Setup completed$(NC)"

setup-dev: ## Setup development environment
	@echo "$(GREEN)Setting up development environment...$(NC)"
	@$(MAKE) setup-venv
	@echo "$(YELLOW)Please activate virtual environment: source $(VENV_DIR)/bin/activate$(NC)"
	@echo "$(YELLOW)Then run: make install-dev && make setup$(NC)"

# Model Management
models-info: ## Show model information
	@echo "$(GREEN)Model Information$(NC)"
	@echo "================="
	@echo "Embedding Model: $(EMBEDDING_MODEL)"
	@echo "Mental Health Classifier: models/mental_health_classifier/"
	@echo "Toxicity Classifier: models/toxicity_classifier/"
	@ls -la models/ 2>/dev/null || echo "Models directory not found"

models-download: ## Download required models
	@echo "$(GREEN)Downloading required models...$(NC)"
	@$(MAKE) ollama-pull
	@echo "$(GREEN)Models download completed$(NC)"

# Health & Monitoring
health-check: ## Check service health
	@echo "$(GREEN)Checking service health...$(NC)"
	@curl -f http://localhost:$(PORT)/health || echo "$(RED)Service not responding$(NC)"

service-info: ## Show service information
	@echo "$(GREEN)Service Information:$(NC)"
	@curl -s http://localhost:$(PORT)/ | python -m json.tool || echo "$(RED)Service not available$(NC)"

metrics: ## Show service metrics
	@echo "$(GREEN)Fetching service metrics...$(NC)"
	@curl -s http://localhost:$(PORT)/metrics || echo "$(RED)Metrics not available$(NC)"

# Performance Testing
perf-test: ## Run performance test
	@echo "$(GREEN)Running performance test...$(NC)"
	@python -c "
import requests
import time
import threading
from concurrent.futures import ThreadPoolExecutor
import json

def test_moderation():
    data = {'content': 'This is a test message for moderation'}
    try:
        response = requests.post('http://localhost:$(PORT)/moderate/content', 
                               json=data, timeout=30)
        return response.status_code == 200
    except:
        return False

print('Running 50 concurrent moderation requests...')
with ThreadPoolExecutor(max_workers=10) as executor:
    start_time = time.time()
    futures = [executor.submit(test_moderation) for _ in range(50)]
    results = [f.result() for f in futures]
    duration = time.time() - start_time
    success_rate = sum(results) / len(results) * 100
    avg_time = duration / len(results) * 1000
    print(f'Performance test completed:')
    print(f'  Success rate: {success_rate:.1f}%')
    print(f'  Total duration: {duration:.2f}s')
    print(f'  Average response time: {avg_time:.0f}ms')
"

load-test: ## Run extended load test
	@echo "$(GREEN)Running extended load test...$(NC)"
	@echo "$(YELLOW)This may take a few minutes...$(NC)"
	@ab -n 100 -c 10 -T 'application/json' -p <(echo '{"content":"Test message"}') http://localhost:$(PORT)/moderate/content

# Maintenance
clean: ## Clean Python cache and artifacts
	@echo "$(GREEN)Cleaning Python cache and artifacts...$(NC)"
	@find . -type f -name "*.pyc" -delete
	@find . -type d -name "__pycache__" -delete
	@find . -type d -name "*.egg-info" -exec rm -rf {} +
	@rm -rf .pytest_cache
	@rm -rf htmlcov
	@rm -rf .coverage
	@rm -rf logs/*.log 2>/dev/null || true
	@echo "$(GREEN)Cleanup completed$(NC)"

clean-all: ## Clean everything including virtual environment
	@echo "$(GREEN)Cleaning everything...$(NC)"
	@$(MAKE) clean
	@rm -rf $(VENV_DIR)
	@rm -rf models/mental_health_classifier/* 2>/dev/null || true
	@rm -rf models/toxicity_classifier/* 2>/dev/null || true
	@echo "$(GREEN)Complete cleanup finished$(NC)"

reset: ## Reset environment (clean + setup + install)
	@echo "$(GREEN)Resetting environment...$(NC)"
	@$(MAKE) clean-all
	@$(MAKE) setup-venv
	@$(MAKE) install
	@$(MAKE) setup
	@echo "$(GREEN)Environment reset completed$(NC)"

# Deployment
pre-deploy: ## Prepare for deployment
	@echo "$(GREEN)Preparing for deployment...$(NC)"
	@$(MAKE) lint
	@$(MAKE) type-check
	@$(MAKE) test
	@$(MAKE) security-scan
	@$(MAKE) ollama-check
	@echo "$(GREEN)Deployment preparation completed$(NC)"

# Environment Information
info: ## Show project information
	@echo "$(GREEN)Project Information$(NC)"
	@echo "=================="
	@echo "Project: Mentara AI Content Moderation"
	@echo "Framework: Flask + Ollama"
	@echo "Python Version: $$(python --version 2>/dev/null || echo 'Not activated')"
	@echo "Port: $(PORT)"
	@echo "Ollama Host: $(OLLAMA_HOST)"
	@echo "Embedding Model: $(EMBEDDING_MODEL)"
	@echo "Virtual Environment: $(VENV_DIR)"

# Utilities
serve: ## Serve the application (alias for dev)
	@$(MAKE) dev

benchmark: ## Run moderation benchmarks
	@echo "$(GREEN)Running moderation benchmarks...$(NC)"
	@python -c "
import time
import requests

test_messages = [
    'Hello, how are you today?',
    'I am feeling very sad and depressed',
    'This is a normal conversation',
    'I want to hurt myself badly',
    'Therapy has been helpful for my anxiety'
]

start_time = time.time()
for msg in test_messages:
    try:
        response = requests.post('http://localhost:$(PORT)/moderate/content',
                               json={'content': msg}, timeout=10)
    except:
        pass

duration = time.time() - start_time
print(f'Benchmark: {len(test_messages)} moderations in {duration:.2f}s ({len(test_messages)/duration:.1f} moderations/sec)')
"

# Configuration
config-check: ## Check configuration
	@echo "$(GREEN)Checking configuration...$(NC)"
	@python -c "
from config import config
print(f'Service: {config.SERVICE_NAME} v{config.VERSION}')
print(f'Ollama Host: {config.OLLAMA_HOST}')
print(f'Embedding Model: {config.EMBEDDING_MODEL}')
print(f'Toxicity Threshold: {config.TOXICITY_THRESHOLD}')
print(f'Mental Health Threshold: {config.MENTAL_HEALTH_THRESHOLD}')
"

# Quick Commands
quick-start: install setup dev ## Quick start for new setup

# Production Utilities
gunicorn-start: ## Start with Gunicorn
	@echo "$(GREEN)Starting with Gunicorn...$(NC)"
	@gunicorn --bind 0.0.0.0:$(PORT) --workers 2 --timeout 120 api:app

gunicorn-prod: ## Start Gunicorn for production
	@echo "$(GREEN)Starting Gunicorn for production...$(NC)"
	@gunicorn --bind 0.0.0.0:$(PORT) --workers 2 --timeout 120 --preload --access-logfile - api:app