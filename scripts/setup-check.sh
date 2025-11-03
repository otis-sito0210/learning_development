#!/bin/bash

# Setup Check Script
# Verifies that all prerequisites are installed and configured

echo "🔍 Checking n8n Researcher Forms Setup..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js is installed: $NODE_VERSION"

    # Check if version is 18+
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo "⚠️  Warning: Node.js 18+ is recommended (you have v$NODE_MAJOR)"
    fi
else
    echo "❌ Node.js is not installed"
    echo "   Install from: https://nodejs.org/"
fi

echo ""

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm is installed: $NPM_VERSION"
else
    echo "❌ npm is not installed"
fi

echo ""

# Check PostgreSQL
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo "✅ PostgreSQL is installed: $PSQL_VERSION"
else
    echo "⚠️  PostgreSQL not found locally (you can use a hosted database)"
fi

echo ""

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker is installed: $DOCKER_VERSION"
else
    echo "⚠️  Docker not found (optional, needed for local n8n)"
fi

echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env file exists"

    # Check for required variables
    if grep -q "DATABASE_URL" .env; then
        echo "  ✅ DATABASE_URL configured"
    else
        echo "  ❌ DATABASE_URL missing"
    fi

    if grep -q "NEXTAUTH_SECRET" .env && ! grep -q "replace-with-generated-secret" .env; then
        echo "  ✅ NEXTAUTH_SECRET configured"
    else
        echo "  ❌ NEXTAUTH_SECRET missing or not generated"
        echo "     Run: openssl rand -base64 32"
    fi

    if grep -q "GOOGLE_CLIENT_ID" .env && ! grep -q "your-client-id" .env; then
        echo "  ✅ GOOGLE_CLIENT_ID configured"
    else
        echo "  ❌ GOOGLE_CLIENT_ID missing"
    fi

    if grep -q "N8N_API_KEY" .env && ! grep -q "your-api-key" .env; then
        echo "  ✅ N8N_API_KEY configured"
    else
        echo "  ❌ N8N_API_KEY missing"
    fi
else
    echo "❌ .env file not found"
    echo "   Copy .env.example to .env and fill in values"
fi

echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed (node_modules exists)"
else
    echo "❌ Dependencies not installed"
    echo "   Run: npm install"
fi

echo ""

# Check Prisma
if [ -f "node_modules/.bin/prisma" ]; then
    echo "✅ Prisma is installed"

    # Check if Prisma client is generated
    if [ -d "node_modules/.prisma/client" ]; then
        echo "  ✅ Prisma client generated"
    else
        echo "  ❌ Prisma client not generated"
        echo "     Run: npm run db:generate"
    fi
else
    echo "⚠️  Prisma not found (install dependencies first)"
fi

echo ""
echo "📋 Summary:"
echo "   Read SETUP.md for detailed setup instructions"
echo "   Read README.md for full documentation"
echo ""
