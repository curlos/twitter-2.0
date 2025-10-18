const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
});

const bucket = admin.storage().bucket();

// Function to detect image type from file buffer
function getImageExtension(buffer) {
  // Check PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return '.png';
  }
  // Check JPEG
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return '.jpg';
  }
  // Check WebP
  if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return '.webp';
  }
  // Check GIF
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return '.gif';
  }
  // Default to jpg if unknown
  return '.jpg';
}

// Format date as YYYY-MM-DD_HH-MM-SS
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

async function downloadAllFiles() {
  try {
    console.log('Fetching list of files from Firebase Storage...');

    const [files] = await bucket.getFiles();

    console.log(`Found ${files.length} files to download\n`);

    const destDir = './firebase-images';

    // Create flat destination directory
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    let downloadedCount = 0;
    let errorCount = 0;
    const usedNames = new Set();

    for (const file of files) {
      try {
        // Download to temporary location first
        const tempPath = path.join(destDir, `temp_${Date.now()}`);
        await file.download({ destination: tempPath });

        // Read file to detect type
        const buffer = fs.readFileSync(tempPath);
        const extension = getImageExtension(buffer);

        // Get file metadata for creation date
        const [metadata] = await file.getMetadata();
        const createdDate = new Date(metadata.timeCreated);

        // Generate filename based on creation date
        let baseName = formatDate(createdDate);
        let finalName = baseName + extension;

        // If name already exists, add a counter
        let counter = 1;
        while (usedNames.has(finalName)) {
          finalName = `${baseName}_${counter}${extension}`;
          counter++;
        }

        usedNames.add(finalName);

        // Rename temp file to final name
        const finalPath = path.join(destDir, finalName);
        fs.renameSync(tempPath, finalPath);

        downloadedCount++;
        console.log(`✓ [${downloadedCount}/${files.length}] ${finalName} (from ${file.name})`);
      } catch (error) {
        errorCount++;
        console.error(`✗ Error downloading ${file.name}:`, error.message);
      }
    }

    console.log(`\n========================================`);
    console.log(`Download Complete!`);
    console.log(`Successfully downloaded: ${downloadedCount} files`);
    console.log(`Errors: ${errorCount} files`);
    console.log(`Files saved to: ${destDir}/`);
    console.log(`========================================`);

  } catch (error) {
    console.error('Error:', error);
  }
}

console.log('Starting Firebase Storage download...\n');
downloadAllFiles().catch(console.error);
