#!/bin/bash

# Google Cloud Run Deployment Script for Mirrify Backend
# This script deploys the backend with Sharp image compression support

set -e

# Configuration
PROJECT_ID="neat-cycling-470410-t9"  # Replace with your project ID
SERVICE_NAME="mirrify-backend"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Deploying Mirrify Backend to Google Cloud Run..."

# Build the Docker image
echo "📦 Building Docker image..."
cd server
docker build -f Dockerfile.google -t $IMAGE_NAME .

# Push to Google Container Registry
echo "⬆️ Pushing image to Google Container Registry..."
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --concurrency 10 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production \
  --set-env-vars TINYPNG_API_KEY="$TINYPNG_API_KEY" \
  --project $PROJECT_ID

echo "✅ Deployment complete!"
echo "🌐 Service URL: https://$SERVICE_NAME-$REGION-$PROJECT_ID.a.run.app"
echo "🔍 Health check: https://$SERVICE_NAME-$REGION-$PROJECT_ID.a.run.app/api/health"

# Test the deployment
echo "🧪 Testing deployment..."
curl -s "https://$SERVICE_NAME-$REGION-$PROJECT_ID.a.run.app/api/health" | jq .

echo "🎉 Deployment successful! Sharp compression is now available on Google Cloud Run."

