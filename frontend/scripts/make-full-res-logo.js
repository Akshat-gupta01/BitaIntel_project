const sharp = require('sharp');
const fs = require('fs');

async function generateMasterLossless() {
  // 1. Keep original 4264x928 full master resolution in lossless WebP
  await sharp('public/logo-2.png')
    .webp({ lossless: true, quality: 100, effort: 6 })
    .toFile('public/logo.webp');
  console.log('Saved 4264x928 lossless logo.webp');

  // 2. Also keep a pristine copy as logo.png
  fs.copyFileSync('public/logo-2.png', 'public/logo.png');
  console.log('Saved public/logo.png');

  // 3. Create SVG that embeds the full original PNG losslessly
  const b64 = fs.readFileSync('public/logo-2.png').toString('base64');
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4264 928" width="100%" height="100%">',
    '  <image href="data:image/png;base64,' + b64 + '" width="4264" height="928" preserveAspectRatio="xMidYMid meet" />',
    '</svg>'
  ].join('\n');
  fs.writeFileSync('public/logo.svg', svg);
  console.log('Saved public/logo.svg');
}

generateMasterLossless().catch(console.error);
