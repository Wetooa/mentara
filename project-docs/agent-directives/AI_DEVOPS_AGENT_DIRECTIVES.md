# 🤖 AI/DEVOPS AGENT - IMPLEMENTATION DIRECTIVES

**From**: Manager Agent  
**To**: AI/DevOps Agent  
**Priority**: HIGH  
**Date**: 2025-01-14  

## 📋 CURRENT STATUS ASSESSMENT

✅ **EXCELLENT FOUNDATION**:
- Comprehensive README and service architecture complete
- API specifications and mental health policies documented
- Integration patterns with backend defined

🚀 **READY FOR IMPLEMENTATION**: Begin Flask service development immediately

---

## 🎯 **IMMEDIATE PRIORITY: CONTENT MODERATION SERVICE**

### **PHASE 1: CORE SERVICE IMPLEMENTATION (TODAY)**

**1. Flask API Foundation**
```python
# ai-content-moderation/api.py
from flask import Flask, request, jsonify
from moderation_engine import ModerationEngine
from config import Config

app = Flask(__name__)
engine = ModerationEngine()

@app.route('/health')
def health_check():
    # Implement health checking for Ollama and models
    pass

@app.route('/api/v1/classify', methods=['POST'])
def classify_content():
    # Implement content classification endpoint
    pass
```

**2. Ollama Integration**
```python
# ai-content-moderation/models/embeddings.py
import requests
import json

class OllamaEmbeddings:
    def __init__(self, host="http://localhost:11434", model="mxbai-embed-large"):
        self.host = host
        self.model = model
    
    def get_embedding(self, text: str):
        # Implement mxbai-embed-large integration
        pass
    
    def health_check(self):
        # Verify Ollama connection and model availability
        pass
```

**3. Basic Classification Engine**
```python
# ai-content-moderation/moderation_engine.py
class ModerationEngine:
    def __init__(self):
        self.embeddings = OllamaEmbeddings()
        self.classifier = None  # Will load trained model
    
    def classify_content(self, text: str, context: dict):
        # Implement core classification logic
        pass
    
    def detect_crisis(self, text: str):
        # Implement crisis detection for immediate escalation
        pass
```

---

## 📦 **DATASET PREPARATION - PARALLEL TASK**

### **IMMEDIATE DATA ACQUISITION**

**1. Download Primary Datasets**
```bash
# Create data acquisition script
# ai-content-moderation/scripts/download_datasets.py

# ToxiGen Dataset
curl -L "https://github.com/microsoft/TOXIGEN/raw/main/data/toxigen-data.jsonl" -o data/toxigen.jsonl

# DeToxy Dataset  
curl -L "https://huggingface.co/datasets/unitary/toxic-bert/raw/main/data.csv" -o data/detoxy.csv

# HatEval Dataset
curl -L "https://competitions.codalab.org/competitions/19935" -o data/hateval.zip
```

**2. Mental Health Context Dataset**
```python
# Create mental health training examples
mental_health_examples = [
    {"text": "I'm feeling really depressed today", "is_toxic": False, "is_mental_health": True},
    {"text": "Therapy has been helping me cope", "is_toxic": False, "is_mental_health": True},
    {"text": "I hate people with depression", "is_toxic": True, "is_mental_health": False},
    # Add 1000+ examples for proper training
]
```

---

## 🧠 **MODEL TRAINING PIPELINE**

### **EMBEDDING-BASED CLASSIFICATION**

**1. Feature Extraction**
```python
# ai-content-moderation/models/feature_extractor.py
def extract_features(text: str):
    # Get mxbai-embed-large embeddings
    embeddings = ollama_client.get_embedding(text)
    
    # Extract semantic features
    features = {
        'embeddings': embeddings,
        'length': len(text),
        'mental_health_keywords': count_mental_health_terms(text),
        'crisis_indicators': detect_crisis_keywords(text)
    }
    return features
```

**2. Classifier Training**
```python
# ai-content-moderation/scripts/train_classifier.py
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

def train_toxicity_classifier(training_data):
    # Extract embeddings for all training examples
    X = [extract_features(item['text']) for item in training_data]
    y = [item['is_toxic'] for item in training_data]
    
    # Train classifier
    classifier = SVC(probability=True)
    classifier.fit(X, y)
    
    return classifier
```

---

## 🚨 **CRISIS DETECTION SYSTEM**

### **IMMEDIATE ESCALATION KEYWORDS**

```python
# ai-content-moderation/crisis_detection.py
CRISIS_PATTERNS = {
    'suicide': [
        'want to die', 'kill myself', 'end my life', 'suicide',
        'not worth living', 'better off dead'
    ],
    'self_harm': [
        'cut myself', 'hurt myself', 'self harm', 'self-harm',
        'cutting', 'burning myself'
    ],
    'immediate_danger': [
        'going to hurt', 'planning to', 'have the pills',
        'wrote a note', 'say goodbye'
    ]
}

def detect_crisis_level(text: str):
    # Implement crisis detection with confidence scoring
    # Return: crisis_level, confidence, immediate_escalation_needed
    pass
```

---

## 🔧 **INTEGRATION WITH BACKEND**

### **API CLIENT FOR BACKEND**

```typescript
// mentara-api/src/common/services/moderation.service.ts
@Injectable()
export class ModerationService {
  constructor(private readonly httpService: HttpService) {}
  
  async classifyContent(
    text: string, 
    context: string, 
    userId?: string
  ): Promise<ModerationResult> {
    const response = await this.httpService.post(
      'http://localhost:5001/api/v1/classify',
      {
        text,
        context,
        user_id: userId
      }
    ).toPromise();
    
    return response.data;
  }
}
```

---

## ⚡ **PERFORMANCE REQUIREMENTS**

### **OPTIMIZATION TARGETS**

**Response Time**: <100ms per classification
- Ollama embedding generation: <50ms
- Classification inference: <30ms  
- Total processing time: <80ms

**Throughput**: 1000+ requests/minute
- Implement request batching for efficiency
- Use connection pooling for Ollama
- Cache embeddings for identical content

**Memory Management**: <2GB RAM usage
- Efficient embedding storage
- Model caching strategies
- Garbage collection optimization

---

## 🧪 **TESTING INFRASTRUCTURE**

### **COMPREHENSIVE TEST SUITE**

**1. Unit Tests**
```python
# ai-content-moderation/tests/test_classification.py
def test_toxic_content_detection():
    engine = ModerationEngine()
    result = engine.classify_content("You are an idiot", {})
    assert result['classification'] == 'toxic'
    assert result['confidence'] > 0.8

def test_mental_health_content_protection():
    engine = ModerationEngine()
    result = engine.classify_content("I'm feeling depressed", {"context": "therapy"})
    assert result['classification'] == 'safe'
    assert result['mental_health_context'] == True
```

**2. Performance Tests**
```python
# ai-content-moderation/tests/test_performance.py
def test_response_time():
    # Ensure <100ms response time
    start = time.time()
    result = engine.classify_content(test_text, {})
    end = time.time()
    assert (end - start) < 0.1  # 100ms
```

**3. Integration Tests**
```python
# Test with actual backend integration
def test_backend_integration():
    # Send request to actual backend endpoint
    # Verify moderation is called and results processed
    pass
```

---

## 📊 **PROGRESS TRACKING**

### **TODAY'S DELIVERABLES**
- [ ] Flask API foundation with health check endpoint
- [ ] Ollama integration and embedding generation
- [ ] Basic classification engine structure
- [ ] Dataset download and preparation scripts

### **TOMORROW'S TARGETS**
- [ ] Complete model training pipeline
- [ ] Crisis detection system operational
- [ ] Performance optimization to <100ms
- [ ] Integration testing with backend

---

## 🤝 **COORDINATION POINTS**

### **Backend Agent Dependencies**
- Backend needs moderation service for posts/comments integration
- API endpoints must match backend client expectations
- Error handling and response formats critical

### **Frontend Agent Requirements**
- Moderator dashboard will need service metrics
- User appeals system requires classification history
- Real-time moderation status updates

---

## 🎯 **SUCCESS CRITERIA**

### **Phase 1 Complete (Today)**
- [ ] Service responds to health checks
- [ ] Ollama integration functional
- [ ] Basic content classification working
- [ ] Crisis detection identifies obvious cases

### **Phase 2 Complete (Tomorrow)**  
- [ ] <100ms response time achieved
- [ ] 95%+ accuracy on toxic content
- [ ] <5% false positives on therapy content
- [ ] Backend integration tested and working

### **Quality Gates**
- [ ] All mental health content properly protected
- [ ] Crisis intervention triggers immediately
- [ ] Service handles 1000+ requests/minute
- [ ] Zero false positives on recovery discussions

---

## 🚨 **ESCALATION PROTOCOL**

### **Immediate Issues**
- **Ollama Connection Problems**: Check installation and model availability
- **Performance Issues**: Consider smaller models for development
- **Dataset Access**: Use publicly available alternatives if needed

### **Quality Concerns**
- **False Positives**: Immediately flag for mental health content review
- **Crisis Detection**: Test with actual crisis examples carefully
- **Integration Problems**: Coordinate with Backend Agent immediately

---

**NEXT CHECK-IN**: 4 hours - Service foundation and Ollama integration status

**Manager Agent Support**: Ready to assist with model selection, performance optimization, and integration challenges.

---

*This service is critical for platform safety. Mental health context awareness is non-negotiable.*