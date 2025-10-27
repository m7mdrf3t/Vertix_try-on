# Environment Setup for Gant Branch

## Google Sheets URLs

You have provided two Google Sheets:
1. **Upper Garment Sheet**: https://docs.google.com/spreadsheets/d/1oJfOpMRLob3jASZmm_rRUWW6LlHHvx_FvzYwXlMp7to/edit?usp=sharing
2. **Lower Garment Sheet**: https://docs.google.com/spreadsheets/d/1PpLJtCicxCHrBynNB2i6OBOx_nnjJDFoCk9Kthnb9FI/edit?usp=sharing

## For Local Development

Create a `.env` file in the root directory with:

```bash
REACT_APP_API_URL=https://mirrify-backend-907099703781.us-central1.run.app

REACT_APP_UPPER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/1oJfOpMRLob3jASZmm_rRUWW6LlHHvx_FvzYwXlMp7to/edit?usp=sharing

REACT_APP_LOWER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/1PpLJtCicxCHrBynNB2i6OBOx_nnjJDFoCk9Kthnb9FI/edit?usp=sharing
```

## For Railway Deployment

1. Go to your Railway project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

```
REACT_APP_UPPER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/1oJfOpMRLob3jASZmm_rRUWW6LlHHvx_FvzYwXlMp7to/edit?usp=sharing
```

```
REACT_APP_LOWER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/1PpLJtCicxCHrBynNB2i6OBOx_nnjJDFoCk9Kthnb9FI/edit?usp=sharing
```

## For Google Cloud Run Deployment

When deploying with `gcloud`, add these environment variables:

```bash
gcloud run deploy your-service \
  --set-env-vars REACT_APP_UPPER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/1oJfOpMRLob3jASZmm_rRUWW6LlHHvx_FvzYwXlMp7to/edit?usp=sharing,REACT_APP_LOWER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/1PpLJtCicxCHrBynNB2i6OBOx_nnjJDFoCk9Kthnb9FI/edit?usp=sharing \
  --region us-central1
```

## Verifying Sheet Structure

Both sheets should have these columns in the first row:
- `id` - Unique product identifier
- `name` - Product name
- `image` - Image URL
- `category` - Product category
- `price` - Product price
- `description` - Product description

Example structure from your first sheet:
```
id: NAD1
name: Navy stripes shirt
image: https://nahlaelalfydesigns.com/cdn/shop/files/...
category: New Arrivals
price: L.E 1,750.00 EGP
description: (can be empty)
```

## Testing

After setting environment variables:

1. **Start development server:**
   ```bash
   npm start
   ```

2. **Check browser console:**
   - Look for "Loading products from Google Sheets..." messages
   - Verify both upper and lower garments load

3. **Test the flow:**
   - Upload user photo
   - Select upper garment from dropdown
   - Select lower garment from dropdown
   - Click "Generate"
   - Verify composite image is created
   - Check backend receives the request

