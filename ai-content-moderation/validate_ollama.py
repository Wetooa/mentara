#!/usr/bin/env python3
"""
Ollama Integration Validation Script
Tests Ollama connection and mxbai-embed-large model availability
"""

import sys
import traceback
from config import config

def test_ollama_connection():
    """Test basic Ollama connection"""
    print("🔍 Testing Ollama Connection...")
    
    try:
        import ollama
        client = ollama.Client(host=config.OLLAMA_HOST)
        
        # Test connection
        models = client.list()
        print(f"✅ Ollama connection successful to {config.OLLAMA_HOST}")
        print(f"Available models: {len(models.get('models', []))}")
        
        # List available models
        for model in models.get('models', []):
            print(f"  - {model['name']}")
        
        return True, client
        
    except Exception as e:
        print(f"❌ Ollama connection failed: {e}")
        return False, None

def test_embedding_model(client):
    """Test mxbai-embed-large model"""
    print(f"\n🔍 Testing {config.EMBEDDING_MODEL} model...")
    
    try:
        # Check if model exists
        models = client.list()
        available_models = [m['name'] for m in models.get('models', [])]
        
        if config.EMBEDDING_MODEL not in available_models:
            print(f"❌ Model {config.EMBEDDING_MODEL} not found")
            print(f"Available models: {available_models}")
            
            # Try to pull the model
            print(f"⏳ Attempting to pull {config.EMBEDDING_MODEL}...")
            try:
                client.pull(config.EMBEDDING_MODEL)
                print(f"✅ Successfully pulled {config.EMBEDDING_MODEL}")
            except Exception as pull_error:
                print(f"❌ Failed to pull model: {pull_error}")
                return False
        
        # Test embeddings generation
        print(f"⏳ Testing embeddings generation...")
        test_text = "This is a test sentence for embeddings."
        
        response = client.embeddings(
            model=config.EMBEDDING_MODEL,
            prompt=test_text
        )
        
        embedding = response['embedding']
        print(f"✅ Embeddings generated successfully")
        print(f"Embedding dimension: {len(embedding)}")
        print(f"Sample values: {embedding[:5]}")
        
        return True
        
    except Exception as e:
        print(f"❌ Embedding model test failed: {e}")
        traceback.print_exc()
        return False

def test_moderation_engine():
    """Test ModerationEngine with Ollama"""
    print(f"\n🔍 Testing ModerationEngine integration...")
    
    try:
        from moderation_engine import ModerationEngine
        
        # Initialize without Redis for testing
        engine = ModerationEngine(
            ollama_host=config.OLLAMA_HOST,
            model_name=config.EMBEDDING_MODEL,
            redis_client=None
        )
        
        print(f"✅ ModerationEngine initialized successfully")
        
        # Test embeddings generation
        test_content = "This is a test message for content moderation."
        embeddings = engine.generate_embeddings(test_content)
        
        print(f"✅ Embeddings generated: {len(embeddings)} dimensions")
        
        # Test toxicity analysis
        from moderation_engine import ToxicityResult
        toxicity_result = engine.analyze_toxicity(test_content, embeddings)
        
        print(f"✅ Toxicity analysis completed")
        print(f"Toxicity score: {toxicity_result.score}")
        print(f"Categories: {toxicity_result.categories}")
        
        return True
        
    except Exception as e:
        print(f"❌ ModerationEngine test failed: {e}")
        traceback.print_exc()
        return False

def test_mental_health_integration():
    """Test mental health classifier integration"""
    print(f"\n🔍 Testing Mental Health Classifier...")
    
    try:
        from mental_health_classifier import MentalHealthClassifier
        
        classifier = MentalHealthClassifier()
        
        # Test analysis
        test_content = "I'm feeling anxious and need therapy help."
        result = classifier.analyze_content(test_content)
        
        print(f"✅ Mental health analysis completed")
        print(f"Is mental health content: {result['is_mental_health_content']}")
        print(f"Score: {result['score']:.3f}")
        print(f"Categories: {result['categories']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Mental health classifier test failed: {e}")
        traceback.print_exc()
        return False

def main():
    """Run all validation tests"""
    print("🚀 AI Content Moderation Service Validation")
    print("=" * 50)
    
    # Test 1: Ollama Connection
    ollama_connected, client = test_ollama_connection()
    
    if not ollama_connected:
        print("\n❌ Ollama validation failed - service not available")
        print("Please ensure Ollama is installed and running:")
        print("  curl -fsSL https://ollama.com/install.sh | sh")
        print("  ollama serve")
        sys.exit(1)
    
    # Test 2: Embedding Model
    model_available = test_embedding_model(client)
    
    if not model_available:
        print(f"\n❌ {config.EMBEDDING_MODEL} model validation failed")
        sys.exit(1)
    
    # Test 3: ModerationEngine
    moderation_working = test_moderation_engine()
    
    # Test 4: Mental Health Classifier
    mental_health_working = test_mental_health_integration()
    
    # Final Results
    print("\n" + "=" * 50)
    print("🎯 VALIDATION RESULTS")
    print("=" * 50)
    
    results = {
        "Ollama Connection": ollama_connected,
        "Embedding Model": model_available,
        "Moderation Engine": moderation_working,
        "Mental Health Classifier": mental_health_working
    }
    
    all_passed = all(results.values())
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    if all_passed:
        print("\n🎉 All validation tests passed!")
        print("AI Content Moderation Service is ready for deployment.")
    else:
        print(f"\n⚠️  {sum(results.values())}/{len(results)} tests passed")
        print("Some components need attention before deployment.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)