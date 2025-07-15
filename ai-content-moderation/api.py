"""
Mentara AI Content Moderation Service
Mental Health Platform Content Safety System

This Flask service provides AI-powered content moderation specifically designed 
for mental health platforms, using Ollama with mxbai-embed-large embeddings 
and specialized toxicity detection models.
"""

import os
import time
import logging
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict

from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import structlog
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import redis
from pydantic import BaseModel, validator
import ollama

from moderation_engine import ModerationEngine
from mental_health_classifier import MentalHealthClassifier
from config import Config

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Flask app initialization
app = Flask(__name__)
CORS(app)

# Configuration
config = Config()
app.config.from_object(config)

# Rate limiting
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per hour", "20 per minute"]
)
limiter.init_app(app)

# Redis connection for caching and queuing
try:
    redis_client = redis.Redis(
        host=config.REDIS_HOST,
        port=config.REDIS_PORT,
        decode_responses=True
    )
    redis_client.ping()
    logger.info("Redis connection established")
except Exception as e:
    logger.error("Redis connection failed", error=str(e))
    redis_client = None

# Prometheus metrics
moderation_requests = Counter('moderation_requests_total', 'Total moderation requests', ['endpoint', 'result'])
moderation_duration = Histogram('moderation_duration_seconds', 'Time spent on moderation requests')
model_health = Counter('model_health_checks_total', 'Model health check results', ['status'])

# Global moderation engine
moderation_engine = None
mental_health_classifier = None

@dataclass
class ModerationResult:
    """Structured moderation result"""
    content_id: str
    is_toxic: bool
    toxicity_score: float
    confidence: float
    categories: List[str]
    mental_health_context: bool
    requires_human_review: bool
    action_taken: str
    reasoning: str
    timestamp: str

class ContentRequest(BaseModel):
    """Request model for content moderation"""
    content: str
    content_type: str = "text"
    context: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = None
    
    @validator('content')
    def content_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Content cannot be empty')
        return v.strip()

class BatchContentRequest(BaseModel):
    """Request model for batch content moderation"""
    items: List[Dict[str, Any]]
    priority: str = "normal"
    
    @validator('items')
    def items_not_empty(cls, v):
        if not v or len(v) == 0:
            raise ValueError('Items list cannot be empty')
        if len(v) > 100:
            raise ValueError('Maximum 100 items per batch')
        return v

def init_models():
    """Initialize AI models and services"""
    global moderation_engine, mental_health_classifier
    
    try:
        logger.info("Initializing AI models...")
        
        # Check Ollama connection
        try:
            ollama_client = ollama.Client(host=config.OLLAMA_HOST)
            models = ollama_client.list()
            logger.info("Ollama connection established", models_count=len(models.get('models', [])))
        except Exception as e:
            logger.error("Ollama connection failed", error=str(e))
            raise
        
        # Initialize moderation engine
        moderation_engine = ModerationEngine(
            ollama_host=config.OLLAMA_HOST,
            model_name=config.EMBEDDING_MODEL,
            redis_client=redis_client
        )
        
        # Initialize mental health classifier
        mental_health_classifier = MentalHealthClassifier(
            model_path=config.MENTAL_HEALTH_MODEL_PATH
        )
        
        logger.info("AI models initialized successfully")
        
    except Exception as e:
        logger.error("Failed to initialize AI models", error=str(e))
        raise

# Initialize models at startup
with app.app_context():
    init_models()

@app.before_request
def before_request():
    """Log request start and set up request context"""
    g.start_time = time.time()
    g.request_id = f"req_{int(time.time())}_{request.remote_addr}"
    
    logger.info(
        "Request started",
        request_id=g.request_id,
        method=request.method,
        path=request.path,
        remote_addr=request.remote_addr
    )

@app.after_request
def after_request(response):
    """Log request completion"""
    duration = time.time() - g.start_time
    
    logger.info(
        "Request completed",
        request_id=g.request_id,
        status_code=response.status_code,
        duration=duration
    )
    
    return response

@app.route('/health', methods=['GET'])
def health_check():
    """Comprehensive health check endpoint"""
    try:
        health_status = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "service": "AI Content Moderation Service",
            "version": "1.0.0",
            "checks": {}
        }
        
        # Check Ollama connection
        try:
            ollama_client = ollama.Client(host=config.OLLAMA_HOST)
            models = ollama_client.list()
            health_status["checks"]["ollama"] = {
                "status": "healthy",
                "models_available": len(models.get('models', [])),
                "embedding_model": config.EMBEDDING_MODEL in [m['name'] for m in models.get('models', [])]
            }
        except Exception as e:
            health_status["checks"]["ollama"] = {
                "status": "unhealthy",
                "error": str(e)
            }
            health_status["status"] = "degraded"
        
        # Check Redis connection
        if redis_client:
            try:
                redis_client.ping()
                health_status["checks"]["redis"] = {"status": "healthy"}
            except Exception as e:
                health_status["checks"]["redis"] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
                health_status["status"] = "degraded"
        else:
            health_status["checks"]["redis"] = {"status": "not_configured"}
        
        # Check models
        if moderation_engine and mental_health_classifier:
            health_status["checks"]["models"] = {"status": "loaded"}
        else:
            health_status["checks"]["models"] = {"status": "not_loaded"}
            health_status["status"] = "unhealthy"
        
        model_health.labels(status=health_status["status"]).inc()
        
        status_code = 200 if health_status["status"] == "healthy" else 503
        return jsonify(health_status), status_code
        
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        model_health.labels(status="error").inc()
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@app.route('/moderate/content', methods=['POST'])
@limiter.limit("30 per minute")
def moderate_content():
    """Moderate a single piece of content"""
    try:
        # Validate request
        try:
            content_request = ContentRequest(**request.json)
        except Exception as e:
            moderation_requests.labels(endpoint="content", result="validation_error").inc()
            return jsonify({
                "error": "Invalid request format",
                "details": str(e)
            }), 400
        
        if not moderation_engine or not mental_health_classifier:
            moderation_requests.labels(endpoint="content", result="service_unavailable").inc()
            return jsonify({
                "error": "Moderation service not available",
                "message": "AI models not loaded"
            }), 503
        
        with moderation_duration.time():
            # Generate content embeddings
            embeddings = moderation_engine.generate_embeddings(content_request.content)
            
            # Toxicity analysis
            toxicity_result = moderation_engine.analyze_toxicity(
                content_request.content,
                embeddings
            )
            
            # Mental health context analysis
            mental_health_result = mental_health_classifier.analyze_content(
                content_request.content,
                context=content_request.context
            )
            
            # Determine final moderation decision
            moderation_decision = moderation_engine.make_decision(
                toxicity_result,
                mental_health_result,
                content_request.context
            )
            
            # Create structured result
            result = ModerationResult(
                content_id=g.request_id,
                is_toxic=moderation_decision['is_toxic'],
                toxicity_score=toxicity_result['score'],
                confidence=moderation_decision['confidence'],
                categories=toxicity_result['categories'],
                mental_health_context=mental_health_result['is_mental_health_content'],
                requires_human_review=moderation_decision['requires_human_review'],
                action_taken=moderation_decision['action'],
                reasoning=moderation_decision['reasoning'],
                timestamp=datetime.utcnow().isoformat()
            )
            
            # Cache result for appeals
            if redis_client:
                try:
                    redis_client.setex(
                        f"moderation:{result.content_id}",
                        3600 * 24 * 7,  # 7 days
                        str(asdict(result))
                    )
                except Exception as e:
                    logger.warning("Failed to cache result", error=str(e))
            
            moderation_requests.labels(endpoint="content", result="success").inc()
            
            logger.info(
                "Content moderated",
                request_id=g.request_id,
                is_toxic=result.is_toxic,
                toxicity_score=result.toxicity_score,
                mental_health_context=result.mental_health_context,
                action=result.action_taken
            )
            
            return jsonify(asdict(result))
        
    except Exception as e:
        moderation_requests.labels(endpoint="content", result="error").inc()
        logger.error("Content moderation failed", request_id=g.request_id, error=str(e))
        return jsonify({
            "error": "Moderation failed",
            "message": "Internal server error during content analysis"
        }), 500

@app.route('/moderate/batch', methods=['POST'])
@limiter.limit("5 per minute")
def moderate_batch():
    """Moderate multiple pieces of content in batch"""
    try:
        # Validate request
        try:
            batch_request = BatchContentRequest(**request.json)
        except Exception as e:
            moderation_requests.labels(endpoint="batch", result="validation_error").inc()
            return jsonify({
                "error": "Invalid batch request format",
                "details": str(e)
            }), 400
        
        if not moderation_engine or not mental_health_classifier:
            moderation_requests.labels(endpoint="batch", result="service_unavailable").inc()
            return jsonify({
                "error": "Moderation service not available"
            }), 503
        
        results = []
        
        with moderation_duration.time():
            for i, item in enumerate(batch_request.items):
                try:
                    content = item.get('content', '')
                    if not content:
                        continue
                    
                    item_id = f"{g.request_id}_item_{i}"
                    
                    # Process each item
                    embeddings = moderation_engine.generate_embeddings(content)
                    toxicity_result = moderation_engine.analyze_toxicity(content, embeddings)
                    mental_health_result = mental_health_classifier.analyze_content(content)
                    moderation_decision = moderation_engine.make_decision(
                        toxicity_result,
                        mental_health_result,
                        item.get('context')
                    )
                    
                    result = ModerationResult(
                        content_id=item_id,
                        is_toxic=moderation_decision['is_toxic'],
                        toxicity_score=toxicity_result['score'],
                        confidence=moderation_decision['confidence'],
                        categories=toxicity_result['categories'],
                        mental_health_context=mental_health_result['is_mental_health_content'],
                        requires_human_review=moderation_decision['requires_human_review'],
                        action_taken=moderation_decision['action'],
                        reasoning=moderation_decision['reasoning'],
                        timestamp=datetime.utcnow().isoformat()
                    )
                    
                    results.append(asdict(result))
                    
                except Exception as e:
                    logger.error(f"Failed to process batch item {i}", error=str(e))
                    results.append({
                        "content_id": f"{g.request_id}_item_{i}",
                        "error": "Processing failed",
                        "details": str(e)
                    })
        
        moderation_requests.labels(endpoint="batch", result="success").inc()
        
        return jsonify({
            "batch_id": g.request_id,
            "total_items": len(batch_request.items),
            "processed_items": len(results),
            "results": results,
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        moderation_requests.labels(endpoint="batch", result="error").inc()
        logger.error("Batch moderation failed", request_id=g.request_id, error=str(e))
        return jsonify({
            "error": "Batch moderation failed",
            "message": str(e)
        }), 500

@app.route('/moderate/status/<content_id>', methods=['GET'])
def get_moderation_status(content_id):
    """Get moderation status for specific content"""
    try:
        if not redis_client:
            return jsonify({"error": "Status tracking not available"}), 503
        
        result = redis_client.get(f"moderation:{content_id}")
        if not result:
            return jsonify({"error": "Content not found"}), 404
        
        return jsonify(eval(result))  # Note: In production, use proper serialization
        
    except Exception as e:
        logger.error("Failed to get moderation status", content_id=content_id, error=str(e))
        return jsonify({"error": "Failed to retrieve status"}), 500

@app.route('/metrics', methods=['GET'])
def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}

@app.route('/', methods=['GET'])
def service_info():
    """Service information endpoint"""
    return jsonify({
        "service": "Mentara AI Content Moderation",
        "version": "1.0.0",
        "description": "Mental health platform content safety system",
        "endpoints": {
            "/health": "GET - Service health check",
            "/moderate/content": "POST - Moderate single content",
            "/moderate/batch": "POST - Moderate multiple content items",
            "/moderate/status/<id>": "GET - Get moderation status",
            "/metrics": "GET - Prometheus metrics",
            "/": "GET - Service information"
        },
        "features": [
            "AI-powered toxicity detection",
            "Mental health context awareness",
            "Ollama embedding integration",
            "Human review flagging",
            "Performance monitoring"
        ],
        "models": {
            "embedding_model": config.EMBEDDING_MODEL,
            "mental_health_classifier": "specialized_mental_health_v1"
        }
    })

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "error": "Endpoint not found",
        "message": "The requested endpoint does not exist"
    }), 404

@app.errorhandler(429)
def rate_limit_handler(error):
    """Handle rate limit errors"""
    return jsonify({
        "error": "Rate limit exceeded",
        "message": "Too many requests. Please try again later."
    }), 429

@app.errorhandler(500)
def internal_error(error):
    """Handle internal server errors"""
    logger.error("Internal server error", error=str(error))
    return jsonify({
        "error": "Internal server error",
        "message": "An unexpected error occurred"
    }), 500

if __name__ == '__main__':
    # Development server
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(
        "Starting AI Content Moderation Service",
        port=port,
        debug=debug,
        ollama_host=config.OLLAMA_HOST,
        embedding_model=config.EMBEDDING_MODEL
    )
    
    app.run(host='0.0.0.0', port=port, debug=debug)