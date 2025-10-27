# Analytics Dashboard Setup Guide

## 🚀 Quick Setup

### 1. Database Setup

Run the SQL script in your Supabase SQL editor to create the analytics table:

```sql
-- Copy and paste the contents of setup-analytics-table.sql
-- This creates the analytics_events table with proper indexes and RLS policies
```

### 2. Environment Variables

Add these to your server's environment variables (or `.env` file):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://euvdpomiybrasicixerw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dmRwb21peWJyYXNpY2l4ZXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDc0OTcsImV4cCI6MjA3NjcyMzQ5N30.T87XjLha8MwBAtJ3K-FfJlZrCB9qKpGoNYg29AAfg5M
```

### 3. Deploy Server

The server now includes the analytics endpoints. Deploy as usual:

```bash
# For Google Cloud Run
gcloud run deploy mirrify-backend --source . --platform managed --region us-central1

# For Railway
railway deploy
```

## 📊 Analytics Endpoints

### POST /api/events/register
Registers user actions from your storefront.

**Required Fields:**
- `eventType`: Type of event (e.g., "product_selected", "generate_tryon", "add_to_cart")
- `shop`: Shopify store domain (e.g., "store-name.myshopify.com")

**Optional Fields:**
- `productId`: Shopify product ID
- `productTitle`: Product name
- `productHandle`: Product handle/slug
- `timestamp`: ISO timestamp (defaults to current time)

### GET /api/events
Retrieves analytics events with filtering options.

**Query Parameters:**
- `eventType`: Filter by event type
- `startDate`: Filter from date (ISO format)
- `endDate`: Filter to date (ISO format)
- `shop`: Filter by shop domain
- `limit`: Number of events (default: 100)
- `offset`: Skip events (default: 0)

## 🎯 Event Types

Common event types for your analytics dashboard:

1. **product_selected** - User clicks on a product
2. **generate_tryon** - User generates a virtual try-on
3. **add_to_cart** - User adds product to cart
4. **view_product** - User views product details
5. **tryon_completed** - User completes virtual try-on
6. **tryon_shared** - User shares try-on result
7. **checkout_started** - User starts checkout process

## 🔧 Frontend Integration

### JavaScript/React Example

```javascript
// Register an event when user selects a product
const trackProductSelection = async (product) => {
  try {
    await fetch('https://mirrify-backend-907099703781.us-central1.run.app/api/events/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'product_selected',
        productId: product.id,
        productTitle: product.title,
        productHandle: product.handle,
        shop: window.Shopify?.shop || 'unknown.myshopify.com'
      })
    });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};

// Register try-on generation
const trackTryOnGeneration = async (product) => {
  try {
    await fetch('https://mirrify-backend-907099703781.us-central1.run.app/api/events/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'generate_tryon',
        productId: product.id,
        productTitle: product.title,
        productHandle: product.handle,
        shop: window.Shopify?.shop || 'unknown.myshopify.com'
      })
    });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};
```

### Shopify App Integration

```javascript
// In your Shopify app, track events
document.addEventListener('DOMContentLoaded', function() {
  // Track product views
  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach(card => {
    card.addEventListener('click', () => {
      const productId = card.dataset.productId;
      const productTitle = card.dataset.productTitle;
      const productHandle = card.dataset.productHandle;
      
      trackProductSelection({
        id: productId,
        title: productTitle,
        handle: productHandle
      });
    });
  });
  
  // Track try-on button clicks
  const tryOnButtons = document.querySelectorAll('.try-on-button');
  tryOnButtons.forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      const productTitle = button.dataset.productTitle;
      const productHandle = button.dataset.productHandle;
      
      trackTryOnGeneration({
        id: productId,
        title: productTitle,
        handle: productHandle
      });
    });
  });
});
```

## 📈 Dashboard Queries

### Get Popular Products
```javascript
const getPopularProducts = async () => {
  const response = await fetch('https://mirrify-backend-907099703781.us-central1.run.app/api/events?eventType=product_selected&limit=1000');
  const events = await response.json();
  
  // Group by product and count
  const productCounts = {};
  events.forEach(event => {
    const key = `${event.productId}-${event.productTitle}`;
    productCounts[key] = (productCounts[key] || 0) + 1;
  });
  
  return Object.entries(productCounts)
    .map(([key, count]) => {
      const [productId, productTitle] = key.split('-');
      return { productId, productTitle, count };
    })
    .sort((a, b) => b.count - a.count);
};
```

### Get Try-On Conversion Rate
```javascript
const getTryOnConversionRate = async () => {
  const [productSelections, tryOns] = await Promise.all([
    fetch('https://mirrify-backend-907099703781.us-central1.run.app/api/events?eventType=product_selected').then(r => r.json()),
    fetch('https://mirrify-backend-907099703781.us-central1.run.app/api/events?eventType=generate_tryon').then(r => r.json())
  ]);
  
  const conversionRate = (tryOns.length / productSelections.length * 100).toFixed(2);
  return { conversionRate, productSelections: productSelections.length, tryOns: tryOns.length };
};
```

### Get Daily Activity
```javascript
const getDailyActivity = async (days = 7) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const response = await fetch(`https://mirrify-backend-907099703781.us-central1.run.app/api/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=1000`);
  const events = await response.json();
  
  // Group by date
  const dailyActivity = {};
  events.forEach(event => {
    const date = new Date(event.timestamp).toDateString();
    dailyActivity[date] = (dailyActivity[date] || 0) + 1;
  });
  
  return dailyActivity;
};
```

## 🧪 Testing

Run the test script to verify everything works:

```bash
node test-analytics-endpoints.js
```

This will test all analytics endpoints and verify they're working correctly.

## 🔒 Security Notes

- The analytics endpoints use Supabase Row Level Security (RLS)
- Anonymous users can insert and read events (suitable for public analytics)
- No authentication required for basic analytics tracking
- Consider adding authentication for admin dashboard access if needed

## 📊 Next Steps

1. **Create Dashboard UI**: Build a React/Vue dashboard to visualize the analytics data
2. **Add More Event Types**: Track additional user interactions
3. **Real-time Updates**: Use Supabase real-time subscriptions for live dashboard updates
4. **Advanced Analytics**: Add conversion funnels, user journey tracking, etc.
5. **Export Features**: Add CSV/Excel export functionality
