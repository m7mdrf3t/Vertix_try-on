# Mirrify API Documentation

## Base URL
```
https://mirrify-backend-907099703781.us-central1.run.app
```

## Authentication

**No authentication required for API consumers!** 

The API is designed to be consumer-friendly:
- ✅ **No API keys needed**
- ✅ **No special headers required**
- ✅ **No registration required**

The server handles all Google Cloud authentication internally using service account credentials. API consumers can call endpoints directly with standard HTTP headers only.

## Endpoints

### 1. Health Check
**GET** `/api/health`

Check if the server is running.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### 2. Virtual Try-On (Main Feature)
**POST** `/api/try-on`

Generate virtual try-on predictions using Google AI Platform.

**Request Body:**
```json
{
  "instances": [
    {
      "person_image": "base64_encoded_person_image",
      "garment_image": "base64_encoded_garment_image"
    }
  ],
  "parameters": {
    "confidence_threshold": 0.5
  }
}
```

**Response:**
```json
{
  "predictions": [
    {
      "result_image": "base64_encoded_result_image",
      "confidence": 0.95
    }
  ]
}
```

### 3. Image Processing
**POST** `/api/process-image`

Compress and process images using Sharp library.

**Request:** FormData
- `image`: Image file (multipart/form-data)
- `maxDimension`: Maximum dimension (default: 1024)
- `quality`: JPEG quality 1-100 (default: 90)
- `format`: Output format (default: 'jpeg')
- `preserveMetadata`: Boolean (default: true)

**Response:** Processed image file

### 4. Image Metadata
**POST** `/api/image-metadata`

Extract metadata from images.

**Request:** FormData
- `image`: Image file (multipart/form-data)

**Response:**
```json
{
  "width": 1920,
  "height": 1080,
  "density": 300,
  "format": "jpeg",
  "size": 1024000,
  "channels": 3,
  "hasAlpha": false
}
```

### 5. Image Proxy
**GET** `/api/proxy-image?url={image_url}`

Proxy images to handle CORS issues.

**Parameters:**
- `url`: URL of the image to proxy

**Response:** Image file

### 6. TinyPNG Compression
**POST** `/api/compress-image`

Compress images using TinyPNG API.

**Request Body:**
```json
{
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "maxDimension": 1024
}
```

**Response:**
```json
{
  "success": true,
  "compressedImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "originalSize": 1024000,
  "compressedSize": 256000,
  "compressionRatio": "75.0",
  "originalDimensions": { "width": 1920, "height": 1080 },
  "processedDimensions": { "width": 1024, "height": 576 },
  "wasResized": true
}
```

## CORS Configuration

The API accepts requests from:
- `https://mirrify-creativespaces.up.railway.app`
- `https://mirrify-app-907099703781.us-central1.run.app`
- `https://www.creativespaces.tech`
- `https://creativespaces.tech`
- `http://localhost:3000` (development)
- `http://localhost:3002` (development)

### Shopify Integration
The API is configured to work with Shopify stores and supports:
- **Shopify Stores**: `https://your-store-name.myshopify.com`
- **Shopify Pages**: `https://your-store-name.pages.shopify.com`
- **Custom Shopify Domains**: Add specific domains to the server configuration

For custom Shopify domains, contact the development team to add your domain to the allowed origins list.

## Rate Limits

- No explicit rate limits configured
- Google Cloud Run handles scaling automatically
- 5-minute timeout for virtual try-on requests

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing parameters)
- `500`: Internal Server Error

Error responses include:
```json
{
  "error": "Error message",
  "details": "Additional error details (development only)"
}
```

## Example Usage

### JavaScript/TypeScript
```javascript
// Health check
const response = await fetch('https://mirrify-backend-907099703781.us-central1.run.app/api/health');
const data = await response.json();

// Virtual try-on
const tryOnResponse = await fetch('https://mirrify-backend-907099703781.us-central1.run.app/api/try-on', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    instances: [{
      person_image: "base64_person_image",
      garment_image: "base64_garment_image"
    }],
    parameters: {
      confidence_threshold: 0.5
    }
  })
});
```

### cURL
```bash
# Health check
curl https://mirrify-backend-907099703781.us-central1.run.app/api/health

# Virtual try-on
curl -X POST https://mirrify-backend-907099703781.us-central1.run.app/api/try-on \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "person_image": "base64_person_image",
      "garment_image": "base64_garment_image"
    }],
    "parameters": {
      "confidence_threshold": 0.5
    }
  }'
```

## Support

For technical support or questions about the API, please contact the development team.

---
**Last Updated**: January 2025
**API Version**: 1.0.0
