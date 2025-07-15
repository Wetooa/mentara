#!/usr/bin/env python3
"""
Start AI Content Moderation Service
"""

import os
import sys
import time
import signal
import subprocess
from pathlib import Path

def start_service():
    """Start the AI content moderation service"""
    # Change to the service directory
    service_dir = Path(__file__).parent
    os.chdir(service_dir)
    
    # Start the service
    env = os.environ.copy()
    env['FLASK_ENV'] = 'development'
    
    # Start with virtual environment
    cmd = [
        "bash", "-c", 
        "source venv/bin/activate && python api.py"
    ]
    
    print("🚀 Starting AI Content Moderation Service...")
    print("Press Ctrl+C to stop")
    
    try:
        process = subprocess.Popen(
            cmd,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        # Print output in real-time
        for line in iter(process.stdout.readline, ''):
            print(line.strip())
        
        process.wait()
        
    except KeyboardInterrupt:
        print("\n🛑 Stopping service...")
        process.terminate()
        process.wait()
        print("Service stopped.")
    
    except Exception as e:
        print(f"❌ Error starting service: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(start_service())