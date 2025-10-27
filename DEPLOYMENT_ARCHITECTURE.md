# Deployment Architecture Overview

## Current Deployment Setup

### Backend Service
- **Location**: `/server` directory
- **Runtime**: Node.js 18 with Express.js
- **Port**: 3001 (configurable via `PORT` env var)
- **Key Features**:
  - Google AI Platform integration for virtual try-on
  - Image processing with Sharp
  - TinyPNG compression
  - Supabase analytics tracking
  - CORS-enabled for multiple frontends

### Frontend Service
- **Location**: Root directory (`/src` for source, `/build` for production)
- **Runtime**: React 18 + TypeScript
- **Build Output**: `/build` directory
- **Serving Options**:
  - `serve.js` - Express-based server (for Railway)
  - nginx - Production web server (for Docker)
  - `serve` package - Simple static file server

## Deployment Methods

### 1. Railway Deployment (Recommended for Separate Services)

#### Backend Service:
```
Root Directory: server
Build Command: npm install
Start Command: npm start
Port: 3001 (auto-assigned by Railway)
```

**Environment Variables:**
- `GOOGLE_APPLICATION_CREDENTIALS` (JSON content)
- `GOOGLE_PROJECT_ID`
- `GOOGLE_LOCATION`
- `GOOGLE_MODEL_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `TINYPNG_API_KEY` (optional)

#### Frontend Service:
```
Root Directory: / (root)
Build Command: npm run build
Start Command: npm run serve
Port: 8080 (auto-assigned by Railway)
```

**Environment Variables:**
- `REACT_APP_API_URL` (Backend service URL)
- `PORT` (auto-assigned)

### 2. Docker Compose Deployment

Uses `docker-compose.yml` to deploy both services:
- **Backend**: Port 3001
- **Frontend**: Port 80 (nginx-reverse proxy)

```bash
docker-compose up --build
```

### 3. Google Cloud Run Deployment

Based on the Dockerfile configurations:
- `server/Dockerfile` - Backend service
- `Dockerfile.railway` or `Dockerfile.react` - Frontend service

## Multiple Frontend Support

The architecture **natively supports multiple frontends** through:

### CORS Configuration (server/server.js lines 29-86)

#### 1. Hardcoded Allowed Origins:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'https://mirrify-creativespaces.up.railway.app',
  'https://mirrify-app-907099703781.us-central1.run.app',
  'https://mirrify-frontend-907099703781.us-central1.run.app',
  'https://www.creativespaces.tech',
  'https://creativespaces.tech',
  process.env.FRONTEND_URL,
];
```

#### 2. Pattern-Based Shopify Domains:
```javascript
// Automatic CORS for any .myshopify.com domain
origin.match(/^https:\/\/[a-zA-Z0-9-]+\.myshopify\.com$/)

// Automatic CORS for any .pages.shopify.com domain
origin.match(/^https:\/\/[a-zA-Z0-9-]+\.pages\.shopify\.com$/)
```

#### 3. Custom Shopify Domains:
```javascript
const customShopifyDomains = [
  'https://rzurp0-bj.myshopify.com',
];
```

### How to Add a New Frontend

#### Option 1: Add Specific Domain
Edit `server/server.js` and add to `allowedOrigins` array:
```javascript
const allowedOrigins = [
  // ... existing domains
  'https://your-new-frontend.com',
];
```

#### Option 2: Use Environment Variable
Set `FRONTEND_URL` environment variable (already supported)

#### Option 3: Add to Custom Shopify Domains
For Shopify-specific domains, add to `customShopifyDomains` array

#### Option 4: Use Pattern Matching
For dynamic domains (like all `.myshopify.com` domains), the pattern matcher automatically handles them

## Key Architecture Benefits

1. **Decoupled Frontend/Backend**: Each can be deployed independently
2. **Multiple Frontend Support**: One backend serves multiple frontends
3. **CORS Flexibility**: Supports hardcoded, environment-based, and pattern-based origins
4. **Shopify Integration**: Built-in support for Shopify store domains
5. **Scalable**: Can add new frontends without modifying backend code (via environment variables)

## Deployment Workflow

### For a New Frontend:

1. **Build the frontend** with `REACT_APP_API_URL` pointing to your backend
2. **Deploy frontend** to Railway/Cloud Run/Your hosting
3. **Add frontend domain** to backend CORS configuration (one of the methods above)
4. **Deploy backend** (if CORS changed) or just restart if using environment variables
5. **Test** - Frontend should now communicate with backend

### For an Existing Frontend:

No changes needed! Backend CORS already configured for multiple origins.

## Current Deployed Services

Based on CORS configuration, these frontends are currently supported:

1. Local development (localhost:3000, localhost:3002)
2. Railway: mirrify-creativespaces.up.railway.app
3. Google Cloud Run: mirrify-app and mirrify-frontend services
4. Creative Spaces: www.creativespaces.tech and creativespaces.tech
5. Shopify Stores: Any .myshopify.com or .pages.shopify.com domain
6. Custom Shopify: rzurp0-bj.myshopify.com
7. Environment-based: Any domain in FRONTEND_URL env var

## File Structure Reference

```
/
├── src/                    # React frontend source
├── build/                  # Compiled frontend (deployment ready)
├── server/                 # Backend service
│   ├── server.js          # Main Express server
│   ├── Dockerfile         # Backend container
│   └── imageProcessor.js  # Image processing
├── public/                 # Frontend static assets
├── Dockerfile.railway      # Railway frontend container
├── Dockerfile.react        # Generic React container
├── docker-compose.yml      # Docker Compose config
├── serve.js               # Express static file server
└── nginx.railway.conf      # nginx configuration
```

## API Integration

Frontend connects to backend via:
```javascript
// src/services/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  'https://mirrify-backend-907099703781.us-central1.run.app';
```

Backend exposes endpoints at `/api/*` routes:
- `/api/health` - Health check
- `/api/auth/token` - Google Cloud auth
- `/api/try-on` - Virtual try-on
- `/api/process-image` - Image processing
- `/api/compress-image` - Image compression
- `/api/events/register` - Analytics events

## Environment Variables Summary

### Backend Required:
- `GOOGLE_APPLICATION_CREDENTIALS`
- `GOOGLE_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Backend Optional:
- `PORT` (defaults to 3001)
- `GOOGLE_LOCATION` (defaults to us-central1)
- `GOOGLE_MODEL_ID` (defaults to gemini-1.5-flash)
- `TINYPNG_API_KEY`
- `FRONTEND_URL`

### Frontend Required:
- `REACT_APP_API_URL`

### Frontend Optional:
- `PORT` (defaults to 8080)

