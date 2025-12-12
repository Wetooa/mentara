#!/bin/bash

# Test script for SambaNova API fixes
# This script tests the chatbot functionality after the fixes

echo "🧪 Testing SambaNova API Fixes"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "📡 Checking if server is running..."
if ! curl -s http://localhost:10000/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Server is not running on port 10000${NC}"
    echo "Please start the server with: npm run start:dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Get auth token (you'll need to replace this with a valid token)
echo "🔑 Getting authentication token..."
echo -e "${YELLOW}⚠️  You need to provide a valid JWT token${NC}"
echo "Please set the AUTH_TOKEN environment variable:"
echo "  export AUTH_TOKEN='your-jwt-token-here'"
echo ""

if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${RED}❌ AUTH_TOKEN not set. Skipping authenticated tests.${NC}"
    echo ""
    echo "You can get a token by:"
    echo "1. Logging in through the API"
    echo "2. Or using an existing admin token"
    exit 1
fi

echo -e "${GREEN}✅ Token found${NC}"
echo ""

# Test 1: Check SambaNova health
echo "🏥 Test 1: Checking SambaNova health..."
HEALTH_RESPONSE=$(curl -s -X GET \
  "http://localhost:10000/api/pre-assessment/sambanova/health" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

echo "Response: $HEALTH_RESPONSE"
echo ""

# Test 2: Check SambaNova metrics
echo "📊 Test 2: Checking SambaNova metrics..."
METRICS_RESPONSE=$(curl -s -X GET \
  "http://localhost:10000/api/pre-assessment/sambanova/metrics" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

echo "Response: $METRICS_RESPONSE"
echo ""

# Test 3: Test SambaNova API directly
echo "🧪 Test 3: Testing SambaNova API directly..."
TEST_RESPONSE=$(curl -s -X POST \
  "http://localhost:10000/api/pre-assessment/sambanova/test" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, this is a test. Please respond with a brief greeting."}')

echo "Response: $TEST_RESPONSE"
echo ""

# Test 4: Start a chatbot session
echo "💬 Test 4: Starting chatbot session..."
SESSION_RESPONSE=$(curl -s -X POST \
  "http://localhost:10000/api/pre-assessment/chatbot/start" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

echo "Response: $SESSION_RESPONSE"
SESSION_ID=$(echo $SESSION_RESPONSE | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
echo "Session ID: $SESSION_ID"
echo ""

if [ -n "$SESSION_ID" ]; then
    # Test 5: Send a message to the chatbot
    echo "📨 Test 5: Sending message to chatbot..."
    MESSAGE_RESPONSE=$(curl -s -X POST \
      "http://localhost:10000/api/pre-assessment/chatbot/message" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"sessionId\": \"$SESSION_ID\", \"message\": \"Hello, I've been feeling anxious lately.\"}")
    
    echo "Response: $MESSAGE_RESPONSE"
    echo ""
    
    # Check if response contains an error
    if echo "$MESSAGE_RESPONSE" | grep -q "error"; then
        echo -e "${RED}❌ Test failed: Chatbot returned an error${NC}"
    elif echo "$MESSAGE_RESPONSE" | grep -q "response"; then
        echo -e "${GREEN}✅ Test passed: Chatbot responded successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Test result unclear${NC}"
    fi
else
    echo -e "${RED}❌ Could not start chatbot session${NC}"
fi

echo ""
echo "================================"
echo "🏁 Testing complete!"
echo ""
echo "Summary:"
echo "- Check the responses above for any errors"
echo "- If you see 500 errors, check the server logs"
echo "- If you see authentication errors, check your AUTH_TOKEN"
echo ""

