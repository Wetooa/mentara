"""
Configuration management for AI Content Moderation Service
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator

class Config(BaseSettings):
    """Application configuration with environment variable support"""
    
    # Service configuration
    SERVICE_NAME: str = "ai-content-moderation"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    PORT: int = 5001
    
    # Ollama configuration
    OLLAMA_HOST: str = "http://localhost:11434"
    EMBEDDING_MODEL: str = "mxbai-embed-large:latest"
    
    # Redis configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    
    # Model paths
    MENTAL_HEALTH_MODEL_PATH: str = "./models/mental_health_classifier"
    TOXICITY_MODEL_PATH: str = "./models/toxicity_classifier"
    
    # Moderation thresholds
    TOXICITY_THRESHOLD: float = 0.7
    CONFIDENCE_THRESHOLD: float = 0.8
    MENTAL_HEALTH_THRESHOLD: float = 0.6
    
    # Performance settings
    MAX_CONTENT_LENGTH: int = 10000  # characters
    BATCH_SIZE_LIMIT: int = 100
    CACHE_TTL: int = 3600 * 24 * 7  # 7 days
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 30
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    # Security
    API_KEY_REQUIRED: bool = False
    API_KEY: Optional[str] = None
    CORS_ORIGINS: List[str] = ["*"]
    
    # Mental health specific settings
    CRISIS_KEYWORDS: List[str] = [
        "suicide", "self-harm", "kill myself", "end it all",
        "want to die", "better off dead", "hurt myself"
    ]
    
    THERAPEUTIC_CONTEXTS: List[str] = [
        "therapy", "counseling", "depression", "anxiety",
        "mental health", "therapist", "treatment", "medication"
    ]
    
    # Model fine-tuning settings
    ENABLE_MODEL_UPDATES: bool = False
    MODEL_UPDATE_THRESHOLD: int = 100  # feedback samples
    
    @validator('OLLAMA_HOST')
    def validate_ollama_host(cls, v):
        """Ensure Ollama host has proper format"""
        if not v.startswith(('http://', 'https://')):
            v = f"http://{v}"
        return v.rstrip('/')
    
    @validator('TOXICITY_THRESHOLD', 'CONFIDENCE_THRESHOLD', 'MENTAL_HEALTH_THRESHOLD')
    def validate_thresholds(cls, v):
        """Ensure thresholds are between 0 and 1"""
        if not 0 <= v <= 1:
            raise ValueError("Threshold must be between 0 and 1")
        return v
    
    @validator('MAX_CONTENT_LENGTH')
    def validate_content_length(cls, v):
        """Ensure reasonable content length limits"""
        if v < 1 or v > 50000:
            raise ValueError("Content length must be between 1 and 50000 characters")
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"
    RATE_LIMIT_PER_MINUTE: int = 100  # Higher limits for development


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG: bool = False
    API_KEY_REQUIRED: bool = True
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: List[str] = [
        "https://mentara.com",
        "https://api.mentara.com",
        "https://admin.mentara.com"
    ]


class TestingConfig(Config):
    """Testing configuration"""
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"
    REDIS_DB: int = 1  # Use different Redis DB for testing
    CACHE_TTL: int = 60  # Shorter cache for testing


def get_config() -> Config:
    """Get configuration based on environment"""
    env = os.getenv('FLASK_ENV', 'development')
    
    if env == 'production':
        return ProductionConfig()
    elif env == 'testing':
        return TestingConfig()
    else:
        return DevelopmentConfig()


# Export singleton config instance
config = get_config()