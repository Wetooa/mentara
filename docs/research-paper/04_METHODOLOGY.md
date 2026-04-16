# Methodology

## 4. Methodology

### 4.1 Problem Formulation

Mental health assessment is inherently a multi-label classification problem, as individuals often present with multiple co-occurring conditions. Traditional single-label approaches fail to capture this complexity, requiring separate models for each condition and ignoring potential correlations between conditions.

**Problem Definition**:
Given a 201-dimensional feature vector **x** representing responses to standardized mental health questionnaires, predict a 19-dimensional binary vector **y** where each element indicates the presence or absence of a specific mental health condition:

**y** = [y₁, y₂, ..., y₁₉] ∈ {0, 1}¹⁹

where:
- yᵢ = 1 indicates presence of condition i
- yᵢ = 0 indicates absence of condition i

**Conditions Predicted**:
1. Phobia, 2. Agoraphobia, 3. Blood Phobia, 4. Social Phobia, 5. ADHD
6. Alcohol Problem, 7. Binge Eating, 8. Drug Problem, 9. Anxiety
10. Insomnia, 11. Burnout, 12. Bipolar Disorder, 13. OCD
14. Hoarding, 15. PTSD, 16. Panic Disorder, 17. Depression
18. High Stress, 19. Social Anxiety

### 4.2 Dataset Description

**Questionnaire Composition**:
The 201-item questionnaire integrates 14 validated mental health assessment tools:

| Assessment Tool | Index Range | Items | Purpose |
|----------------|-------------|-------|---------|
| PHQ | 0-14 | 15 | Depression screening |
| ASRS | 15-32 | 18 | ADHD assessment |
| AUDIT | 33-42 | 10 | Alcohol use screening |
| BES | 43-58 | 16 | Binge eating assessment |
| DAST-10 | 59-68 | 10 | Drug abuse screening |
| GAD-7 | 69-75 | 7 | Anxiety assessment |
| ISI | 76-82 | 7 | Insomnia severity |
| MBI | 83-104 | 22 | Burnout measurement |
| MDQ | 105-119 | 15 | Bipolar disorder screening |
| OCI-R | 120-137 | 18 | OCD assessment |
| PCL-5 | 138-157 | 20 | PTSD symptoms |
| PDSS | 158-164 | 7 | Panic disorder severity |
| PHQ-9 | 165-173 | 9 | Depression (PHQ-9 specific) |
| PSS | 174-183 | 10 | Perceived stress |
| SPIN | 184-200 | 17 | Social phobia inventory |

**Data Preprocessing**:
- **Normalization**: Questionnaire responses normalized to [0, 1] range based on each assessment tool's scoring scale
- **Missing Values**: Handled through imputation or exclusion based on assessment tool guidelines
- **Feature Engineering**: Direct mapping from questionnaire responses to input features (no feature selection)

**Training Data Characteristics**:
- **Dataset Size**: [TO BE FILLED - if available]
- **Label Distribution**: Imbalanced multi-label dataset with varying condition prevalence
- **Data Sources**: [TO BE FILLED - describe data collection methodology]

### 4.3 Neural Network Architecture

**Model Design**:
We employ a feedforward neural network with two hidden layers, designed to balance model capacity with inference speed for production deployment.

**Architecture Specification**:

```python
class MultiLabelNN(nn.Module):
    def __init__(self, input_size=201, hidden_size1=512, 
                 hidden_size2=256, dropout=0.4, output_size=19):
        super(MultiLabelNN, self).__init__()
        # Layer 1: Input → Hidden 1
        self.fc1 = nn.Linear(input_size, hidden_size1)
        # Layer 2: Hidden 1 → Hidden 2
        self.fc2 = nn.Linear(hidden_size1, hidden_size2)
        # Layer 3: Hidden 2 → Output
        self.fc3 = nn.Linear(hidden_size2, output_size)
        # Regularization
        self.dropout = nn.Dropout(dropout)
        # Activations
        self.relu = nn.ReLU()
        self.sigmoid = nn.Sigmoid()
    
    def forward(self, x):
        # Hidden layer 1
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        # Hidden layer 2
        x = self.relu(self.fc2(x))
        x = self.dropout(x)
        # Output layer
        x = self.sigmoid(self.fc3(x))
        return x
```

**Architecture Rationale**:
- **Input Layer (201)**: One neuron per questionnaire item, preserving all assessment information
- **Hidden Layer 1 (512)**: Larger capacity to learn complex patterns across multiple assessment tools
- **Hidden Layer 2 (256)**: Reduced dimensionality to capture higher-level condition representations
- **Output Layer (19)**: One neuron per condition with sigmoid activation for independent binary predictions
- **Dropout (0.4)**: Regularization to prevent overfitting, applied after each hidden layer

**Model Parameters**:
- Total parameters: ~150,000 trainable parameters
- Parameter breakdown:
  - FC1: 201 × 512 + 512 = 103,424
  - FC2: 512 × 256 + 256 = 131,328
  - FC3: 256 × 19 + 19 = 4,883
  - Total: ~239,635 parameters

### 4.4 Training Methodology

**Loss Function**:
Binary Cross-Entropy Loss (BCE) with multi-label formulation:

L(**y**, **ŷ**) = -Σᵢ [yᵢ log(ŷᵢ) + (1 - yᵢ) log(1 - ŷᵢ)]

where:
- **y** = ground truth binary vector
- **ŷ** = predicted probability vector
- i ranges over 19 conditions

**Optimization**:
- **Optimizer**: Adam optimizer [CITATION NEEDED]
- **Learning Rate**: [TO BE FILLED - if available]
- **Batch Size**: [TO BE FILLED - if available]
- **Epochs**: [TO BE FILLED - if available]
- **Early Stopping**: Based on validation loss to prevent overfitting

**Training Strategy**:
- **Data Split**: Train/validation/test split [TO BE FILLED]
- **Cross-Validation**: [TO BE FILLED - if k-fold CV used]
- **Class Balancing**: [TO BE FILLED - if techniques like weighted loss used]
- **Regularization**: Dropout (0.4) + [L2 regularization if used]

### 4.5 Feature Engineering

**Questionnaire Mapping**:
Each assessment tool's responses are directly mapped to input features:

1. **PHQ-9 (Depression)**: 9 items, each scored 0-3, mapped to indices 165-173
2. **GAD-7 (Anxiety)**: 7 items, each scored 0-3, mapped to indices 69-75
3. **ASRS (ADHD)**: 18 items, scored 0-4, mapped to indices 15-32
4. **PCL-5 (PTSD)**: 20 items, scored 0-4, mapped to indices 138-157
5. **AUDIT (Alcohol)**: 10 items, various scales, mapped to indices 33-42
6. **DAST-10 (Drugs)**: 10 items, yes/no, mapped to indices 59-68
7. **Additional Tools**: Similar direct mapping for remaining assessment tools

**Normalization Strategy**:
- Each assessment tool's responses normalized to [0, 1] based on maximum possible score
- Preserves relative severity within each assessment tool
- Enables neural network to learn cross-assessment patterns

**Feature Selection**:
- No feature selection performed - all 201 items included
- Rationale: Preserve all information from validated assessment tools
- Future work may explore feature importance analysis

### 4.6 Multi-Label Classification Approach

**Independent Binary Classification**:
Each condition is predicted independently using sigmoid activation, enabling multiple conditions to be predicted simultaneously. This approach:

- **Advantages**: 
  - Simple and interpretable
  - Allows for condition comorbidity
  - Efficient inference
- **Limitations**:
  - Does not explicitly model label correlations
  - May benefit from label correlation learning

**Threshold Selection**:
- **Default Threshold**: 0.5 (standard for binary classification)
- **Rationale**: Balanced precision-recall tradeoff
- **Future Work**: Condition-specific threshold optimization

**Label Correlation**:
While not explicitly modeled, the shared hidden representations enable the model to learn implicit correlations between conditions (e.g., depression and anxiety often co-occur).

### 4.7 Evaluation Metrics

**Multi-Label Metrics**:
- **Hamming Loss**: Average fraction of labels incorrectly predicted
- **Subset Accuracy**: Exact match of all labels (strict metric)
- **F1-Score (Micro)**: Overall F1 across all labels
- **F1-Score (Macro)**: Average F1 per label, then averaged
- **Precision/Recall per Label**: Condition-specific performance

**Per-Condition Metrics**:
- **Accuracy**: (TP + TN) / (TP + TN + FP + FN) for each condition
- **Precision**: TP / (TP + FP) for each condition
- **Recall**: TP / (TP + FN) for each condition
- **F1-Score**: 2 × (Precision × Recall) / (Precision + Recall)

**Clinical Relevance Metrics**:
- **Sensitivity**: Ability to detect true cases (recall)
- **Specificity**: Ability to correctly identify non-cases
- **Positive Predictive Value**: Probability condition present given positive prediction
- **Negative Predictive Value**: Probability condition absent given negative prediction

**Performance Metrics**:
- **Inference Latency**: Time from input to prediction (target: <1000ms)
- **Throughput**: Predictions per second
- **Model Size**: Memory footprint
- **API Response Time**: End-to-end API latency

### 4.8 Validation Strategy

**Data Validation**:
- **Train/Validation/Test Split**: [TO BE FILLED]
- **Stratification**: [TO BE FILLED - if stratified by condition prevalence]
- **Temporal Split**: [TO BE FILLED - if time-based validation used]

**Model Validation**:
- **Cross-Validation**: [TO BE FILLED - if k-fold CV used]
- **Holdout Test Set**: Final evaluation on unseen test set
- **Clinical Validation**: [TO BE FILLED - if clinician review performed]

**Hyperparameter Tuning**:
- **Grid Search / Random Search**: [TO BE FILLED]
- **Hyperparameters Tuned**: 
  - Hidden layer sizes
  - Dropout rate
  - Learning rate
  - Batch size

---

## Notes for Authors

- Fill in training dataset details if available
- Include actual training hyperparameters
- Add cross-validation results
- Include feature importance analysis if performed
- Add ablation studies if conducted
- Document any data augmentation techniques used
- Include comparison with baseline methods
