#!/bin/bash

# Mentara Platform - Service Orchestration Script
# Simple wrapper around Make commands for easier service management

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_NAME="Mentara Platform"
SERVICES=("mentara-api" "mentara-client" "ai-patient-evaluation" "ai-content-moderation")

# Function to display header
show_header() {
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}    ${PROJECT_NAME}${NC}"
    echo -e "${GREEN}    Service Orchestration Script${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
}

# Function to display usage
show_usage() {
    show_header
    echo -e "${BLUE}Usage:${NC} $0 [command]"
    echo ""
    echo -e "${BLUE}Available commands:${NC}"
    echo "  setup          Setup development environment"
    echo "  start          Start all services"
    echo "  stop           Stop all services"
    echo "  restart        Restart all services"
    echo "  status         Check service status"
    echo "  logs           View logs from all services"
    echo "  test           Run tests for all services"
    echo "  clean          Clean build artifacts"
    echo "  update         Update dependencies"
    echo "  help           Show this help message"
    echo ""
    echo -e "${BLUE}Individual service commands:${NC}"
    echo "  api            Start only backend API"
    echo "  client         Start only frontend"
    echo "  ai-eval        Start only AI patient evaluation"
    echo "  ai-mod         Start only AI content moderation"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  $0 setup       # First-time setup"
    echo "  $0 start       # Start all services"
    echo "  $0 status      # Check if services are running"
    echo "  $0 api         # Start only the API service"
    echo ""
}

# Function to check if Make is available
check_make() {
    if ! command -v make &> /dev/null; then
        echo -e "${RED}Error: make is not installed or not in PATH${NC}"
        echo "Please install make to use this script."
        exit 1
    fi
}

# Function to check if Docker is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}Warning: Docker is not installed or not in PATH${NC}"
        echo "Some commands may not work without Docker."
    fi
}

# Function to setup environment
setup_environment() {
    show_header
    echo -e "${GREEN}Setting up development environment...${NC}"
    
    # Check prerequisites
    check_make
    check_docker
    
    # Run setup
    make setup-dev
    
    echo ""
    echo -e "${GREEN}✓ Environment setup completed!${NC}"
    echo -e "${YELLOW}You can now run: $0 start${NC}"
}

# Function to start all services
start_services() {
    show_header
    echo -e "${GREEN}Starting all services...${NC}"
    
    make start
    
    echo ""
    echo -e "${GREEN}✓ All services started!${NC}"
    echo -e "${YELLOW}Use '$0 status' to check service health${NC}"
}

# Function to stop all services
stop_services() {
    show_header
    echo -e "${GREEN}Stopping all services...${NC}"
    
    make stop
    
    echo -e "${GREEN}✓ All services stopped${NC}"
}

# Function to restart all services
restart_services() {
    show_header
    echo -e "${GREEN}Restarting all services...${NC}"
    
    make restart
    
    echo -e "${GREEN}✓ All services restarted${NC}"
}

# Function to check service status
check_status() {
    show_header
    echo -e "${GREEN}Checking service status...${NC}"
    echo ""
    
    make status
}

# Function to view logs
view_logs() {
    show_header
    echo -e "${GREEN}Viewing logs from all services...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop following logs${NC}"
    echo ""
    
    make logs
}

# Function to run tests
run_tests() {
    show_header
    echo -e "${GREEN}Running tests for all services...${NC}"
    
    make test
    
    echo -e "${GREEN}✓ All tests completed${NC}"
}

# Function to clean build artifacts
clean_artifacts() {
    show_header
    echo -e "${GREEN}Cleaning build artifacts...${NC}"
    
    make clean
    
    echo -e "${GREEN}✓ Cleanup completed${NC}"
}

# Function to update dependencies
update_dependencies() {
    show_header
    echo -e "${GREEN}Updating dependencies...${NC}"
    
    make update
    
    echo -e "${GREEN}✓ Dependencies updated${NC}"
}

# Function to start individual service
start_individual_service() {
    local service=$1
    show_header
    echo -e "${GREEN}Starting $service service...${NC}"
    
    case $service in
        "api")
            make api
            ;;
        "client")
            make client
            ;;
        "ai-eval")
            make ai-eval
            ;;
        "ai-mod")
            make ai-mod
            ;;
        *)
            echo -e "${RED}Error: Unknown service '$service'${NC}"
            echo "Available services: api, client, ai-eval, ai-mod"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}✓ $service service started${NC}"
}

# Main script logic
main() {
    # Check if no arguments provided
    if [ $# -eq 0 ]; then
        show_usage
        exit 0
    fi
    
    # Check if make is available for most commands
    case $1 in
        "help"|"--help"|"-h")
            show_usage
            exit 0
            ;;
        *)
            check_make
            ;;
    esac
    
    # Handle commands
    case $1 in
        "setup")
            setup_environment
            ;;
        "start")
            start_services
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "status")
            check_status
            ;;
        "logs")
            view_logs
            ;;
        "test")
            run_tests
            ;;
        "clean")
            clean_artifacts
            ;;
        "update")
            update_dependencies
            ;;
        "api"|"client"|"ai-eval"|"ai-mod")
            start_individual_service $1
            ;;
        "help"|"--help"|"-h")
            show_usage
            ;;
        *)
            echo -e "${RED}Error: Unknown command '$1'${NC}"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"