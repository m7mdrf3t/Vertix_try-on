# Railway Deployment Guide (Simplified)

This guide provides a simple approach to deploy your Vertix Try-On application on Railway without nginx proxy complications.

## Prerequisites

1. Railway account
2. Google Cloud Platform project with AI Platform enabled
3. Service account credentials

## Deployment Steps

### Step 1: Deploy Backend Service

1. **Create a new Railway project**
2. **Connect your GitHub repository**
3. **Create a new service for the backend:**
   - Click "New Service" → "GitHub Repo"
   - Select your repository
   - Set **Root Directory** to: `server`
   - Set **Build Command** to: `npm install`
   - Set **Start Command** to: `npm start`

4. **Add Environment Variables:**
   - `GOOGLE_PROJECT_ID`: Your Google Cloud project ID
   - `GOOGLE_LOCATION`: Your AI Platform location (e.g., `us-central1`)
   - `GOOGLE_MODEL_ID`: Your model ID (e.g., `gemini-1.5-flash`)
   - `GOOGLE_APPLICATION_CREDENTIALS`: The contents of your service account JSON file

5. **Deploy the backend service**

### Step 2: Deploy Frontend Service

1. **In the same Railway project, create another service:**
   - Click "New Service" → "GitHub Repo"
   - Select the same repository
   - Set **Root Directory** to: `/` (leave empty for root)
   - Set **Build Command** to: `npm run build`
   - Set **Start Command** to: `npm run serve`

2. **Add Environment Variable:**
   - `REACT_APP_API_URL`: The URL of your backend service (e.g., `https://your-backend-service.railway.app`)

3. **Deploy the frontend service**

## Environment Variables Summary

### Backend Service Variables:
```
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_LOCATION=us-central1
GOOGLE_MODEL_ID=your-model-id
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account",...}
```

### Frontend Service Variables:
```
REACT_APP_API_URL=https://your-backend-service.railway.app
```

## Testing Your Deployment

1. **Backend Health Check**: Visit `https://your-backend-service.railway.app/api/health`
2. **Frontend**: Visit your frontend service URL
3. **Test the full flow**: Upload images and test the virtual try-on functionality

## Troubleshooting

### Common Issues:

1. **CORS Errors**: The backend is configured to accept requests from any origin in production
2. **Build Failures**: Make sure all dependencies are properly installed
3. **Environment Variables**: Double-check that all required variables are set

### Checking Logs:

- Go to each service in Railway dashboard
- Click on "Deployments" tab
- View logs for any errors

## Alternative: Single Service Deployment

If you prefer to deploy as a single service, you can use the `docker-compose.yml` file:

1. Create a new Railway project
2. Connect your repository
3. Railway will automatically detect the `docker-compose.yml` file
4. Add the required environment variables
5. Deploy

## Local Testing

Before deploying, test locally:

```bash
# Start backend
cd server && npm install && npm start

# In another terminal, start frontend
npm install && npm start
```

## Security Notes

1. Never commit service account credentials to version control
2. Use Railway's secret management for sensitive data
3. The backend CORS is configured to accept requests from any origin in production
4. Consider implementing rate limiting for production use
