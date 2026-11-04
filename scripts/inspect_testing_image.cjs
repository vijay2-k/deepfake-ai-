const fs = require('fs');
const sharp = require('sharp');

async function inspectTestingImage() {
  const imgPath = 'C:/Users/Fet Event Tech/Downloads/testing image.jpeg';
  if (!fs.existsSync(imgPath)) {
    console.error('File not found:', imgPath);
    return;
  }
  const meta = await sharp(imgPath).metadata();
  console.log('Testing image metadata:', {
    format: meta.format,
    width: meta.width,
    height: meta.height,
    space: meta.space,
    channels: meta.channels,
    depth: meta.depth,
    density: meta.density,
    hasProfile: !!meta.icc,
    exifLength: meta.exif ? meta.exif.length : 0,
  });
}

inspectTestingImage().catch(console.error);

