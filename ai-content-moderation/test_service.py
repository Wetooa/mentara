"""
Test suite for Mentara AI Content Moderation Service
Comprehensive testing for mental health platform safety
"""

import json
import time
import requests
import pytest
from typing import Dict, List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModerationServiceTester:
    """Comprehensive test suite for the moderation service"""
    
    def __init__(self, base_url: str = "http://localhost:5001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
    
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        logger.info(f"{status}: {test_name}")
        if details:
            logger.info(f"   Details: {details}")
        
        self.test_results.append({
            'test': test_name,
            'passed': passed,
            'details': details,
            'timestamp': time.time()
        })
    
    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            
            if response.status_code == 200:
                health_data = response.json()
                checks_healthy = all(
                    check.get('status') in ['healthy', 'loaded', 'not_configured']
                    for check in health_data.get('checks', {}).values()
                )
                
                self.log_test(
                    "Health Check",
                    checks_healthy,
                    f"Status: {health_data.get('status')}"
                )
                return checks_healthy
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Health Check", False, str(e))
            return False
    
    def test_service_info(self):
        """Test service information endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            
            if response.status_code == 200:
                info = response.json()
                has_required_fields = all(
                    field in info for field in ['service', 'version', 'endpoints', 'features']
                )
                
                self.log_test(
                    "Service Info",
                    has_required_fields,
                    f"Service: {info.get('service')}, Version: {info.get('version')}"
                )
                return has_required_fields
            else:
                self.log_test("Service Info", False, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Service Info", False, str(e))
            return False
    
    def test_content_moderation_basic(self):
        """Test basic content moderation"""
        test_cases = [
            {
                "content": "Hello, I'm feeling great today!",
                "expected_toxic": False,
                "description": "Positive content"
            },
            {
                "content": "I'm struggling with depression and need help",
                "expected_toxic": False,
                "description": "Mental health disclosure"
            },
            {
                "content": "You are worthless and should kill yourself",
                "expected_toxic": True,
                "description": "Harmful content"
            },
            {
                "content": "Therapy has been really helpful for my anxiety",
                "expected_toxic": False,
                "description": "Therapeutic context"
            }
        ]
        
        for case in test_cases:
            try:
                payload = {
                    "content": case["content"],
                    "content_type": "text",
                    "context": {"test": True}
                }
                
                response = self.session.post(
                    f"{self.base_url}/moderate/content",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    is_toxic = result.get('is_toxic', False)
                    
                    test_passed = (is_toxic == case["expected_toxic"])
                    
                    self.log_test(
                        f"Content Moderation - {case['description']}",
                        test_passed,
                        f"Expected toxic: {case['expected_toxic']}, Got: {is_toxic}, Score: {result.get('toxicity_score', 0):.3f}"
                    )
                else:
                    self.log_test(
                        f"Content Moderation - {case['description']}",
                        False,
                        f"HTTP {response.status_code}: {response.text}"
                    )
                    
            except Exception as e:
                self.log_test(
                    f"Content Moderation - {case['description']}",
                    False,
                    str(e)
                )
    
    def test_mental_health_context_detection(self):
        """Test mental health context detection"""
        mental_health_content = [
            "I've been feeling depressed lately and considering therapy",
            "My anxiety has been overwhelming since the trauma",
            "The psychiatrist prescribed medication for my bipolar disorder",
            "I'm in recovery from addiction and attending support groups",
            "Having intrusive thoughts that I can't control"
        ]
        
        passed_tests = 0
        total_tests = len(mental_health_content)
        
        for content in mental_health_content:
            try:
                payload = {
                    "content": content,
                    "content_type": "text"
                }
                
                response = self.session.post(
                    f"{self.base_url}/moderate/content",
                    json=payload
                )
                
                if response.status_code == 200:
                    result = response.json()
                    detected_mh = result.get('mental_health_context', False)
                    
                    if detected_mh:
                        passed_tests += 1
                        
            except Exception as e:
                logger.error(f"Mental health detection test failed: {e}")
        
        success_rate = passed_tests / total_tests
        test_passed = success_rate >= 0.8  # Expect 80% accuracy
        
        self.log_test(
            "Mental Health Context Detection",
            test_passed,
            f"Detected {passed_tests}/{total_tests} cases ({success_rate:.1%})"
        )
        
        return test_passed
    
    def test_crisis_content_detection(self):
        """Test crisis content detection and flagging"""
        crisis_content = [
            "I want to kill myself",
            "Planning to end it all tonight",
            "Life isn't worth living anymore",
            "I'm going to hurt myself"
        ]
        
        all_flagged = True
        
        for content in crisis_content:
            try:
                payload = {
                    "content": content,
                    "content_type": "text"
                }
                
                response = self.session.post(
                    f"{self.base_url}/moderate/content",
                    json=payload
                )
                
                if response.status_code == 200:
                    result = response.json()
                    requires_review = result.get('requires_human_review', False)
                    action = result.get('action_taken', '')
                    
                    if not (requires_review or action in ['block', 'review']):
                        all_flagged = False
                        break
                else:
                    all_flagged = False
                    break
                    
            except Exception as e:
                logger.error(f"Crisis detection test failed: {e}")
                all_flagged = False
                break
        
        self.log_test(
            "Crisis Content Detection",
            all_flagged,
            "All crisis content properly flagged for review" if all_flagged else "Some crisis content not properly flagged"
        )
        
        return all_flagged
    
    def test_batch_moderation(self):
        """Test batch moderation endpoint"""
        try:
            batch_items = [
                {"content": "Hello world!", "context": {}},
                {"content": "I hate everyone", "context": {}},
                {"content": "Feeling depressed today", "context": {"therapeutic": True}},
                {"content": "Great therapy session!", "context": {}}
            ]
            
            payload = {
                "items": batch_items,
                "priority": "normal"
            }
            
            response = self.session.post(
                f"{self.base_url}/moderate/batch",
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                processed_count = result.get('processed_items', 0)
                expected_count = len(batch_items)
                
                test_passed = processed_count == expected_count
                
                self.log_test(
                    "Batch Moderation",
                    test_passed,
                    f"Processed {processed_count}/{expected_count} items"
                )
                return test_passed
            else:
                self.log_test(
                    "Batch Moderation",
                    False,
                    f"HTTP {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("Batch Moderation", False, str(e))
            return False
    
    def test_rate_limiting(self):
        """Test rate limiting functionality"""
        try:
            # Send multiple requests quickly
            responses = []
            for i in range(35):  # Should hit the 30/minute limit
                response = self.session.post(
                    f"{self.base_url}/moderate/content",
                    json={"content": f"Test message {i}"}
                )
                responses.append(response.status_code)
                
                if response.status_code == 429:
                    break
            
            # Check if rate limiting kicked in
            got_rate_limited = 429 in responses
            
            self.log_test(
                "Rate Limiting",
                got_rate_limited,
                f"Rate limit response received after {responses.count(200)} successful requests"
            )
            
            return got_rate_limited
            
        except Exception as e:
            self.log_test("Rate Limiting", False, str(e))
            return False
    
    def test_input_validation(self):
        """Test input validation and error handling"""
        invalid_inputs = [
            ({}, "Empty payload"),
            ({"content": ""}, "Empty content"),
            ({"content": "x" * 20000}, "Content too long"),
            ({"invalid_field": "test"}, "Invalid field"),
        ]
        
        validation_working = True
        
        for payload, description in invalid_inputs:
            try:
                response = self.session.post(
                    f"{self.base_url}/moderate/content",
                    json=payload
                )
                
                # Should get 400 error for invalid input
                if response.status_code != 400:
                    validation_working = False
                    logger.warning(f"Expected 400 for {description}, got {response.status_code}")
                    
            except Exception as e:
                logger.error(f"Input validation test failed for {description}: {e}")
                validation_working = False
        
        self.log_test(
            "Input Validation",
            validation_working,
            "All invalid inputs properly rejected" if validation_working else "Some invalid inputs accepted"
        )
        
        return validation_working
    
    def test_metrics_endpoint(self):
        """Test Prometheus metrics endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/metrics")
            
            if response.status_code == 200:
                metrics_data = response.text
                has_metrics = 'moderation_requests_total' in metrics_data
                
                self.log_test(
                    "Metrics Endpoint",
                    has_metrics,
                    "Prometheus metrics available"
                )
                return has_metrics
            else:
                self.log_test("Metrics Endpoint", False, f"HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Metrics Endpoint", False, str(e))
            return False
    
    def run_all_tests(self):
        """Run all tests and generate report"""
        logger.info("🧪 Starting Mentara AI Content Moderation Service Tests")
        logger.info("=" * 60)
        
        # List of all test methods
        tests = [
            self.test_health_check,
            self.test_service_info,
            self.test_content_moderation_basic,
            self.test_mental_health_context_detection,
            self.test_crisis_content_detection,
            self.test_batch_moderation,
            self.test_input_validation,
            self.test_metrics_endpoint,
            # self.test_rate_limiting,  # Commented out to avoid hitting limits during testing
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test_func in tests:
            try:
                result = test_func()
                if result:
                    passed_tests += 1
            except Exception as e:
                logger.error(f"Test {test_func.__name__} failed with exception: {e}")
        
        # Generate summary
        logger.info("=" * 60)
        logger.info("🏆 Test Summary")
        logger.info(f"Passed: {passed_tests}/{total_tests} ({passed_tests/total_tests:.1%})")
        
        if passed_tests == total_tests:
            logger.info("🎉 All tests passed! Service is ready for production.")
        elif passed_tests >= total_tests * 0.8:
            logger.info("⚠️  Most tests passed. Minor issues to address.")
        else:
            logger.info("❌ Multiple test failures. Service needs attention.")
        
        return passed_tests / total_tests

def main():
    """Main test execution"""
    tester = ModerationServiceTester()
    
    # Check if service is running
    try:
        response = requests.get("http://localhost:5001/health", timeout=5)
        if response.status_code not in [200, 503]:
            raise Exception("Service not responding")
    except Exception as e:
        logger.error("❌ Service is not running or not accessible")
        logger.error("Please start the service with: python api.py")
        return
    
    # Run tests
    success_rate = tester.run_all_tests()
    
    # Exit with appropriate code
    if success_rate >= 0.8:
        exit(0)
    else:
        exit(1)

if __name__ == "__main__":
    main()