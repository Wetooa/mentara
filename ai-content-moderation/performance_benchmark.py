#!/usr/bin/env python3
"""
Performance Benchmark and Optimization Script
Tests and optimizes AI Content Moderation Service for <100ms response time
"""

import time
import asyncio
import statistics
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
import threading
from dataclasses import dataclass
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class BenchmarkResult:
    """Benchmark result structure"""
    test_name: str
    total_requests: int
    successful_requests: int
    failed_requests: int
    avg_response_time: float
    min_response_time: float
    max_response_time: float
    p95_response_time: float
    p99_response_time: float
    requests_per_second: float
    success_rate: float

class PerformanceBenchmark:
    """Performance benchmark and optimization tool"""
    
    def __init__(self, service_url: str = "http://localhost:5001"):
        self.service_url = service_url
        self.test_content = [
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
        self.results: List[BenchmarkResult] = []
    
    def start_service(self) -> bool:
        """Start the AI content moderation service"""
        try:
            # Check if service is already running
            response = requests.get(f"{self.service_url}/health", timeout=5)
            if response.status_code in [200, 503]:
                logger.info("Service is already running")
                return True
        except:
            pass
        
        logger.info("Starting AI content moderation service...")
        
        # Start service (assuming it's already set up)
        import subprocess
        import os
        
        # Change to the service directory
        service_dir = Path(__file__).parent
        os.chdir(service_dir)
        
        # Start the service in the background
        try:
            process = subprocess.Popen([
                "python", "-m", "venv", "venv"
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            # Give it a moment to start
            time.sleep(2)
            
            # Check if service is running
            response = requests.get(f"{self.service_url}/health", timeout=5)
            return response.status_code in [200, 503]
            
        except Exception as e:
            logger.error(f"Failed to start service: {e}")
            return False
    
    def test_single_request(self, content: str) -> Tuple[bool, float, Optional[Dict]]:
        """Test a single content moderation request"""
        start_time = time.time()
        
        try:
            response = requests.post(
                f"{self.service_url}/moderate/content",
                json={"content": content},
                timeout=10
            )
            
            end_time = time.time()
            response_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            if response.status_code == 200:
                return True, response_time, response.json()
            else:
                return False, response_time, None
                
        except Exception as e:
            end_time = time.time()
            response_time = (end_time - start_time) * 1000
            logger.error(f"Request failed: {e}")
            return False, response_time, None
    
    def benchmark_sequential(self, num_requests: int = 100) -> BenchmarkResult:
        """Benchmark sequential requests"""
        logger.info(f"Running sequential benchmark with {num_requests} requests...")
        
        response_times = []
        successful_requests = 0
        failed_requests = 0
        
        start_time = time.time()
        
        for i in range(num_requests):
            content = self.test_content[i % len(self.test_content)]
            success, response_time, result = self.test_single_request(content)
            
            response_times.append(response_time)
            
            if success:
                successful_requests += 1
            else:
                failed_requests += 1
            
            # Progress indicator
            if (i + 1) % 10 == 0:
                logger.info(f"Completed {i + 1}/{num_requests} requests")
        
        end_time = time.time()
        total_time = end_time - start_time
        
        return BenchmarkResult(
            test_name="Sequential",
            total_requests=num_requests,
            successful_requests=successful_requests,
            failed_requests=failed_requests,
            avg_response_time=statistics.mean(response_times),
            min_response_time=min(response_times),
            max_response_time=max(response_times),
            p95_response_time=statistics.quantiles(response_times, n=20)[18],  # 95th percentile
            p99_response_time=statistics.quantiles(response_times, n=100)[98],  # 99th percentile
            requests_per_second=num_requests / total_time,
            success_rate=(successful_requests / num_requests) * 100
        )
    
    def benchmark_concurrent(self, num_requests: int = 100, concurrency: int = 10) -> BenchmarkResult:
        """Benchmark concurrent requests"""
        logger.info(f"Running concurrent benchmark with {num_requests} requests, concurrency {concurrency}...")
        
        response_times = []
        successful_requests = 0
        failed_requests = 0
        
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=concurrency) as executor:
            # Submit all requests
            future_to_content = {}
            for i in range(num_requests):
                content = self.test_content[i % len(self.test_content)]
                future = executor.submit(self.test_single_request, content)
                future_to_content[future] = content
            
            # Collect results
            completed = 0
            for future in as_completed(future_to_content):
                success, response_time, result = future.result()
                
                response_times.append(response_time)
                
                if success:
                    successful_requests += 1
                else:
                    failed_requests += 1
                
                completed += 1
                
                # Progress indicator
                if completed % 10 == 0:
                    logger.info(f"Completed {completed}/{num_requests} requests")
        
        end_time = time.time()
        total_time = end_time - start_time
        
        return BenchmarkResult(
            test_name=f"Concurrent ({concurrency} workers)",
            total_requests=num_requests,
            successful_requests=successful_requests,
            failed_requests=failed_requests,
            avg_response_time=statistics.mean(response_times),
            min_response_time=min(response_times),
            max_response_time=max(response_times),
            p95_response_time=statistics.quantiles(response_times, n=20)[18],  # 95th percentile
            p99_response_time=statistics.quantiles(response_times, n=100)[98],  # 99th percentile
            requests_per_second=num_requests / total_time,
            success_rate=(successful_requests / num_requests) * 100
        )
    
    def benchmark_stress_test(self, duration_seconds: int = 60, concurrency: int = 20) -> BenchmarkResult:
        """Stress test the service for a specific duration"""
        logger.info(f"Running stress test for {duration_seconds} seconds with {concurrency} workers...")
        
        response_times = []
        successful_requests = 0
        failed_requests = 0
        
        start_time = time.time()
        end_time = start_time + duration_seconds
        
        def worker():
            nonlocal successful_requests, failed_requests
            request_count = 0
            
            while time.time() < end_time:
                content = self.test_content[request_count % len(self.test_content)]
                success, response_time, result = self.test_single_request(content)
                
                response_times.append(response_time)
                
                if success:
                    successful_requests += 1
                else:
                    failed_requests += 1
                
                request_count += 1
                
                # Small delay to avoid overwhelming
                time.sleep(0.01)
        
        # Start worker threads
        threads = []
        for _ in range(concurrency):
            thread = threading.Thread(target=worker)
            thread.start()
            threads.append(thread)
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        actual_duration = time.time() - start_time
        total_requests = successful_requests + failed_requests
        
        return BenchmarkResult(
            test_name=f"Stress Test ({duration_seconds}s)",
            total_requests=total_requests,
            successful_requests=successful_requests,
            failed_requests=failed_requests,
            avg_response_time=statistics.mean(response_times) if response_times else 0,
            min_response_time=min(response_times) if response_times else 0,
            max_response_time=max(response_times) if response_times else 0,
            p95_response_time=statistics.quantiles(response_times, n=20)[18] if len(response_times) >= 20 else 0,
            p99_response_time=statistics.quantiles(response_times, n=100)[98] if len(response_times) >= 100 else 0,
            requests_per_second=total_requests / actual_duration,
            success_rate=(successful_requests / total_requests) * 100 if total_requests > 0 else 0
        )
    
    def test_specific_content_types(self) -> Dict[str, BenchmarkResult]:
        """Test performance for specific content types"""
        logger.info("Testing performance for specific content types...")
        
        content_types = {
            "crisis": [
                "I want to hurt myself",
                "I can't take it anymore",
                "What's the point of living?"
            ],
            "depression": [
                "I feel so empty inside",
                "Nothing matters anymore",
                "I've lost all hope"
            ],
            "anxiety": [
                "I'm having panic attacks",
                "I can't stop worrying",
                "My heart is racing"
            ],
            "therapeutic": [
                "My therapist said I should practice mindfulness",
                "In our session we discussed coping strategies",
                "I'm making progress in therapy"
            ],
            "general": [
                "What's the weather like today?",
                "I love this new restaurant",
                "Working on a coding project"
            ]
        }
        
        results = {}
        
        for content_type, texts in content_types.items():
            response_times = []
            successful_requests = 0
            failed_requests = 0
            
            start_time = time.time()
            
            # Test each text 10 times
            for text in texts:
                for _ in range(10):
                    success, response_time, result = self.test_single_request(text)
                    
                    response_times.append(response_time)
                    
                    if success:
                        successful_requests += 1
                    else:
                        failed_requests += 1
            
            end_time = time.time()
            total_time = end_time - start_time
            total_requests = successful_requests + failed_requests
            
            results[content_type] = BenchmarkResult(
                test_name=f"Content Type: {content_type}",
                total_requests=total_requests,
                successful_requests=successful_requests,
                failed_requests=failed_requests,
                avg_response_time=statistics.mean(response_times),
                min_response_time=min(response_times),
                max_response_time=max(response_times),
                p95_response_time=statistics.quantiles(response_times, n=20)[18] if len(response_times) >= 20 else 0,
                p99_response_time=statistics.quantiles(response_times, n=100)[98] if len(response_times) >= 100 else 0,
                requests_per_second=total_requests / total_time,
                success_rate=(successful_requests / total_requests) * 100
            )
        
        return results
    
    def run_all_benchmarks(self) -> Dict[str, BenchmarkResult]:
        """Run all benchmark tests"""
        logger.info("🚀 Starting comprehensive performance benchmarks...")
        
        results = {}
        
        # Test 1: Sequential requests
        results["sequential"] = self.benchmark_sequential(50)
        
        # Test 2: Concurrent requests (low concurrency)
        results["concurrent_low"] = self.benchmark_concurrent(50, 5)
        
        # Test 3: Concurrent requests (high concurrency)
        results["concurrent_high"] = self.benchmark_concurrent(50, 15)
        
        # Test 4: Stress test
        results["stress_test"] = self.benchmark_stress_test(30, 10)
        
        # Test 5: Content type specific tests
        content_type_results = self.test_specific_content_types()
        results.update(content_type_results)
        
        return results
    
    def generate_report(self, results: Dict[str, BenchmarkResult]) -> str:
        """Generate performance report"""
        report = []
        report.append("📊 AI Content Moderation Service - Performance Report")
        report.append("=" * 60)
        
        # Target analysis
        target_met = 0
        total_tests = 0
        
        for test_name, result in results.items():
            total_tests += 1
            
            report.append(f"\n🔍 {result.test_name}")
            report.append("-" * 40)
            report.append(f"Total Requests: {result.total_requests}")
            report.append(f"Successful: {result.successful_requests}")
            report.append(f"Failed: {result.failed_requests}")
            report.append(f"Success Rate: {result.success_rate:.1f}%")
            report.append(f"Avg Response Time: {result.avg_response_time:.2f}ms")
            report.append(f"Min Response Time: {result.min_response_time:.2f}ms")
            report.append(f"Max Response Time: {result.max_response_time:.2f}ms")
            report.append(f"P95 Response Time: {result.p95_response_time:.2f}ms")
            report.append(f"P99 Response Time: {result.p99_response_time:.2f}ms")
            report.append(f"Requests/Second: {result.requests_per_second:.2f}")
            
            # Check if target is met
            if result.avg_response_time < 100:
                report.append("✅ Target <100ms: ACHIEVED")
                target_met += 1
            else:
                report.append("❌ Target <100ms: MISSED")
        
        # Summary
        report.append(f"\n🎯 PERFORMANCE SUMMARY")
        report.append("=" * 60)
        report.append(f"Tests passing <100ms target: {target_met}/{total_tests}")
        report.append(f"Overall success rate: {target_met/total_tests*100:.1f}%")
        
        if target_met == total_tests:
            report.append("🎉 All performance targets achieved!")
        else:
            report.append("⚠️  Some tests exceed 100ms target - optimization needed")
        
        return "\n".join(report)
    
    def save_results(self, results: Dict[str, BenchmarkResult], filename: str = "performance_results.json"):
        """Save benchmark results to file"""
        # Convert results to serializable format
        serializable_results = {}
        for test_name, result in results.items():
            serializable_results[test_name] = {
                'test_name': result.test_name,
                'total_requests': result.total_requests,
                'successful_requests': result.successful_requests,
                'failed_requests': result.failed_requests,
                'avg_response_time': result.avg_response_time,
                'min_response_time': result.min_response_time,
                'max_response_time': result.max_response_time,
                'p95_response_time': result.p95_response_time,
                'p99_response_time': result.p99_response_time,
                'requests_per_second': result.requests_per_second,
                'success_rate': result.success_rate
            }
        
        with open(filename, 'w') as f:
            json.dump(serializable_results, f, indent=2)
        
        logger.info(f"Results saved to {filename}")

def main():
    """Main function"""
    benchmark = PerformanceBenchmark()
    
    # Check if service is running
    try:
        response = requests.get(f"{benchmark.service_url}/health", timeout=5)
        logger.info(f"Service health check: {response.status_code}")
    except:
        logger.error("Service is not running. Please start the service first:")
        logger.error("  source venv/bin/activate && python api.py")
        return
    
    # Run all benchmarks
    results = benchmark.run_all_benchmarks()
    
    # Generate and display report
    report = benchmark.generate_report(results)
    print("\n" + report)
    
    # Save results
    benchmark.save_results(results)

if __name__ == "__main__":
    main()