"""
Mentara AI Content Moderation Engine
Core moderation logic with Ollama integration for mental health platforms
"""

import hashlib
import json
import logging
import time
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass

import numpy as np
import ollama
from sklearn.metrics.pairwise import cosine_similarity
import redis

from config import config

logger = logging.getLogger(__name__)

@dataclass
class ToxicityResult:
    """Result structure for toxicity analysis"""
    score: float
    categories: List[str]
    confidence: float
    reasoning: str
    embedding_similarity: float

@dataclass
class ModerationDecision:
    """Final moderation decision structure"""
    is_toxic: bool
    action: str
    confidence: float
    requires_human_review: bool
    reasoning: str

class ModerationEngine:
    """
    Core moderation engine using Ollama embeddings and custom toxicity detection
    """
    
    def __init__(self, ollama_host: str, model_name: str, redis_client=None):
        self.ollama_host = ollama_host
        self.model_name = model_name
        self.redis_client = redis_client
        self.ollama_client = None
        
        # Initialize toxicity patterns for mental health contexts
        self.toxicity_patterns = {
            'harassment': [
                'hate speech', 'personal attacks', 'bullying', 'intimidation',
                'threats', 'doxxing', 'stalking', 'targeted harassment'
            ],
            'hate_speech': [
                'racial slurs', 'discriminatory language', 'prejudiced statements',
                'bigotry', 'xenophobia', 'homophobia', 'transphobia'
            ],
            'violence': [
                'violent threats', 'graphic violence', 'weapon mentions',
                'physical harm', 'assault descriptions', 'murder threats'
            ],
            'self_harm': [
                'suicide ideation', 'self-injury', 'cutting', 'overdose',
                'suicide methods', 'self-destruction', 'harmful behaviors'
            ],
            'sexual_content': [
                'explicit sexual content', 'sexual harassment', 'inappropriate advances',
                'sexual violence', 'non-consensual content', 'sexual exploitation'
            ],
            'spam': [
                'repetitive content', 'promotional spam', 'irrelevant links',
                'bot-like behavior', 'mass posting', 'commercial spam'
            ]
        }
        
        # Mental health crisis keywords requiring immediate review
        self.crisis_indicators = config.CRISIS_KEYWORDS
        
        # Therapeutic context indicators that may affect moderation
        self.therapeutic_contexts = config.THERAPEUTIC_CONTEXTS
        
        self._initialize_ollama()
        self._load_toxicity_embeddings()
    
    def _initialize_ollama(self):
        """Initialize Ollama client connection"""
        try:
            self.ollama_client = ollama.Client(host=self.ollama_host)
            
            # Test connection and model availability
            models = self.ollama_client.list()
            available_models = [m['name'] for m in models.get('models', [])]
            
            if self.model_name not in available_models:
                logger.warning(f"Model {self.model_name} not found. Available: {available_models}")
                # Attempt to pull the model
                try:
                    logger.info(f"Pulling model {self.model_name}...")
                    self.ollama_client.pull(self.model_name)
                    logger.info(f"Successfully pulled model {self.model_name}")
                except Exception as e:
                    logger.error(f"Failed to pull model {self.model_name}: {e}")
                    raise
            
            logger.info("Ollama client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Ollama client: {e}")
            raise
    
    def _load_toxicity_embeddings(self):
        """Pre-compute embeddings for toxicity patterns"""
        try:
            self.toxicity_embeddings = {}
            
            for category, patterns in self.toxicity_patterns.items():
                category_embeddings = []
                
                for pattern in patterns:
                    # Check cache first
                    cache_key = f"embedding:{hashlib.md5(pattern.encode()).hexdigest()}"
                    
                    if self.redis_client:
                        cached_embedding = self.redis_client.get(cache_key)
                        if cached_embedding:
                            embedding = json.loads(cached_embedding)
                            category_embeddings.append(embedding)
                            continue
                    
                    # Generate new embedding
                    try:
                        response = self.ollama_client.embeddings(
                            model=self.model_name,
                            prompt=pattern
                        )
                        embedding = response['embedding']
                        category_embeddings.append(embedding)
                        
                        # Cache the embedding
                        if self.redis_client:
                            self.redis_client.setex(
                                cache_key,
                                config.CACHE_TTL,
                                json.dumps(embedding)
                            )
                    
                    except Exception as e:
                        logger.warning(f"Failed to generate embedding for pattern '{pattern}': {e}")
                        continue
                
                if category_embeddings:
                    # Average embeddings for the category
                    self.toxicity_embeddings[category] = np.mean(category_embeddings, axis=0).tolist()
                    logger.info(f"Loaded {len(category_embeddings)} embeddings for category '{category}'")
            
            logger.info(f"Toxicity embeddings loaded for {len(self.toxicity_embeddings)} categories")
            
        except Exception as e:
            logger.error(f"Failed to load toxicity embeddings: {e}")
            self.toxicity_embeddings = {}
    
    def generate_embeddings(self, content: str) -> List[float]:
        """Generate embeddings for content using Ollama"""
        try:
            # Check cache first
            content_hash = hashlib.md5(content.encode()).hexdigest()
            cache_key = f"embedding:{content_hash}"
            
            if self.redis_client:
                cached_embedding = self.redis_client.get(cache_key)
                if cached_embedding:
                    return json.loads(cached_embedding)
            
            # Generate new embedding
            response = self.ollama_client.embeddings(
                model=self.model_name,
                prompt=content
            )
            
            embedding = response['embedding']
            
            # Cache the result
            if self.redis_client:
                self.redis_client.setex(
                    cache_key,
                    config.CACHE_TTL,
                    json.dumps(embedding)
                )
            
            return embedding
            
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            # Return zero vector as fallback
            return [0.0] * 1024  # mxbai-embed-large dimension
    
    def analyze_toxicity(self, content: str, embeddings: List[float]) -> ToxicityResult:
        """Analyze content for toxicity using embeddings and pattern matching"""
        try:
            content_lower = content.lower()
            detected_categories = []
            max_similarity = 0.0
            reasoning_parts = []
            
            # Check for crisis indicators first
            crisis_detected = any(keyword in content_lower for keyword in self.crisis_indicators)
            if crisis_detected:
                detected_categories.append('crisis')
                reasoning_parts.append("Crisis indicators detected")
            
            # Check embedding similarities with toxicity patterns
            if self.toxicity_embeddings and embeddings:
                content_embedding = np.array(embeddings).reshape(1, -1)
                
                for category, pattern_embedding in self.toxicity_embeddings.items():
                    pattern_embedding = np.array(pattern_embedding).reshape(1, -1)
                    
                    similarity = cosine_similarity(content_embedding, pattern_embedding)[0][0]
                    
                    # Use different thresholds for different categories
                    threshold = config.TOXICITY_THRESHOLD
                    if category in ['self_harm', 'violence']:
                        threshold = 0.6  # Lower threshold for harmful content
                    
                    if similarity > threshold:
                        detected_categories.append(category)
                        max_similarity = max(max_similarity, similarity)
                        reasoning_parts.append(f"{category} similarity: {similarity:.3f}")
            
            # Calculate overall toxicity score
            base_score = max_similarity
            
            # Boost score for crisis content
            if crisis_detected:
                base_score = max(base_score, 0.9)
            
            # Adjust for therapeutic context
            therapeutic_context = any(context in content_lower for context in self.therapeutic_contexts)
            if therapeutic_context and not crisis_detected:
                base_score *= 0.7  # Reduce score for therapeutic discussions
                reasoning_parts.append("Therapeutic context adjustment applied")
            
            # Determine confidence based on multiple signals
            confidence = min(1.0, base_score + (len(detected_categories) * 0.1))
            
            reasoning = "; ".join(reasoning_parts) if reasoning_parts else "No toxicity indicators found"
            
            return ToxicityResult(
                score=base_score,
                categories=detected_categories,
                confidence=confidence,
                reasoning=reasoning,
                embedding_similarity=max_similarity
            )
            
        except Exception as e:
            logger.error(f"Toxicity analysis failed: {e}")
            return ToxicityResult(
                score=0.0,
                categories=[],
                confidence=0.0,
                reasoning=f"Analysis failed: {str(e)}",
                embedding_similarity=0.0
            )
    
    def make_decision(self, toxicity_result: ToxicityResult, mental_health_result: Dict, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Make final moderation decision based on all analysis results"""
        try:
            # Extract mental health analysis
            is_mental_health_content = mental_health_result.get('is_mental_health_content', False)
            mental_health_score = mental_health_result.get('score', 0.0)
            
            # Determine if content is toxic
            is_toxic = toxicity_result.score > config.TOXICITY_THRESHOLD
            
            # Crisis content always requires immediate action
            has_crisis = 'crisis' in toxicity_result.categories or 'self_harm' in toxicity_result.categories
            
            # Determine action
            action = "allow"
            requires_human_review = False
            reasoning_parts = []
            
            if has_crisis:
                action = "block"
                requires_human_review = True
                reasoning_parts.append("Crisis content detected - immediate intervention required")
            
            elif is_toxic and toxicity_result.score > 0.8:
                action = "block"
                reasoning_parts.append(f"High toxicity score: {toxicity_result.score:.3f}")
            
            elif is_toxic and toxicity_result.score > config.TOXICITY_THRESHOLD:
                if is_mental_health_content:
                    action = "review"
                    requires_human_review = True
                    reasoning_parts.append("Toxic content in mental health context - human review required")
                else:
                    action = "block"
                    reasoning_parts.append("Toxicity threshold exceeded")
            
            elif is_mental_health_content and mental_health_score > 0.7:
                requires_human_review = True
                reasoning_parts.append("High-sensitivity mental health content flagged for review")
            
            # Adjust confidence based on context
            confidence = min(toxicity_result.confidence, config.CONFIDENCE_THRESHOLD)
            
            if is_mental_health_content:
                confidence *= 0.9  # Slightly reduce confidence for mental health content
            
            # Final reasoning
            reasoning = "; ".join(reasoning_parts) if reasoning_parts else "Content approved - no policy violations"
            
            return {
                'is_toxic': is_toxic,
                'action': action,
                'confidence': confidence,
                'requires_human_review': requires_human_review,
                'reasoning': reasoning,
                'mental_health_context': is_mental_health_content,
                'toxicity_score': toxicity_result.score,
                'categories': toxicity_result.categories
            }
            
        except Exception as e:
            logger.error(f"Decision making failed: {e}")
            return {
                'is_toxic': False,
                'action': 'review',
                'confidence': 0.0,
                'requires_human_review': True,
                'reasoning': f"Decision error: {str(e)}",
                'mental_health_context': False,
                'toxicity_score': 0.0,
                'categories': []
            }
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get health status of the moderation engine"""
        try:
            status = {
                'ollama_connected': False,
                'model_available': False,
                'embeddings_loaded': False,
                'redis_connected': False
            }
            
            # Check Ollama connection
            try:
                models = self.ollama_client.list()
                status['ollama_connected'] = True
                
                available_models = [m['name'] for m in models.get('models', [])]
                status['model_available'] = self.model_name in available_models
            except:
                pass
            
            # Check embeddings
            status['embeddings_loaded'] = len(self.toxicity_embeddings) > 0
            
            # Check Redis
            if self.redis_client:
                try:
                    self.redis_client.ping()
                    status['redis_connected'] = True
                except:
                    pass
            
            return status
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {'error': str(e)}