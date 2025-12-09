# Quick Setup - Service Account Configuration

## ✅ What Was Changed

1. **Project ID Updated**: Changed from `neat-cycling-470410-t9` to `tryandfit` in all files
2. **Server.js**: Now uses `GOOGLE_PROJECT_ID` environment variable instead of hardcoded value
3. **Deployment Scripts**: Updated to include `GOOGLE_APPLICATION_CREDENTIALS` environment variable
4. **Cloud Build Files**: Updated with new project ID

## 🚀 Quick Start

### 1. Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Project: **tryandfit**
3. **IAM & Admin** → **Service Accounts** → **Create Service Account**
4. Name: `mirrify-backend-service`
5. Grant role: **Vertex AI User** (`roles/aiplatform.user`)
6. **Create Key** → **JSON** → Download

### 2. Set Up Local Development

```bash
# Copy the example file
cp server/.env.example server/.env

# Place your downloaded JSON file in server/ directory
# Name it tryandfit.json (or update .env with correct path)

# Edit server/.env and update:
GOOGLE_PROJECT_ID=tryandfit
GOOGLE_APPLICATION_CREDENTIALS=./tryandfit.json
```

### 3. Deploy to Cloud Run

**Before deploying, set your credentials:**

```bash
# Option 1: Set as environment variable (JSON string)
export GOOGLE_APPLICATION_CREDENTIALS=$(cat server/tryandfit.json | jq -c)

# Option 2: Or update deploy-backend-new.sh to read from file
```

Then deploy:
```bash
./deploy-backend-new.sh
```

## 🔄 Changing Service Account Later

### Easy Method (Recommended):

1. **Download new service account JSON**
2. **For local**: Replace `server/service-account-key.json` and restart
3. **For Cloud Run**: Update environment variable:
   ```bash
   gcloud run services update mirrify-backend-v2 \
     --update-env-vars GOOGLE_APPLICATION_CREDENTIALS="$(cat new-key.json | jq -c)" \
     --region us-central1 \
     --project tryandfit
   ```

## 📝 Current Configuration

- **Project ID**: `tryandfit`
- **Account Email**: `m7mdrf3t6@gmail.com`
- **Service Account**: Create one following Step 1 above

## 📚 More Details

See `SERVICE_ACCOUNT_SETUP.md` for complete documentation.

