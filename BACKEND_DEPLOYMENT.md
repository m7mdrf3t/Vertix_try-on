# Backend Deployment Guide

This guide explains how to deploy the backend to a new domain on Google Cloud Run and switch the frontend to use it.

## Backend URLs

### Current Active Backend
- **New Backend**: `https://mirrify-backend-v2-907099703781.us-central1.run.app`
- **Previous Backend**: `https://mirrify-backend-907099703781.us-central1.run.app` (kept for rollback)

## Deploying to New Domain

### Step 1: Deploy the Backend

Run the deployment script to deploy to a new Google Cloud Run service:

```bash
./deploy-backend-new.sh
```

This script will:
1. Build the Docker image with the backend server
2. Push it to Google Container Registry
3. Deploy to Cloud Run with service name `mirrify-backend-v2`
4. Test the deployment

**Prerequisites:**
- Google Cloud SDK (`gcloud`) installed and authenticated
- Docker installed and running
- `TINYPNG_API_KEY` environment variable set (optional, for image compression)

### Step 2: Update Frontend Configuration

The frontend is already configured to use the new backend URL. The configuration is managed in:

- **Configuration File**: `src/config/backend.ts`
- **API Service**: `src/services/api.ts`

#### Using Environment Variable (Recommended for Local Development)

Create a `.env` file in the project root:

```bash
REACT_APP_API_URL=https://mirrify-backend-v2-907099703781.us-central1.run.app
```

For production builds, set the environment variable during build:

```bash
REACT_APP_API_URL=https://mirrify-backend-v2-907099703781.us-central1.run.app npm run build
```

#### Direct Configuration Edit

Edit `src/config/backend.ts`:

```typescript
export const BACKEND_CONFIG = {
  CURRENT: 'https://mirrify-backend-v2-907099703781.us-central1.run.app', // New backend
  PREVIOUS: 'https://mirrify-backend-907099703781.us-central1.run.app',   // Old backend
} as const;
```

### Step 3: Rollback (if needed)

To switch back to the previous backend, update `src/config/backend.ts`:

```typescript
export const BACKEND_CONFIG = {
  CURRENT: 'https://mirrify-backend-907099703781.us-central1.run.app',  // Previous backend
  PREVIOUS: 'https://mirrify-backend-v2-907099703781.us-central1.run.app', // New backend
} as const;
```

Or set the environment variable:

```bash
REACT_APP_API_URL=https://mirrify-backend-907099703781.us-central1.run.app npm run build
```

## Configuration Structure

```
src/
├── config/
│   └── backend.ts          # Backend URL configuration
├── services/
│   └── api.ts              # API service using backend config
└── App.tsx                 # Main app (uses backend for proxy)
```

## Verification

After deployment, verify the new backend is working:

1. **Health Check**:
   ```bash
   curl https://mirrify-backend-v2-907099703781.us-central1.run.app/api/health
   ```

2. **Check Frontend Console**:
   - Open browser developer tools
   - Look for console logs showing the backend URL being used
   - Should see: `🔗 Current API_BASE_URL: https://mirrify-backend-v2-...`

3. **Test Try-On Functionality**:
   - Upload a person image
   - Select a product
   - Run the try-on process
   - Verify it completes successfully

## Troubleshooting

### Backend Not Responding

1. Check Cloud Run service status:
   ```bash
   gcloud run services describe mirrify-backend-v2 --region us-central1
   ```

2. Check logs:
   ```bash
   gcloud run services logs read mirrify-backend-v2 --region us-central1
   ```

### CORS Errors

If you see CORS errors, verify that your frontend domain is in the allowed origins list in `server/server.js`:

```javascript
const allowedOrigins = [
  'https://your-frontend-domain.com',
  // ... other origins
];
```

Then redeploy the backend.

### Frontend Still Using Old Backend

1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check that `src/config/backend.ts` has the correct URL
4. Rebuild the frontend if needed: `npm run build`

## Notes

- Both backend services will run independently
- The previous backend remains available for rollback
- Environment variables take precedence over config file settings
- Changes to `src/config/backend.ts` require a rebuild

