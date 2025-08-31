# Railway Deployment Guide

This guide explains how to deploy the Vertix Try-On application on Railway with both frontend and backend services.

## Prerequisites

1. Railway account
2. Google Cloud Platform project with AI Platform enabled
3. Service account credentials

## Deployment Steps

### Option 1: Deploy as Separate Services (Recommended)

#### 1. Deploy Backend Service

1. Create a new Railway project
2. Connect your GitHub repository
3. Set the **Root Directory** to `server`
4. Set the **Build Command** to: `npm install`
5. Set the **Start Command** to: `npm start`
6. Add the following environment variables:
   - `GOOGLE_PROJECT_ID`: Your Google Cloud project ID
   - `GOOGLE_LOCATION`: Your AI Platform location (e.g., `us-central1`)
   - `GOOGLE_MODEL_ID`: Your model ID (e.g., `gemini-1.5-flash`)
   - `GOOGLE_APPLICATION_CREDENTIALS`: The path to your service account JSON file

7. Upload your service account JSON file as a secret:
   - Go to Variables tab
   - Add a new variable with name `GOOGLE_APPLICATION_CREDENTIALS`
   - Set the value to the contents of your JSON file

#### 2. Deploy Frontend Service

1. Create another service in the same Railway project
2. Set the **Root Directory** to `/` (root of the repository)
3. Set the **Build Command** to: `npm run build`
4. Set the **Start Command** to: `npx serve -s build -l 3000`
5. Add the following environment variable:
   - `REACT_APP_API_URL`: The URL of your backend service (e.g., `https://your-backend-service.railway.app`)

### Option 2: Deploy with Docker Compose

1. Create a new Railway project
2. Connect your GitHub repository
3. Railway will automatically detect the `docker-compose.yml` file
4. Add the required environment variables as mentioned above
5. Deploy

## Environment Variables

### Backend Service
- `PORT`: Port number (Railway sets this automatically)
- `GOOGLE_PROJECT_ID`: Your Google Cloud project ID
- `GOOGLE_LOCATION`: AI Platform location (e.g., `us-central1`)
- `GOOGLE_MODEL_ID`: Your model ID
- `GOOGLE_APPLICATION_CREDENTIALS`: Service account credentials

### Frontend Service
- `REACT_APP_API_URL`: Backend service URL

## Testing the Deployment

1. **Backend Health Check**: Visit `https://your-backend-service.railway.app/api/health`
2. **Frontend**: Visit your frontend service URL
3. **API Integration**: Test the virtual try-on functionality

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure the backend CORS configuration includes your frontend domain
2. **Google Auth Errors**: Verify your service account credentials and permissions
3. **Build Failures**: Check that all dependencies are properly installed

### Logs

- Check Railway logs for both services
- Backend logs will show API requests and errors
- Frontend logs will show build and runtime errors

## Local Development

To test locally before deploying:

```bash
# Start both services
docker-compose up --build

# Or start individually
cd server && npm install && npm start
# In another terminal
npm install && npm start
```

## Security Notes

1. Never commit service account credentials to version control
2. Use Railway's secret management for sensitive data
3. Enable HTTPS for production deployments
4. Consider implementing rate limiting for the API
