const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateIcons() {
  // Read the SVG file
  const svgBuffer = fs.readFileSync(path.join(process.cwd(), 'public', 'newlogo.svg'));
  
  // Generate PNG icons
  await sharp(svgBuffer)
    .resize(192, 192)
    .toFile(path.join(process.cwd(), 'public', 'icon-192x192.png'));
  
  await sharp(svgBuffer)
    .resize(512, 512)
    .toFile(path.join(process.cwd(), 'public', 'icon-512x512.png'));
  
  await sharp(svgBuffer)
    .resize(180, 180)
    .toFile(path.join(process.cwd(), 'public', 'apple-icon-180x180.png'));
  
  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error); 