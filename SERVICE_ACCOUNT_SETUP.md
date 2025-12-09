# Service Account Setup Guide

This guide explains how to set up and change your Google Cloud service account credentials.

## Quick Setup

### Step 1: Create a Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **tryandfit**
3. Navigate to **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**
5. Fill in:
   - **Name**: `mirrify-backend-service`
   - **Description**: `Service account for Mirrify backend API`
6. Click **Create and Continue**
7. Grant roles:
   - `Vertex AI User` (roles/aiplatform.user) - for Virtual Try-On API
   - `Service Account User` (roles/iam.serviceAccountUser)
8. Click **Done**

### Step 2: Create and Download Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON** format
5. Download the JSON file
6. Save it as `server/tryandfit.json` (or any name you prefer)

### Step 3: Configure Credentials

#### For Local Development:

1. Copy the example env file:
   ```bash
   cp server/.env.example server/.env
   ```

2. Edit `server/.env` and set:
   ```env
   GOOGLE_PROJECT_ID=tryandfit
   GOOGLE_APPLICATION_CREDENTIALS=./tryandfit.json
   ```

3. Place your downloaded JSON file in the `server/` directory as `tryandfit.json`

#### For Google Cloud Run Deployment:

**Option A: Using Environment Variable (Recommended)**

1. Get your service account email (format: `service-account-name@tryandfit.iam.gserviceaccount.com`)

2. Before deploying, set the environment variable:
   ```bash
   # Read your JSON file and set it as an environment variable
   export GOOGLE_APPLICATION_CREDENTIALS=$(cat server/tryandfit.json | jq -c)
   ```

3. Deploy using the script:
   ```bash
   ./deploy-backend-new.sh
   ```

**Option B: Using Service Account Email (Cloud Run Default)**

1. Update your deployment script to use the service account:
   ```bash
   gcloud run deploy mirrify-backend-v2 \
     --service-account=mirrify-backend-service@tryandfit.iam.gserviceaccount.com \
     ...
   ```

## Changing Service Account in the Future

### Method 1: Update .env File (Local Development)

1. Download new service account JSON
2. Replace `server/tryandfit.json` (or update .env with new filename)
3. Restart your server

### Method 2: Update Cloud Run Environment Variable

1. Get new service account JSON
2. Convert to single-line JSON:
   ```bash
   cat new-service-account.json | jq -c
   ```

3. Update Cloud Run:
   ```bash
   gcloud run services update mirrify-backend-v2 \
     --update-env-vars GOOGLE_APPLICATION_CREDENTIALS="$(cat new-service-account.json | jq -c)" \
     --region us-central1 \
     --project tryandfit
   ```

### Method 3: Update Deployment Script

1. Edit `deploy-backend-new.sh`
2. Update the `GOOGLE_APPLICATION_CREDENTIALS` export before running:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=$(cat path/to/new-key.json | jq -c)
   ./deploy-backend-new.sh
   ```

## Current Configuration

- **Project ID**: `tryandfit`
- **Account Email**: `m7mdrf3t6@gmail.com`
- **Service Account**: Create one using the steps above

## Troubleshooting

### Error: "Permission denied"
- Make sure the service account has `Vertex AI User` role
- Check that the project ID matches: `tryandfit`

### Error: "Invalid credentials"
- Verify the JSON file is valid: `cat tryandfit.json | jq .`
- Check that `project_id` in JSON matches `tryandfit`

### Error: "Service account not found"
- Verify the service account email format: `name@tryandfit.iam.gserviceaccount.com`
- Make sure you're using the correct project

## Security Notes

⚠️ **Never commit service account JSON files to git!**

- The `.env` file is already in `.gitignore`
- Service account JSON files should also be in `.gitignore`
- Use environment variables for production deployments

