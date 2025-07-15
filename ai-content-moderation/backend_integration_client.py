#!/usr/bin/env python3
"""
Backend Integration Client for AI Content Moderation Service
Creates client library for mentara-api integration
"""

import json
import logging
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
import requests
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModerationAction(Enum):
    """Moderation action types"""
    ALLOW = "allow"
    REVIEW = "review"
    BLOCK = "block"

class SeverityLevel(Enum):
    """Content severity levels"""
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class ModerationRequest:
    """Content moderation request structure"""
    content: str
    content_type: str = "text"
    user_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

@dataclass
class ModerationResponse:
    """Content moderation response structure"""
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

class ContentModerationClient:
    """Client for AI Content Moderation Service"""
    
    def __init__(self, base_url: str = "http://localhost:5001", api_key: Optional[str] = None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        
        # Set default headers
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'mentara-api-client/1.0.0'
        })
        
        if api_key:
            self.session.headers['Authorization'] = f'Bearer {api_key}'
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                     timeout: int = 30) -> requests.Response:
        """Make HTTP request to the service"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                timeout=timeout
            )
            return response
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            raise
    
    def health_check(self) -> Dict[str, Any]:
        """Check service health"""
        try:
            response = self._make_request('GET', '/health')
            return response.json()
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {'status': 'unhealthy', 'error': str(e)}
    
    def moderate_content(self, content: str, user_id: Optional[str] = None, 
                        context: Optional[Dict] = None) -> Dict[str, Any]:
        """Moderate a single piece of content"""
        request_data = {
            'content': content,
            'content_type': 'text',
            'user_id': user_id,
            'context': context
        }
        
        try:
            response = self._make_request('POST', '/moderate/content', request_data)
            
            if response.status_code == 200:
                return response.json()
            else:
                error_data = response.json() if response.content else {}
                logger.error(f"Moderation failed: {response.status_code} - {error_data}")
                return {
                    'error': True,
                    'status_code': response.status_code,
                    'message': error_data.get('message', 'Unknown error')
                }
                
        except Exception as e:
            logger.error(f"Content moderation failed: {e}")
            return {
                'error': True,
                'message': str(e)
            }
    
    def moderate_batch(self, content_items: List[Dict], priority: str = "normal") -> Dict[str, Any]:
        """Moderate multiple pieces of content in batch"""
        request_data = {
            'items': content_items,
            'priority': priority
        }
        
        try:
            response = self._make_request('POST', '/moderate/batch', request_data)
            
            if response.status_code == 200:
                return response.json()
            else:
                error_data = response.json() if response.content else {}
                logger.error(f"Batch moderation failed: {response.status_code} - {error_data}")
                return {
                    'error': True,
                    'status_code': response.status_code,
                    'message': error_data.get('message', 'Unknown error')
                }
                
        except Exception as e:
            logger.error(f"Batch moderation failed: {e}")
            return {
                'error': True,
                'message': str(e)
            }
    
    def get_moderation_status(self, content_id: str) -> Dict[str, Any]:
        """Get moderation status for specific content"""
        try:
            response = self._make_request('GET', f'/moderate/status/{content_id}')
            
            if response.status_code == 200:
                return response.json()
            else:
                error_data = response.json() if response.content else {}
                return {
                    'error': True,
                    'status_code': response.status_code,
                    'message': error_data.get('message', 'Content not found')
                }
                
        except Exception as e:
            logger.error(f"Status check failed: {e}")
            return {
                'error': True,
                'message': str(e)
            }
    
    def get_service_info(self) -> Dict[str, Any]:
        """Get service information"""
        try:
            response = self._make_request('GET', '/')
            return response.json()
        except Exception as e:
            logger.error(f"Service info failed: {e}")
            return {'error': True, 'message': str(e)}
    
    def get_metrics(self) -> str:
        """Get Prometheus metrics"""
        try:
            response = self._make_request('GET', '/metrics')
            return response.text
        except Exception as e:
            logger.error(f"Metrics failed: {e}")
            return f"Error: {str(e)}"

class MentaraContentModerationIntegration:
    """Integration wrapper for Mentara API"""
    
    def __init__(self, moderation_client: ContentModerationClient):
        self.client = moderation_client
    
    def moderate_post(self, post_content: str, user_id: str, community_id: str) -> Dict[str, Any]:
        """Moderate a community post"""
        context = {
            'content_type': 'community_post',
            'community_id': community_id,
            'user_id': user_id,
            'is_therapy_session': False
        }
        
        result = self.client.moderate_content(post_content, user_id, context)
        
        if result.get('error'):
            return result
        
        # Transform response for Mentara API
        return {
            'is_approved': result.get('action_taken') == 'allow',
            'requires_review': result.get('requires_human_review', False),
            'toxicity_score': result.get('toxicity_score', 0.0),
            'mental_health_context': result.get('mental_health_context', False),
            'categories': result.get('categories', []),
            'reasoning': result.get('reasoning', ''),
            'moderation_id': result.get('content_id')
        }
    
    def moderate_comment(self, comment_content: str, user_id: str, post_id: str) -> Dict[str, Any]:
        """Moderate a comment"""
        context = {
            'content_type': 'comment',
            'post_id': post_id,
            'user_id': user_id,
            'is_therapy_session': False
        }
        
        result = self.client.moderate_content(comment_content, user_id, context)
        
        if result.get('error'):
            return result
        
        return {
            'is_approved': result.get('action_taken') == 'allow',
            'requires_review': result.get('requires_human_review', False),
            'toxicity_score': result.get('toxicity_score', 0.0),
            'mental_health_context': result.get('mental_health_context', False),
            'categories': result.get('categories', []),
            'reasoning': result.get('reasoning', ''),
            'moderation_id': result.get('content_id')
        }
    
    def moderate_message(self, message_content: str, sender_id: str, 
                        receiver_id: str, is_therapy_session: bool = False) -> Dict[str, Any]:
        """Moderate a private message"""
        context = {
            'content_type': 'private_message',
            'sender_id': sender_id,
            'receiver_id': receiver_id,
            'is_therapy_session': is_therapy_session
        }
        
        result = self.client.moderate_content(message_content, sender_id, context)
        
        if result.get('error'):
            return result
        
        return {
            'is_approved': result.get('action_taken') == 'allow',
            'requires_review': result.get('requires_human_review', False),
            'toxicity_score': result.get('toxicity_score', 0.0),
            'mental_health_context': result.get('mental_health_context', False),
            'categories': result.get('categories', []),
            'reasoning': result.get('reasoning', ''),
            'moderation_id': result.get('content_id'),
            'crisis_detected': 'crisis' in result.get('categories', [])
        }
    
    def moderate_worksheet_submission(self, content: str, user_id: str, 
                                    worksheet_id: str) -> Dict[str, Any]:
        """Moderate a worksheet submission"""
        context = {
            'content_type': 'worksheet_submission',
            'worksheet_id': worksheet_id,
            'user_id': user_id,
            'is_therapy_session': True  # Worksheet submissions are therapeutic
        }
        
        result = self.client.moderate_content(content, user_id, context)
        
        if result.get('error'):
            return result
        
        return {
            'is_approved': result.get('action_taken') == 'allow',
            'requires_review': result.get('requires_human_review', False),
            'toxicity_score': result.get('toxicity_score', 0.0),
            'mental_health_context': result.get('mental_health_context', False),
            'categories': result.get('categories', []),
            'reasoning': result.get('reasoning', ''),
            'moderation_id': result.get('content_id'),
            'crisis_detected': 'crisis' in result.get('categories', [])
        }

def test_integration():
    """Test the integration client"""
    print("🚀 Testing AI Content Moderation Integration Client")
    print("=" * 50)
    
    # Initialize client
    client = ContentModerationClient()
    integration = MentaraContentModerationIntegration(client)
    
    # Test 1: Health check
    print("\n1. Health Check")
    health = client.health_check()
    print(f"Service Status: {health.get('status', 'unknown')}")
    
    # Test 2: Service info
    print("\n2. Service Info")
    info = client.get_service_info()
    if not info.get('error'):
        print(f"Service: {info.get('service', 'unknown')}")
        print(f"Version: {info.get('version', 'unknown')}")
    
    # Test 3: Content moderation
    print("\n3. Content Moderation Tests")
    
    test_cases = [
        ("Normal post", "I had a great day today!"),
        ("Anxious content", "I'm feeling anxious about therapy"),
        ("Crisis content", "I want to hurt myself"),
        ("Recovery content", "I'm making progress in therapy")
    ]
    
    for test_name, content in test_cases:
        print(f"\n  Testing: {test_name}")
        result = integration.moderate_post(content, "user123", "community456")
        
        if result.get('error'):
            print(f"    ❌ Error: {result.get('message')}")
        else:
            print(f"    Approved: {result.get('is_approved')}")
            print(f"    Requires Review: {result.get('requires_review')}")
            print(f"    Mental Health Context: {result.get('mental_health_context')}")
            print(f"    Categories: {result.get('categories')}")
    
    print("\n✅ Integration test completed!")

if __name__ == "__main__":
    test_integration()