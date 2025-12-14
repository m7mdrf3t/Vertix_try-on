const express = require('express');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const tinify = require('tinify');
const multer = require('multer');
const { processImageWithSharp, getImageMetadata } = require('./imageProcessor');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://euvdpomiybrasicixerw.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dmRwb21peWJyYXNpY2l4ZXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDc0OTcsImV4cCI6MjA3NjcyMzQ5N30.T87XjLha8MwBAtJ3K-FfJlZrCB9qKpGoNYg29AAfg5M';
const supabase = createClient(supabaseUrl, supabaseKey);

// Google Cloud Run compatibility
if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode on Google Cloud Run');
  console.log('Port:', PORT);
}

// Middleware
// CORS configuration for development and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'https://mirrify-creativespaces.up.railway.app', // Your Railway frontend domain
  'https://mirrify-app-907099703781.us-central1.run.app', // Google Cloud Run frontend
  'https://mirrify-frontend-907099703781.us-central1.run.app', // Current Google Cloud Run frontend
  'https://mirrify-frontend-v2-907099703781.us-central1.run.app', // OLD Frontend v2 URL
  'https://mirrify-frontend-v2-cafok76baq-uc.a.run.app', // NEW Frontend v2 (current)
  'https://mirrify-frontend-v2-338398090136.us-central1.run.app', // Frontend v2 (alternative format)
  'https://mirrify-multi-907099703781.us-central1.run.app', // Mirrify multi-service
  'https://gant.eg', // Gant website
  'http://gant.eg', // Gant website (HTTP)
  'https://www.creativespaces.tech', // Creative Spaces production domain (with www)
  'https://creativespaces.tech', // Creative Spaces production domain (without www)
  process.env.FRONTEND_URL, // Fallback for environment variable
];

// Shopify domains pattern matching
const isShopifyDomain = (origin) => {
  if (!origin) return false;
  
  // Check for .myshopify.com domains
  if (origin.match(/^https:\/\/[a-zA-Z0-9-]+\.myshopify\.com$/)) {
    return true;
  }
  
  // Check for Shopify Pages domains (if using Shopify Pages)
  if (origin.match(/^https:\/\/[a-zA-Z0-9-]+\.pages\.shopify\.com$/)) {
    return true;
  }
  
  // Check for custom Shopify domains (you can add specific ones here)
  const customShopifyDomains = [
    // Add your specific Shopify custom domains here
     'https://rzurp0-bj.myshopify.com',
  ];
  
  return customShopifyDomains.includes(origin);
};

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed origins list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Check if origin is a valid Shopify domain
    if (isShopifyDomain(origin)) {
      console.log('CORS allowed Shopify domain:', origin);
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400 // 24 hours
}));
app.use(express.json({ limit: '50mb' }));

// Serve static files from templates directory
app.use('/app/static', express.static(path.join(__dirname, 'templates')));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

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
      tryOn: '/api/try-on',
      app: {
        main: '/app',
        analytics: '/app/tryon-analytics'
      },
      analytics: {
        registerEvent: '/api/events/register',
        getEvents: '/api/events'
      }
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

// Image processing endpoint with Sharp
app.post('/api/process-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { maxDimension = 1024, quality = 90, format = 'jpeg', preserveMetadata = true } = req.body;
    
    console.log('Processing image with Sharp:', {
      originalSize: req.file.size,
      maxDimension,
      quality,
      format,
      preserveMetadata,
      environment: process.env.NODE_ENV || 'development'
    });

    // Process image with Sharp
    const processedBuffer = await processImageWithSharp(req.file.buffer, {
      maxDimension: parseInt(maxDimension),
      quality: parseInt(quality),
      format,
      preserveMetadata: preserveMetadata === 'true'
    });

    // Get processed metadata
    const metadata = await getImageMetadata(processedBuffer);

    console.log('Sharp processing successful:', {
      originalSize: req.file.size,
      processedSize: processedBuffer.length,
      compressionRatio: ((req.file.size - processedBuffer.length) / req.file.size * 100).toFixed(1) + '%',
      dimensions: `${metadata.width}x${metadata.height}`
    });

    // Set response headers
    res.set({
      'Content-Type': `image/${format}`,
      'Content-Length': processedBuffer.length,
      'X-Original-Size': req.file.size,
      'X-Processed-Size': processedBuffer.length,
      'X-Dimensions': `${metadata.width}x${metadata.height}`,
      'X-DPI': metadata.density
    });

    res.send(processedBuffer);

  } catch (error) {
    console.error('Error processing image with Sharp:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      environment: process.env.NODE_ENV || 'development'
    });
    res.status(500).json({ 
      error: 'Failed to process image',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get image metadata endpoint
app.post('/api/image-metadata', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const metadata = await getImageMetadata(req.file.buffer);
    res.json(metadata);

  } catch (error) {
    console.error('Error getting image metadata:', error);
    res.status(500).json({ error: 'Failed to get image metadata' });
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

// Proxy endpoint for CSV/Google Sheets to handle CORS
app.get('/api/proxy-csv', async (req, res) => {
  try {
    const csvUrl = req.query.url;
    if (!csvUrl) {
      return res.status(400).json({ error: 'CSV URL is required' });
    }

    const response = await axios.get(csvUrl, {
      responseType: 'text',
      timeout: 30000,
    });

    // Set CORS headers
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    });

    res.send(response.data);
  } catch (error) {
    console.error('Error proxying CSV:', error.message);
    res.status(500).json({ error: 'Failed to load CSV' });
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
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${process.env.GOOGLE_PROJECT_ID || 'tryandfit'}/locations/us-central1/publishers/google/models/virtual-try-on-preview-08-04:predict`, 
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

// Shopify App Interface Routes

// Main Shopify app interface
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'app.html'));
});

// Analytics dashboard
app.get('/app/tryon-analytics', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'analytics.html'));
});

// Catch-all for other app routes (for future expansion)
app.get('/app/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'app.html'));
});

// Analytics endpoints

// Register analytics event
app.post('/api/events/register', async (req, res) => {
  try {
    const { eventType, productId, productTitle, productHandle, timestamp, shop } = req.body;

    // Validate required fields
    if (!eventType || !shop) {
      return res.status(400).json({ 
        error: 'Missing required fields: eventType and shop are required' 
      });
    }

    // Prepare event data
    const eventData = {
      event_type: eventType,
      product_id: productId || null,
      product_title: productTitle || null,
      product_handle: productHandle || null,
      timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
      shop: shop
    };

    // Insert event into Supabase
    const { data, error } = await supabase
      .from('analytics_events')
      .insert([eventData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to register event',
        details: error.message 
      });
    }

    console.log('Event registered successfully:', eventData);
    res.json({ success: true, eventId: data[0]?.id });

  } catch (error) {
    console.error('Error registering event:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get analytics events with filtering
app.get('/api/events', async (req, res) => {
  try {
    const { eventType, startDate, endDate, shop, limit = 100, offset = 0 } = req.query;

    // Build query
    let query = supabase
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Apply filters
    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (shop) {
      query = query.eq('shop', shop);
    }

    if (startDate) {
      query = query.gte('timestamp', new Date(startDate).toISOString());
    }

    if (endDate) {
      query = query.lte('timestamp', new Date(endDate).toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch events',
        details: error.message 
      });
    }

    // Transform data to match expected format
    const events = data.map(event => ({
      eventType: event.event_type,
      productId: event.product_id,
      productTitle: event.product_title,
      productHandle: event.product_handle,
      timestamp: event.timestamp,
      shop: event.shop
    }));

    res.json(events);

  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
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

