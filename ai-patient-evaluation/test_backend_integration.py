"""
Backend integration tests for AI service
Tests the NestJS backend integration with the ML service
"""
import pytest
import requests
import json
import time
from concurrent.futures import ThreadPoolExecutor
import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api import app


class TestBackendIntegration:
    """Test backend integration scenarios"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client
    
    @pytest.fixture
    def sample_assessment_data(self):
        """Sample pre-assessment data that backend would send"""
        # Simulate flattened questionnaire responses
        return {
            "inputs": [
                # PHQ (0-14): Depression questionnaire
                2, 1, 3, 2, 1, 0, 2, 3, 1, 2, 0, 1, 2, 1, 3,
                # ASRS (15-32): ADHD questionnaire  
                1, 2, 1, 3, 2, 0, 1, 2, 3, 1, 2, 0, 1, 3, 2, 1, 2, 1,
                # AUDIT (33-42): Alcohol use
                0, 1, 0, 2, 1, 0, 1, 2, 0, 1,
                # BES (43-58): Binge eating
                1, 2, 1, 0, 2, 3, 1, 2, 0, 1, 2, 1, 3, 2, 1, 0,
                # DAST10 (59-68): Drug use
                0, 0, 1, 0, 2, 0, 1, 0, 1, 0,
                # GAD7 (69-75): Anxiety
                2, 3, 2, 1, 3, 2, 1,
                # ISI (76-82): Insomnia
                2, 3, 2, 1, 2, 3, 1,
                # MBI (83-104): Burnout
                2, 1, 3, 2, 1, 2, 3, 1, 2, 0, 1, 2, 3, 1, 2, 0, 1, 3, 2, 1, 2, 1,
                # MDQ (105-119): Bipolar
                1, 0, 2, 1, 0, 1, 2, 0, 1, 2, 1, 0, 2, 1, 0,
                # OCI_R (120-137): OCD
                1, 2, 1, 0, 2, 1, 3, 2, 1, 0, 2, 1, 3, 2, 1, 0, 2, 1,
                # PCL5 (138-157): PTSD
                2, 1, 3, 2, 0, 1, 2, 3, 1, 2, 0, 1, 3, 2, 1, 0, 2, 1, 3, 2,
                # PDSS (158-164): Panic disorder
                1, 2, 1, 3, 2, 1, 0,
                # PHQ9 (165-173): Depression (detailed)
                2, 1, 3, 2, 1, 2, 3, 1, 2,
                # PSS (174-183): Stress
                2, 3, 2, 1, 3, 2, 1, 3, 2, 1,
                # SPIN (184-200): Social anxiety
                2, 1, 3, 2, 1, 0, 2, 3, 1, 2, 0, 1, 3, 2, 1, 0, 2
            ]
        }
    
    def test_backend_api_contract(self, client, sample_assessment_data):
        """Test that API matches backend expectations"""
        response = client.post('/predict',
                             data=json.dumps(sample_assessment_data),
                             content_type='application/json')
        
        if response.status_code == 200:
            data = json.loads(response.data)
            
            # Verify response format expected by AiServiceClient
            assert isinstance(data, dict)
            
            # Check all expected condition names are present
            expected_conditions = [
                "Has_Phobia", "Has_Agoraphobia", "Has_BloodPhobia", "Has_SocialPhobia",
                "Has_ADHD", "Has_Alcohol_Problem", "Has_Binge_Eating", "Has_Drug_Problem",
                "Has_Anxiety", "Has_Insomnia", "Has_Burnout", "Has_Bipolar",
                "Has_OCD", "Has_Hoarding", "Has_PTSD", "Has_Panic_Disorder",
                "Has_Depression", "Has_High_Stress", "Has_Social_Anxiety"
            ]
            
            for condition in expected_conditions:
                assert condition in data, f"Missing condition: {condition}"
                assert isinstance(data[condition], bool), f"Condition {condition} should be boolean"
    
    def test_aiserviceclient_compatibility(self, client, sample_assessment_data):
        """Test compatibility with NestJS AiServiceClient expectations"""
        response = client.post('/predict',
                             data=json.dumps(sample_assessment_data),
                             content_type='application/json')
        
        # Test successful response format
        if response.status_code == 200:
            data = json.loads(response.data)
            
            # Should be able to create AiPredictionResult format
            ai_result = {
                "success": True,
                "predictions": data,
                "responseTime": 100  # This would be measured by AiServiceClient
            }
            
            assert ai_result["success"] is True
            assert "predictions" in ai_result
            assert isinstance(ai_result["predictions"], dict)
        
        # Test error response format  
        elif response.status_code in [400, 503]:
            data = json.loads(response.data)
            
            # Should have error field for AiServiceClient error handling
            assert "error" in data
            assert isinstance(data["error"], str)
    
    def test_questionnaire_flattening_validation(self, client):
        """Test validation of flattened questionnaire format"""
        # Test each questionnaire section boundary
        test_cases = [
            # Valid full questionnaire
            (list(range(201)), True),
            
            # Invalid lengths
            (list(range(200)), False),  # Too short
            (list(range(202)), False),  # Too long
            
            # Invalid data types
            (['string'] * 201, False),  # Non-numeric
            ([None] * 201, False),      # Null values
        ]
        
        for inputs, should_succeed in test_cases:
            response = client.post('/predict',
                                 data=json.dumps({"inputs": inputs}),
                                 content_type='application/json')
            
            if should_succeed:
                assert response.status_code in [200, 503], f"Expected success but got {response.status_code}"
            else:
                assert response.status_code == 400, f"Expected 400 but got {response.status_code}"
    
    def test_rate_limiting_behavior(self, client, sample_assessment_data):
        """Test rate limiting doesn't affect normal backend usage"""
        # Make multiple requests in sequence
        success_count = 0
        for i in range(10):
            response = client.post('/predict',
                                 data=json.dumps(sample_assessment_data),
                                 content_type='application/json')
            
            if response.status_code in [200, 503]:  # 503 if model not loaded
                success_count += 1
        
        # Should handle reasonable request volume
        assert success_count >= 8, f"Too many requests failed: {success_count}/10"
    
    def test_error_handling_robustness(self, client):
        """Test error handling for various backend scenarios"""
        error_test_cases = [
            # Missing data
            ({}, 400),
            
            # Wrong field name
            ({"wrong_field": list(range(201))}, 400),
            
            # Malformed JSON would be handled by Flask before reaching our code
            # Testing empty inputs
            ({"inputs": []}, 400),
            
            # Mixed data types
            ({"inputs": [1.5] * 100 + ['string'] * 101}, 400),
        ]
        
        for test_data, expected_status in error_test_cases:
            response = client.post('/predict',
                                 data=json.dumps(test_data),
                                 content_type='application/json')
            
            assert response.status_code == expected_status
            
            if response.status_code >= 400:
                data = json.loads(response.data)
                assert "error" in data
                assert isinstance(data["error"], str)
                assert len(data["error"]) > 0


class TestBackendLoadTesting:
    """Load testing for backend integration scenarios"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client
    
    @pytest.fixture
    def sample_data(self):
        """Sample assessment data"""
        return {"inputs": list(range(201))}
    
    @pytest.mark.slow
    def test_concurrent_backend_requests(self, sample_data):
        """Test handling concurrent requests from multiple backend instances"""
        def make_backend_request():
            """Simulate backend request"""
            with app.test_client() as client:
                response = client.post('/predict',
                                     data=json.dumps(sample_data),
                                     content_type='application/json')
                return response.status_code
        
        # Simulate multiple backend instances making concurrent requests
        num_concurrent = 5
        requests_per_instance = 5
        
        with ThreadPoolExecutor(max_workers=num_concurrent) as executor:
            futures = []
            
            for _ in range(num_concurrent * requests_per_instance):
                future = executor.submit(make_backend_request)
                futures.append(future)
            
            # Collect results
            success_count = 0
            for future in futures:
                status_code = future.result()
                if status_code in [200, 503]:
                    success_count += 1
        
        total_requests = num_concurrent * requests_per_instance
        success_rate = success_count / total_requests
        
        print(f"\nConcurrent backend test:")
        print(f"Total requests: {total_requests}")
        print(f"Successful: {success_count}")
        print(f"Success rate: {success_rate:.2%}")
        
        # Should handle concurrent backend requests well
        assert success_rate >= 0.8, f"Backend concurrency success rate too low: {success_rate:.2%}"
    
    @pytest.mark.slow
    def test_backend_timeout_scenarios(self, client, sample_data):
        """Test timeout handling for backend integration"""
        # Test with valid data to measure baseline response time
        start_time = time.time()
        response = client.post('/predict',
                             data=json.dumps(sample_data),
                             content_type='application/json')
        response_time = time.time() - start_time
        
        print(f"\nResponse time: {response_time:.3f}s")
        
        # Response should be fast enough for backend timeout settings
        assert response_time < 5.0, f"Response too slow for backend integration: {response_time:.3f}s"
        
        # Should get a response (even if error due to missing model)
        assert response.status_code in [200, 503]
    
    def test_memory_stability_under_load(self, client, sample_data):
        """Test memory stability under backend load"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Simulate sustained backend load
        for i in range(50):
            response = client.post('/predict',
                                 data=json.dumps(sample_data),
                                 content_type='application/json')
            
            # Check memory every 10 requests
            if i % 10 == 0:
                current_memory = process.memory_info().rss / 1024 / 1024
                memory_growth = current_memory - initial_memory
                
                print(f"Request {i}: Memory usage {current_memory:.1f}MB (+{memory_growth:.1f}MB)")
                
                # Memory shouldn't grow excessively
                assert memory_growth < 50, f"Memory growth too high: {memory_growth:.1f}MB"


class TestBackendErrorScenarios:
    """Test error scenarios specific to backend integration"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client
    
    def test_backend_service_discovery(self, client):
        """Test service discovery endpoints for backend"""
        # Test health check for backend monitoring
        response = client.get('/health')
        assert response.status_code in [200, 503]
        
        data = json.loads(response.data)
        assert 'status' in data
        assert 'model_loaded' in data
        assert 'service' in data
        
        # Test metrics endpoint for backend monitoring
        response = client.get('/metrics')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'service' in data
        assert 'requests' in data
        assert 'performance' in data
    
    def test_backend_circuit_breaker_simulation(self, client):
        """Simulate circuit breaker scenarios"""
        # Test rapid successive failures
        invalid_data = {"inputs": []}  # Invalid data
        
        failure_count = 0
        for _ in range(10):
            response = client.post('/predict',
                                 data=json.dumps(invalid_data),
                                 content_type='application/json')
            
            if response.status_code >= 400:
                failure_count += 1
        
        # Should consistently fail for invalid data
        assert failure_count == 10, "Should fail consistently for invalid data"
        
        # Service should still respond (not crash)
        response = client.get('/health')
        assert response.status_code in [200, 503]
    
    def test_backend_graceful_degradation(self, client):
        """Test graceful degradation when model unavailable"""
        # When model is not loaded, should return 503 with proper error
        valid_data = {"inputs": list(range(201))}
        
        response = client.post('/predict',
                             data=json.dumps(valid_data),
                             content_type='application/json')
        
        if response.status_code == 503:
            data = json.loads(response.data)
            assert "error" in data
            assert "Model not available" in data["error"]
            
            # Backend should be able to handle this gracefully
            assert isinstance(data["error"], str)
            assert len(data["error"]) > 0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])