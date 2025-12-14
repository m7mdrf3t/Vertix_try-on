#!/bin/bash

# Fix Cloud Build Permissions for Deployment
# This script grants the necessary permissions to the Cloud Build service account

set -e

PROJECT_ID="tryandfit"

echo "🔧 Fixing Cloud Build permissions for project: $PROJECT_ID"
echo ""

# Get the project number
echo "📋 Getting project number..."
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

if [ -z "$PROJECT_NUMBER" ]; then
    echo "❌ Error: Could not get project number. Please check that:"
    echo "   1. You're authenticated: gcloud auth login"
    echo "   2. The project ID is correct: $PROJECT_ID"
    exit 1
fi

echo "✅ Project number: $PROJECT_NUMBER"
echo ""

# Cloud Build service account email
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

echo "🔐 Granting permissions to: $CLOUD_BUILD_SA"
echo ""

# Grant Storage Admin role (for GCR)
echo "📦 Granting Storage Admin role (for Google Container Registry)..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/storage.admin" \
  --condition=None \
  --quiet || echo "⚠️  Storage Admin role may already be granted"

echo ""

# Grant Artifact Registry Writer role (for Artifact Registry)
echo "📦 Granting Artifact Registry Writer role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/artifactregistry.writer" \
  --condition=None \
  --quiet || echo "⚠️  Artifact Registry Writer role may already be granted"

echo ""

# Also grant Service Account User role (sometimes needed)
echo "👤 Granting Service Account User role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/iam.serviceAccountUser" \
  --condition=None \
  --quiet || echo "⚠️  Service Account User role may already be granted"

echo ""
echo "✅ Permissions granted successfully!"
echo ""
echo "🧪 Verifying permissions..."
echo "   Service Account: $CLOUD_BUILD_SA"
echo ""
echo "📋 Current IAM bindings for Cloud Build service account:"
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:${CLOUD_BUILD_SA}" \
  --format="table(bindings.role)" || echo "⚠️  Could not verify permissions"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Permission fix complete!"
echo ""
echo "🚀 You can now try deploying again:"
echo "   ./deploy-backend-new.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

