#!/bin/bash

# Test different SambaNova models to find which one works

if [ -z "$API_KEY" ]; then
    echo "❌ Please set API_KEY environment variable"
    echo "Usage: API_KEY='your-key' ./test-models.sh"
    exit 1
fi

echo "🧪 Testing SambaNova Models"
echo "============================"
echo ""

# Models to test
models=(
    "Meta-Llama-3.1-8B-Instruct"
    "Meta-Llama-3.1-70B-Instruct"
    "Meta-Llama-3.2-1B-Instruct"
    "Meta-Llama-3.2-3B-Instruct"
    "meta-llama/Meta-Llama-3.1-8B-Instruct"
    "llama3-8b"
    "Llama-3.2-1B-Instruct"
)

for model in "${models[@]}"; do
    echo "Testing model: $model"
    response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $API_KEY" \
         -H "Content-Type: application/json" \
         -d "{
            \"stream\": false,
            \"model\": \"$model\",
            \"messages\": [
                {
                    \"role\": \"system\",
                    \"content\": \"You are a helpful assistant\"
                },
                {
                    \"role\": \"user\",
                    \"content\": \"Say 'test successful' if you can read this\"
                }
            ]
         }" \
         -X POST https://api.sambanova.ai/v1/chat/completions 2>&1)
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ]; then
        echo "✅ SUCCESS! HTTP $http_code"
        echo "Response preview: $(echo "$body" | jq -r '.choices[0].message.content' 2>/dev/null || echo "$body" | head -c 100)"
        echo ""
        echo "🎉 Use this model in your .env:"
        echo "SAMBANOVA_MODEL=$model"
        echo ""
        break
    else
        echo "❌ FAILED! HTTP $http_code"
        echo "Error: $(echo "$body" | head -c 150)"
        echo ""
    fi
done

echo "============================"
echo "Testing complete!"

