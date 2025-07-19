# AI Content Moderation Service

🛡️ **Mental Health-Aware Content Safety System**

A production-ready Python Flask service providing AI-powered content moderation specifically designed for mental health platforms, featuring specialized toxicity detection, crisis intervention capabilities, and therapeutic context awareness.

## 🏗️ Project Overview

This Flask-based microservice provides comprehensive content moderation for the Mentara mental health platform, using advanced AI techniques to ensure user safety while maintaining therapeutic context awareness.

## 🚀 Architecture

### Technology Stack
- **Framework**: Flask with Python 3.9+
- **AI Engine**: Ollama with mxbai-embed-large embeddings
- **Caching**: Redis for performance optimization
- **Deployment**: Docker with multi-container orchestration
- **Monitoring**: Health checks, metrics, and comprehensive logging
- **Testing**: Comprehensive test suite with performance benchmarking

### Core Features
- **Mental Health-Aware** toxicity classification with therapeutic context understanding
- **Crisis Content Detection** for immediate intervention and escalation
- **Semantic Analysis** using state-of-the-art embedding models
- **Real-time Moderation** with configurable thresholds and human review flagging
- **Batch Processing** for efficient handling of multiple content items
- **Performance Optimization** with intelligent caching and rate limiting

### Service Architecture
```
ai-content-moderation/
├── api.py                      # Main Flask application
├── moderation_engine.py        # Core moderation logic
├── mental_health_classifier.py # Mental health context analysis
├── config.py                   # Configuration management
├── setup.py                    # Installation and setup script
├── test_service.py            # Comprehensive test suite
├── requirements.txt           # Python dependencies
├── models/                    # ML model storage
├── logs/                      # Service logs
└── data/                      # Training data and samples
```

## 🔧 Development Setup

### Prerequisites
- Python 3.9+
- Docker and Docker Compose (for containerized development)
- Ollama (automatically managed in Docker setup)
- 4GB+ RAM (for embedding models)

### Installation

1. **Clone and setup environment**:
```bash
git clone <repository-url>
cd ai-content-moderation
cp .env.example .env
# Configure environment variables
```

2. **Start with Docker Compose (Recommended)**:
```bash
docker-compose up --build
```
This automatically:
- Starts Ollama service with required models
- Sets up Redis for caching
- Builds and starts the AI service
- Downloads mxbai-embed-large embedding model

3. **Verify installation**:
```bash
curl http://localhost:5001/health
python test_service.py
```

### Manual Setup (Alternative)

For local development without Docker:

1. **Setup virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Install and configure Ollama**:
```bash
# Install Ollama (if not already installed)
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Download embedding model
ollama pull mxbai-embed-large
```

3. **Run setup script**:
```bash
python setup.py
```

4. **Start development server**:
```bash
python api.py
# or with Make: make dev
```

The service will be available at `http://localhost:5001`

## 🧪 Testing

### Unit Tests
```bash
make test                # Run all tests
make test-verbose        # Run tests with verbose output
make test-coverage       # Run tests with coverage report
```

### Service Tests
```bash
make test-service        # Test service endpoints
make test-moderation     # Test content moderation functionality
```

### Performance Tests
```bash
make perf-test           # Run performance benchmarks
make load-test           # Run extended load testing
```

## 🛠️ Development Commands

### Using Make (Recommended)
```bash
# Development
make dev                 # Start development server
make dev-debug          # Start with debug mode
make dev-with-ollama     # Start with Ollama health check

# Docker Compose
make compose-up          # Start services with docker-compose
make compose-up-d        # Start services in background
make compose-down        # Stop and remove containers
make compose-logs        # View service logs
make compose-logs-ollama # View Ollama logs

# Ollama Management
make ollama-check        # Check if Ollama is running
make ollama-pull         # Pull required embedding model
make ollama-setup        # Complete Ollama setup

# Code Quality
make lint                # Run flake8 linting
make format              # Format code with black
make type-check          # Run mypy type checking
make security-scan       # Run security audit

# Environment
make setup-env           # Setup environment variables
make setup-dev           # Complete development setup
```

### Using Python directly
```bash
# Development
python api.py           # Start development server
FLASK_DEBUG=1 python api.py  # Start with debug mode

# Testing
python -m pytest       # Run unit tests
python test_service.py  # Test service endpoints

# Code Quality
flake8 .               # Run linting
black .                # Format code
mypy .                 # Type checking
```

## 🔧 Manual Setup (Legacy)

If you prefer manual setup without Docker:

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Setup Ollama
```bash
# Install Ollama (if not already installed)
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Download embedding model
ollama pull mxbai-embed-large
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Create Directories
```bash
mkdir -p models/mental_health_classifier models/toxicity_classifier logs data
```

## ⚙️ Configuration

### Environment Variables (.env)

```bash
# Service Configuration
FLASK_ENV=development
PORT=5001

# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
EMBEDDING_MODEL=mxbai-embed-large

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Moderation Thresholds
TOXICITY_THRESHOLD=0.7           # Toxicity detection threshold
CONFIDENCE_THRESHOLD=0.8         # Minimum confidence for actions
MENTAL_HEALTH_THRESHOLD=0.6      # Mental health content threshold

# Performance Settings
MAX_CONTENT_LENGTH=10000         # Maximum characters per request
BATCH_SIZE_LIMIT=100            # Maximum items per batch
CACHE_TTL=604800                # Cache TTL in seconds (7 days)

# Rate Limiting
RATE_LIMIT_PER_MINUTE=30        # Requests per minute per IP
RATE_LIMIT_PER_HOUR=1000        # Requests per hour per IP

# Security
API_KEY_REQUIRED=false          # Require API key authentication
API_KEY=your_api_key_here       # API key (if required)
```

## 📡 API Endpoints

### Health Check
```http
GET /health
```
Returns service health status and component availability.

### Service Information
```http
GET /
```
Returns service metadata, available endpoints, and features.

### Moderate Content
```http
POST /moderate/content
Content-Type: application/json

{
  "content": "Text to moderate",
  "content_type": "text",
  "context": {
    "user_id": "user123",
    "is_therapy_session": true
  }
}
```

**Response:**
```json
{
  "content_id": "req_1234567890",
  "is_toxic": false,
  "toxicity_score": 0.23,
  "confidence": 0.87,
  "categories": ["mental_health"],
  "mental_health_context": true,
  "requires_human_review": false,
  "action_taken": "allow",
  "reasoning": "Mental health disclosure in therapeutic context",
  "timestamp": "2025-07-14T10:30:00Z"
}
```

### Batch Moderation
```http
POST /moderate/batch
Content-Type: application/json

{
  "items": [
    {"content": "First message", "context": {}},
    {"content": "Second message", "context": {}}
  ],
  "priority": "normal"
}
```

### Moderation Status
```http
GET /moderate/status/{content_id}
```
Retrieve cached moderation result for appeals or review.

### Metrics
```http
GET /metrics
```
Prometheus metrics for monitoring and alerting.

## 🧠 Mental Health Features

### Crisis Detection
Automatically detects and flags crisis-level content:
- **Suicide ideation** - Immediate human review required
- **Self-harm content** - Escalated priority
- **Crisis keywords** - Configurable crisis indicators

### Therapeutic Context Awareness
Understands mental health discussions:
- **Therapy sessions** - Reduced false positives
- **Treatment discussions** - Context-aware moderation
- **Recovery narratives** - Supportive content recognition

### Mental Health Categories
Detects and classifies:
- Depression and mood disorders
- Anxiety and stress-related content
- Trauma and PTSD discussions
- Eating disorders and body image
- Substance abuse and recovery
- Bipolar and mood cycling
- OCD and compulsive behaviors
- ADHD and attention issues
- Personality disorders
- Psychosis and reality distortion

## 🔒 Security & Privacy

### HIPAA Compliance
- **Audit logging** - All moderation decisions logged
- **Data encryption** - Content encrypted in transit
- **Access controls** - Role-based API access
- **Retention policies** - Configurable data retention

### Privacy Protection
- **No persistent storage** - Content not permanently stored
- **Anonymization** - User IDs can be anonymized
- **Minimal data** - Only necessary metadata collected
- **Secure caching** - Redis encryption support

## 📊 Monitoring & Metrics

### Prometheus Metrics
- `moderation_requests_total` - Total moderation requests
- `moderation_duration_seconds` - Request processing time
- `model_health_checks_total` - Model health status
- Custom labels for endpoints and results

### Health Checks
- **Ollama connectivity** - Embedding service status
- **Model availability** - Required models loaded
- **Redis connectivity** - Caching service status
- **Component health** - All subsystems operational

## 🧪 Testing

### Run Test Suite
```bash
python test_service.py
```

### Test Categories
- **Health checks** - Service availability
- **Content moderation** - Basic toxicity detection
- **Mental health detection** - Context awareness
- **Crisis detection** - Emergency content flagging
- **Batch processing** - Multiple content handling
- **Input validation** - Error handling
- **Rate limiting** - Abuse prevention
- **Metrics collection** - Monitoring functionality

### Performance Testing
```bash
# Load testing with 50 concurrent requests
ab -n 1000 -c 50 -T 'application/json' \
   -p test_payload.json \
   http://localhost:5001/moderate/content
```

## 🔄 Integration

### Backend Integration
```python
# Example Python integration
import requests

def moderate_content(content: str, context: dict = None):
    response = requests.post(
        "http://localhost:5001/moderate/content",
        json={
            "content": content,
            "context": context or {}
        }
    )
    return response.json()

# Usage
result = moderate_content(
    "I'm feeling really depressed today",
    {"user_id": "user123", "is_therapy_session": True}
)
```

### API Integration Patterns
```javascript
// Frontend integration example
const moderateContent = async (content, context = {}) => {
  const response = await fetch('/api/moderate/content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content, context })
  });
  
  return response.json();
};
```

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5001

CMD ["gunicorn", "--bind", "0.0.0.0:5001", "api:app"]
```

### Production Configuration
```bash
# Production environment variables
FLASK_ENV=production
LOG_LEVEL=WARNING
API_KEY_REQUIRED=true
RATE_LIMIT_PER_MINUTE=100
CACHE_TTL=86400
```

### Scaling Considerations
- **Horizontal scaling** - Multiple service instances
- **Load balancing** - Distribute requests across instances
- **Caching strategy** - Redis cluster for high availability
- **Model optimization** - GPU acceleration for embeddings

## 🛠️ Development

### Adding New Features
1. **Update configuration** in `config.py`
2. **Extend moderation engine** in `moderation_engine.py`
3. **Add mental health categories** in `mental_health_classifier.py`
4. **Create tests** in `test_service.py`
5. **Update API endpoints** in `api.py`

### Custom Model Training
```python
# Train mental health classifier with custom data
from mental_health_classifier import MentalHealthClassifier

classifier = MentalHealthClassifier()
training_data = [
    {"text": "I feel anxious", "is_mental_health": True},
    {"text": "Nice weather today", "is_mental_health": False}
]

result = classifier.train_model(training_data, save_model=True)
print(f"Training accuracy: {result['accuracy']:.3f}")
```

## 📈 Performance

### Benchmarks
- **Single request**: ~200ms average response time
- **Batch processing**: ~50ms per item in batch
- **Throughput**: 300+ requests/minute (single instance)
- **Memory usage**: ~2GB (with embeddings loaded)

### Optimization Tips
- **Redis caching** - Enable for improved performance
- **Batch requests** - Use batch endpoint for multiple items
- **Model caching** - Embeddings cached for 7 days by default
- **Rate limiting** - Configured to prevent abuse

## 🐛 Troubleshooting

### Common Issues

**Ollama Connection Failed**
```bash
# Check if Ollama is running
ollama list

# Start Ollama service
ollama serve

# Pull required model
ollama pull mxbai-embed-large
```

**Model Not Found**
```bash
# Verify model availability
ollama list | grep mxbai-embed-large

# Re-download if missing
ollama pull mxbai-embed-large
```

**High Memory Usage**
- Embedding models require significant memory
- Consider using smaller models for development
- Monitor memory with embedding caching enabled

**Rate Limiting Issues**
```bash
# Adjust rate limits in .env
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=5000
```

### Debug Mode
```bash
# Enable debug logging
FLASK_ENV=development
LOG_LEVEL=DEBUG

# Run with verbose output
python api.py
```

## 📚 Resources

### Mental Health Resources
- [Crisis Text Line](https://www.crisistextline.org/) - Text HOME to 741741
- [National Suicide Prevention Lifeline](https://suicidepreventionlifeline.org/) - 988
- [SAMHSA National Helpline](https://www.samhsa.gov/find-help/national-helpline) - 1-800-662-4357

### Technical Documentation
- [Ollama Documentation](https://ollama.ai/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [mxbai-embed-large Model](https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1)

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Add tests** for new functionality
4. **Commit changes** (`git commit -m 'Add amazing feature'`)
5. **Push to branch** (`git push origin feature/amazing-feature`)
6. **Open Pull Request**

### Development Guidelines
- **Test coverage** - All new features must include tests
- **Documentation** - Update README and docstrings
- **Mental health sensitivity** - Consider impact on vulnerable users
- **Performance** - Ensure changes don't degrade response times

## 📄 License

MIT License - See LICENSE file for details.

## 🙏 Acknowledgments

- **Ollama** - For providing excellent local LLM infrastructure
- **Mixedbread AI** - For the mxbai-embed-large embedding model
- **Mental Health Community** - For guidance on sensitive content handling
- **Mentara Team** - For the opportunity to build safety tools

---

**Built with ❤️ for mental health platform safety**

*This service is designed to protect and support users in vulnerable states while maintaining therapeutic context and promoting healing.*