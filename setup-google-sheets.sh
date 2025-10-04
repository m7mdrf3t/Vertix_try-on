#!/bin/bash

echo "🚀 Setting up Google Sheets for Mirrify App"
echo "=========================================="
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

echo "📋 Please follow these steps to set up Google Sheets:"
echo ""
echo "1. Go to https://sheets.google.com"
echo "2. Create a new spreadsheet"
echo "3. Add these columns in the first row:"
echo "   id | name | image | category | price | description"
echo ""
echo "4. Add some sample data:"
echo "   shirt-1 | Classic White Shirt | /products/white-shirt.jpg | Shirts | \$29.99 | Classic white cotton shirt"
echo ""
echo "5. Publish your sheet:"
echo "   - Click File → Share → Publish to web"
echo "   - Select 'Entire document'"
echo "   - Choose 'Comma-separated values (.csv)' format"
echo "   - Click 'Publish'"
echo "   - Copy the generated URL"
echo ""

# Prompt for Google Sheets URL
read -p "📝 Paste your Google Sheets CSV URL here: " GOOGLE_SHEETS_URL

if [ -z "$GOOGLE_SHEETS_URL" ]; then
    echo "❌ No URL provided. Exiting."
    exit 1
fi

# Create .env file
echo "REACT_APP_GOOGLE_SHEETS_URL=$GOOGLE_SHEETS_URL" > .env

echo ""
echo "✅ Configuration saved to .env file"
echo ""
echo "🔧 For Railway deployment, add this environment variable:"
echo "   REACT_APP_GOOGLE_SHEETS_URL=$GOOGLE_SHEETS_URL"
echo ""
echo "🚀 You can now start your app with: npm start"
echo "   The app will load products from your Google Sheet!"
