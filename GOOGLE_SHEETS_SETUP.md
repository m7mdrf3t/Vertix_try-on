# Google Sheets Setup Guide

This guide explains how to set up Google Sheets as a data source for your Mirrify application.

## 🎯 Benefits of Using Google Sheets

- **Real-time Updates**: Changes in your sheet automatically reflect in the app
- **Easy Management**: Edit products directly in Google Sheets
- **Collaborative**: Multiple people can manage products
- **No File Uploads**: No need to manually update files

## 📋 Setup Steps

### 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Mirrify Products" (or any name you prefer)

### 2. Set Up Your Data

Create columns with these headers in the first row:

| id | name | image | category | price | description |
|----|------|-------|----------|-------|-------------|
| shirt-1 | Classic White Shirt | /products/white-shirt.jpg | Shirts | $29.99 | Classic white cotton shirt |
| shirt-2 | Blue Denim Shirt | https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400 | Shirts | $34.99 | Comfortable blue denim shirt |
| shirt-2 | Blue Denim Shirt | /products/blue-shirt.jpg | Shirts | $34.99 | Comfortable blue denim shirt |

### 3. Make the Sheet Public

1. Click **File** > **Share** > **Publish to web**
2. Select **Entire document** or **Current sheet**
3. Choose **Comma-separated values (.csv)** format
4. Click **Publish**
5. Copy the generated URL

### 4. Configure Your App

Add the Google Sheets URL to your environment variables:

**Option A: Create a `.env` file in your project root:**
```env
REACT_APP_GOOGLE_SHEETS_URL=https://docs.google.com/spreadsheets/d/1E4OdeiFgBO07T6NSePoRUSo8n5B1pWX8Tt4k48bYw5w/edit?usp=sharing
```

**Option B: Set environment variable when starting the app:**
```bash
REACT_APP_GOOGLE_SHEETS_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit#gid=0 npm start
```

## 🔄 Data Loading Priority

The app tries to load data in this order:
1. **Google Sheets** (if URL is configured)
2. **Excel file** (`/public/assets/products.xlsx`)
3. **CSV file** (`/public/assets/products.csv`)

## 📝 Column Names

The app supports flexible column names:

| Required | Supported Names |
|----------|----------------|
| ID | `id`, `ID` |
| Name | `name`, `Name`, `NAME` |
| Image | `image`, `Image`, `IMAGE` |
| Category | `category`, `Category`, `CATEGORY` |
| Price | `price`, `Price`, `PRICE` |
| Description | `description`, `Description`, `DESCRIPTION` |

## 🖼️ Image Handling

The app supports **both local file paths and URLs** for images:

### Local Paths (relative to public folder):
- `/products/white-shirt.jpg`
- `/images/product1.png`
- `products/blue-shirt.jpg`

### External URLs:
- `https://images.unsplash.com/photo-1234567890?w=400`
- `https://example.com/images/product.jpg`
- `https://cdn.example.com/products/shoes.png`

### Data URLs (base64 encoded):
- `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...`

The app automatically detects the image type and handles it appropriately.

## 🚀 Testing

1. Set up your Google Sheet
2. Add the URL to your environment variables
3. Restart your app
4. Check the browser console for loading messages

## 🔧 Troubleshooting

### Common Issues:

1. **"Google Sheets URL not configured"**
   - Make sure you've set the `REACT_APP_GOOGLE_SHEETS_URL` environment variable

2. **"Failed to fetch Google Sheets"**
   - Check that your sheet is published to web
   - Verify the URL is correct
   - Make sure the sheet is publicly accessible

3. **"No products found"**
   - Check that your sheet has the correct column headers
   - Ensure there's data in the sheet (not just headers)

### Debug Steps:

1. Open browser developer tools (F12)
2. Check the Console tab for error messages
3. Verify your Google Sheets URL is accessible in a new browser tab
4. Test the CSV export URL manually

## 📊 Sample Google Sheet

Here's a sample structure for your Google Sheet:

```
A1: id          B1: name                C1: image                    D1: category    E1: price    F1: description
A2: shirt-1     B2: Classic White Shirt C2: /products/white-shirt.jpg D2: Shirts      E2: $29.99    F2: Classic white cotton shirt
A3: shirt-2     B3: Blue Denim Shirt    C3: /products/blue-shirt.jpg  D3: Shirts      E3: $34.99    F3: Comfortable blue denim shirt
```

## 🎉 You're Done!

Once configured, your app will automatically load products from your Google Sheet. Any changes you make in the sheet will be reflected in your app after a page refresh!
