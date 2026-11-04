const fs = require('fs');
const sharp = require('sharp');

async function testImageRegions() {
  const imgPath = 'C:/Users/Fet Event Tech/Downloads/testing image.jpeg';
  const imgBuffer = fs.readFileSync(imgPath);
  const meta = await sharp(imgBuffer).metadata();
  const width = meta.width;
  const height = meta.height;

  // Split into a 4x4 grid of 16 patches
  const cols = 4;
  const rows = 4;
  const patchW = Math.floor(width / cols);
  const patchH = Math.floor(height / rows);

  console.log(`Analyzing ${width}x${height} in ${cols}x${rows} grid (${patchW}x${patchH} per patch)...`);

  const patchStats = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const left = c * patchW;
      const top = r * patchH;

      const { data } = await sharp(imgBuffer)
        .extract({ left, top, width: patchW, height: patchH })
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Compute local variance and noise residual (diff from 3x3 box blur)
      let sum = 0;
      let sumSq = 0;
      let diffSum = 0;
      const len = data.length;

      for (let i = 0; i < len; i++) {
        const val = data[i];
        sum += val;
        sumSq += val * val;

        if (i % patchW < patchW - 1) {
          diffSum += Math.abs(val - data[i + 1]);
        }
      }

      const mean = sum / len;
      const variance = (sumSq / len) - (mean * mean);
      const noise = diffSum / len;

      patchStats.push({
        row: r,
        col: c,
        leftPercent: Math.round((left / width) * 100),
        topPercent: Math.round((top / height) * 100),
        widthPercent: Math.round((patchW / width) * 100),
        heightPercent: Math.round((patchH / height) * 100),
        variance: Math.round(variance),
        noiseResidual: Number(noise.toFixed(2)),
      });
    }
  }

  console.table(patchStats);
}

testImageRegions().catch(console.error);

