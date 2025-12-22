#!/usr/bin/env node

/**
 * Automated Country Image Downloader
 * 
 * This script automatically downloads country images from Unsplash
 * and saves them to /public/images/countries/
 * 
 * Usage: node scripts/download-country-images.js
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

// Popular study abroad destinations
const COUNTRIES = [
  'United States',
  'United Kingdom', 
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Netherlands',
  'Switzerland',
  'Sweden',
  'Norway',
  'Denmark',
  'Belgium',
  'Austria',
  'Ireland',
  'New Zealand',
  'Japan',
  'South Korea',
  'Singapore',
  'China',
  'India',
  'Brazil',
  'Mexico',
  'United Arab Emirates',
  'Portugal',
  'Czech Republic',
  'Poland',
  'Hungary',
  'Finland'
];

const OUTPUT_DIR = path.join(__dirname, '../public/images/countries');
const DELAY_BETWEEN_DOWNLOADS = 2000; // 2 seconds to avoid rate limiting

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  console.log('📁 Creating directory:', OUTPUT_DIR);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Check which images already exist
const existingImages = new Set();
if (fs.existsSync(OUTPUT_DIR)) {
  fs.readdirSync(OUTPUT_DIR).forEach(file => {
    const nameWithoutExt = file.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    existingImages.add(nameWithoutExt.toLowerCase());
  });
}

// Filter out countries that already have images
const countriesToDownload = COUNTRIES.filter(country => {
  const exists = existingImages.has(country.toLowerCase());
  if (exists) {
    console.log(`⏭️  Skipping ${country} (already exists)`);
  }
  return !exists;
});

if (countriesToDownload.length === 0) {
  console.log('✅ All country images already exist!');
  process.exit(0);
}

console.log(`\n🌍 Starting download for ${countriesToDownload.length} countries...\n`);

/**
 * Download a single country image
 */
function downloadCountryImage(country, index, total) {
  return new Promise((resolve, reject) => {
    // Construct Unsplash URL with landmark keyword for better results
    const query = encodeURIComponent(`${country} landmark famous architecture`);
    const url = `https://source.unsplash.com/1600x1000/?${query}`;
    const filename = `${country}.jpg`;
    const filepath = path.join(OUTPUT_DIR, filename);

    console.log(`[${index + 1}/${total}] 📥 Downloading: ${country}...`);

    https.get(url, (response) => {
      // Handle redirects (Unsplash uses them)
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (redirectResponse) => {
          const fileStream = fs.createWriteStream(filepath);
          redirectResponse.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close();
            console.log(`     ✅ Saved: ${filename}`);
            resolve();
          });

          fileStream.on('error', (err) => {
            fs.unlink(filepath, () => {}); // Clean up partial file
            console.error(`     ❌ Error saving ${country}:`, err.message);
            reject(err);
          });
        }).on('error', reject);
      } else {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`     ✅ Saved: ${filename}`);
          resolve();
        });

        fileStream.on('error', (err) => {
          fs.unlink(filepath, () => {}); // Clean up partial file
          console.error(`     ❌ Error saving ${country}:`, err.message);
          reject(err);
        });
      }
    }).on('error', (err) => {
      console.error(`     ❌ Error downloading ${country}:`, err.message);
      reject(err);
    });
  });
}

/**
 * Download all countries with delay between requests
 */
async function downloadAll() {
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < countriesToDownload.length; i++) {
    try {
      await downloadCountryImage(countriesToDownload[i], i, countriesToDownload.length);
      successCount++;
      
      // Wait before next download (except for the last one)
      if (i < countriesToDownload.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_DOWNLOADS));
      }
    } catch (error) {
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n✨ Download complete!`);
  console.log(`   ✅ Success: ${successCount}/${countriesToDownload.length}`);
  if (errorCount > 0) {
    console.log(`   ❌ Errors: ${errorCount}`);
  }
  console.log(`   📁 Location: ${OUTPUT_DIR}\n`);
}

// Run the script
downloadAll().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
