# Implementation Details

## 5. Implementation Details

### 5.1 Technology Stack

**AI/ML Service**:
- **Language**: Python 3.11
- **Framework**: Flask 2.x (lightweight REST API)
- **Machine Learning**: PyTorch 2.x
- **HTTP Client**: Flask built-in request handling
- **Containerization**: Docker with Python base image

**Backend API Service**:
- **Language**: TypeScript
- **Framework**: NestJS 11.x
- **HTTP Client**: Axios for AI service communication
- **Database**: PostgreSQL via Supabase with Prisma ORM

**Frontend Service**:
- **Language**: TypeScript
- **Framework**: Next.js 15.2.4
- **HTTP Client**: Axios for API communication

### 5.2 AI/ML Service Implementation

**Flask Application Structure**:

```python
# api.py - Application entry point
from flask import Flask
from src.app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10002, debug=False)
```

**Model Loading Service**:

```python
# src/services/inference_service.py
def load_model() -> MultiLabelNN | None:
    model = MultiLabelNN(201, 512, 256, 0.4, 19)
    try:
        state_dict = torch.load(
            "models/mental_model_config2.pt",
            map_location=torch.device("cpu")
        )
        model.load_state_dict(state_dict)
        model.eval()  # Set to evaluation mode
        return model
    except Exception:
        return None
```

**Inference Service**:

```python
def run_inference(model: MultiLabelNN, inputs: List[float]) -> Dict[str, bool]:
    # Convert to tensor
    input_tensor = torch.tensor(inputs, dtype=torch.float32).unsqueeze(0)
    
    # Run inference (no gradient computation)
    with torch.no_grad():
        output = model(input_tensor)
        values = output.squeeze().tolist()
        
        # Apply threshold (0.5) for binary classification
        booleans = [v >= 0.5 for v in values]
        
        # Map to condition names
        return {
            name: val 
            for name, val in zip(CONDITION_NAMES, booleans)
        }
```

**Prediction Endpoint**:

```python
# src/routes/predict.py
@bp.route("/predict", methods=["POST"])
def predict():
    start = time.time()
    record_request()
    
    # Check model availability
    if _model is None:
        record_failure()
        return jsonify({
            "error": "Model not available"
        }), 503
    
    # Validate input
    data = request.get_json(silent=True)
    if not data or "inputs" not in data:
        record_failure()
        return jsonify({"error": "Missing 'inputs' field"}), 400
    
    inputs = data["inputs"]
    if not isinstance(inputs, list) or len(inputs) != 201:
        record_failure()
        return jsonify({
            "error": "Input must be a list of 201 numeric values"
        }), 400
    
    # Run inference
    try:
        prediction = run_inference(_model, inputs)
        record_success(time.time() - start)
        return jsonify(prediction)
    except Exception:
        record_failure()
        return jsonify({
            "error": "Internal server error during prediction"
        }), 500
```

### 5.3 API Design

**RESTful Endpoints**:

**POST /predict**
- **Purpose**: Perform mental health condition prediction
- **Request Body**:
  ```json
  {
    "inputs": [0.0, 0.5, 1.0, ..., 0.75]  // 201 float values
  }
  ```
- **Response**:
  ```json
  {
    "Has_Depression": true,
    "Has_Anxiety": true,
    "Has_ADHD": false,
    ...
  }
  ```
- **Error Responses**:
  - `400`: Invalid input format or length
  - `503`: Model not available
  - `500`: Internal server error

**GET /health**
- **Purpose**: Service health check
- **Response**:
  ```json
  {
    "status": "healthy",
    "model_loaded": true,
    "timestamp": "2025-01-01T00:00:00Z"
  }
  ```

**GET /metrics**
- **Purpose**: Performance metrics
- **Response**:
  ```json
  {
    "total_requests": 1000,
    "successful_requests": 950,
    "failed_requests": 50,
    "average_latency_ms": 850,
    "p95_latency_ms": 1200
  }
  ```

### 5.4 Real-Time Inference Pipeline

**Request Processing Flow**:

```
1. HTTP Request Received
   ↓
2. Input Validation
   - Check JSON format
   - Validate input length (201)
   - Validate numeric types
   ↓
3. Model Inference
   - Convert to PyTorch tensor
   - Forward pass through neural network
   - Apply sigmoid activation
   - Threshold at 0.5
   ↓
4. Response Formatting
   - Map outputs to condition names
   - Format as JSON dictionary
   ↓
5. Metrics Recording
   - Record request count
   - Record latency
   - Record success/failure
   ↓
6. HTTP Response Sent
```

**Performance Optimizations**:
- **Model Caching**: Model loaded once at startup, cached in memory
- **Evaluation Mode**: `model.eval()` disables dropout and batch normalization updates
- **No Gradient Computation**: `torch.no_grad()` reduces memory usage
- **CPU Optimization**: Model optimized for CPU inference (GPU support available)

### 5.5 Error Handling and Robustness

**Input Validation**:
- Type checking for input array
- Length validation (must be exactly 201)
- Numeric value validation
- Range checking (if applicable)

**Model Error Handling**:
- Graceful degradation if model fails to load
- Error logging for debugging
- User-friendly error messages
- HTTP status codes for different error types

**Service Resilience**:
- Health check endpoint for monitoring
- Metrics endpoint for performance tracking
- Graceful shutdown handling
- Container restart policies

### 5.6 Backend Integration

**AI Service Client**:

```typescript
// mentara-api/src/pre-assessment/ai-service-client.service.ts
@Injectable()
export class AiServiceClient {
  private readonly aiServiceUrl: string;
  
  async predictConditions(
    questionnaireData: number[]
  ): Promise<Record<string, boolean>> {
    const response = await axios.post(
      `${this.aiServiceUrl}/predict`,
      { inputs: questionnaireData },
      { timeout: 5000 }
    );
    return response.data;
  }
}
```

**Assessment Processing**:

```typescript
// mentara-api/src/pre-assessment/pre-assessment.service.ts
async processAssessment(answers: QuestionnaireAnswers) {
  // 1. Flatten questionnaire responses to 201-item array
  const flattenedData = this.flattenQuestionnaire(answers);
  
  // 2. Call AI service
  const predictions = await this.aiServiceClient.predictConditions(
    flattenedData
  );
  
  // 3. Store results in database
  const assessment = await this.prisma.preAssessment.create({
    data: {
      userId: user.id,
      answers: answers,
      aiEvaluation: predictions,
      // ... other fields
    }
  });
  
  // 4. Trigger therapist matching
  await this.therapistMatchingService.matchTherapists(user.id);
  
  return assessment;
}
```

### 5.7 Performance Optimization Techniques

**Model Optimization**:
- **Quantization**: [TO BE FILLED - if model quantization used]
- **Pruning**: [TO BE FILLED - if model pruning used]
- **ONNX Conversion**: [TO BE FILLED - if ONNX runtime used]

**Inference Optimization**:
- **Batch Processing**: [TO BE FILLED - if batching implemented]
- **Async Processing**: [TO BE FILLED - if async inference used]
- **Caching**: Prediction results cached for identical inputs

**API Optimization**:
- **Connection Pooling**: HTTP connection reuse
- **Request Timeout**: 5-second timeout for AI service calls
- **Retry Logic**: Exponential backoff for transient failures

### 5.8 Integration with Therapist Matching System

**Condition-Based Matching**:

```typescript
// mentara-api/src/therapist/services/advanced-matching.service.ts
async calculateConditionMatchScore(
  userProfile: UserConditionProfile,
  therapist: Therapist
): Promise<number> {
  let score = 0;
  
  // Match therapist specializations with predicted conditions
  for (const condition of userProfile.conditions) {
    if (therapist.expertise.includes(condition)) {
      score += 20; // Base match score
    }
    
    // Severity-based weighting
    const severity = userProfile.severity[condition];
    if (severity === 'severe') {
      score += 10; // Bonus for severe conditions
    }
  }
  
  return Math.min(score, 100); // Cap at 100
}
```

**Clinical Insights Integration**:

The AI assessment results inform clinical insights generation:

```typescript
// mentara-api/src/pre-assessment/analysis/clinical-insights.service.ts
generateTreatmentPlan(assessment: PreAssessment) {
  const conditions = this.extractConditions(assessment.aiEvaluation);
  const severities = this.calculateSeverities(assessment);
  
  return {
    primaryConditions: conditions.filter(c => c.severity === 'severe'),
    recommendedTherapies: this.matchTherapies(conditions),
    therapistCriteria: {
      requiredSpecializations: conditions.map(c => c.specialization),
      experienceLevel: this.determineExperienceLevel(severities)
    }
  };
}
```

### 5.9 Deployment Configuration

**Docker Configuration**:

```dockerfile
# ml-patient-evaluator-api/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 10002

# Run application
CMD ["python", "api.py"]
```

**Environment Configuration**:
- **Port**: 10002 (configurable via environment variable)
- **Model Path**: `models/mental_model_config2.pt`
- **Logging**: Structured logging to stdout
- **Health Checks**: `/health` endpoint for container health checks

**Docker Compose**:

```yaml
# ml-patient-evaluator-api/docker-compose.yml
services:
  ml-patient-evaluator:
    build: .
    ports:
      - "10002:10002"
    volumes:
      - ./models:/app/models
    environment:
      - PORT=10002
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:10002/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## Notes for Authors

- Add actual code snippets from codebase if available
- Include performance profiling results
- Document any additional optimizations
- Add monitoring and logging details
- Include load testing results
- Document scaling strategies
