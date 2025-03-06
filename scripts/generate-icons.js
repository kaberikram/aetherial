const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateIcons() {
  // Use the moon icon SVG as the source
  const svgBuffer = fs.readFileSync(path.join(process.cwd(), 'public', 'moon-icon.svg'));
  
  // Generate the icons
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-192x192.png'));
  
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-512x512.png'));
  
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(process.cwd(), 'public', 'apple-icon-180x180.png'));
  
  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error); 