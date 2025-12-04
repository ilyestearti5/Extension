/**
 * Icon Converter for CleanWeb Customizer Extension
 * This script will resize your icon to the required sizes for Chrome extension
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
    sharp = require('sharp');
} catch (err) {
    console.log('❌ Error: sharp is not installed');
    console.log('\nTo install sharp, run:');
    console.log('  npm install sharp');
    console.log('\nOr use one of the alternative methods in SETUP_ICONS.md');
    process.exit(1);
}

async function createIcons(inputPath) {
    try {
        // Create icons directory
        const iconsDir = 'icons';
        if (!fs.existsSync(iconsDir)) {
            fs.mkdirSync(iconsDir);
        }

        // Check if input file exists
        if (!fs.existsSync(inputPath)) {
            console.log(`❌ Error: Could not find image file: ${inputPath}`);
            process.exit(1);
        }

        console.log(`Opening image: ${inputPath}`);

        // Create different sizes
        const sizes = [16, 48, 128];

        for (const size of sizes) {
            console.log(`Creating ${size}x${size} icon...`);
            const outputPath = path.join(iconsDir, `icon${size}.png`);
            
            await sharp(inputPath)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .png()
                .toFile(outputPath);
            
            console.log(`✓ Saved: ${outputPath}`);
        }

        console.log('\n✅ All icons created successfully!');
        console.log(`\nIcon files created in '${iconsDir}' folder:`);
        console.log('  - icon16.png');
        console.log('  - icon48.png');
        console.log('  - icon128.png');

    } catch (err) {
        console.log(`❌ Error creating icons: ${err.message}`);
        process.exit(1);
    }
}

// Main execution
console.log('CleanWeb Customizer - Icon Converter');
console.log('='.repeat(50));

// Get input file
let inputImage;

if (process.argv.length > 2) {
    inputImage = process.argv[2];
} else {
    // Try to find the icon in common locations
    const possiblePaths = [
        'icon.png',
        'logo.png',
        '../icon.png',
    ];

    for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
            inputImage = testPath;
            break;
        }
    }

    if (!inputImage) {
        console.log('\nUsage: node create_icons.js <path-to-icon-image>');
        console.log('\nExample:');
        console.log('  node create_icons.js my-icon.png');
        console.log('  node create_icons.js C:\\Users\\YourName\\Downloads\\icon.png');
        process.exit(1);
    }
}

createIcons(inputImage);
