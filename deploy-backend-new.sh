#!/bin/bash

# Google Cloud Run Deployment Script for Mirrify Backend (New Domain)
# This script deploys the backend to a new service/domain on Google Cloud Run

set -e

# Configuration - NEW BACKEND SERVICE
PROJECT_ID="tryandfit"  # Replace with your project ID
SERVICE_NAME="mirrify-backend-v2"  # New service name for the new domain
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Deploying Mirrify Backend to NEW Google Cloud Run service..."
echo "📦 Service Name: $SERVICE_NAME"
echo "🌍 Region: $REGION"

# Build the Docker image using Cloud Build
echo "📦 Building Docker image using Cloud Build..."
# Run from root directory - cloudbuild-backend.yaml is in root
gcloud builds submit --config cloudbuild-backend.yaml --project $PROJECT_ID .

# Alternative: If you prefer using Docker directly (requires Docker installed):
# cd server
# docker build -f Dockerfile.google -t $IMAGE_NAME .
# docker push $IMAGE_NAME

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
  --set-env-vars GOOGLE_PROJECT_ID="$PROJECT_ID" \
  --set-env-vars GOOGLE_APPLICATION_CREDENTIALS="$GOOGLE_APPLICATION_CREDENTIALS" \
  --set-env-vars TINYPNG_API_KEY="$TINYPNG_API_KEY" \
  --set-env-vars NEXT_PUBLIC_SUPABASE_URL="https://euvdpomiybrasicixerw.supabase.co" \
  --set-env-vars NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dmRwb21peWJyYXNpY2l4ZXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDc0OTcsImV4cCI6MjA3NjcyMzQ5N30.T87XjLha8MwBAtJ3K-FfJlZrCB9qKpGoNYg29AAfg5M" \
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

echo "🌐 NEW Service URL: $NEW_SERVICE_URL"
echo "🔍 Health check: $NEW_SERVICE_URL/api/health"

# Test the deployment
echo "🧪 Testing deployment..."
curl -s "$NEW_SERVICE_URL/api/health" | jq . || echo "⚠️  Health check failed or jq not installed"

echo "📊 Testing analytics endpoints..."
curl -s "$NEW_SERVICE_URL/" | jq .endpoints.analytics || echo "⚠️  Analytics endpoint test failed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 BACKEND URLS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🆕 NEW Backend: $NEW_SERVICE_URL"
echo "🔄 OLD Backend: https://mirrify-backend-907099703781.us-central1.run.app"
echo ""
echo "💡 Update src/config/backend.ts with the NEW Backend URL above"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Deployment successful! New backend is now available."
echo "💡 Update your frontend configuration to use the new backend URL."

