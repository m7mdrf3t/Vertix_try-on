# Environment Variables Setup

## For Local Development (.env file)

Create a `.env` file in the root directory:

```bash
REACT_APP_API_URL=https://mirrify-backend-907099703781.us-central1.run.app

REACT_APP_UPPER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_UPPER_SHEET_ID/edit
REACT_APP_LOWER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_LOWER_SHEET_ID/edit
```

## For Railway Deployment

Add these environment variables in Railway dashboard:

1. Go to your project → Settings → Environment Variables
2. Add:
   - `REACT_APP_UPPER_GARMENT_SHEET_URL` = Your upper garment sheet URL
   - `REACT_APP_LOWER_GARMENT_SHEET_URL` = Your lower garment sheet URL

## For Google Cloud Run

Add these environment variables when deploying:

```bash
gcloud run deploy your-service \
  --set-env-vars REACT_APP_UPPER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_UPPER_SHEET_ID/edit,REACT_APP_LOWER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_LOWER_SHEET_ID/edit
```

## Google Sheet Format

Both sheets should have these columns:
- `id` - Unique identifier
- `name` - Product name
- `image` - Image URL or path
- `category` - Product category
- `price` - Product price
- `description` - Product description

Example row:
```
id,name,image,category,price,description
shirt-1,Classic T-Shirt,https://example.com/shirt.jpg,Shirts,$29.99,Comfortable cotton shirt
```

