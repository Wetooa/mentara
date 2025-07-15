"""
Mental Health Context Classifier for Mentara AI Content Moderation
Specialized classifier for identifying mental health content and context
"""

import json
import logging
import re
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import pickle

from config import config

logger = logging.getLogger(__name__)

@dataclass
class MentalHealthResult:
    """Result structure for mental health analysis"""
    is_mental_health_content: bool
    score: float
    confidence: float
    categories: List[str]
    severity_level: str
    reasoning: str

class MentalHealthClassifier:
    """
    Specialized classifier for mental health content in therapeutic contexts
    """
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path or config.MENTAL_HEALTH_MODEL_PATH
        self.model = None
        self.vectorizer = None
        self.is_trained = False
        
        # Mental health condition categories
        self.mental_health_categories = {
            'depression': [
                'depressed', 'depression', 'sad', 'hopeless', 'worthless',
                'empty', 'numb', 'crying', 'tears', 'despair', 'melancholy'
            ],
            'anxiety': [
                'anxious', 'anxiety', 'worried', 'panic', 'fear', 'nervous',
                'overwhelmed', 'stress', 'tension', 'racing thoughts'
            ],
            'trauma': [
                'trauma', 'ptsd', 'flashbacks', 'nightmares', 'triggered',
                'abuse', 'assault', 'accident', 'combat', 'survivor'
            ],
            'eating_disorders': [
                'eating disorder', 'anorexia', 'bulimia', 'binge eating',
                'body image', 'weight', 'calories', 'purging', 'restriction'
            ],
            'substance_abuse': [
                'addiction', 'substance abuse', 'alcohol', 'drugs', 'relapse',
                'withdrawal', 'recovery', 'sobriety', 'clean', 'detox'
            ],
            'bipolar': [
                'bipolar', 'manic', 'mania', 'mood swings', 'hypomania',
                'mood disorder', 'cycling', 'elevated mood', 'grandiose'
            ],
            'ocd': [
                'ocd', 'obsessive', 'compulsive', 'intrusive thoughts',
                'rituals', 'checking', 'contamination', 'rumination'
            ],
            'adhd': [
                'adhd', 'attention deficit', 'hyperactive', 'focus',
                'concentration', 'impulsive', 'distractible', 'restless'
            ],
            'personality_disorders': [
                'personality disorder', 'borderline', 'narcissistic',
                'antisocial', 'paranoid', 'schizoid', 'avoidant'
            ],
            'psychosis': [
                'psychosis', 'schizophrenia', 'hallucinations', 'delusions',
                'paranoia', 'voices', 'reality', 'dissociation'
            ]
        }
        
        # Crisis-level indicators requiring immediate attention
        self.crisis_indicators = {
            'high': [
                'suicide', 'kill myself', 'end it all', 'better off dead',
                'want to die', 'planning to die', 'suicide plan'
            ],
            'medium': [
                'self-harm', 'cut myself', 'hurt myself', 'punish myself',
                'self-injury', 'cutting', 'burning', 'hitting myself'
            ],
            'low': [
                'hopeless', 'no point', 'give up', 'can\'t go on',
                'nothing matters', 'life is meaningless'
            ]
        }
        
        # Therapeutic context indicators
        self.therapeutic_indicators = [
            'therapy', 'therapist', 'counselor', 'psychiatrist', 'psychologist',
            'session', 'treatment', 'medication', 'diagnosis', 'mental health',
            'coping', 'strategies', 'support group', 'healing', 'recovery'
        ]
        
        # Positive indicators (recovery, progress, etc.)
        self.positive_indicators = [
            'feeling better', 'improving', 'progress', 'breakthrough',
            'hope', 'optimistic', 'grateful', 'healing', 'recovery',
            'strength', 'resilience', 'coping well', 'support'
        ]
        
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize or load the mental health classification model"""
        try:
            model_path = Path(self.model_path)
            
            if model_path.exists():
                self._load_model()
            else:
                logger.info("No pre-trained model found. Using rule-based classification.")
                self._initialize_rule_based_classifier()
            
        except Exception as e:
            logger.error(f"Failed to initialize model: {e}")
            self._initialize_rule_based_classifier()
    
    def _load_model(self):
        """Load pre-trained mental health classification model"""
        try:
            with open(f"{self.model_path}/model.pkl", 'rb') as f:
                self.model = pickle.load(f)
            
            with open(f"{self.model_path}/vectorizer.pkl", 'rb') as f:
                self.vectorizer = pickle.load(f)
            
            self.is_trained = True
            logger.info("Pre-trained mental health model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self._initialize_rule_based_classifier()
    
    def _initialize_rule_based_classifier(self):
        """Initialize rule-based classifier as fallback"""
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            stop_words='english',
            lowercase=True
        )
        
        # Create basic training data from our patterns
        training_texts = []
        training_labels = []
        
        # Positive mental health examples
        for category, keywords in self.mental_health_categories.items():
            for keyword in keywords:
                training_texts.append(f"I'm experiencing {keyword} and need help")
                training_labels.append(1)
        
        # Add therapeutic context examples
        for indicator in self.therapeutic_indicators:
            training_texts.append(f"In {indicator} we discussed my feelings")
            training_labels.append(1)
        
        # Negative examples (non-mental health content)
        negative_examples = [
            "What's the weather like today?",
            "I love pizza and movies",
            "Work was busy but good",
            "Planning a vacation next month",
            "The game was really exciting",
            "Learning new programming skills",
            "Shopping for groceries later",
            "My cat is very playful today"
        ]
        
        for example in negative_examples:
            training_texts.append(example)
            training_labels.append(0)
        
        # Train basic model
        try:
            X = self.vectorizer.fit_transform(training_texts)
            self.model = LogisticRegression(random_state=42)
            self.model.fit(X, training_labels)
            self.is_trained = True
            logger.info("Rule-based mental health classifier initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize rule-based classifier: {e}")
            self.is_trained = False
    
    def analyze_content(self, content: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Analyze content for mental health context and severity"""
        try:
            content_lower = content.lower()
            
            # Rule-based analysis
            rule_based_result = self._rule_based_analysis(content_lower)
            
            # Model-based analysis (if available)
            model_result = None
            if self.is_trained and self.model and self.vectorizer:
                model_result = self._model_based_analysis(content)
            
            # Combine results
            final_result = self._combine_results(rule_based_result, model_result, context)
            
            return {
                'is_mental_health_content': final_result.is_mental_health_content,
                'score': final_result.score,
                'confidence': final_result.confidence,
                'categories': final_result.categories,
                'severity_level': final_result.severity_level,
                'reasoning': final_result.reasoning
            }
            
        except Exception as e:
            logger.error(f"Mental health analysis failed: {e}")
            return {
                'is_mental_health_content': False,
                'score': 0.0,
                'confidence': 0.0,
                'categories': [],
                'severity_level': 'unknown',
                'reasoning': f"Analysis failed: {str(e)}"
            }
    
    def _rule_based_analysis(self, content_lower: str) -> MentalHealthResult:
        """Perform rule-based mental health content analysis"""
        detected_categories = []
        reasoning_parts = []
        max_score = 0.0
        severity_level = 'low'
        
        # Check for mental health categories
        for category, keywords in self.mental_health_categories.items():
            matches = sum(1 for keyword in keywords if keyword in content_lower)
            if matches > 0:
                detected_categories.append(category)
                category_score = min(1.0, matches * 0.3)
                max_score = max(max_score, category_score)
                reasoning_parts.append(f"{category}: {matches} matches")
        
        # Check crisis indicators
        crisis_score = 0.0
        for level, indicators in self.crisis_indicators.items():
            matches = sum(1 for indicator in indicators if indicator in content_lower)
            if matches > 0:
                if level == 'high':
                    crisis_score = 1.0
                    severity_level = 'critical'
                elif level == 'medium':
                    crisis_score = max(crisis_score, 0.8)
                    severity_level = 'high'
                elif level == 'low':
                    crisis_score = max(crisis_score, 0.6)
                    severity_level = 'medium'
                
                reasoning_parts.append(f"Crisis indicators ({level}): {matches} matches")
        
        max_score = max(max_score, crisis_score)
        
        # Check therapeutic context
        therapeutic_matches = sum(1 for indicator in self.therapeutic_indicators 
                                 if indicator in content_lower)
        if therapeutic_matches > 0:
            max_score = max(max_score, 0.7)
            detected_categories.append('therapeutic_context')
            reasoning_parts.append(f"Therapeutic context: {therapeutic_matches} indicators")
        
        # Check positive indicators (might reduce urgency)
        positive_matches = sum(1 for indicator in self.positive_indicators 
                              if indicator in content_lower)
        if positive_matches > 0 and crisis_score < 0.8:
            max_score *= 0.8  # Reduce score for positive content
            detected_categories.append('positive_progress')
            reasoning_parts.append(f"Positive indicators: {positive_matches} matches")
            if severity_level == 'medium':
                severity_level = 'low'
        
        # Determine if this is mental health content
        is_mental_health = max_score > config.MENTAL_HEALTH_THRESHOLD or len(detected_categories) > 0
        
        # Calculate confidence
        confidence = min(1.0, max_score + (len(detected_categories) * 0.1))
        
        reasoning = "; ".join(reasoning_parts) if reasoning_parts else "No mental health indicators detected"
        
        return MentalHealthResult(
            is_mental_health_content=is_mental_health,
            score=max_score,
            confidence=confidence,
            categories=detected_categories,
            severity_level=severity_level,
            reasoning=reasoning
        )
    
    def _model_based_analysis(self, content: str) -> Optional[MentalHealthResult]:
        """Perform ML model-based analysis"""
        try:
            if not self.is_trained or not self.model or not self.vectorizer:
                return None
            
            # Vectorize content
            X = self.vectorizer.transform([content])
            
            # Get prediction
            prediction = self.model.predict(X)[0]
            probability = self.model.predict_proba(X)[0]
            
            # Get confidence (probability of predicted class)
            confidence = max(probability)
            score = probability[1] if len(probability) > 1 else confidence
            
            return MentalHealthResult(
                is_mental_health_content=bool(prediction),
                score=score,
                confidence=confidence,
                categories=['ml_prediction'] if prediction else [],
                severity_level='unknown',
                reasoning=f"ML model prediction: {prediction}, confidence: {confidence:.3f}"
            )
            
        except Exception as e:
            logger.error(f"Model-based analysis failed: {e}")
            return None
    
    def _combine_results(self, rule_based: MentalHealthResult, 
                        model_based: Optional[MentalHealthResult],
                        context: Optional[Dict]) -> MentalHealthResult:
        """Combine rule-based and model-based results"""
        
        # Start with rule-based result
        final_result = rule_based
        
        # Enhance with model-based result if available
        if model_based:
            # Use higher score
            final_result.score = max(rule_based.score, model_based.score)
            
            # Combine categories
            all_categories = set(rule_based.categories + model_based.categories)
            final_result.categories = list(all_categories)
            
            # Average confidence
            final_result.confidence = (rule_based.confidence + model_based.confidence) / 2
            
            # Combine reasoning
            final_result.reasoning = f"{rule_based.reasoning}; {model_based.reasoning}"
            
            # Update classification
            final_result.is_mental_health_content = (
                rule_based.is_mental_health_content or model_based.is_mental_health_content
            )
        
        # Apply context adjustments
        if context:
            user_history = context.get('user_history', {})
            is_therapy_session = context.get('is_therapy_session', False)
            
            if is_therapy_session:
                final_result.score *= 1.2  # Boost score in therapy context
                final_result.categories.append('therapy_session')
            
            if user_history.get('mental_health_diagnosis'):
                final_result.score *= 1.1  # Boost for users with known conditions
                final_result.categories.append('diagnosed_user')
        
        # Ensure bounds
        final_result.score = min(1.0, final_result.score)
        final_result.confidence = min(1.0, final_result.confidence)
        
        return final_result
    
    def train_model(self, training_data: List[Dict], save_model: bool = True) -> Dict[str, Any]:
        """Train the mental health classifier with new data"""
        try:
            texts = [item['text'] for item in training_data]
            labels = [item['is_mental_health'] for item in training_data]
            
            # Update vectorizer and model
            X = self.vectorizer.fit_transform(texts)
            
            self.model = LogisticRegression(random_state=42, class_weight='balanced')
            self.model.fit(X, labels)
            
            # Calculate performance metrics
            predictions = self.model.predict(X)
            report = classification_report(labels, predictions, output_dict=True)
            
            self.is_trained = True
            
            # Save model if requested
            if save_model:
                self._save_model()
            
            logger.info("Mental health classifier trained successfully")
            
            return {
                'success': True,
                'samples_trained': len(training_data),
                'accuracy': report['accuracy'],
                'precision': report['weighted avg']['precision'],
                'recall': report['weighted avg']['recall'],
                'f1_score': report['weighted avg']['f1-score']
            }
            
        except Exception as e:
            logger.error(f"Model training failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _save_model(self):
        """Save the trained model and vectorizer"""
        try:
            model_path = Path(self.model_path)
            model_path.mkdir(parents=True, exist_ok=True)
            
            with open(model_path / 'model.pkl', 'wb') as f:
                pickle.dump(self.model, f)
            
            with open(model_path / 'vectorizer.pkl', 'wb') as f:
                pickle.dump(self.vectorizer, f)
            
            logger.info(f"Model saved to {self.model_path}")
            
        except Exception as e:
            logger.error(f"Failed to save model: {e}")
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get health status of the mental health classifier"""
        return {
            'model_loaded': self.model is not None,
            'vectorizer_loaded': self.vectorizer is not None,
            'is_trained': self.is_trained,
            'model_path': self.model_path,
            'categories_count': len(self.mental_health_categories),
            'crisis_indicators_count': sum(len(indicators) for indicators in self.crisis_indicators.values())
        }