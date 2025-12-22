# Image Download Scripts

## 🎯 Purpose

These scripts automatically download images for countries and colleges/universities from Unsplash, eliminating the need for manual image management.

## 📋 Available Scripts

### 1. Country Images
```bash
node scripts/download-country-images.js
```

**What it does:**
- Downloads images for 30 popular study destinations
- Saves to: `/public/images/countries/`
- Skips countries that already have images
- Includes: USA, UK, Canada, Australia, Germany, France, and more

### 2. College/University Images
```bash
node scripts/download-college-images.js
```

**What it does:**
- Downloads images for 50+ top universities worldwide
- Saves to: `/public/images/colleges/`
- Skips universities that already have images
- Includes: MIT, Stanford, Oxford, Cambridge, and more

## 🚀 Usage

### Quick Start (Download Everything)

```bash
# From project root directory
cd /Users/maneeshmalepati/Desktop/Slotpilot

# Download all country images
node scripts/download-country-images.js

# Download all college images  
node scripts/download-college-images.js
```

### Selective Download

Both scripts automatically skip existing images, so you can run them multiple times safely.

```bash
# Add more countries to the list in the script
# Then run again - it will only download new ones
node scripts/download-country-images.js
```

## ⚙️ How It Works

1. **Checks existing images** - Scans `/public/images/` folders
2. **Skips duplicates** - Only downloads missing images
3. **Rate limiting** - 2-second delay between downloads
4. **Error handling** - Continues even if some downloads fail
5. **Progress display** - Shows download status in real-time

## 📁 Output Structure

```
public/
└── images/
    ├── countries/
    │   ├── United States.jpg
    │   ├── Canada.jpg
    │   ├── Germany.jpg
    │   └── ...
    └── colleges/
        ├── Stanford University.jpg
        ├── MIT.jpg
        ├── Oxford University.jpg
        └── ...
```

## 🎨 Image Specifications

- **Source:** Unsplash (free, high-quality)
- **Size:** 1600x1000 pixels
- **Format:** JPEG
- **Keywords:**
  - Countries: "{country} landmark famous architecture"
  - Colleges: "{university} campus building architecture"

## 🔧 Customization

### Add More Countries

Edit `scripts/download-country-images.js`:

```javascript
const COUNTRIES = [
  'United States',
  'Canada',
  // Add your countries here:
  'Portugal',
  'Greece',
  'Thailand',
  // ...
];
```

### Add More Universities

Edit `scripts/download-college-images.js`:

```javascript
const UNIVERSITIES = [
  'MIT',
  'Stanford',
  // Add your universities here:
  'Your University Name',
  // ...
];
```

### Change Image Size

Modify the URL in either script:

```javascript
// Current: 1600x1000
const url = `https://source.unsplash.com/1600x1000/?${query}`;

// Change to: 1920x1080 (Full HD)
const url = `https://source.unsplash.com/1920x1080/?${query}`;

// Change to: 2560x1440 (2K)
const url = `https://source.unsplash.com/2560x1440/?${query}`;
```

### Change Image Source

Replace Unsplash with another API:

```javascript
// Pexels (requires API key)
const url = `https://api.pexels.com/v1/search?query=${query}&per_page=1`;

// Your custom CDN
const url = `https://your-cdn.com/images/${country}.jpg`;
```

## 🐛 Troubleshooting

### Script fails to run
```bash
# Make sure you're in the project root
cd /Users/maneeshmalepati/Desktop/Slotpilot

# Check Node.js is installed
node --version

# If permission denied, make scripts executable
chmod +x scripts/*.js
```

### Some images fail to download
- Normal! Some queries may not return results
- Script continues with other downloads
- You can manually add images later

### Rate limiting errors
- Increase `DELAY_BETWEEN_DOWNLOADS` in the script
- Change from 2000ms to 3000ms or higher

### Want to re-download all images
```bash
# Delete existing images
rm -rf public/images/countries/*
rm -rf public/images/colleges/*

# Run scripts again
node scripts/download-country-images.js
node scripts/download-college-images.js
```

## 📊 Performance

- **Download speed:** ~30 images per minute (with 2s delay)
- **Total time:** 
  - Countries (30): ~2 minutes
  - Colleges (50): ~3 minutes
- **Storage:** ~2-5 MB per image
- **Total:** ~150-400 MB for all images

## ✅ Best Practices

1. **Run during off-hours** - Downloading takes time
2. **Check results** - Verify images look appropriate
3. **Replace if needed** - Manually replace any poor quality images
4. **Backup** - Keep a copy of good images before re-downloading
5. **Version control** - Consider adding images to `.gitignore` if large

## 🎯 Alternative: Manual Download

If scripts don't work, you can manually download images:

1. Visit [Unsplash](https://unsplash.com)
2. Search for: "{country name} landmark"
3. Download image
4. Rename to exact country/college name
5. Place in `/public/images/countries/` or `/public/images/colleges/`

The app will automatically detect and use them!

## 📝 Notes

- Images are stored in `/public/` so they're served as static files
- No database changes needed
- App automatically detects new images
- Supports multiple formats: JPG, PNG, WebP
- Case-insensitive filename matching
- Works with spaces in filenames (e.g., "United States.jpg")

## 🤝 Need Help?

- Images not showing? Check browser console for errors
- File not found? Verify filename matches exactly
- Want different images? Replace files manually
- Need more countries/colleges? Edit the scripts

---

**Pro Tip:** The app has a 3-tier fallback system:
1. Local bundled images (fastest)
2. Public folder images (these scripts)
3. Unsplash API (automatic fallback)

So even without running these scripts, the app still works! 🎉
