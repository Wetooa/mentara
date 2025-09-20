# ML Patient Evaluator API

A Python Flask service providing AI-powered mental health assessments using a PyTorch multi-label model. Clean, service-scoped compose/Dockerfiles, and per-service Postman collections.

## 🏗️ Project Overview

This service processes 201-item mental health questionnaire responses and predicts 19 different mental health conditions using a trained PyTorch neural network model.

## 🚀 Architecture

### Technology Stack

- **Framework**: Flask (Python 3.11)
- **ML**: PyTorch
- **Containerization**: Docker + docker-compose per service
- **Monitoring**: Health/metrics endpoints

### Core Features

- PyTorch MultiLabelNN with 201 inputs → 19 condition predictions
- REST API: `/predict`, `/health`, `/metrics`, `/metrics/reset`
- Error handling for missing model and invalid inputs
- Security headers; input validation handled at endpoint
- Metrics aggregation (requests, latency, success rate)

## 🔧 Development Setup

### Prerequisites

- Python 3.11+
- Docker and Docker Compose (optional for local container runs)
- pip

### Installation

1. Install dependencies

```bash
cd ml-patient-evaluator-api
pip install -r requirements.txt
```

2. Ensure ML model file is present

```bash
# Place the model under models/
models/mental_model_config2.pt
```

3. Run

```bash
# Local
python api.py  # http://localhost:10002

# Or via Docker
docker compose up --build
```

## 🧪 Postman Collections

- This service’s collection lives here: `postman-collections/ML_Patient_Evaluator.postman_collection.json`
- Mentara API collections were moved to: `../mentara-api/postman-collections/`

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

### Run

```bash
python api.py           # Start development server (default port 10002)
FLASK_DEBUG=1 python api.py  # Debug mode
```

## API Endpoints

### POST /predict

Process 201-item questionnaire and get mental health predictions.

**Request:** JSON with 201 numeric values (range typically -10..10).

Examples:

1. All zeros (baseline)

```json
{
  "inputs": [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ]
}
```

2. Mild uniform

```json
{
  "inputs": [
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2
  ]
}
```

3. Stress/Anxiety elevated (GAD7 69–75; PSS 174–183)

```json
{
  "inputs": [
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9,
    0.9, 0.9, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
    0.2, 0.2, 0.2, 0.2, 0.2, 0.2
  ]
}
```

**Response (Success):**

```json
{
  "Has_Depression": true,
  "Has_Anxiety": false,
  "Has_PTSD": true
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

### GET / (optional)

Service info if exposed.

## Questionnaire Mapping

The 201 input values correspond to specific mental health assessment tools:

| Assessment | Index Range | Items |
| ---------- | ----------- | ----- |
| PHQ        | 0-14        | 15    |
| ASRS       | 15-32       | 18    |
| AUDIT      | 33-42       | 10    |
| BES        | 43-58       | 16    |
| DAST10     | 59-68       | 10    |
| GAD7       | 69-75       | 7     |
| ISI        | 76-82       | 7     |
| MBI        | 83-104      | 22    |
| MDQ        | 105-119     | 15    |
| OCI_R      | 120-137     | 18    |
| PCL5       | 138-157     | 20    |
| PDSS       | 158-164     | 7     |
| PHQ9       | 165-173     | 9     |
| PSS        | 174-183     | 10    |
| SPIN       | 184-200     | 17    |

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

## Notes

- Input index ranges are documented below to help craft targeted test payloads.

## Model File

The service requires `models/mental_model_config2.pt`. If missing, `/predict` returns HTTP 503.

## Error Handling

- **Model Not Loaded**: Returns 503 with descriptive error message
- **Invalid Input**: Returns 400 with validation error details
- **Wrong Input Length**: Returns 400 specifying expected length (201)
- **Non-Numeric Input**: Returns 400 with format error

## Integration with Backend

This service integrates with the NestJS backend through the `AiServiceClient` class in the pre-assessment module. The backend flattens questionnaire responses into the 201-item format and sends them to this service for prediction.

## Project Structure

```
ml-patient-evaluator-api/
├── api.py                      # App entry (registers blueprints)
├── src/
│   ├── app.py                  # Flask factory and security headers
│   ├── routes/
│   │   ├── predict.py
│   │   ├── health.py
│   │   └── metrics.py
│   ├── services/
│   │   ├── inference_service.py
│   │   └── state.py
│   ├── models/
│   │   └── multilabel_nn.py    # PyTorch model definition
│   └── security/
│       └── security.py
├── models/
│   └── mental_model_config2.pt
├── postman-collections/
│   └── ML_Patient_Evaluator.postman_collection.json
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── README.md
```

### Performance Targets

- Average prediction latency: < 1000ms
- Maximum latency: < 2000ms
- Concurrent request success rate: ≥ 80%

### Performance Targets

- Average prediction latency: < 1000ms
- Maximum latency: < 2000ms
- Memory growth: < 100MB over 100 requests
- Concurrent request success rate: ≥ 80%

## Monitoring & Logging

Includes startup logging for model load state, health/metrics endpoints, and basic audit logging hooks in security layer.

## Security Considerations

- Input validation and sanitization
- Error messages don't expose internal details
- No sensitive data logging
- Service designed to run in containerized environment
