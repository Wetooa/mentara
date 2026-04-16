# Figures and Tables

## 10. Figures and Tables

### 10.1 Figure Descriptions

#### Figure 1: System Architecture Overview

**Caption**: High-level architecture of the Mentara platform showing three microservices (Frontend, Backend API, AI/ML Service) and shared infrastructure components.

**Description**:
- Three main service boxes: Frontend (Next.js), Backend API (NestJS), AI/ML Service (Python Flask)
- Arrows showing data flow between services
- Shared infrastructure layer: Database (PostgreSQL), Storage (Supabase + S3), Payment (Stripe)
- Port numbers labeled: 10001 (Frontend), 10000 (Backend), 10002 (AI/ML)
- Containerization indicated with Docker symbols

**Location**: Section 3.2 (System Architecture)

---

#### Figure 2: Neural Network Architecture Diagram

**Caption**: Architecture of the multi-label neural network showing input layer (201 neurons), two hidden layers (512 and 256 neurons), and output layer (19 neurons) with activation functions and dropout.

**Description**:
- Input layer: 201 nodes representing questionnaire items
- Hidden Layer 1: 512 nodes with ReLU activation and Dropout (0.4)
- Hidden Layer 2: 256 nodes with ReLU activation and Dropout (0.4)
- Output layer: 19 nodes with Sigmoid activation
- Arrows showing forward pass direction
- Threshold (0.5) applied to outputs for binary classification

**Location**: Section 3.7 (Neural Network Architecture) or Section 4.3 (Neural Network Architecture)

---

#### Figure 3: Assessment Data Flow Diagram

**Caption**: End-to-end data flow from user questionnaire completion through AI inference to therapist matching and results display.

**Description**:
- Flowchart showing:
  1. User completes questionnaire (Frontend)
  2. Data sent to Backend API
  3. Backend validates and normalizes data
  4. Backend calls AI/ML Service
  5. AI/ML Service performs inference
  6. Results returned to Backend
  7. Backend stores results and triggers matching
  8. Results displayed to user with therapist recommendations
- Latency annotations at each stage
- Error handling paths indicated

**Location**: Section 3.6 (Data Flow Architecture)

---

#### Figure 4: Questionnaire Mapping Visualization

**Caption**: Visualization of the 201-item questionnaire showing the mapping of 14 assessment tools to input indices.

**Description**:
- Horizontal bar chart or table showing:
  - Assessment tool names (PHQ-9, GAD-7, ASRS, etc.)
  - Index ranges (0-14, 15-32, etc.)
  - Number of items per tool
  - Color coding by assessment category
- Total of 201 items clearly indicated

**Location**: Section 4.2 (Dataset Description) or Appendix

---

#### Figure 5: Model Performance Metrics

**Caption**: Performance metrics comparison across different mental health conditions showing precision, recall, and F1-scores.

**Description**:
- Bar chart or grouped bar chart showing:
  - X-axis: 19 mental health conditions
  - Y-axis: Performance metric (0-1 scale)
  - Multiple bars per condition: Precision, Recall, F1-Score
  - Color coding for different metrics
  - Average performance line indicated

**Location**: Section 6.2 (Model Performance Metrics)

---

#### Figure 6: Inference Latency Distribution

**Caption**: Distribution of inference latency showing average, p95, and p99 percentiles for the AI/ML service.

**Description**:
- Histogram or box plot showing:
  - X-axis: Latency (milliseconds)
  - Y-axis: Frequency or density
  - Vertical lines indicating percentiles (p50, p95, p99)
  - Target threshold (<1000ms) marked
  - Normal distribution curve overlay (if applicable)

**Location**: Section 6.3 (Inference Performance)

---

#### Figure 7: Confusion Matrix (Example: Depression)

**Caption**: Confusion matrix for depression prediction showing true positives, false positives, true negatives, and false negatives.

**Description**:
- 2×2 matrix showing:
  - True Positive (TP): Correctly predicted depression
  - False Positive (FP): Incorrectly predicted depression
  - False Negative (FN): Missed depression cases
  - True Negative (TN): Correctly identified non-depression
- Color intensity indicating counts
- Accuracy metrics calculated and displayed

**Location**: Section 6.2 (Model Performance Metrics)

---

#### Figure 8: Therapist Matching Algorithm Flow

**Caption**: Flowchart of the therapist matching algorithm showing how AI assessment results inform therapist recommendations.

**Description**:
- Flowchart showing:
  1. Extract predicted conditions from AI assessment
  2. Build user condition profile
  3. Calculate compatibility scores:
     - Condition match score
     - Approach compatibility
     - Experience score
     - Review score
     - Logistics score
  4. Weighted combination of scores
  5. Rank and return top therapists
- Score calculation formulas indicated
- Weight values shown

**Location**: Section 3.6 (Data Flow Architecture) or Section 5.8 (Integration with Therapist Matching)

---

#### Figure 9: Microservices Deployment Diagram

**Caption**: Docker container deployment diagram showing three services, networking, and shared resources.

**Description**:
- Container diagram showing:
  - Three Docker containers (Frontend, Backend, AI/ML)
  - Network connections between containers
  - External services (Database, Storage, Payment)
  - Port mappings
  - Volume mounts for model files
  - Health check endpoints

**Location**: Section 3.8 (Scalability and Deployment) or Section 5.9 (Deployment Configuration)

---

#### Figure 10: Comparison with Baseline Methods

**Caption**: Performance comparison of our multi-label neural network approach with baseline methods (single-label classifiers, ensemble methods).

**Description**:
- Comparison chart showing:
  - X-axis: Different methods
  - Y-axis: Performance metric (accuracy, F1-score, latency)
  - Multiple bars or lines for different metrics
  - Our method highlighted
  - Statistical significance indicators

**Location**: Section 6.7 (Comparison with Baseline Methods)

---

### 10.2 Table Descriptions

#### Table 1: Questionnaire Assessment Tools Mapping

**Caption**: Complete mapping of 14 mental health assessment tools to the 201-item questionnaire input indices.

**Content**:
| Assessment Tool | Index Range | Items | Purpose |
|----------------|-------------|-------|---------|
| PHQ | 0-14 | 15 | Depression screening |
| ASRS | 15-32 | 18 | ADHD assessment |
| AUDIT | 33-42 | 10 | Alcohol use screening |
| ... | ... | ... | ... |

**Location**: Section 4.2 (Dataset Description) or Appendix

---

#### Table 2: Predicted Mental Health Conditions

**Caption**: List of 19 mental health conditions predicted by the neural network model.

**Content**:
| # | Condition Name | Abbreviation |
|---|----------------|--------------|
| 1 | Phobia | - |
| 2 | Agoraphobia | - |
| ... | ... | ... |
| 19 | Social Anxiety | - |

**Location**: Section 4.1 (Problem Formulation) or Appendix

---

#### Table 3: Model Performance Metrics

**Caption**: Overall multi-label classification performance metrics including Hamming Loss, Subset Accuracy, and F1-scores.

**Content**:
| Metric | Value | Notes |
|--------|-------|-------|
| Hamming Loss | [VALUE] | Lower is better |
| Subset Accuracy | [VALUE] | Exact match rate |
| Micro F1-Score | [VALUE] | Overall F1 |
| Macro F1-Score | [VALUE] | Average F1 per condition |

**Location**: Section 6.2 (Model Performance Metrics)

---

#### Table 4: Per-Condition Performance Metrics

**Caption**: Detailed performance metrics (Precision, Recall, F1-Score) for each of the 19 predicted conditions.

**Content**:
| Condition | Precision | Recall | F1-Score | Support |
|-----------|----------|--------|----------|---------|
| Depression | [VALUE] | [VALUE] | [VALUE] | [VALUE] |
| Anxiety | [VALUE] | [VALUE] | [VALUE] | [VALUE] |
| ... | ... | ... | ... | ... |

**Location**: Section 6.2 (Model Performance Metrics)

---

#### Table 5: Inference Performance Metrics

**Caption**: Latency and throughput metrics for the AI/ML service in production deployment.

**Content**:
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Average Latency | <1000ms | <1000ms | ✅ Met |
| P95 Latency | <2000ms | <2000ms | ✅ Met |
| P99 Latency | [VALUE] | <3000ms | [STATUS] |
| Requests per Second | [VALUE] | - | - |

**Location**: Section 6.3 (Inference Performance)

---

#### Table 6: API Response Times

**Caption**: Response time percentiles (P50, P95, P99) for key backend API endpoints.

**Content**:
| Endpoint | P50 | P95 | P99 | Target |
|----------|-----|-----|-----|--------|
| POST /api/pre-assessment/submit | [VALUE] | <200ms | [VALUE] | <200ms |
| GET /api/therapist/recommendations | [VALUE] | <200ms | [VALUE] | <200ms |
| POST /api/auth/login | <100ms | <100ms | [VALUE] | <100ms |

**Location**: Section 6.4 (API Performance)

---

#### Table 7: End-to-End Assessment Flow Latency

**Caption**: Breakdown of latency at each stage of the assessment flow from frontend to results display.

**Content**:
| Stage | Latency | Notes |
|-------|---------|-------|
| Frontend → Backend | [VALUE] | Network + validation |
| Backend → AI Service | [VALUE] | HTTP request |
| AI Inference | <1000ms | Neural network forward pass |
| AI Service → Backend | [VALUE] | HTTP response |
| Backend Processing | [VALUE] | Database + matching |
| Backend → Frontend | [VALUE] | Network + rendering |
| **Total** | **<2000ms** | **End-to-end** |

**Location**: Section 6.4 (API Performance)

---

#### Table 8: Comparison with Baseline Methods

**Caption**: Performance comparison of our multi-label neural network with baseline approaches.

**Content**:
| Method | Accuracy | Latency | Notes |
|--------|----------|---------|-------|
| Single-Label Binary Classifiers | [VALUE] | [VALUE] | Separate model per condition |
| Ensemble Methods | [VALUE] | [VALUE] | Multiple models combined |
| Rule-Based Assessment | [VALUE] | [VALUE] | Threshold-based scoring |
| **Our Method (Multi-Label NN)** | **[VALUE]** | **<1000ms** | **Single unified model** |

**Location**: Section 6.7 (Comparison with Baseline Methods)

---

#### Table 9: Load Testing Results

**Caption**: System performance under varying concurrent user loads showing latency and error rates.

**Content**:
| Concurrent Users | Requests/sec | Avg Latency | P95 Latency | Error Rate |
|------------------|--------------|-------------|-------------|------------|
| 10 | [VALUE] | [VALUE] | [VALUE] | <1% |
| 50 | [VALUE] | [VALUE] | [VALUE] | <1% |
| 100 | [VALUE] | [VALUE] | [VALUE] | <2% |
| 500 | [VALUE] | [VALUE] | [VALUE] | [VALUE] |

**Location**: Section 6.8 (System Scalability Evaluation)

---

#### Table 10: Technology Stack Summary

**Caption**: Complete technology stack used across all three microservices.

**Content**:
| Service | Technology | Version | Purpose |
|---------|------------|---------|---------|
| Frontend | Next.js | 15.2.4 | Web framework |
| Frontend | React | 19 | UI library |
| Backend | NestJS | 11.x | API framework |
| Backend | Prisma | 6.x | ORM |
| AI/ML | Python | 3.11 | Language |
| AI/ML | PyTorch | 2.x | ML framework |
| AI/ML | Flask | 2.x | Web framework |
| Database | PostgreSQL | - | Database |
| Container | Docker | - | Containerization |

**Location**: Section 3 (System Architecture) or Appendix

---

### 10.3 Figure and Table Guidelines

**Figure Guidelines**:
- All figures should be high-resolution (300 DPI minimum)
- Use consistent color schemes and fonts
- Include figure numbers and captions
- Reference figures in text using "Figure X"
- Ensure figures are readable in both color and grayscale

**Table Guidelines**:
- Use clear column headers
- Align numeric data appropriately
- Include units where applicable
- Use consistent formatting
- Reference tables in text using "Table X"
- Keep tables concise and readable

**Accessibility**:
- Provide alt text for all figures
- Ensure color contrast meets accessibility standards
- Use patterns or textures in addition to color for differentiation
- Provide data tables as alternatives to charts where possible

---

## Notes for Authors

- Create actual figures using tools like matplotlib, plotly, or drawing software
- Generate tables from actual performance data
- Ensure all figures and tables are properly numbered and referenced
- Add figure/table numbers to the main text where they are discussed
- Consider creating interactive figures for online publication
- Include source data files for reproducibility
- Add figure/table creation scripts to repository
