#!/bin/bash

# Google Cloud Run Deployment Script for Mirrify Frontend (New Domain)
# This script deploys the frontend to a new service/domain on Google Cloud Run

set -e

# Configuration - NEW FRONTEND SERVICE
PROJECT_ID="tryandfit"
SERVICE_NAME="mirrify-frontend-v2"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Deploying Mirrify Frontend to NEW Google Cloud Run service..."
echo "📦 Service Name: $SERVICE_NAME"
echo "🌍 Region: $REGION"

# Build the Docker image using Cloud Build
echo "📦 Building Docker image using Cloud Build..."
gcloud builds submit --config cloudbuild-frontend.yaml --project $PROJECT_ID

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --concurrency 80 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production \
  --set-env-vars REACT_APP_API_URL="https://mirrify-backend-v2-cafok76baq-uc.a.run.app" \
  --project $PROJECT_ID

# Get the actual service URL from gcloud
echo "✅ Deployment complete!"
echo "📋 Getting service URL..."
NEW_SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT_ID --format 'value(status.url)')

if [ -z "$NEW_SERVICE_URL" ]; then
  # Fallback URL format if gcloud doesn't return it
  NEW_SERVICE_URL="https://$SERVICE_NAME-$PROJECT_ID.$REGION.run.app"
  echo "⚠️  Could not get URL from gcloud, using fallback format"
fi

echo "🌐 NEW Frontend URL: $NEW_SERVICE_URL"

# Test the deployment
echo "🧪 Testing deployment..."
curl -s "$NEW_SERVICE_URL" | head -20 || echo "⚠️  Frontend test failed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 DEPLOYMENT URLS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🆕 NEW Frontend: $NEW_SERVICE_URL"
echo "🆕 NEW Backend:  https://mirrify-backend-v2-cafok76baq-uc.a.run.app"
echo "🔄 OLD Frontend: https://mirrify-frontend-quniks2hyq-uc.a.run.app"
echo "🔄 OLD Backend:  https://mirrify-backend-quniks2hyq-uc.a.run.app"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Deployment successful! New frontend is now available."
echo "💡 The frontend is configured to use the new backend automatically."

