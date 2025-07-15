#!/usr/bin/env python3
"""
Simple Performance Test for AI Content Moderation Service
Quick test to measure response times and validate <100ms target
"""

import time
import requests
import statistics
from typing import List, Tuple

def test_response_time(content: str, url: str = "http://localhost:5001") -> Tuple[bool, float]:
    """Test response time for a single request"""
    start_time = time.time()
    
    try:
        response = requests.post(
            f"{url}/moderate/content",
            json={"content": content},
            timeout=5
        )
        
        end_time = time.time()
        response_time = (end_time - start_time) * 1000  # Convert to milliseconds
        
        return response.status_code == 200, response_time
        
    except Exception as e:
        end_time = time.time()
        response_time = (end_time - start_time) * 1000
        print(f"Request failed: {e}")
        return False, response_time

def test_health_endpoint(url: str = "http://localhost:5001") -> bool:
    """Test if service is healthy"""
    try:
        response = requests.get(f"{url}/health", timeout=5)
        return response.status_code in [200, 503]  # 503 is OK for degraded service
    except:
        return False

def run_performance_test():
    """Run simple performance test"""
    print("🚀 AI Content Moderation - Simple Performance Test")
    print("=" * 50)
    
    # Check if service is running
    if not test_health_endpoint():
        print("❌ Service is not running or not responding")
        print("Please start the service first:")
        print("  source venv/bin/activate && python api.py")
        return
    
    print("✅ Service is running")
    
    # Test content examples
    test_content = [
        "I feel anxious about my therapy session",
        "This is a normal message",
        "I want to hurt myself",
        "My therapist helped me today",
        "I'm feeling depressed",
        "What's the weather like?",
        "I can't take it anymore",
        "I'm making progress in therapy",
        "I feel hopeless",
        "Great day at work today"
    ]
    
    print(f"\n🔍 Testing {len(test_content)} different content types...")
    
    response_times = []
    successful_requests = 0
    failed_requests = 0
    
    for i, content in enumerate(test_content):
        print(f"Testing request {i+1}/{len(test_content)}: {content[:30]}...")
        
        success, response_time = test_response_time(content)
        response_times.append(response_time)
        
        if success:
            successful_requests += 1
            print(f"  ✅ Success: {response_time:.2f}ms")
        else:
            failed_requests += 1
            print(f"  ❌ Failed: {response_time:.2f}ms")
    
    # Calculate statistics
    if response_times:
        avg_response_time = statistics.mean(response_times)
        min_response_time = min(response_times)
        max_response_time = max(response_times)
        
        print(f"\n📊 PERFORMANCE RESULTS")
        print("=" * 50)
        print(f"Total Requests: {len(test_content)}")
        print(f"Successful: {successful_requests}")
        print(f"Failed: {failed_requests}")
        print(f"Success Rate: {(successful_requests/len(test_content)*100):.1f}%")
        print(f"Average Response Time: {avg_response_time:.2f}ms")
        print(f"Min Response Time: {min_response_time:.2f}ms")
        print(f"Max Response Time: {max_response_time:.2f}ms")
        
        # Check target
        if avg_response_time < 100:
            print(f"✅ Target <100ms: ACHIEVED ({avg_response_time:.2f}ms)")
        else:
            print(f"❌ Target <100ms: MISSED ({avg_response_time:.2f}ms)")
        
        # Response time distribution
        fast_responses = sum(1 for t in response_times if t < 100)
        slow_responses = len(response_times) - fast_responses
        
        print(f"\n🎯 Response Time Distribution:")
        print(f"Under 100ms: {fast_responses}/{len(response_times)} ({fast_responses/len(response_times)*100:.1f}%)")
        print(f"Over 100ms: {slow_responses}/{len(response_times)} ({slow_responses/len(response_times)*100:.1f}%)")
        
        if successful_requests > 0:
            print(f"\n🚀 Service is functional and processing requests!")
        else:
            print(f"\n❌ Service has issues - no successful requests")
    
    else:
        print("❌ No response times recorded")

if __name__ == "__main__":
    run_performance_test()