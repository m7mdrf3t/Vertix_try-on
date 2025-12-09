#!/bin/bash

# Deploy updated server with Shopify CORS support
# This script updates your Google Cloud Run service with the new CORS configuration

echo "🚀 Deploying Mirrify Backend with Shopify CORS Support..."

# Set your project ID
PROJECT_ID="tryandfit"
SERVICE_NAME="mirrify-backend"
REGION="us-central1"

echo "📦 Building Docker image..."
cd server

# Build the Docker image
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME . --project=$PROJECT_ID

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully"
else
    echo "❌ Docker build failed"
    exit 1
fi

echo "🚀 Deploying to Google Cloud Run..."
# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --concurrency 10 \
    --max-instances 10 \
    --timeout 300 \
    --project=$PROJECT_ID

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🎉 Your backend is now updated with Shopify CORS support!"
    echo "📍 Service URL: https://mirrify-backend-907099703781.us-central1.run.app"
    echo ""
    echo "🧪 Test the deployment:"
    echo "curl https://mirrify-backend-907099703781.us-central1.run.app/api/health"
    echo ""
    echo "📋 Supported Shopify domains:"
    echo "  - https://your-store-name.myshopify.com"
    echo "  - https://your-store-name.pages.shopify.com"
    echo "  - Custom domains (contact to add)"
else
    echo "❌ Deployment failed"
    exit 1
fi

cd ..
echo "🏁 Deployment complete!"
