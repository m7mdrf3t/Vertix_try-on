# Dual Garment Selection Feature

## Overview

The application now supports selecting **upper and lower garments** from **two separate Google Sheets**. When the user clicks "Generate", both garment images are combined into a single composite image, which is then sent to the backend API along with the user's photo.

## Features

1. **Two Separate Google Sheets**
   - One sheet for upper garments (shirts, tops, jackets)
   - One sheet for lower garments (pants, skirts, shorts)

2. **Two Dropdown Menus**
   - One dropdown for selecting upper garments
   - One dropdown for selecting lower garments
   - Both have independent search and filtering

3. **Image Composition**
   - When "Generate" is clicked, the selected upper and lower garments are combined into one image
   - The images are stacked vertically (upper garment on top, lower garment below)
   - This composite image is then sent to the backend along with the user's photo

## Setup

### 1. Create Two Google Sheets

Create two separate Google Sheets with the following structure:

**Upper Garment Sheet:**
- Columns: `id`, `name`, `image`, `category`, `price`, `description`
- Example row: `shirt-1, Classic T-Shirt, https://example.com/shirt.jpg, Shirts, $29.99, Comfortable cotton shirt`

**Lower Garment Sheet:**
- Same structure as upper garment sheet
- Example row: `pants-1, Blue Jeans, https://example.com/pants.jpg, Pants, $49.99, Classic blue jeans`

### 2. Publish Sheets to Web

1. Open your Google Sheet
2. Go to **File > Share > Publish to web**
3. Select the sheet and click "Publish"
4. Copy the published URL

### 3. Add Environment Variables

Add the following environment variables to your deployment platform:

```bash
REACT_APP_UPPER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_UPPER_SHEET_ID/edit
REACT_APP_LOWER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_LOWER_SHEET_ID/edit
```

**Example:**
```bash
REACT_APP_UPPER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/1ABC123xyz/edit
REACT_APP_LOWER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/1DEF456abc/edit
```

### 4. Build and Deploy

```bash
npm run build
```

The application will automatically load products from both Google Sheets when the page loads.

## File Structure

### New Files

- `src/components/DualProductSelector.tsx` - Component for selecting upper and lower garments
- `src/utils/imageComposer.ts` - Utility for combining garment images

### Modified Files

- `src/services/csvService.ts` - Added `loadProductsFromSheetUrl()` method
- `src/App.tsx` - Updated to use dual garment selection and image compositing

## How It Works

### 1. Product Loading

```typescript
// Loads products from two different Google Sheets
const upperProducts = await CSVService.loadProductsFromSheetUrl(upperSheetUrl);
const lowerProducts = await CSVService.loadProductsFromSheetUrl(lowerSheetUrl);
```

### 2. Image Composition

```typescript
// Combines upper and lower garment images
const compositeResult = await combineGarments(
  selectedUpperProduct.image,
  selectedLowerProduct.image
);
```

### 3. API Request

```typescript
// Sends user image + composite garment image to backend
const request = {
  instances: [{
    personImage: { image: { bytesBase64Encoded: userImageBase64 } },
    productImages: [{ image: { bytesBase64Encoded: compositeBase64 } }]
  }]
};
```

## Usage

1. **Upload User Image** - User uploads their photo
2. **Select Upper Garment** - User chooses from upper garment dropdown
3. **Select Lower Garment** - User chooses from lower garment dropdown
4. **Click Generate** - System combines both garments into one image and sends to backend
5. **View Result** - Backend processes and returns the virtual try-on result

## Backwards Compatibility

The old single-product mode is still available. To toggle between modes:

```typescript
const [useDualGarments, setUseDualGarments] = useState(true);
```

Set to `false` to use the legacy single product selector.

## API Changes

### Backend

No changes needed to the backend API. It receives:
- Person image (user's photo)
- One composite product image (combined upper + lower garments)

### Frontend

- Sends **one composite image** instead of multiple product images
- The composite image contains both the upper and lower garments stacked vertically

## Troubleshooting

### Sheets Not Loading

1. Verify sheet URLs are correct in environment variables
2. Ensure sheets are published to web (File > Share > Publish to web)
3. Check browser console for errors
4. Verify CORS is enabled if using external image URLs

### Image Composition Issues

1. Check that both garments are selected before clicking Generate
2. Verify image URLs are accessible
3. Check browser console for composition errors

### Environment Variables Not Working

1. Restart development server after adding environment variables
2. Rebuild the application for production
3. Verify variables are set correctly in deployment platform

## Example Google Sheet Format

| id | name | image | category | price | description |
|----|------|-------|----------|--------|-------------|
| shirt-1 | Classic T-Shirt | https://example.com/shirt.jpg | Shirts | $29.99 | Comfortable cotton shirt |
| pants-1 | Blue Jeans | https://example.com/pants.jpg | Pants | $49.99 | Classic blue jeans |

## Testing

### Local Testing

1. Set up environment variables in `.env`:
   ```bash
   REACT_APP_UPPER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_UPPER_ID/edit
   REACT_APP_LOWER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_LOWER_ID/edit
   ```

2. Start the application:
   ```bash
   npm start
   ```

3. Test the dual garment selection and generation flow

### Production Testing

1. Deploy with environment variables set
2. Verify both dropdowns load products correctly
3. Test image composition and API submission
4. Verify virtual try-on results

