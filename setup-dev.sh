#!/bin/bash
# Mentara Development Setup Script
# Run this after fresh clone: chmod +x setup-dev.sh && ./setup-dev.sh

set -e  # Exit on any error

echo "🚀 Setting up Mentara development environment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Installing root dependencies...${NC}"
npm install

echo -e "${YELLOW}📦 Installing mentara-commons dependencies...${NC}"
cd mentara-commons
npm install
npm run build
echo -e "${GREEN}✅ mentara-commons built successfully${NC}"

echo -e "${YELLOW}📦 Installing mentara-api dependencies...${NC}"
cd ../mentara-api
npm install
echo -e "${GREEN}✅ mentara-api dependencies installed${NC}"

echo -e "${YELLOW}📦 Installing mentara-client dependencies...${NC}"
cd ../mentara-client
npm install
echo -e "${GREEN}✅ mentara-client dependencies installed${NC}"

echo -e "${YELLOW}📦 Installing AI services dependencies...${NC}"
cd ../ai-patient-evaluation
pip install -r requirements.txt 2>/dev/null || echo -e "${YELLOW}⚠️  pip install failed, install Python dependencies manually${NC}"

cd ../ai-content-moderation
pip install -r requirements.txt 2>/dev/null || echo -e "${YELLOW}⚠️  pip install failed, install Python dependencies manually${NC}"

cd ..

echo -e "${YELLOW}⚙️  Setting up environment files...${NC}"
if [ ! -f mentara-api/.env ]; then
    cp mentara-api/.env.example mentara-api/.env
    echo -e "${YELLOW}📝 Created mentara-api/.env - please configure with your values${NC}"
fi

echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure environment variables in mentara-api/.env"
echo "2. Start development servers:"
echo "   cd mentara-api && npm run start:dev"
echo "   cd mentara-client && npm run dev"
echo ""
echo -e "${GREEN}✨ Happy coding!${NC}"