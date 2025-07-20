#!/bin/bash

# AI Patient Evaluation Service - Development Environment Setup
# This script sets up a proper Python virtual environment with all dependencies

set -e  # Exit on any error

echo "🚀 Setting up AI Patient Evaluation Service Development Environment"
echo "=================================================================="

# Get the directory of the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$DIR"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python -m venv venv
    echo "✅ Virtual environment created"
else
    echo "📦 Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install production dependencies
echo "📥 Installing production dependencies..."
pip install -r requirements.txt

# Install development and testing dependencies
echo "🧪 Installing testing dependencies..."
pip install pytest pytest-flask pytest-cov requests psutil black flake8 mypy

# Install security scanning tools
echo "🔒 Installing security tools..."
pip install bandit safety

# Create test configuration if it doesn't exist
if [ ! -f "pytest.ini" ]; then
    echo "📋 Creating pytest configuration..."
    cat > pytest.ini << EOF
[tool:pytest]
testpaths = .
python_files = test_*.py
python_classes = Test*
python_functions = test_*
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
    integration: marks tests as integration tests
    unit: marks tests as unit tests
    security: marks tests as security tests
addopts = -v --tb=short
EOF
fi

# Run basic health check
echo "🏥 Running basic health check..."
python -c "
import torch
from model import MultiLabelNN
print('✅ PyTorch import successful')
print('✅ Model class import successful')
print('✅ Setup completed successfully!')
"

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "To activate the environment in the future, run:"
echo "  source venv/bin/activate"
echo ""
echo "To run tests:"
echo "  python run_tests.py --quick"
echo ""
echo "To start the service:"
echo "  python api.py"