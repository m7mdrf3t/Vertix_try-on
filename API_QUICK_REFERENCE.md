# Mirrify API - Quick Reference

## 🚀 Base URL
```
https://mirrify-backend-907099703781.us-central1.run.app
```

> **Note**: This is the PRIMARY service with latest Shopify CORS support. 
> Avoid using the older `mirrify-server-*` URL.

## 📋 Main Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Check server status |
| `/api/try-on` | POST | Virtual try-on predictions |
| `/api/process-image` | POST | Image compression (Sharp) |
| `/api/image-metadata` | POST | Extract image metadata |
| `/api/proxy-image` | GET | CORS image proxy |
| `/api/compress-image` | POST | TinyPNG compression |
| `/api/events/register` | POST | Register analytics events |
| `/api/events` | GET | Retrieve analytics events |

## 🔥 Most Important: Virtual Try-On

**Endpoint:** `POST /api/try-on`

**Request:**
```json
{
  "instances": [{
    "person_image": "base64_person_image",
    "garment_image": "base64_garment_image"
  }],
  "parameters": {
    "confidence_threshold": 0.5
  }
}
```

**Response:**
```json
{
  "predictions": [{
    "result_image": "base64_result_image",
    "confidence": 0.95
  }]
}
```

## 📊 Analytics Dashboard Endpoints

### Register Analytics Event

**Endpoint:** `POST /api/events/register`

**Request:**
```json
{
  "eventType": "product_selected",
  "productId": 9913222791475,
  "productTitle": "Off-White",
  "productHandle": "off-white-shirt",
  "timestamp": "2025-10-22T14:05:00Z",
  "shop": "store-name.myshopify.com"
}
```

**Response:**
```json
{
  "success": true,
  "eventId": 123
}
```

### Get Analytics Events

**Endpoint:** `GET /api/events`

**Query Parameters:**
- `eventType` (optional): Filter by event type (e.g., "product_selected", "generate_tryon", "add_to_cart")
- `startDate` (optional): Filter events from this date (ISO format)
- `endDate` (optional): Filter events until this date (ISO format)
- `shop` (optional): Filter by shop domain
- `limit` (optional): Number of events to return (default: 100)
- `offset` (optional): Number of events to skip (default: 0)

**Example:**
```
GET /api/events?eventType=product_selected&shop=store-name.myshopify.com&limit=50
```

**Response:**
```json
[
  {
    "eventType": "product_selected",
    "productId": 9913222791475,
    "productTitle": "Off-White",
    "productHandle": "off-white-shirt",
    "timestamp": "2025-10-22T14:05:00Z",
    "shop": "store-name.myshopify.com"
  },
  {
    "eventType": "generate_tryon",
    "productId": 9913222791475,
    "productTitle": "Off-White",
    "productHandle": "off-white-shirt",
    "timestamp": "2025-10-22T14:06:15Z",
    "shop": "store-name.myshopify.com"
  }
]
```

## 🧪 Test the API

```bash
# Health check
curl https://mirrify-backend-907099703781.us-central1.run.app/api/health

# Should return: {"status":"OK","message":"Server is running"}

# Register analytics event
curl -X POST https://mirrify-backend-907099703781.us-central1.run.app/api/events/register \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "product_selected",
    "productId": 9913222791475,
    "productTitle": "Off-White",
    "productHandle": "off-white-shirt",
    "shop": "store-name.myshopify.com"
  }'

# Get analytics events
curl https://mirrify-backend-907099703781.us-central1.run.app/api/events

# Get events filtered by type
curl "https://mirrify-backend-907099703781.us-central1.run.app/api/events?eventType=product_selected"

# Get events with pagination
curl "https://mirrify-backend-907099703781.us-central1.run.app/api/events?limit=10&offset=0"
```

## 🔧 Integration

**JavaScript/React:**
```javascript
const API_BASE_URL = 'https://mirrify-backend-907099703781.us-central1.run.app';

// Virtual try-on
const response = await fetch(`${API_BASE_URL}/api/try-on`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    instances: [{ person_image, garment_image }],
    parameters: { confidence_threshold: 0.5 }
  })
});

// Register analytics event
const analyticsResponse = await fetch(`${API_BASE_URL}/api/events/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'product_selected',
    productId: 9913222791475,
    productTitle: 'Off-White',
    productHandle: 'off-white-shirt',
    shop: 'store-name.myshopify.com'
  })
});

// Get analytics events
const eventsResponse = await fetch(`${API_BASE_URL}/api/events?eventType=product_selected&limit=50`);
const events = await eventsResponse.json();
```

**Python:**
```python
import requests

api_url = "https://mirrify-backend-907099703781.us-central1.run.app"

# Health check
response = requests.get(f"{api_url}/api/health")
print(response.json())

# Virtual try-on
data = {
    "instances": [{
        "person_image": person_base64,
        "garment_image": garment_base64
    }],
    "parameters": {"confidence_threshold": 0.5}
}
response = requests.post(f"{api_url}/api/try-on", json=data)

# Register analytics event
analytics_data = {
    "eventType": "product_selected",
    "productId": 9913222791475,
    "productTitle": "Off-White",
    "productHandle": "off-white-shirt",
    "shop": "store-name.myshopify.com"
}
analytics_response = requests.post(f"{api_url}/api/events/register", json=analytics_data)

# Get analytics events
events_response = requests.get(f"{api_url}/api/events?eventType=product_selected&limit=50")
events = events_response.json()
```

## ⚠️ Important Notes

- **Timeout**: 5 minutes for virtual try-on requests
- **CORS**: Configured for specific domains + Shopify stores
- **Shopify Support**: Works with `.myshopify.com` and `.pages.shopify.com` domains
- **File Size**: Up to 50MB for image uploads
- **Format**: Images should be base64 encoded for virtual try-on
- **Authentication**: **NO AUTH REQUIRED** - No API keys or special headers needed
- **Headers**: Only standard `Content-Type: application/json` for JSON endpoints

## 🆘 Support

If you encounter issues:
1. Check the health endpoint first
2. Verify your request format matches the examples
3. Ensure images are properly base64 encoded
4. Check CORS settings if calling from a web browser
