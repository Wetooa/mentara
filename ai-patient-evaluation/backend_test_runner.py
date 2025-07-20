#!/usr/bin/env python3
"""
Backend API Testing Infrastructure Runner
Provides comprehensive testing support for NestJS backend integration
"""
import subprocess
import sys
import os
import argparse
import json
import time
from datetime import datetime


def run_command(command, description, capture_output=False):
    """Run a command and return success status"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Command: {command}")
    print('='*60)
    
    try:
        if capture_output:
            result = subprocess.run(command, shell=True, check=True, 
                                  capture_output=True, text=True)
            return True, result.stdout
        else:
            result = subprocess.run(command, shell=True, check=True, capture_output=False)
            print(f"✅ {description} completed successfully")
            return True, None
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed with exit code {e.returncode}")
        if capture_output and e.stdout:
            print(f"Output: {e.stdout}")
        if capture_output and e.stderr:
            print(f"Error: {e.stderr}")
        return False, None


def test_backend_integration():
    """Run backend integration tests"""
    print("🔗 Testing Backend Integration...")
    
    commands = [
        ("python -m pytest test_backend_integration.py::TestBackendIntegration -v", 
         "Backend API Contract Tests"),
        ("python -m pytest test_backend_integration.py::TestBackendErrorScenarios -v", 
         "Backend Error Handling Tests"),
    ]
    
    success_count = 0
    for command, description in commands:
        success, _ = run_command(command, description)
        if success:
            success_count += 1
    
    return success_count, len(commands)


def test_backend_load():
    """Run backend load tests"""
    print("⚡ Testing Backend Load Handling...")
    
    success, _ = run_command(
        "python -m pytest test_backend_integration.py::TestBackendLoadTesting -v -m slow",
        "Backend Load Tests"
    )
    
    return 1 if success else 0, 1


def test_api_security():
    """Test API security aspects"""
    print("🔒 Testing API Security...")
    
    commands = [
        ("python -m pytest test_api.py::TestMLService::test_predict_non_numeric_input -v",
         "Input Validation Security"),
        ("python -m pytest test_api.py::TestMLService::test_predict_missing_inputs -v",
         "Request Validation Security"),
        ("python -m pytest test_backend_integration.py::TestBackendErrorScenarios::test_backend_circuit_breaker_simulation -v",
         "Circuit Breaker Security"),
    ]
    
    success_count = 0
    for command, description in commands:
        success, _ = run_command(command, description)
        if success:
            success_count += 1
    
    return success_count, len(commands)


def generate_test_report():
    """Generate a comprehensive test report"""
    print("📊 Generating Test Report...")
    
    # Run tests with JSON output for report generation
    success, output = run_command(
        "python -m pytest test_api.py test_backend_integration.py --json-report --json-report-file=test_report.json",
        "Generating JSON Test Report",
        capture_output=True
    )
    
    if success and os.path.exists('test_report.json'):
        with open('test_report.json', 'r') as f:
            report_data = json.load(f)
        
        # Generate human-readable summary
        summary = {
            "timestamp": datetime.now().isoformat(),
            "total_tests": report_data.get('summary', {}).get('total', 0),
            "passed": report_data.get('summary', {}).get('passed', 0),
            "failed": report_data.get('summary', {}).get('failed', 0),
            "duration": report_data.get('duration', 0),
            "categories": {
                "ml_service": 0,
                "backend_integration": 0,
                "performance": 0,
                "security": 0
            }
        }
        
        # Categorize tests
        for test in report_data.get('tests', []):
            test_name = test.get('nodeid', '')
            if 'test_api.py' in test_name:
                summary['categories']['ml_service'] += 1
            elif 'test_backend_integration.py' in test_name:
                if 'Load' in test_name:
                    summary['categories']['performance'] += 1
                elif 'Error' in test_name or 'Security' in test_name:
                    summary['categories']['security'] += 1
                else:
                    summary['categories']['backend_integration'] += 1
        
        # Write summary report
        with open('backend_test_summary.json', 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"📋 Test Summary Report:")
        print(f"   Total Tests: {summary['total_tests']}")
        print(f"   Passed: {summary['passed']}")
        print(f"   Failed: {summary['failed']}")
        print(f"   Duration: {summary['duration']:.2f}s")
        print(f"   Report saved to: backend_test_summary.json")
        
        return True
    
    return False


def setup_backend_monitoring():
    """Set up monitoring for backend integration"""
    print("📡 Setting up Backend Monitoring...")
    
    monitoring_script = """
import requests
import time
import json
from datetime import datetime

def monitor_ml_service(duration_minutes=5):
    '''Monitor ML service for backend integration'''
    base_url = 'http://localhost:5000'
    
    print(f"Monitoring ML service for {duration_minutes} minutes...")
    start_time = time.time()
    end_time = start_time + (duration_minutes * 60)
    
    metrics = []
    
    while time.time() < end_time:
        try:
            # Check health
            health_response = requests.get(f'{base_url}/health', timeout=5)
            
            # Get metrics
            metrics_response = requests.get(f'{base_url}/metrics', timeout=5)
            
            if health_response.status_code == 200 and metrics_response.status_code == 200:
                health_data = health_response.json()
                metrics_data = metrics_response.json()
                
                snapshot = {
                    'timestamp': datetime.now().isoformat(),
                    'status': health_data.get('status'),
                    'model_loaded': health_data.get('model_loaded'),
                    'uptime': metrics_data.get('uptime', {}).get('seconds', 0),
                    'total_requests': metrics_data.get('requests', {}).get('total', 0),
                    'success_rate': metrics_data.get('requests', {}).get('success_rate_percent', 0),
                    'avg_response_time': metrics_data.get('performance', {}).get('average_response_time_ms', 0)
                }
                
                metrics.append(snapshot)
                print(f"✓ {snapshot['timestamp']}: {snapshot['status']} - {snapshot['total_requests']} requests")
            
        except Exception as e:
            print(f"✗ Error monitoring service: {e}")
        
        time.sleep(30)  # Check every 30 seconds
    
    # Save monitoring results
    with open('monitoring_results.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    
    print(f"Monitoring complete. Results saved to monitoring_results.json")

if __name__ == '__main__':
    monitor_ml_service()
"""
    
    with open('monitor_service.py', 'w') as f:
        f.write(monitoring_script)
    
    print("📝 Monitoring script created: monitor_service.py")
    print("   Usage: python monitor_service.py")
    
    return True


def main():
    """Main test runner function"""
    parser = argparse.ArgumentParser(description='Backend API Testing Infrastructure')
    parser.add_argument('--integration', action='store_true',
                       help='Run backend integration tests')
    parser.add_argument('--load', action='store_true',
                       help='Run backend load tests')
    parser.add_argument('--security', action='store_true',
                       help='Run API security tests')
    parser.add_argument('--all', action='store_true',
                       help='Run all backend tests')
    parser.add_argument('--report', action='store_true',
                       help='Generate comprehensive test report')
    parser.add_argument('--setup-monitoring', action='store_true',
                       help='Set up backend monitoring tools')
    parser.add_argument('--install', action='store_true',
                       help='Install additional testing dependencies')
    
    args = parser.parse_args()
    
    # Change to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    total_success = 0
    total_tests = 0
    
    # Install dependencies if requested
    if args.install:
        total_tests += 1
        success, _ = run_command(
            "pip install pytest-json-report requests psutil",
            "Installing additional testing dependencies"
        )
        if success:
            total_success += 1
    
    # Set up monitoring
    if args.setup_monitoring:
        total_tests += 1
        if setup_backend_monitoring():
            total_success += 1
    
    # Run tests based on arguments
    if args.integration or args.all:
        success, tests = test_backend_integration()
        total_success += success
        total_tests += tests
    
    if args.load or args.all:
        success, tests = test_backend_load()
        total_success += success
        total_tests += tests
    
    if args.security or args.all:
        success, tests = test_api_security()
        total_success += success
        total_tests += tests
    
    if args.report:
        total_tests += 1
        if generate_test_report():
            total_success += 1
    
    # Default: run integration tests
    if not any([args.integration, args.load, args.security, args.all, 
               args.report, args.setup_monitoring, args.install]):
        success, tests = test_backend_integration()
        total_success += success
        total_tests += tests
    
    # Summary
    print(f"\n{'='*60}")
    print("BACKEND TESTING SUMMARY")
    print('='*60)
    print(f"Test suites completed: {total_success}/{total_tests}")
    
    if total_success == total_tests:
        print("🎉 All backend tests passed!")
        print("🔗 Backend integration infrastructure ready")
        return 0
    else:
        print("❌ Some backend tests failed!")
        return 1


if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)