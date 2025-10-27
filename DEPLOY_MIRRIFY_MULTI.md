# Deploy Mirrify Multi Frontend to Google Cloud Run

## Overview
This deploys the dual-garment selection frontend as a separate service named "mirrify-multi" on Google Cloud Run.

## Prerequisites
1. Google Cloud CLI (`gcloud`) installed and authenticated
2. Docker installed locally
3. Project access to project ID: `907099703781`

## Deployment Steps

### Option 1: Using Cloud Build (Recommended)

Cloud Build builds the image in the cloud, so you don't need Docker locally.

```bash
# Set project
gcloud config set project 907099703781

# Submit build to Cloud Build
gcloud builds submit --tag gcr.io/907099703781/mirrify-multi .

# Deploy to Cloud Run
gcloud run deploy mirrify-multi \
  --image gcr.io/907099703781/mirrify-multi \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars "REACT_APP_API_URL=https://mirrify-backend-907099703781.us-central1.run.app,REACT_APP_UPPER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/1oJfOpMRLob3jASZmm_rRUWW6LlHHvx_FvzYwXlMp7to/edit?usp=sharing,REACT_APP_LOWER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/1PpLJtCicxCHrBynNB2i6OBOx_nnjJDFoCk9Kthnb9FI/edit?usp=sharing"
```

### Option 2: Using Deploy Script

If you have Docker installed locally:

```bash
chmod +x deploy-multi-frontend.sh
./deploy-multi-frontend.sh
```

## Configuration

### Environment Variables Set:
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_UPPER_GARMENT_SHEET_URL`: Upper garment Google Sheet
- `REACT_APP_LOWER_GARMENT_SHEET_URL`: Lower garment Google Sheet

### Service Details:
- **Name**: mirrify-multi
- **Region**: us-central1
- **Port**: 8080
- **Memory**: 512Mi
- **CPU**: 1
- **Max Instances**: 10

## Expected URL
After deployment, your frontend will be available at:
```
https://mirrify-multi-907099703781.us-central1.run.app
```

## Backend CORS
The backend CORS has been updated to allow this URL:
```
https://mirrify-multi-907099703781.us-central1.run.app
```

**Note**: If the backend server is deployed separately, you'll need to redeploy the backend with the updated CORS configuration.

## Verify Deployment

1. **Check service status:**
   ```bash
   gcloud run services describe mirrify-multi --region us-central1
   ```

2. **View logs:**
   ```bash
   gcloud run services logs read mirrify-multi --region us-central1
   ```

3. **Open in browser:**
   Visit: `https://mirrify-multi-907099703781.us-central1.run.app`

## Testing

After deployment:
1. Open the frontend URL
2. Upload a user photo
3. Select an upper garment (from Sheet 1)
4. Select a lower garment (from Sheet 2)
5. Click "Generate"
6. Verify the composite image is created and sent to backend
7. Check the virtual try-on result

## Troubleshooting

### Build Fails
- Ensure Docker is properly installed
- Check Google Cloud build logs

### CORS Errors
- Verify backend CORS includes the new frontend URL
- Redeploy backend if necessary

### Environment Variables Not Working
- Check env vars are set correctly in Cloud Run
- Rebuild and redeploy if needed

## Rollback

To rollback to a previous version:
```bash
gcloud run services update-traffic mirrify-multi \
  --to-revisions mirrify-multi-<previous-version>=100 \
  --region us-central1
```

## Update Environment Variables

To update environment variables without redeploying:
```bash
gcloud run services update mirrify-multi \
  --region us-central1 \
  --update-env-vars "KEY=VALUE"
```

## Cost Estimation

- **CPU**: 1 vCPU
- **Memory**: 512Mi
- **Invocations**: Pay per request
- **Estimated**: ~$10-50/month for moderate usage

