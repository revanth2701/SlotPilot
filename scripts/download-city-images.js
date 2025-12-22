#!/usr/bin/env node

/**
 * Automated City Image Downloader
 * 
 * This script downloads city images for major study abroad destinations
 * from Unsplash and saves them to /public/images/cities/
 * 
 * Usage: node scripts/download-city-images.js
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

// Popular cities for international students
const CITIES = {
  // United States
  'New York': 'United States',
  'Boston': 'United States',
  'Los Angeles': 'United States',
  'San Francisco': 'United States',
  'Chicago': 'United States',
  'Seattle': 'United States',
  'Austin': 'United States',
  'Philadelphia': 'United States',
  'Washington DC': 'United States',
  'San Diego': 'United States',
  
  // United Kingdom
  'London': 'United Kingdom',
  'Oxford': 'United Kingdom',
  'Cambridge': 'United Kingdom',
  'Edinburgh': 'United Kingdom',
  'Manchester': 'United Kingdom',
  'Glasgow': 'United Kingdom',
  'Bristol': 'United Kingdom',
  'Birmingham': 'United Kingdom',
  
  // Canada
  'Toronto': 'Canada',
  'Vancouver': 'Canada',
  'Montreal': 'Canada',
  'Calgary': 'Canada',
  'Ottawa': 'Canada',
  'Edmonton': 'Canada',
  
  // Australia
  'Sydney': 'Australia',
  'Melbourne': 'Australia',
  'Brisbane': 'Australia',
  'Perth': 'Australia',
  'Adelaide': 'Australia',
  'Canberra': 'Australia',
  
  // Germany
  'Berlin': 'Germany',
  'Munich': 'Germany',
  'Frankfurt': 'Germany',
  'Hamburg': 'Germany',
  'Cologne': 'Germany',
  'Stuttgart': 'Germany',
  
  // France
  'Paris': 'France',
  'Lyon': 'France',
  'Marseille': 'France',
  'Toulouse': 'France',
  'Nice': 'France',
  
  // Netherlands
  'Amsterdam': 'Netherlands',
  'Rotterdam': 'Netherlands',
  'The Hague': 'Netherlands',
  'Utrecht': 'Netherlands',
  
  // Other European cities
  'Zurich': 'Switzerland',
  'Geneva': 'Switzerland',
  'Vienna': 'Vienna',
  'Stockholm': 'Sweden',
  'Copenhagen': 'Denmark',
  'Oslo': 'Norway',
  'Helsinki': 'Finland',
  'Dublin': 'Ireland',
  'Brussels': 'Belgium',
  'Madrid': 'Spain',
  'Barcelona': 'Spain',
  'Milan': 'Italy',
  'Rome': 'Italy',
  
  // Asian cities
  'Tokyo': 'Japan',
  'Kyoto': 'Japan',
  'Osaka': 'Japan',
  'Seoul': 'South Korea',
  'Singapore': 'Singapore',
  'Hong Kong': 'Hong Kong',
  'Shanghai': 'China',
  'Beijing': 'China',
  'Bangalore': 'India',
  'Mumbai': 'India',
  'Delhi': 'India'
};

const OUTPUT_DIR = path.join(__dirname, '../public/images/cities');
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

// Filter out cities that already have images
const citiesToDownload = Object.keys(CITIES).filter(city => {
  const exists = existingImages.has(city.toLowerCase());
  if (exists) {
    console.log(`⏭️  Skipping ${city} (already exists)`);
  }
  return !exists;
});

if (citiesToDownload.length === 0) {
  console.log('✅ All city images already exist!');
  process.exit(0);
}

console.log(`\n🌆 Starting download for ${citiesToDownload.length} cities...\n`);

/**
 * Download a single city image
 */
function downloadCityImage(city, index, total) {
  return new Promise((resolve, reject) => {
    const country = CITIES[city];
    
    // Construct Unsplash URL with skyline/cityscape keywords for better results
    const query = encodeURIComponent(`${city} ${country} skyline cityscape architecture`);
    const url = `https://source.unsplash.com/1600x1000/?${query}`;
    const filename = `${city}.jpg`;
    const filepath = path.join(OUTPUT_DIR, filename);

    console.log(`[${index + 1}/${total}] 📥 Downloading: ${city}, ${country}...`);

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
            console.error(`     ❌ Error saving ${city}:`, err.message);
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
          console.error(`     ❌ Error saving ${city}:`, err.message);
          reject(err);
        });
      }
    }).on('error', (err) => {
      console.error(`     ❌ Error downloading ${city}:`, err.message);
      reject(err);
    });
  });
}

/**
 * Download all cities with delay between requests
 */
async function downloadAll() {
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < citiesToDownload.length; i++) {
    try {
      await downloadCityImage(citiesToDownload[i], i, citiesToDownload.length);
      successCount++;
      
      // Wait before next download (except for the last one)
      if (i < citiesToDownload.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_DOWNLOADS));
      }
    } catch (error) {
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n✨ Download complete!`);
  console.log(`   ✅ Success: ${successCount}/${citiesToDownload.length}`);
  if (errorCount > 0) {
    console.log(`   ❌ Errors: ${errorCount}`);
  }
  console.log(`   📁 Location: ${OUTPUT_DIR}\n`);
  
  // Generate a summary by country
  console.log('📊 Cities by country:');
  const byCountry = {};
  citiesToDownload.forEach(city => {
    const country = CITIES[city];
    byCountry[country] = (byCountry[country] || 0) + 1;
  });
  
  Object.entries(byCountry)
    .sort((a, b) => b[1] - a[1])
    .forEach(([country, count]) => {
      console.log(`   ${country}: ${count} cities`);
    });
}

// Run the script
downloadAll().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
