"""
Performance and load testing for Mental Health AI Prediction Service
"""
import pytest
import time
import json
import threading
import statistics
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api import app


class TestPerformance:
    """Performance testing for the ML service"""
    
    @pytest.fixture
    def client(self):
        """Create a test client"""
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client
    
    @pytest.fixture
    def sample_input(self):
        """Generate sample input for testing"""
        return list(range(201))
    
    @pytest.mark.slow
    def test_prediction_latency(self, client, sample_input):
        """Test prediction response time"""
        # Warm up
        client.post('/predict', 
                   data=json.dumps({"inputs": sample_input}),
                   content_type='application/json')
        
        # Measure latency
        latencies = []
        for _ in range(10):
            start_time = time.time()
            response = client.post('/predict',
                                 data=json.dumps({"inputs": sample_input}),
                                 content_type='application/json')
            end_time = time.time()
            
            latency = (end_time - start_time) * 1000  # Convert to milliseconds
            latencies.append(latency)
            
            # Basic response validation
            assert response.status_code in [200, 503]
        
        # Analyze latency statistics
        avg_latency = statistics.mean(latencies)
        max_latency = max(latencies)
        min_latency = min(latencies)
        
        print(f"\nLatency Statistics:")
        print(f"Average: {avg_latency:.2f}ms")
        print(f"Min: {min_latency:.2f}ms")
        print(f"Max: {max_latency:.2f}ms")
        
        # Performance assertions (adjust thresholds as needed)
        assert avg_latency < 1000, f"Average latency too high: {avg_latency}ms"
        assert max_latency < 2000, f"Max latency too high: {max_latency}ms"
    
    @pytest.mark.slow
    def test_memory_usage_stability(self, client, sample_input):
        """Test memory usage doesn't grow excessively over multiple requests"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Make multiple requests
        for i in range(100):
            response = client.post('/predict',
                                 data=json.dumps({"inputs": sample_input}),
                                 content_type='application/json')
            
            # Check every 10 requests
            if i % 10 == 0:
                current_memory = process.memory_info().rss / 1024 / 1024
                memory_growth = current_memory - initial_memory
                
                # Memory shouldn't grow more than 100MB
                assert memory_growth < 100, f"Memory growth too high: {memory_growth}MB"
    
    @pytest.mark.slow  
    def test_concurrent_requests(self, sample_input):
        """Test handling of concurrent requests"""
        def make_request():
            """Make a single request"""
            try:
                with app.test_client() as client:
                    response = client.post('/predict',
                                         data=json.dumps({"inputs": sample_input}),
                                         content_type='application/json')
                    return response.status_code, time.time()
            except Exception as e:
                return None, time.time()
        
        # Test with multiple concurrent threads
        num_threads = 5
        requests_per_thread = 10
        
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            futures = []
            
            # Submit all requests
            for _ in range(num_threads * requests_per_thread):
                future = executor.submit(make_request)
                futures.append(future)
            
            # Collect results
            successful_requests = 0
            failed_requests = 0
            
            for future in as_completed(futures):
                status_code, request_time = future.result()
                if status_code in [200, 503]:  # 503 is acceptable if model not loaded
                    successful_requests += 1
                else:
                    failed_requests += 1
        
        end_time = time.time()
        total_time = end_time - start_time
        
        print(f"\nConcurrency Test Results:")
        print(f"Total requests: {num_threads * requests_per_thread}")
        print(f"Successful: {successful_requests}")
        print(f"Failed: {failed_requests}")
        print(f"Total time: {total_time:.2f}s")
        print(f"Requests per second: {(successful_requests + failed_requests) / total_time:.2f}")
        
        # At least 80% of requests should succeed
        success_rate = successful_requests / (successful_requests + failed_requests)
        assert success_rate >= 0.8, f"Success rate too low: {success_rate:.2%}"


class TestLoadTesting:
    """Load testing scenarios"""
    
    @pytest.fixture
    def sample_input(self):
        """Generate sample input"""
        return list(range(201))
    
    @pytest.mark.slow
    def test_sustained_load(self, sample_input):
        """Test system under sustained load"""
        def worker():
            """Worker function for load testing"""
            with app.test_client() as client:
                successful = 0
                failed = 0
                
                for _ in range(20):  # Each worker makes 20 requests
                    try:
                        response = client.post('/predict',
                                             data=json.dumps({"inputs": sample_input}),
                                             content_type='application/json')
                        if response.status_code in [200, 503]:
                            successful += 1
                        else:
                            failed += 1
                    except Exception:
                        failed += 1
                
                return successful, failed
        
        # Run load test with multiple workers
        num_workers = 3
        
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=num_workers) as executor:
            futures = [executor.submit(worker) for _ in range(num_workers)]
            
            total_successful = 0
            total_failed = 0
            
            for future in as_completed(futures):
                successful, failed = future.result()
                total_successful += successful
                total_failed += failed
        
        end_time = time.time()
        total_time = end_time - start_time
        
        print(f"\nLoad Test Results:")
        print(f"Workers: {num_workers}")
        print(f"Total requests: {total_successful + total_failed}")
        print(f"Successful: {total_successful}")
        print(f"Failed: {total_failed}")
        print(f"Duration: {total_time:.2f}s")
        print(f"Throughput: {(total_successful + total_failed) / total_time:.2f} req/s")
        
        # Basic assertions
        assert total_successful > 0, "No successful requests in load test"
        success_rate = total_successful / (total_successful + total_failed)
        assert success_rate >= 0.7, f"Load test success rate too low: {success_rate:.2%}"


class TestStressScenarios:
    """Stress testing for edge cases"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client
    
    def test_rapid_sequential_requests(self, client):
        """Test rapid sequential requests"""
        sample_input = list(range(201))
        
        start_time = time.time()
        
        for i in range(50):
            response = client.post('/predict',
                                 data=json.dumps({"inputs": sample_input}),
                                 content_type='application/json')
            
            # Should get a response (even if it's an error)
            assert response.status_code in [200, 400, 503]
        
        end_time = time.time()
        print(f"\nRapid requests completed in {end_time - start_time:.2f}s")
    
    def test_large_batch_simulation(self, client):
        """Simulate processing multiple questionnaires in sequence"""
        # Create multiple different inputs
        inputs = []
        for i in range(10):
            # Generate different patterns of responses
            base_values = [i % 5] * 201
            inputs.append(base_values)
        
        successful = 0
        failed = 0
        
        for input_data in inputs:
            response = client.post('/predict',
                                 data=json.dumps({"inputs": input_data}),
                                 content_type='application/json')
            
            if response.status_code in [200, 503]:
                successful += 1
            else:
                failed += 1
        
        print(f"\nBatch processing: {successful} successful, {failed} failed")
        assert successful >= failed, "More failures than successes in batch processing"


if __name__ == '__main__':
    pytest.main([__file__, '-v', '-m', 'slow'])