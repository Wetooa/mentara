"""
Setup script for Mentara AI Content Moderation Service
"""

import os
import subprocess
import sys
from pathlib import Path

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"\n🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(f"Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed")
        print(f"Error: {e.stderr.strip()}")
        return False

def check_ollama_installation():
    """Check if Ollama is installed and running"""
    print("\n🔍 Checking Ollama installation...")
    
    # Check if ollama command exists
    try:
        subprocess.run(['ollama', '--version'], check=True, capture_output=True)
        print("✅ Ollama is installed")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Ollama is not installed or not in PATH")
        print("Please install Ollama from: https://ollama.ai/")
        return False
    
    # Check if Ollama is running
    try:
        subprocess.run(['ollama', 'list'], check=True, capture_output=True)
        print("✅ Ollama service is running")
    except subprocess.CalledProcessError:
        print("❌ Ollama service is not running")
        print("Please start Ollama service: ollama serve")
        return False
    
    return True

def setup_ollama_model():
    """Download and setup the mxbai-embed-large model"""
    print("\n📥 Setting up Ollama embedding model...")
    
    # Check if model is already available
    try:
        result = subprocess.run(['ollama', 'list'], capture_output=True, text=True)
        if 'mxbai-embed-large' in result.stdout:
            print("✅ mxbai-embed-large model is already available")
            return True
    except subprocess.CalledProcessError:
        pass
    
    # Download the model
    return run_command(
        'ollama pull mxbai-embed-large',
        'Downloading mxbai-embed-large model'
    )

def install_python_dependencies():
    """Install Python dependencies"""
    print("\n📦 Installing Python dependencies...")
    
    # Upgrade pip first
    run_command(
        f'{sys.executable} -m pip install --upgrade pip',
        'Upgrading pip'
    )
    
    # Install requirements
    return run_command(
        f'{sys.executable} -m pip install -r requirements.txt',
        'Installing Python packages'
    )

def setup_directories():
    """Create necessary directories"""
    print("\n📁 Setting up directories...")
    
    directories = [
        'models',
        'models/mental_health_classifier',
        'models/toxicity_classifier',
        'logs',
        'tests',
        'data'
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {directory}")
    
    return True

def create_env_file():
    """Create .env file with default configuration"""
    print("\n⚙️ Setting up environment configuration...")
    
    env_file = Path('.env')
    if env_file.exists():
        print("✅ .env file already exists")
        return True
    
    env_content = """# Mentara AI Content Moderation Service Environment Configuration

# Flask Environment
FLASK_ENV=development
PORT=5001

# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
EMBEDDING_MODEL=mxbai-embed-large

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
# REDIS_PASSWORD=your_redis_password

# Security Configuration
API_KEY_REQUIRED=false
# API_KEY=your_api_key_here

# Logging Configuration
LOG_LEVEL=INFO
LOG_FORMAT=json

# Model Configuration
MENTAL_HEALTH_MODEL_PATH=./models/mental_health_classifier
TOXICITY_MODEL_PATH=./models/toxicity_classifier

# Moderation Thresholds
TOXICITY_THRESHOLD=0.7
CONFIDENCE_THRESHOLD=0.8
MENTAL_HEALTH_THRESHOLD=0.6

# Performance Settings
MAX_CONTENT_LENGTH=10000
BATCH_SIZE_LIMIT=100
CACHE_TTL=604800

# Rate Limiting
RATE_LIMIT_PER_MINUTE=30
RATE_LIMIT_PER_HOUR=1000
"""
    
    try:
        with open(env_file, 'w') as f:
            f.write(env_content)
        print("✅ Created .env file with default configuration")
        return True
    except Exception as e:
        print(f"❌ Failed to create .env file: {e}")
        return False

def test_service():
    """Run basic tests to verify setup"""
    print("\n🧪 Running basic setup tests...")
    
    try:
        # Test imports
        print("Testing Python imports...")
        import flask
        import ollama
        import redis
        import sklearn
        import numpy
        print("✅ All required packages can be imported")
        
        # Test Ollama connection
        print("Testing Ollama connection...")
        ollama_client = ollama.Client(host='http://localhost:11434')
        models = ollama_client.list()
        print(f"✅ Ollama connection successful, {len(models.get('models', []))} models available")
        
        # Test embedding model
        if 'mxbai-embed-large' in [m['name'] for m in models.get('models', [])]:
            print("✅ mxbai-embed-large model is available")
        else:
            print("❌ mxbai-embed-large model not found")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Setup test failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Mentara AI Content Moderation Service Setup")
    print("=" * 50)
    
    setup_success = True
    
    # Setup steps
    steps = [
        (setup_directories, "Setting up directories"),
        (create_env_file, "Creating environment configuration"),
        (install_python_dependencies, "Installing Python dependencies"),
        (check_ollama_installation, "Checking Ollama installation"),
        (setup_ollama_model, "Setting up Ollama model"),
        (test_service, "Testing service setup")
    ]
    
    for step_func, step_name in steps:
        try:
            if not step_func():
                print(f"\n❌ Setup failed at: {step_name}")
                setup_success = False
                break
        except Exception as e:
            print(f"\n❌ Unexpected error during {step_name}: {e}")
            setup_success = False
            break
    
    print("\n" + "=" * 50)
    
    if setup_success:
        print("🎉 Setup completed successfully!")
        print("\nNext steps:")
        print("1. Review and customize .env file if needed")
        print("2. Start the service: python api.py")
        print("3. Test the service: curl http://localhost:5001/health")
        print("4. Check service info: curl http://localhost:5001/")
    else:
        print("❌ Setup failed. Please resolve the errors and try again.")
        sys.exit(1)

if __name__ == "__main__":
    main()