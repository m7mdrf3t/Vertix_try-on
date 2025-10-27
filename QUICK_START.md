# Quick Start Guide - Gant Branch

## What You Have Now

✅ Dual garment selection implemented
✅ Two Google Sheets URLs configured
✅ Image composition logic ready
✅ All code committed to `gant` branch

## Google Sheets

**Sheet 1 - Upper Garments:**
https://docs.google.com/spreadsheets/d/1oJfOpMRLob3jASZmm_rRUWW6LlHHvx_FvzYwXlMp7to/edit

**Sheet 2 - Lower Garments:**
https://docs.google.com/spreadsheets/d/1PpLJtCicxCHrBynNB2i6OBOx_nnjJDFoCk9Kthnb9FI/edit

## Important: Publish Sheets to Web

Before testing, you MUST publish both sheets to web:

1. Open each Google Sheet
2. Go to **File** → **Share** → **Publish to web**
3. Click **Publish** button
4. Leave as "Entire document" and "Web page"
5. Click **OK**

This allows the app to access the CSV data.

## Local Testing

### 1. Create .env File

Create a `.env` file in the root directory:

```bash
REACT_APP_API_URL=https://mirrify-backend-907099703781.us-central1.run.app

REACT_APP_UPPER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/1oJfOpMRLob3jASZmm_rRUWW6LlHHvx_FvzYwXlMp7to/edit?usp=sharing

REACT_APP_LOWER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/1PpLJtCicxCHrBynNB2i6OBOx_nnjJDFoCk9Kthnb9FI/edit?usp=sharing
```

### 2. Install Dependencies (if not already done)

```bash
npm install
```

### 3. Start Development Server

```bash
npm start
```

### 4. Test the Application

1. Open http://localhost:3000
2. Upload a user photo
3. Select an **upper garment** from the first dropdown
4. Select a **lower garment** from the second dropdown
5. Click **"Generate"**
6. Verify the result

## What to Check

✅ Both dropdowns load products from their respective sheets
✅ Products display with images
✅ Selected garments show previews
✅ "Generate" button is enabled when both garments are selected
✅ Composite image is created (check browser console)
✅ Request is sent to backend with combined image

## Deploy to Production

### Option 1: Railway

1. Push the `gant` branch to GitHub
2. Create a new Railway service
3. Add environment variables (see ENV_SETUP.md)
4. Deploy

### Option 2: Google Cloud Run

1. Build the Docker image
2. Deploy with environment variables (see ENV_SETUP.md)
3. Test the deployment URL

## Troubleshooting

### Sheets not loading?
- Verify sheets are published to web
- Check environment variables are set correctly
- Check browser console for errors
- Verify sheet URLs are correct

### CORS errors?
- Make sure image URLs in sheets are accessible
- Check backend CORS configuration

### Images not combining?
- Check browser console for errors
- Verify both garments are selected
- Check image URLs are valid

## Files Modified

- `src/App.tsx` - Updated to use dual garment mode
- `src/components/DualProductSelector.tsx` - New component
- `src/utils/imageComposer.ts` - Image combination logic
- `src/services/csvService.ts` - Multi-sheet support

## Next Steps

1. ✅ Publish both Google Sheets to web
2. ⏳ Create `.env` file locally
3. ⏳ Test locally (`npm start`)
4. ⏳ Deploy to production
5. ⏳ Test with real users

