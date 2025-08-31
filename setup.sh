#!/bin/bash

echo "🚀 Setting up Vertix Try-On Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js version 16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

# Create environment files
echo "⚙️  Setting up environment files..."

# Frontend .env
if [ ! -f .env ]; then
    echo "REACT_APP_API_URL=http://localhost:3001" > .env
    echo "✅ Created frontend .env file"
else
    echo "ℹ️  Frontend .env file already exists"
fi

# Backend .env
if [ ! -f server/.env ]; then
    cp server/env.example server/.env
    echo "✅ Created backend .env file"
    echo "⚠️  Please update server/.env with your Google Cloud credentials"
else
    echo "ℹ️  Backend .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update server/.env with your Google Cloud service account credentials"
echo "2. Start the backend server: cd server && npm start"
echo "3. Start the frontend server: npm start"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "For more information, see README.md"




