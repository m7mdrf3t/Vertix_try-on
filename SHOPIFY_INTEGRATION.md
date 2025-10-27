# Shopify Integration Guide

## Overview

The Mirrify API is now configured to work seamlessly with Shopify stores and Shopify Pages. This guide will help you integrate the virtual try-on functionality into your Shopify store.

## Backend URL
```
https://mirrify-backend-907099703781.us-central1.run.app
```

## CORS Support

The API automatically accepts requests from:
- ✅ `https://your-store-name.myshopify.com`
- ✅ `https://your-store-name.pages.shopify.com`
- ✅ Custom Shopify domains (contact us to add)

## Integration Methods

### 1. Shopify Pages (Recommended)

If you're using Shopify Pages, you can directly call the API from your page's JavaScript:

```javascript
// Shopify Pages integration
const API_BASE_URL = 'https://mirrify-backend-907099703781.us-central1.run.app';

// Health check
async function checkAPI() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    console.log('API Status:', data);
  } catch (error) {
    console.error('API Error:', error);
  }
}

// Virtual try-on function
async function virtualTryOn(personImage, garmentImage) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/try-on`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{
          person_image: personImage, // base64 encoded
          garment_image: garmentImage // base64 encoded
        }],
        parameters: {
          confidence_threshold: 0.5
        }
      })
    });
    
    const result = await response.json();
    return result.predictions[0].result_image;
  } catch (error) {
    console.error('Virtual try-on error:', error);
    throw error;
  }
}
```

### 2. Shopify App Integration

For Shopify apps, you can use the same API endpoints:

```javascript
// In your Shopify app
const MIRRIFY_API = 'https://mirrify-backend-907099703781.us-central1.run.app';

// Example: Add virtual try-on to product pages
function addVirtualTryOnToProduct() {
  // Your existing product page code
  const productImages = document.querySelectorAll('.product-image');
  
  productImages.forEach(image => {
    image.addEventListener('click', async () => {
      // Convert image to base64
      const base64Image = await convertImageToBase64(image.src);
      
      // Call virtual try-on API
      try {
        const result = await virtualTryOn(userPhoto, base64Image);
        displayResult(result);
      } catch (error) {
        console.error('Try-on failed:', error);
      }
    });
  });
}
```

### 3. Shopify Theme Integration

Add this to your theme's JavaScript:

```javascript
// theme.js or custom.js
window.MirrifyAPI = {
  baseURL: 'https://mirrify-backend-907099703781.us-central1.run.app',
  
  async tryOn(personImage, garmentImage) {
    const response = await fetch(`${this.baseURL}/api/try-on`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{
          person_image: personImage,
          garment_image: garmentImage
        }],
        parameters: { confidence_threshold: 0.5 }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  async compressImage(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('maxDimension', '1024');
    formData.append('quality', '90');
    
    const response = await fetch(`${this.baseURL}/api/process-image`, {
      method: 'POST',
      body: formData
    });
    
    return response.blob();
  }
};
```

## Image Handling

### Convert Images to Base64

```javascript
function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// For existing images
function convertImageUrlToBase64(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
      resolve(base64);
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}
```

## Example: Product Page Integration

```html
<!-- Add to your product template -->
<div class="virtual-try-on-section">
  <h3>Try It On</h3>
  <input type="file" id="user-photo" accept="image/*" />
  <button id="try-on-btn">Try On This Item</button>
  <div id="result-container" style="display: none;">
    <h4>Result:</h4>
    <img id="result-image" alt="Virtual try-on result" />
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const userPhotoInput = document.getElementById('user-photo');
  const tryOnBtn = document.getElementById('try-on-btn');
  const resultContainer = document.getElementById('result-container');
  const resultImage = document.getElementById('result-image');
  
  tryOnBtn.addEventListener('click', async function() {
    if (!userPhotoInput.files[0]) {
      alert('Please select a photo first');
      return;
    }
    
    try {
      // Get product image (you'll need to adapt this to your theme)
      const productImage = document.querySelector('.product-image img').src;
      
      // Convert images to base64
      const userPhotoBase64 = await convertImageToBase64(userPhotoInput.files[0]);
      const productImageBase64 = await convertImageUrlToBase64(productImage);
      
      // Call API
      const result = await window.MirrifyAPI.tryOn(userPhotoBase64, productImageBase64);
      
      // Display result
      resultImage.src = `data:image/jpeg;base64,${result.predictions[0].result_image}`;
      resultContainer.style.display = 'block';
      
    } catch (error) {
      console.error('Try-on failed:', error);
      alert('Try-on failed. Please try again.');
    }
  });
});
</script>
```

## Testing Your Integration

1. **Test API connectivity:**
   ```javascript
   fetch('https://mirrify-backend-907099703781.us-central1.run.app/api/health')
     .then(response => response.json())
     .then(data => console.log('API Status:', data));
   ```

2. **Test from your Shopify store:**
   - Open browser developer tools
   - Go to Console tab
   - Run the test code above
   - Should return: `{status: "OK", message: "Server is running"}`

## Troubleshooting

### Common Issues:

1. **CORS Error**: Make sure you're calling from a valid Shopify domain
2. **Image Upload Error**: Ensure images are properly converted to base64
3. **Timeout Error**: Virtual try-on can take up to 5 minutes for large images

### Debug Steps:

1. Check browser console for errors
2. Verify your domain is supported (check server logs)
3. Test with smaller images first
4. Check network tab for API response details

## Support

For technical support or to add custom Shopify domains to the CORS whitelist, contact the development team.

---
**Last Updated**: January 2025
**API Version**: 1.0.0
