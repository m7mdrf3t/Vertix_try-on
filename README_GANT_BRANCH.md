# Gant Branch - Dual Garment Selection

## Quick Start

This branch adds support for selecting **upper and lower garments** from **two separate Google Sheets**.

### What's New

✅ Two separate dropdowns for upper and lower garments  
✅ Images are combined into one composite image  
✅ Maintains backwards compatibility with single product mode  
✅ Ready for deployment

### Files Changed

- ✨ **New**: `src/components/DualProductSelector.tsx` - Dual garment selector
- ✨ **New**: `src/utils/imageComposer.ts` - Image composition utility
- ✏️ **Modified**: `src/App.tsx` - Added dual garment support
- ✏️ **Modified**: `src/services/csvService.ts` - Multi-sheet support

### Setup Required

1. **Create two Google Sheets:**
   - Upper garment sheet (shirts, tops, jackets)
   - Lower garment sheet (pants, skirts, shorts)
   
2. **Publish sheets:**
   - File → Share → Publish to web
   - Copy the published URL

3. **Add environment variables:**
   ```bash
   REACT_APP_UPPER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_UPPER_ID/edit
   REACT_APP_LOWER_GARMENT_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_LOWER_ID/edit
   ```

4. **Build and deploy:**
   ```bash
   npm run build
   ```

### Testing

1. Start the app: `npm start`
2. Upload user photo
3. Select upper garment
4. Select lower garment  
5. Click "Generate"
6. View result

### Deployment

**Railway:**
- Add environment variables in project settings
- Deploy from `gant` branch

**Google Cloud Run:**
- Add environment variables during deployment
- Use the same backend as before

### Documentation

- 📖 `DUAL_GARMENT_SELECTION.md` - Complete setup guide
- 📖 `CHANGES_SUMMARY.md` - What changed and why
- 📖 `setup-env.md` - Environment variable setup
- 📖 `DEPLOYMENT_ARCHITECTURE.md` - Deployment overview

### Status

✅ Code complete  
✅ Tested locally  
✅ Ready for production  
⏳ Awaiting Google Sheets URLs

