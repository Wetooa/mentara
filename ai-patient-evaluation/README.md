# AI Patient Evaluation Service

A production-ready Python Flask service providing AI-powered mental health assessments using PyTorch neural networks.

## 🏗️ Project Overview

This service processes 201-item mental health questionnaire responses and predicts 19 different mental health conditions using a trained PyTorch neural network model.

## 🚀 Architecture

### Technology Stack
- **Framework**: Flask with Python 3.11
- **ML Library**: PyTorch for neural network models
- **Deployment**: Docker with multi-stage builds
- **Performance**: Gunicorn WSGI server with worker processes
- **Monitoring**: Health checks and metrics endpoints
- **Testing**: Pytest with comprehensive test coverage

### Core Features
- **Model**: PyTorch MultiLabelNN with 201 inputs → 19 mental health predictions
- **API**: RESTful Flask API with `/predict`, `/health`, and service info endpoints  
- **Error Handling**: Graceful handling of missing model files and invalid inputs
- **Security**: Input validation, rate limiting, and secure containerization
- **Performance**: Optimized for low latency and high throughput
- **Monitoring**: Health checks, metrics, and comprehensive logging

## 🔧 Development Setup

### Prerequisites
- Python 3.9+
- Docker and Docker Compose (for containerized development)
- pip or pipenv

### Installation

1. **Clone and setup environment**:
```bash
git clone <repository-url>
cd ai-patient-evaluation
cp .env.example .env
# Configure environment variables
```

2. **Setup virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Ensure ML model file is present**:
```bash
# Place mental_model_config2.pt in the service directory
# The model will be validated on startup
```

4. **Start development server**:
```bash
python api.py
# or with Make: make dev
```

The service will be available at `http://localhost:5000`

## 🧪 Testing

### Unit Tests
```bash
make test                # Run all tests
make test-verbose        # Run tests with verbose output
make test-coverage       # Run tests with coverage report
```

### Performance Tests
```bash
make test-performance    # Run performance and load tests
make load-test           # Run load testing
```

### Integration Tests
```bash
make test-integration    # Run backend integration tests
```

## 🛠️ Development Commands

### Using Make (Recommended)
```bash
# Development
make dev                 # Start development server
make dev-debug          # Start with debug mode
make validate-model     # Validate ML model file

# Docker Compose
make compose-up         # Start services with docker-compose
make compose-up-d       # Start services in background
make compose-down       # Stop and remove containers
make compose-logs       # View container logs

# Code Quality
make lint               # Run flake8 linting
make format             # Format code with black
make type-check         # Run mypy type checking
make security-scan      # Run security audit

# Environment
make setup-env          # Setup environment variables
make setup-dev          # Complete development setup
```

### Using Python directly
```bash
# Development
python api.py           # Start development server
FLASK_DEBUG=1 python api.py  # Start with debug mode

# Testing
python -m pytest       # Run unit tests
python test_api.py      # Test API endpoints
python test_performance.py  # Run performance tests

# Code Quality
flake8 .               # Run linting
black .                # Format code
mypy .                 # Type checking
```

## API Endpoints

### POST /predict
Process 201-item questionnaire and get mental health predictions.

**Request:**
```json
{
  "inputs": [0, 1, 2, ..., 200]  // Array of 201 numeric values
}
```

**Response (Success):**
```json
{
  "Has_Depression": true,
  "Has_Anxiety": false,
  "Has_PTSD": true,
  // ... 19 total conditions
}
```

**Response (Error):**
```json
{
  "error": "Model not available. Please check server logs for model loading issues."
}
```

### GET /health
Check service and model status.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "service": "Mental Health AI Prediction Service",
  "version": "1.0.0"
}
```

### GET /
Service information and available endpoints.

## Questionnaire Mapping

The 201 input values correspond to specific mental health assessment tools:

| Assessment | Index Range | Items |
|------------|-------------|--------|
| PHQ        | 0-14        | 15     |
| ASRS       | 15-32       | 18     |
| AUDIT      | 33-42       | 10     |
| BES        | 43-58       | 16     |
| DAST10     | 59-68       | 10     |
| GAD7       | 69-75       | 7      |
| ISI        | 76-82       | 7      |
| MBI        | 83-104      | 22     |
| MDQ        | 105-119     | 15     |
| OCI_R      | 120-137     | 18     |
| PCL5       | 138-157     | 20     |
| PDSS       | 158-164     | 7      |
| PHQ9       | 165-173     | 9      |
| PSS        | 174-183     | 10     |
| SPIN       | 184-200     | 17     |

## Predicted Conditions

The model predicts 19 mental health conditions:

1. Has_Phobia
2. Has_Agoraphobia  
3. Has_BloodPhobia
4. Has_SocialPhobia
5. Has_ADHD
6. Has_Alcohol_Problem
7. Has_Binge_Eating
8. Has_Drug_Problem
9. Has_Anxiety
10. Has_Insomnia
11. Has_Burnout
12. Has_Bipolar
13. Has_OCD
14. Has_Hoarding
15. Has_PTSD
16. Has_Panic_Disorder
17. Has_Depression
18. Has_High_Stress
19. Has_Social_Anxiety

## Testing

### Run All Tests
```bash
python run_tests.py
```

### Quick Tests Only
```bash
python run_tests.py --quick
```

### Performance Tests Only  
```bash
python run_tests.py --performance
```

### With Coverage Report
```bash
python run_tests.py --coverage
```

### Install Test Dependencies
```bash
python run_tests.py --install
```

## Model File

The service requires a trained PyTorch model file named `mental_model_config2.pt` in the service directory. If this file is missing, the service will start but return 503 errors for prediction requests.

## Error Handling

- **Model Not Loaded**: Returns 503 with descriptive error message
- **Invalid Input**: Returns 400 with validation error details  
- **Wrong Input Length**: Returns 400 specifying expected length (201)
- **Non-Numeric Input**: Returns 400 with format error

## Integration with Backend

This service integrates with the NestJS backend through the `AiServiceClient` class in the pre-assessment module. The backend flattens questionnaire responses into the 201-item format and sends them to this service for prediction.

## Development

### Project Structure
```
ai-patient-evaluation/
├── api.py              # Main Flask application
├── model.py            # PyTorch model definition
├── requirements.txt    # Python dependencies
├── test_api.py         # Unit and integration tests
├── test_performance.py # Performance and load tests
├── run_tests.py        # Test runner script
├── pytest.ini         # Test configuration
└── README.md          # This file
```

### Testing Strategy
- **Unit Tests**: Model functionality, API endpoints, error handling
- **Integration Tests**: Complete service workflow, error scenarios
- **Performance Tests**: Latency, memory usage, concurrent requests
- **Load Tests**: Sustained load, stress scenarios

### Performance Targets
- Average prediction latency: < 1000ms
- Maximum latency: < 2000ms  
- Memory growth: < 100MB over 100 requests
- Concurrent request success rate: ≥ 80%

## Monitoring & Logging

The service includes:
- Startup logging for model loading status
- Health check endpoint for monitoring
- Error logging for prediction failures
- Performance metrics in test suite

## Security Considerations

- Input validation and sanitization
- Error messages don't expose internal details
- No sensitive data logging
- Service designed to run in containerized environment