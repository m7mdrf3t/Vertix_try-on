# Google Cloud Run Troubleshooting Guide

## Sharp Compression Issues on Google Cloud

### Common Problems and Solutions

#### 1. Sharp Module Not Found
**Error**: `Cannot find module 'sharp'` or `sharp is not defined`

**Solution**:
```bash
# Use the Google Cloud optimized Dockerfile
docker build -f server/Dockerfile.google -t your-image .
```

#### 2. Sharp Binary Issues
**Error**: `Something went wrong installing the "sharp" module`

**Solution**:
- The Dockerfile.google includes `npm rebuild sharp --platform=linux --arch=x64`
- This ensures Sharp is compiled for the correct platform

#### 3. Memory Issues
**Error**: `Process out of memory` or timeouts

**Solution**:
```bash
# Deploy with more memory
gcloud run deploy your-service \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300
```

#### 4. Port Configuration
**Error**: `EADDRINUSE` or connection refused

**Solution**:
- Google Cloud Run sets `PORT` environment variable
- Server automatically uses `process.env.PORT || 3001`

### Deployment Commands

#### Quick Deploy
```bash
# Build and deploy
cd server
docker build -f Dockerfile.google -t gcr.io/your-project/mirrify-backend .
docker push gcr.io/your-project/mirrify-backend

gcloud run deploy mirrify-backend \
  --image gcr.io/your-project/mirrify-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2
```

#### Using the Deployment Script
```bash
# Make executable and run
chmod +x deploy-google-cloud.sh
./deploy-google-cloud.sh
```

### Testing the Deployment

#### 1. Health Check
```bash
curl https://your-service-url.a.run.app/api/health
```

#### 2. Test Image Compression
```bash
curl -X POST \
  -F "image=@test-image.jpg" \
  -F "maxDimension=1024" \
  -F "quality=90" \
  -F "format=jpeg" \
  https://your-service-url.a.run.app/api/process-image \
  --output compressed.jpg
```

#### 3. Test Metadata Extraction
```bash
curl -X POST \
  -F "image=@test-image.jpg" \
  https://your-service-url.a.run.app/api/image-metadata
```

### Environment Variables

Required for production:
```bash
NODE_ENV=production
TINYPNG_API_KEY=your_tinypng_key  # Optional, for fallback
```

### Monitoring and Logs

#### View Logs
```bash
gcloud run services logs read mirrify-backend --region us-central1
```

#### Check Service Status
```bash
gcloud run services describe mirrify-backend --region us-central1
```

### Common Fixes

#### 1. Rebuild Sharp for Cloud Run
```dockerfile
# In Dockerfile.google
RUN npm rebuild sharp --platform=linux --arch=x64
```

#### 2. Increase Memory Limits
```bash
gcloud run deploy your-service --memory 2Gi --cpu 2
```

#### 3. Check CORS Configuration
Ensure your frontend URL is in the allowed origins list in `server.js`.

#### 4. Verify Dependencies
```bash
# Check if Sharp is properly installed
docker run --rm your-image node -e "console.log(require('sharp').versions)"
```

### Performance Optimization

#### 1. Enable Caching
```javascript
// Add cache headers
res.set('Cache-Control', 'public, max-age=3600');
```

#### 2. Optimize Image Processing
```javascript
// Use appropriate quality settings
const quality = process.env.NODE_ENV === 'production' ? 85 : 90;
```

#### 3. Monitor Resource Usage
- Use Cloud Run metrics to monitor CPU and memory usage
- Adjust memory allocation based on image sizes

### Debugging Steps

1. **Check Logs**: Look for Sharp-related errors in Cloud Run logs
2. **Test Locally**: Use Docker to test the exact same environment
3. **Verify Dependencies**: Ensure all Sharp dependencies are installed
4. **Check Memory**: Monitor memory usage during image processing
5. **Test with Small Images**: Start with small images to isolate issues

### Success Indicators

✅ **Working Correctly**:
- Health check returns `{"status":"OK"}`
- Image compression returns processed image
- Metadata extraction returns image details
- No Sharp-related errors in logs

❌ **Issues Detected**:
- 500 errors on image processing
- Sharp module not found errors
- Memory/timeout errors
- CORS errors from frontend

