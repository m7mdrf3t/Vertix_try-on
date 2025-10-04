# 🚀 Google Sheets Only Configuration

Your Mirrify app now **exclusively uses Google Sheets** for product data. No local CSV or Excel files are used.

## ⚠️ Important: Required Setup

You **must** configure Google Sheets or the app will not work.

## 📋 Quick Setup Steps

### 1. Create Your Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Add these columns: `id`, `name`, `image`, `category`, `price`, `description`

### 2. Add Sample Data
```
id          | name                | image                                                           | category | price  | description
shirt-1     | Classic White Shirt | /products/white-shirt.jpg                                      | Shirts   | $29.99 | Classic white cotton shirt
shirt-2     | Blue Denim Shirt    | https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400 | Shirts   | $34.99 | Comfortable blue denim shirt
```

### 3. Publish Your Sheet
1. **File** → **Share** → **Publish to web**
2. Select **"Entire document"**
3. Choose **"Comma-separated values (.csv)"** format
4. Click **"Publish"**
5. **Copy the URL**

### 4. Configure Your App

**Option A: Environment Variable (Recommended)**
```bash
REACT_APP_GOOGLE_SHEETS_URL="YOUR_GOOGLE_SHEETS_URL" npm start
```

**Option B: Create .env file**
```bash
echo 'REACT_APP_GOOGLE_SHEETS_URL=YOUR_GOOGLE_SHEETS_URL' > .env
npm start
```

## 🔗 Example URLs

**Your sharing URL looks like:**
```
https://docs.google.com/spreadsheets/d/1E4OdeiFgBO07T6NSePoRUSo8n5B1pWX8Tt4k48bYw5w/edit?usp=sharing
```

**Published URL looks like:**
```
https://docs.google.com/spreadsheets/d/1E4OdeiFgBO07T6NSePoRUSo8n5B1pWX8Tt4k48bYw5w/export?format=csv&gid=0
```

## ✅ Testing

1. Set your Google Sheets URL
2. Start the app: `npm start`
3. Open http://localhost:3000
4. Check the product dropdown - it should load from your Google Sheet

## 🚨 Troubleshooting

**"Failed to load products from Google Sheets"**
- ✅ Check that `REACT_APP_GOOGLE_SHEETS_URL` is set
- ✅ Ensure your sheet is published to web (not just shared)
- ✅ Verify the URL is accessible in a browser
- ✅ Check browser console for detailed error messages

**No products showing**
- ✅ Ensure your sheet has the correct column headers
- ✅ Make sure there's data in your sheet (not just headers)
- ✅ Check that your sheet is publicly accessible

## 🎉 Benefits of Google Sheets Only

- ✅ **Real-time updates**: Changes reflect immediately
- ✅ **No file management**: No need to upload/update local files
- ✅ **Collaborative**: Multiple people can edit products
- ✅ **Always in sync**: Single source of truth
- ✅ **Easy backup**: Google handles backups automatically
