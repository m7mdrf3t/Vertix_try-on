# Changes Summary - Dual Garment Selection

## Branch: gant

### What Changed

1. **Two Google Sheets Instead of One**
   - Previously: Single Google Sheet for all products
   - Now: Two separate sheets (upper garments and lower garments)

2. **Two Dropdown Menus**
   - Previously: One dropdown for product selection
   - Now: Two dropdowns (upper garment and lower garment) with independent selection

3. **Image Composition**
   - Previously: Sent selected product image directly to backend
   - Now: Combines upper and lower garment images into one composite image before sending to backend

### New Files Created

1. `src/components/DualProductSelector.tsx`
   - New component for selecting upper and lower garments separately
   - Two independent dropdowns
   - Loading from two different Google Sheets

2. `src/utils/imageComposer.ts`
   - Utility for combining two garment images
   - Stacks images vertically (upper on top, lower on bottom)
   - Returns composite image as base64

3. `DUAL_GARMENT_SELECTION.md`
   - Complete documentation for the new feature
   - Setup instructions
   - Usage guide

### Modified Files

1. `src/services/csvService.ts`
   - Added `loadProductsFromSheetUrl()` method
   - Now supports loading from specific sheet URL
   - Maintains backward compatibility

2. `src/App.tsx`
   - Added `selectedUpperProduct` and `selectedLowerProduct` state
   - Updated `handleProcess` to compose images when using dual garments
   - Added UI for dual garment selector
   - Maintains backward compatibility with old single product mode

### Environment Variables Needed

Add these to your deployment:

```bash
REACT_APP_UPPER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_UPPER_ID/edit
REACT_APP_LOWER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_LOWER_ID/edit
```

### How It Works

**Before:**
```
User Photo + Product Image → Backend → Result
```

**Now:**
```
User Photo + (Upper Garment + Lower Garment = Composite Image) → Backend → Result
```

### User Flow

1. User uploads their photo
2. User selects upper garment from dropdown (first Google Sheet)
3. User selects lower garment from dropdown (second Google Sheet)
4. User clicks "Generate"
5. System combines both garments into one image (stacked vertically)
6. Sends user photo + composite garment image to backend
7. Backend processes and returns virtual try-on result

### Backwards Compatibility

The old single-product mode is still available via the `useDualGarments` state variable. Set to `false` to use the legacy selector.

### Testing Checklist

- [ ] Create two Google Sheets with product data
- [ ] Publish sheets to web
- [ ] Add environment variables
- [ ] Build application: `npm run build`
- [ ] Upload user photo
- [ ] Select upper garment from dropdown
- [ ] Select lower garment from dropdown
- [ ] Click Generate
- [ ] Verify images are combined
- [ ] Verify backend receives correct data
- [ ] Verify virtual try-on results

### Deployment Notes

1. Add environment variables to Railway/Google Cloud Run
2. Rebuild the application
3. Test the dual garment selection
4. Monitor logs for any errors

### Next Steps

1. Create the two Google Sheets with product data
2. Set up environment variables
3. Deploy to production
4. Test the complete flow
5. Monitor for any issues

