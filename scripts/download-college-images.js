#!/usr/bin/env node

/**
 * Automated College/University Image Downloader
 * 
 * This script fetches college names from your Supabase database
 * and downloads images for them from Unsplash.
 * 
 * Usage: node scripts/download-college-images.js
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

// Popular universities - you can also fetch these from your Supabase database
const UNIVERSITIES = [
  // US Universities
  'Massachusetts Institute of Technology',
  'Stanford University',
  'Harvard University',
  'California Institute of Technology',
  'University of California Berkeley',
  'Princeton University',
  'Yale University',
  'Columbia University',
  'University of Chicago',
  'Cornell University',
  'Carnegie Mellon University',
  'University of Pennsylvania',
  'Duke University',
  'Northwestern University',
  'Johns Hopkins University',
  
  // UK Universities
  'University of Oxford',
  'University of Cambridge',
  'Imperial College London',
  'University College London',
  'London School of Economics',
  'University of Edinburgh',
  'Kings College London',
  'University of Manchester',
  
  // Canadian Universities
  'University of Toronto',
  'University of British Columbia',
  'McGill University',
  'University of Montreal',
  'University of Alberta',
  
  // Australian Universities
  'University of Melbourne',
  'Australian National University',
  'University of Sydney',
  'University of Queensland',
  'Monash University',
  
  // European Universities
  'ETH Zurich',
  'Technical University of Munich',
  'University of Amsterdam',
  'Delft University of Technology',
  'KU Leuven',
  'Karolinska Institute',
  
  // Asian Universities
  'National University of Singapore',
  'Nanyang Technological University',
  'University of Tokyo',
  'Seoul National University',
  'Tsinghua University',
  'Peking University'
];

const OUTPUT_DIR = path.join(__dirname, '../public/images/colleges');
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

// Filter out universities that already have images
const universitiesToDownload = UNIVERSITIES.filter(university => {
  const exists = existingImages.has(university.toLowerCase());
  if (exists) {
    console.log(`⏭️  Skipping ${university} (already exists)`);
  }
  return !exists;
});

if (universitiesToDownload.length === 0) {
  console.log('✅ All university images already exist!');
  process.exit(0);
}

console.log(`\n🎓 Starting download for ${universitiesToDownload.length} universities...\n`);

/**
 * Download a single university image
 */
function downloadUniversityImage(university, index, total) {
  return new Promise((resolve, reject) => {
    // Construct Unsplash URL with campus/building keywords for better results
    const query = encodeURIComponent(`${university} campus building architecture`);
    const url = `https://source.unsplash.com/1600x1000/?${query}`;
    const filename = `${university}.jpg`;
    const filepath = path.join(OUTPUT_DIR, filename);

    console.log(`[${index + 1}/${total}] 📥 Downloading: ${university}...`);

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
            console.error(`     ❌ Error saving ${university}:`, err.message);
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
          console.error(`     ❌ Error saving ${university}:`, err.message);
          reject(err);
        });
      }
    }).on('error', (err) => {
      console.error(`     ❌ Error downloading ${university}:`, err.message);
      reject(err);
    });
  });
}

/**
 * Download all universities with delay between requests
 */
async function downloadAll() {
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < universitiesToDownload.length; i++) {
    try {
      await downloadUniversityImage(universitiesToDownload[i], i, universitiesToDownload.length);
      successCount++;
      
      // Wait before next download (except for the last one)
      if (i < universitiesToDownload.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_DOWNLOADS));
      }
    } catch (error) {
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n✨ Download complete!`);
  console.log(`   ✅ Success: ${successCount}/${universitiesToDownload.length}`);
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
