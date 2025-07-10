# Mentara TURN Server Management Makefile

# Default values
TURN_USERNAME ?= mentara
TURN_PASSWORD ?= mentara123
TURN_REALM ?= mentara.local

# Docker compose command
DOCKER_COMPOSE = docker-compose
DOCKER = docker

.PHONY: help build up down restart logs status clean test certificates production

# Default target
all: help

help: ## Show this help message
	@echo "Mentara TURN Server Management"
	@echo "=============================="
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Environment variables:"
	@echo "  TURN_USERNAME: $(TURN_USERNAME)"
	@echo "  TURN_PASSWORD: [hidden]"
	@echo "  TURN_REALM: $(TURN_REALM)"

build: ## Build the TURN server Docker image
	@echo "Building TURN server image..."
	$(DOCKER_COMPOSE) build

up: ## Start the TURN server
	@echo "Starting TURN server..."
	TURN_USERNAME=$(TURN_USERNAME) TURN_PASSWORD=$(TURN_PASSWORD) TURN_REALM=$(TURN_REALM) \
	$(DOCKER_COMPOSE) up -d

down: ## Stop the TURN server
	@echo "Stopping TURN server..."
	$(DOCKER_COMPOSE) down

restart: down up ## Restart the TURN server

logs: ## View TURN server logs
	$(DOCKER_COMPOSE) logs -f coturn

logs-all: ## View all service logs
	$(DOCKER_COMPOSE) logs -f

status: ## Check TURN server status
	@echo "TURN Server Status:"
	@echo "=================="
	$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "Port Status:"
	@netstat -ln 2>/dev/null | grep -E ":(3478|5349)" || echo "No TURN ports found (server may be down)"
	@echo ""
	@echo "Container Health:"
	$(DOCKER) ps --filter "name=mentara-coturn" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

clean: ## Remove containers and volumes
	@echo "Cleaning up TURN server resources..."
	$(DOCKER_COMPOSE) down -v --remove-orphans
	$(DOCKER) system prune -f

test: ## Test TURN server connectivity
	@echo "Testing TURN server connectivity..."
	@echo "Testing STUN on port 3478..."
	@nc -u -z localhost 3478 && echo "✓ STUN port 3478 is open" || echo "✗ STUN port 3478 is closed"
	@echo "Testing TURNS on port 5349..."
	@nc -z localhost 5349 && echo "✓ TURNS port 5349 is open" || echo "✗ TURNS port 5349 is closed"
	@echo ""
	@echo "To test STUN/TURN functionality, use a WebRTC testing tool like:"
	@echo "  https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/"

test-docker: ## Test TURN server inside Docker network
	@echo "Testing TURN server from inside Docker network..."
	$(DOCKER_COMPOSE) exec coturn turnutils_stunclient localhost

certificates: ## Generate self-signed certificates for testing
	@echo "Generating self-signed certificates..."
	@mkdir -p certs
	@openssl req -x509 -newkey rsa:2048 -keyout certs/turn.key -out certs/turn.crt \
		-days 365 -nodes -subj "/C=US/ST=CA/L=SF/O=Mentara/CN=mentara-turn.local"
	@chmod 600 certs/turn.key
	@echo "Certificates generated in ./certs/"
	@echo "Remember to update docker-compose.yml to mount the certificates"

production: ## Setup for production deployment
	@echo "Setting up production configuration..."
	@echo "1. Generate proper SSL certificates (Let's Encrypt recommended)"
	@echo "2. Update turnserver.conf with your domain and certificates"
	@echo "3. Set strong passwords via environment variables"
	@echo "4. Consider using Redis for user database"
	@echo "5. Configure firewall rules for ports 3478, 5349, and 49152-65535"
	@echo ""
	@echo "Example production commands:"
	@echo "  make certificates  # Generate test certificates"
	@echo "  TURN_PASSWORD=strong_password make up"

# Development helpers
dev-up: ## Start with development settings
	@echo "Starting TURN server in development mode..."
	TURN_USERNAME=dev TURN_PASSWORD=dev123 TURN_REALM=dev.mentara.local \
	$(DOCKER_COMPOSE) up -d

dev-logs: ## Show development logs with timestamps
	$(DOCKER_COMPOSE) logs -f --timestamps coturn

# Monitoring
monitor: ## Show real-time resource usage
	@echo "Monitoring TURN server resources..."
	$(DOCKER) stats mentara-coturn

network-info: ## Show network information
	@echo "Docker Network Information:"
	@echo "=========================="
	$(DOCKER) network ls | grep coturn
	@echo ""
	@echo "Container Network Details:"
	$(DOCKER) inspect mentara-coturn | grep -A 10 "NetworkSettings"

# Backup and restore
backup: ## Backup TURN server configuration and data
	@echo "Backing up TURN server configuration..."
	@mkdir -p backup/$(shell date +%Y%m%d_%H%M%S)
	@cp *.conf backup/$(shell date +%Y%m%d_%H%M%S)/
	@$(DOCKER_COMPOSE) exec coturn tar czf - /var/log/coturn > backup/$(shell date +%Y%m%d_%H%M%S)/logs.tar.gz
	@echo "Backup completed in backup/ directory"

# Security
security-check: ## Check security configuration
	@echo "Security Configuration Check:"
	@echo "============================"
	@echo "Checking file permissions..."
	@ls -la *.conf
	@echo ""
	@echo "Checking for default passwords..."
	@grep -n "mentara123" *.conf && echo "⚠️  Default password found!" || echo "✓ No default passwords found"
	@echo ""
	@echo "Checking SSL configuration..."
	@grep -n "cert=" turnserver.conf && echo "✓ SSL certificates configured" || echo "⚠️  No SSL certificates configured"

# Quick actions
quick-restart: ## Quick restart without rebuild
	$(DOCKER_COMPOSE) restart coturn

tail: ## Tail the latest logs
	$(DOCKER_COMPOSE) logs --tail=50 -f coturn