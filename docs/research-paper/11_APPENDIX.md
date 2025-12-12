# Appendix

## 11. Appendix

### A. Detailed API Specifications

#### A.1 AI/ML Service API

**Base URL**: `http://ml-patient-evaluator-api:10002`

**POST /predict**

**Description**: Performs mental health condition prediction from 201-item questionnaire responses.

**Request**:
```json
{
  "inputs": [0.0, 0.5, 1.0, ..., 0.75]  // Array of 201 float values
}
```

**Response** (Success - 200):
```json
{
  "Has_Phobia": false,
  "Has_Agoraphobia": false,
  "Has_BloodPhobia": false,
  "Has_SocialPhobia": true,
  "Has_ADHD": false,
  "Has_Alcohol_Problem": false,
  "Has_Binge_Eating": false,
  "Has_Drug_Problem": false,
  "Has_Anxiety": true,
  "Has_Insomnia": false,
  "Has_Burnout": false,
  "Has_Bipolar": false,
  "Has_OCD": false,
  "Has_Hoarding": false,
  "Has_PTSD": false,
  "Has_Panic_Disorder": false,
  "Has_Depression": true,
  "Has_High_Stress": true,
  "Has_Social_Anxiety": true
}
```

**Error Responses**:

- **400 Bad Request**: Invalid input format
  ```json
  {
    "error": "Input must be a list of 201 numeric values"
  }
  ```

- **503 Service Unavailable**: Model not loaded
  ```json
  {
    "error": "Model not available. Please check server logs for model loading issues."
  }
  ```

- **500 Internal Server Error**: Inference failure
  ```json
  {
    "error": "Internal server error during prediction"
  }
  ```

**GET /health**

**Description**: Service health check endpoint.

**Response**:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "timestamp": "2025-01-01T00:00:00Z"
}
```

**GET /metrics**

**Description**: Performance metrics endpoint.

**Response**:
```json
{
  "total_requests": 1000,
  "successful_requests": 950,
  "failed_requests": 50,
  "average_latency_ms": 850,
  "p95_latency_ms": 1200,
  "p99_latency_ms": 1800
}
```

#### A.2 Backend API Endpoints

**Base URL**: `http://mentara-api:10000/api`

**POST /pre-assessment/submit**

**Description**: Submit completed mental health assessment questionnaire.

**Authentication**: Required (JWT token)

**Request**:
```json
{
  "answers": {
    "phq9": [0, 1, 2, 1, 0, 2, 1, 1, 0],
    "gad7": [1, 2, 0, 1, 2, 1, 0],
    // ... other assessment tools
  }
}
```

**Response**:
```json
{
  "id": "assessment_id",
  "userId": "user_id",
  "aiEvaluation": {
    "Has_Depression": true,
    "Has_Anxiety": true,
    // ... other conditions
  },
  "createdAt": "2025-01-01T00:00:00Z"
}
```

**GET /therapist/recommendations**

**Description**: Get AI-recommended therapists based on assessment results.

**Authentication**: Required (JWT token)

**Query Parameters**:
- `limit`: Number of recommendations (default: 10, max: 50)
- `province`: Filter by location (optional)
- `maxHourlyRate`: Maximum hourly rate (optional)

**Response**:
```json
{
  "recommendations": [
    {
      "therapist": {
        "id": "therapist_id",
        "name": "Dr. Jane Smith",
        "specializations": ["Depression", "Anxiety"],
        "hourlyRate": 150
      },
      "matchScore": 85,
      "explanation": "Strong match for depression and anxiety..."
    }
  ]
}
```

### B. Questionnaire Item Mappings

#### B.1 Complete Index Mapping

**PHQ (Indices 0-14, 15 items)**:
- Index 0: PHQ Item 1
- Index 1: PHQ Item 2
- ...
- Index 14: PHQ Item 15

**ASRS (Indices 15-32, 18 items)**:
- Index 15: ASRS Item 1
- Index 16: ASRS Item 2
- ...
- Index 32: ASRS Item 18

**AUDIT (Indices 33-42, 10 items)**:
- Index 33: AUDIT Item 1
- ...
- Index 42: AUDIT Item 10

**BES (Indices 43-58, 16 items)**:
- Index 43: BES Item 1
- ...
- Index 58: BES Item 16

**DAST-10 (Indices 59-68, 10 items)**:
- Index 59: DAST-10 Item 1
- ...
- Index 68: DAST-10 Item 10

**GAD-7 (Indices 69-75, 7 items)**:
- Index 69: GAD-7 Item 1
- ...
- Index 75: GAD-7 Item 7

**ISI (Indices 76-82, 7 items)**:
- Index 76: ISI Item 1
- ...
- Index 82: ISI Item 7

**MBI (Indices 83-104, 22 items)**:
- Index 83: MBI Item 1
- ...
- Index 104: MBI Item 22

**MDQ (Indices 105-119, 15 items)**:
- Index 105: MDQ Item 1
- ...
- Index 119: MDQ Item 15

**OCI-R (Indices 120-137, 18 items)**:
- Index 120: OCI-R Item 1
- ...
- Index 137: OCI-R Item 18

**PCL-5 (Indices 138-157, 20 items)**:
- Index 138: PCL-5 Item 1
- ...
- Index 157: PCL-5 Item 20

**PDSS (Indices 158-164, 7 items)**:
- Index 158: PDSS Item 1
- ...
- Index 164: PDSS Item 7

**PHQ-9 (Indices 165-173, 9 items)**:
- Index 165: PHQ-9 Item 1
- ...
- Index 173: PHQ-9 Item 9

**PSS (Indices 174-183, 10 items)**:
- Index 174: PSS Item 1
- ...
- Index 183: PSS Item 10

**SPIN (Indices 184-200, 17 items)**:
- Index 184: SPIN Item 1
- ...
- Index 200: SPIN Item 17

### C. Model Hyperparameters

**Architecture Parameters**:
- Input size: 201
- Hidden layer 1 size: 512
- Hidden layer 2 size: 256
- Output size: 19
- Dropout rate: 0.4

**Training Hyperparameters**:
- Optimizer: Adam
- Learning rate: [TO BE FILLED]
- Batch size: [TO BE FILLED]
- Epochs: [TO BE FILLED]
- Weight decay: [TO BE FILLED]
- Early stopping patience: [TO BE FILLED]

**Inference Parameters**:
- Threshold: 0.5
- Device: CPU (GPU support available)
- Batch size: 1 (single request inference)

### D. Additional Performance Metrics

#### D.1 Resource Utilization

**CPU Usage**:
- Average: [TO BE FILLED]%
- Peak: [TO BE FILLED]%
- Under load (100 concurrent): [TO BE FILLED]%

**Memory Usage**:
- Base (idle): ~200MB
- With model loaded: ~250MB
- Peak (under load): [TO BE FILLED]MB

**Network**:
- Average request size: ~2KB
- Average response size: ~500 bytes
- Bandwidth usage: [TO BE FILLED] Mbps

#### D.2 Error Analysis

**Error Types**:
- Invalid input format: [TO BE FILLED]%
- Model loading failures: [TO BE FILLED]%
- Inference errors: [TO BE FILLED]%
- Timeout errors: [TO BE FILLED]%

**Error Recovery**:
- Automatic retry: [TO BE FILLED]%
- Graceful degradation: [TO BE FILLED]%
- User notification: [TO BE FILLED]%

### E. Code Snippets

#### E.1 Model Loading (Python)

```python
import torch
from src.models.multilabel_nn import MultiLabelNN

def load_model(model_path: str) -> MultiLabelNN:
    model = MultiLabelNN(
        input_size=201,
        hidden_size1=512,
        hidden_size2=256,
        dropout=0.4,
        output_size=19
    )
    state_dict = torch.load(
        model_path,
        map_location=torch.device("cpu")
    )
    model.load_state_dict(state_dict)
    model.eval()
    return model
```

#### E.2 Inference (Python)

```python
def predict(model: MultiLabelNN, inputs: List[float]) -> Dict[str, bool]:
    input_tensor = torch.tensor(inputs, dtype=torch.float32).unsqueeze(0)
    with torch.no_grad():
        output = model(input_tensor)
        values = output.squeeze().tolist()
        booleans = [v >= 0.5 for v in values]
        return {
            name: val 
            for name, val in zip(CONDITION_NAMES, booleans)
        }
```

#### E.3 Backend Integration (TypeScript)

```typescript
async function processAssessment(
  userId: string,
  answers: QuestionnaireAnswers
): Promise<PreAssessment> {
  // Flatten questionnaire to 201-item array
  const flattenedData = flattenQuestionnaire(answers);
  
  // Call AI service
  const predictions = await aiServiceClient.predictConditions(
    flattenedData
  );
  
  // Store results
  const assessment = await prisma.preAssessment.create({
    data: {
      userId,
      answers,
      aiEvaluation: predictions,
    }
  });
  
  return assessment;
}
```

### F. Deployment Configurations

#### F.1 Docker Configuration

**Dockerfile** (AI/ML Service):
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 10002

CMD ["python", "api.py"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

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

#### F.2 Environment Variables

**AI/ML Service**:
- `PORT`: Service port (default: 10002)
- `MODEL_PATH`: Path to model file (default: models/mental_model_config2.pt)
- `LOG_LEVEL`: Logging level (default: INFO)

**Backend API**:
- `AI_SERVICE_URL`: URL of AI/ML service
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret

### G. Data Schemas

#### G.1 Pre-Assessment Schema

```typescript
interface PreAssessment {
  id: string;
  userId: string;
  answers: QuestionnaireAnswers;
  aiEvaluation: Record<string, boolean>;
  severityLevels: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

interface QuestionnaireAnswers {
  phq9: number[];
  gad7: number[];
  asrs: number[];
  // ... other assessment tools
}
```

#### G.2 AI Evaluation Response Schema

```typescript
interface AIEvaluation {
  Has_Phobia: boolean;
  Has_Agoraphobia: boolean;
  Has_BloodPhobia: boolean;
  Has_SocialPhobia: boolean;
  Has_ADHD: boolean;
  Has_Alcohol_Problem: boolean;
  Has_Binge_Eating: boolean;
  Has_Drug_Problem: boolean;
  Has_Anxiety: boolean;
  Has_Insomnia: boolean;
  Has_Burnout: boolean;
  Has_Bipolar: boolean;
  Has_OCD: boolean;
  Has_Hoarding: boolean;
  Has_PTSD: boolean;
  Has_Panic_Disorder: boolean;
  Has_Depression: boolean;
  Has_High_Stress: boolean;
  Has_Social_Anxiety: boolean;
}
```

---

## Notes for Authors

- Fill in actual hyperparameter values if available
- Add complete API documentation with all endpoints
- Include example requests and responses
- Add database schema diagrams
- Include deployment scripts and configurations
- Add troubleshooting guides
- Document known issues and workarounds
