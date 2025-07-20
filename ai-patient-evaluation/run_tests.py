#!/usr/bin/env python3
"""
Test runner script for Mental Health AI Prediction Service
"""
import subprocess
import sys
import os
import argparse


def run_command(command, description):
    """Run a command and return success status"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Command: {command}")
    print('='*60)
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=False)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed with exit code {e.returncode}")
        return False


def main():
    """Main test runner function"""
    parser = argparse.ArgumentParser(description='Run tests for ML service')
    parser.add_argument('--quick', action='store_true', 
                       help='Run only quick tests (skip slow/performance tests)')
    parser.add_argument('--performance', action='store_true',
                       help='Run only performance tests')
    parser.add_argument('--coverage', action='store_true',
                       help='Generate detailed coverage report')
    parser.add_argument('--install', action='store_true',
                       help='Install test dependencies first')
    
    args = parser.parse_args()
    
    # Change to the script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    success_count = 0
    total_tests = 0
    
    # Install dependencies if requested
    if args.install:
        total_tests += 1
        if run_command("pip install pytest pytest-flask pytest-cov requests psutil", 
                      "Installing test dependencies"):
            success_count += 1
    
    # Run different test suites based on arguments
    if args.performance:
        # Only performance tests
        total_tests += 1
        if run_command("python -m pytest test_performance.py -v -m slow", 
                      "Performance tests"):
            success_count += 1
    
    elif args.quick:
        # Quick tests only (exclude slow tests)
        total_tests += 1
        if run_command("python -m pytest test_api.py -v -m 'not slow'", 
                      "Quick unit tests"):
            success_count += 1
    
    else:
        # Full test suite
        total_tests += 3
        
        # Unit tests
        if run_command("python -m pytest test_api.py -v", 
                      "Unit and integration tests"):
            success_count += 1
        
        # Performance tests
        if run_command("python -m pytest test_performance.py -v -m slow", 
                      "Performance tests"):
            success_count += 1
        
        # All tests with coverage
        coverage_cmd = "python -m pytest test_api.py test_performance.py --cov=. --cov-report=term-missing"
        if args.coverage:
            coverage_cmd += " --cov-report=html:htmlcov"
        
        if run_command(coverage_cmd, "Coverage analysis"):
            success_count += 1
    
    # Summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print('='*60)
    print(f"Tests completed: {success_count}/{total_tests}")
    
    if success_count == total_tests:
        print("🎉 All tests passed!")
        if args.coverage:
            print("📊 Coverage report generated in htmlcov/index.html")
        return 0
    else:
        print("❌ Some tests failed!")
        return 1


if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)