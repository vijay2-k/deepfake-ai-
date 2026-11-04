const fs = require('fs');
const sharp = require('sharp');

async function testForensicPipeline(imgPath) {
  const buffer = fs.readFileSync(imgPath);
  const meta = await sharp(buffer).metadata();
  const width = meta.width;
  const height = meta.height;

  // 4x4 grid (16 patches)
  const cols = 4;
  const rows = 4;
  const patchW = Math.floor(width / cols);
  const patchH = Math.floor(height / rows);

  const patches = [];
  let sumNoise = 0;
  let maxNoise = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const left = c * patchW;
      const top = r * patchH;

      const { data } = await sharp(buffer)
        .extract({ left, top, width: patchW, height: patchH })
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

      let sum = 0;
      let sumSq = 0;
      let pixelDiffSum = 0;
      let gradSum = 0;
      const len = data.length;

      for (let i = 0; i < len; i++) {
        const val = data[i];
        sum += val;
        sumSq += val * val;

        if (i % patchW < patchW - 1) {
          pixelDiffSum += Math.abs(val - data[i + 1]);
        }
        if (i + patchW < len) {
          gradSum += Math.abs(val - data[i + patchW]);
        }
      }

      const mean = sum / len;
      const variance = (sumSq / len) - (mean * mean);
      const noiseResidual = pixelDiffSum / len;
      const gradientEnergy = gradSum / len;
      const microSmoothness = gradientEnergy / (noiseResidual + 0.05);

      sumNoise += noiseResidual;
      if (noiseResidual > maxNoise) maxNoise = noiseResidual;

      patches.push({
        patchIndex: r * cols + c + 1,
        row: r,
        col: c,
        x: Math.round((left / width) * 100),
        y: Math.round((top / height) * 100),
        width: Math.round((patchW / width) * 100),
        height: Math.round((patchH / height) * 100),
        variance: Math.round(variance),
        noiseResidual: Number(noiseResidual.toFixed(2)),
        gradientEnergy: Number(gradientEnergy.toFixed(2)),
        microSmoothness: Number(microSmoothness.toFixed(2)),
      });
    }
  }

  // Camera noise baseline from top 50% noisiest patches
  const sortedNoise = [...patches].map(p => p.noiseResidual).sort((a, b) => b - a);
  const activeCameraNoiseBaseline = sortedNoise.slice(0, 8).reduce((a, b) => a + b, 0) / 8;

  let suspiciousCount = 0;
  let maxLocalAnomalyScore = 0;

  // Regional findings
  let backgroundMaxScore = 0;
  let faceMaxScore = 0;
  let clothingMaxScore = 0;

  for (const p of patches) {
    let syntheticScore = 20; // baseline natural
    let anomalyType = 'natural_texture';

    // Discrepancy from camera noise baseline
    const noiseDiscrepancy = activeCameraNoiseBaseline > 1.2 
      ? (activeCameraNoiseBaseline - p.noiseResidual) / activeCameraNoiseBaseline 
      : 0;

    // Check for neural smoothing or inpainting void
    if (activeCameraNoiseBaseline >= 1.5 && p.noiseResidual < 0.4 && p.variance < 200) {
      // Very flat, zero-noise in an otherwise noisy camera photo
      syntheticScore = 85;
      anomalyType = 'inpainting_void_or_smoothing';
    } else if (p.microSmoothness > 3.0 && p.noiseResidual < 1.0) {
      syntheticScore = 78;
      anomalyType = 'smoothing';
    } else if (noiseDiscrepancy > 0.75 && p.variance > 30) {
      syntheticScore = 70;
      anomalyType = 'noise_floor_mismatch';
    }

    p.syntheticScore = syntheticScore;
    p.anomalyType = anomalyType;
    p.isSuspicious = syntheticScore >= 65;

    if (p.isSuspicious) suspiciousCount++;
    if (syntheticScore > maxLocalAnomalyScore) maxLocalAnomalyScore = syntheticScore;

    // Categorize by spatial location
    if (p.y < 35 || p.x < 20 || p.x > 75) {
      if (syntheticScore > backgroundMaxScore) backgroundMaxScore = syntheticScore;
    } else if (p.y >= 30 && p.y <= 70) {
      if (syntheticScore > faceMaxScore) faceMaxScore = syntheticScore;
    } else if (p.y > 65) {
      if (syntheticScore > clothingMaxScore) clothingMaxScore = syntheticScore;
    }
  }

  const avgSynthetic = Math.round(patches.reduce((acc, p) => acc + p.syntheticScore, 0) / patches.length);
  const authenticCameraEvidence = Math.min(95, Math.max(20, Math.round(activeCameraNoiseBaseline * 28)));
  const localManipulationLikelihood = maxLocalAnomalyScore;
  const wholeImageAiLikelihood = avgSynthetic;

  let verdict = 'Inconclusive';
  if (localManipulationLikelihood >= 65 && authenticCameraEvidence >= 50 && wholeImageAiLikelihood < 65) {
    verdict = 'Likely AI Modified Photograph';
  } else if (wholeImageAiLikelihood >= 70) {
    verdict = 'Likely AI Generated';
  } else if (wholeImageAiLikelihood <= 35 && localManipulationLikelihood < 55 && authenticCameraEvidence >= 50) {
    verdict = 'Likely Real Photograph';
  }

  console.log({
    file: imgPath,
    activeCameraNoiseBaseline: activeCameraNoiseBaseline.toFixed(2),
    suspiciousCount,
    avgSynthetic,
    wholeImageAiLikelihood,
    localManipulationLikelihood,
    authenticCameraEvidence,
    backgroundMaxScore,
    faceMaxScore,
    clothingMaxScore,
    verdict
  });
}

testForensicPipeline('C:/Users/Fet Event Tech/Downloads/testing image.jpeg').catch(console.error);

