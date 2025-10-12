const express = require('express');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const tinify = require('tinify');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS configuration for development and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'https://mirrify-creativespaces.up.railway.app', // Your Railway frontend domain
  'https://mirrify-app-907099703781.us-central1.run.app', // Google Cloud Run frontend
  'https://www.creativespaces.tech', // Creative Spaces production domain (with www)
  'https://creativespaces.tech', // Creative Spaces production domain (without www)
  process.env.FRONTEND_URL, // Fallback for environment variable
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // For production, allow your specific domains
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log blocked origins for debugging
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));

// Google Cloud authentication
// On Cloud Run, use default service account; otherwise use explicit credentials
let authConfig = {
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
};

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // For local development or when explicit credentials are provided
  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('Using explicit credentials, project_id:', credentials.project_id);
    const credentialsPath = path.join(__dirname, 'temp-credentials.json');
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
    authConfig.keyFile = credentialsPath;
  } catch (error) {
    console.error('Error parsing credentials:', error);
    authConfig.keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }
} else {
  // On Cloud Run, use default service account
  console.log('Using default service account (Cloud Run)');
}

const auth = new GoogleAuth(authConfig);

// Configure TinyPNG
if (process.env.TINYPNG_API_KEY) {
  tinify.key = process.env.TINYPNG_API_KEY;
  console.log('TinyPNG API configured');
} else {
  console.log('TinyPNG API key not found - using fallback compression');
}

// Get access token
async function getAccessToken() {
  try {
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    return token.token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// Root endpoint for debugging
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/token',
      tryOn: '/api/try-on'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Get access token endpoint
app.get('/api/auth/token', async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({ accessToken: token });
  } catch (error) {
    console.error('Error getting access token:', error);
    res.status(500).json({ error: 'Failed to get access token' });
  }
});

// Proxy endpoint for images to handle CORS
app.get('/api/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      timeout: 10000,
    });

    // Set CORS headers
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': response.headers['content-type'] || 'image/jpeg',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    });

    response.data.pipe(res);
  } catch (error) {
    console.error('Error proxying image:', error.message);
    res.status(500).json({ error: 'Failed to load image' });
  }
});

// TinyPNG compression endpoint
app.post('/api/compress-image', async (req, res) => {
  try {
    const { imageData, maxDimension = 1024 } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64');
    
    if (!process.env.TINYPNG_API_KEY) {
      // Fallback to client-side compression if no API key
      return res.status(400).json({ 
        error: 'TinyPNG API key not configured',
        fallback: true 
      });
    }

    // Compress with TinyPNG (maintain original DPI/resolution)
    const source = tinify.fromBuffer(imageBuffer);
    
    // Get original dimensions first
    const originalMetadata = await source.metadata();
    const originalWidth = originalMetadata.width;
    const originalHeight = originalMetadata.height;
    
    let processedSource = source;
    let finalWidth = originalWidth;
    let finalHeight = originalHeight;
    
    // Only resize if the largest dimension exceeds maxDimension
    const largestDimension = Math.max(originalWidth, originalHeight);
    if (largestDimension > maxDimension) {
      // Calculate new dimensions maintaining aspect ratio
      if (originalWidth > originalHeight) {
        finalWidth = maxDimension;
        finalHeight = Math.round((originalHeight * maxDimension) / originalWidth);
      } else {
        finalHeight = maxDimension;
        finalWidth = Math.round((originalWidth * maxDimension) / originalHeight);
      }
      
      processedSource = source.resize({
        method: 'scale',
        width: finalWidth,
        height: finalHeight
      });
    }

    const compressedBuffer = await processedSource.toBuffer();
    
    // Convert back to base64
    const compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
    
    res.json({
      success: true,
      compressedImage: compressedBase64,
      originalSize: imageBuffer.length,
      compressedSize: compressedBuffer.length,
      compressionRatio: ((imageBuffer.length - compressedBuffer.length) / imageBuffer.length * 100).toFixed(1),
      originalDimensions: { width: originalWidth, height: originalHeight },
      processedDimensions: { width: finalWidth, height: finalHeight },
      wasResized: largestDimension > maxDimension
    });

  } catch (error) {
    console.error('Error compressing image with TinyPNG:', error.message);
    
    // If TinyPNG fails, return fallback instruction
    res.status(500).json({ 
      error: 'TinyPNG compression failed',
      fallback: true,
      details: error.message 
    });
  }
});

// Proxy endpoint for virtual try-on API
app.post('/api/try-on', async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    
    const response = await axios.post(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/neat-cycling-470410-t9/locations/us-central1/publishers/google/models/virtual-try-on-preview-08-04:predict`, 
      req.body,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 300000, // 5 minutes
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error calling Creative spaces API:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || 'Internal server error',
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

