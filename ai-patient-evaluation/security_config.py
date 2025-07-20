"""
Mentara AI Service Security Configuration
HIPAA Compliance and Security Hardening
"""

import os
import secrets
import hashlib
import time
from functools import wraps
from flask import request, jsonify
import logging

# Security Configuration
SECURITY_CONFIG = {
    'API_KEY_LENGTH': 32,
    'MAX_REQUESTS_PER_MINUTE': 60,
    'MAX_REQUESTS_PER_HOUR': 1000,
    'REQUEST_TIMEOUT_SECONDS': 30,
    'MAX_INPUT_LENGTH': 201,
    'ALLOWED_INPUT_RANGE': (-10, 10),  # Reasonable range for questionnaire responses
    'RATE_LIMIT_STORAGE': {},
    'API_KEYS': set(),  # Store valid API keys
}

# Generate secure API key
def generate_api_key():
    """Generate a cryptographically secure API key"""
    return secrets.token_urlsafe(SECURITY_CONFIG['API_KEY_LENGTH'])

# Input validation decorator
def validate_input(f):
    """Decorator to validate input data for security"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            data = request.get_json()
            
            # Check if data exists
            if not data or 'inputs' not in data:
                return jsonify({'error': 'Missing required inputs field'}), 400
            
            inputs = data['inputs']
            
            # Validate input type
            if not isinstance(inputs, list):
                return jsonify({'error': 'Inputs must be a list'}), 400
            
            # Validate input length
            if len(inputs) != SECURITY_CONFIG['MAX_INPUT_LENGTH']:
                return jsonify({'error': f'Inputs must contain exactly {SECURITY_CONFIG["MAX_INPUT_LENGTH"]} values'}), 400
            
            # Validate input values
            for i, value in enumerate(inputs):
                if not isinstance(value, (int, float)):
                    return jsonify({'error': f'Input at index {i} must be numeric'}), 400
                
                min_val, max_val = SECURITY_CONFIG['ALLOWED_INPUT_RANGE']
                if not (min_val <= value <= max_val):
                    return jsonify({'error': f'Input at index {i} out of allowed range ({min_val} to {max_val})'}), 400
            
            return f(*args, **kwargs)
            
        except Exception as e:
            logging.error(f"Input validation error: {str(e)}")
            return jsonify({'error': 'Invalid input format'}), 400
    
    return decorated_function

# Rate limiting decorator
def rate_limit(max_per_minute=60):
    """Rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            client_ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr)
            current_time = time.time()
            
            # Clean old entries
            cutoff_time = current_time - 60  # 1 minute ago
            SECURITY_CONFIG['RATE_LIMIT_STORAGE'] = {
                ip: timestamps for ip, timestamps in SECURITY_CONFIG['RATE_LIMIT_STORAGE'].items()
                if any(t > cutoff_time for t in timestamps)
            }
            
            # Update current client's timestamps
            if client_ip not in SECURITY_CONFIG['RATE_LIMIT_STORAGE']:
                SECURITY_CONFIG['RATE_LIMIT_STORAGE'][client_ip] = []
            
            # Remove old timestamps for this client
            SECURITY_CONFIG['RATE_LIMIT_STORAGE'][client_ip] = [
                t for t in SECURITY_CONFIG['RATE_LIMIT_STORAGE'][client_ip] if t > cutoff_time
            ]
            
            # Check rate limit
            if len(SECURITY_CONFIG['RATE_LIMIT_STORAGE'][client_ip]) >= max_per_minute:
                return jsonify({'error': 'Rate limit exceeded. Try again later.'}), 429
            
            # Add current request timestamp
            SECURITY_CONFIG['RATE_LIMIT_STORAGE'][client_ip].append(current_time)
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

# API key authentication decorator
def require_api_key(f):
    """Decorator to require API key authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            return jsonify({'error': 'API key required'}), 401
        
        # In production, this should check against a secure database
        # For now, we'll use environment variable or secure storage
        valid_api_key = os.environ.get('MENTARA_AI_API_KEY')
        
        if not valid_api_key or api_key != valid_api_key:
            return jsonify({'error': 'Invalid API key'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

# Security headers middleware
def add_security_headers(response):
    """Add security headers to all responses"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

# Input sanitization
def sanitize_input(value):
    """Sanitize input values"""
    if isinstance(value, str):
        # Remove any potentially dangerous characters
        return ''.join(c for c in value if c.isalnum() or c in '.-')
    return value

# Audit logging
def log_api_access(endpoint, client_ip, status_code, response_time=None):
    """Log API access for audit purposes"""
    log_entry = {
        'timestamp': time.time(),
        'endpoint': endpoint,
        'client_ip': client_ip,
        'status_code': status_code,
        'response_time': response_time
    }
    
    # In production, this should go to a secure audit log
    logging.info(f"API_AUDIT: {log_entry}")

# Initialize security
def init_security():
    """Initialize security configuration"""
    # Generate API key if not exists
    if not os.environ.get('MENTARA_AI_API_KEY'):
        api_key = generate_api_key()
        print(f"Generated API key: {api_key}")
        print("Please set MENTARA_AI_API_KEY environment variable")
    
    print("🔒 Security configuration initialized")
