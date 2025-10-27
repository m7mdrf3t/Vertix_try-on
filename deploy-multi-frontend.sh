#!/bin/bash

# Deploy Mirrify Multi Frontend to Google Cloud Run
# This will deploy the frontend with dual garment selection feature

set -e

# Configuration
PROJECT_ID="907099703781"
REGION="us-central1"
SERVICE_NAME="mirrify-multi"
IMAGE_NAME="gcr.io/${PROJECT_ID}/mirrify-multi"

echo "🚀 Deploying Mirrify Multi Frontend to Google Cloud Run"
echo "Project ID: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo "Service Name: ${SERVICE_NAME}"
echo ""

# Set the project
echo "📋 Setting Google Cloud project..."
gcloud config set project ${PROJECT_ID}

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t ${IMAGE_NAME} .

# Tag the image
echo "🏷️  Tagging image..."
docker tag ${IMAGE_NAME} ${IMAGE_NAME}:latest

# Push to Google Container Registry
echo "📤 Pushing image to Google Container Registry..."
docker push ${IMAGE_NAME}:latest

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars "REACT_APP_API_URL=https://mirrify-backend-907099703781.us-central1.run.app" \
  --set-env-vars "REACT_APP_UPPER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/1oJfOpMRLob3jASZmm_rRUWW6LlHHvx_FvzYwXlMp7to/edit?usp=sharing" \
  --set-env-vars "REACT_APP_LOWER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/1PpLJtCicxCHrBynNB2i6OBOx_nnjJDFoCk9Kthnb9FI/edit?usp=sharing"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Service URL: https://${SERVICE_NAME}-${PROJECT_ID}.${REGION}.run.app"
echo ""
echo "📊 View logs:"
echo "gcloud run services logs read ${SERVICE_NAME} --region=${REGION}"
echo ""
echo "📝 Update CORS in backend server to allow this origin:"
echo "https://${SERVICE_NAME}-${PROJECT_ID}.${REGION}.run.app"

