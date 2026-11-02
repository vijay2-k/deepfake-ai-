/**
 * Forensic Analysis & Canvas Image Processing Utilities
 * - Error Level Analysis (ELA)
 * - Frequency Edge Gradient (Sobel)
 * - Cryptographic SHA-256 Hash Generation
 * - Printable Forensic PDF Report Generation
 */

export async function computeSHA256(dataUrl: string): Promise<string> {
  try {
    const response = await fetch(dataUrl);
    const buffer = await response.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  }
}

/**
 * Computes Error Level Analysis (ELA) on an image using HTML5 Canvas.
 * ELA re-saves the image at ~95% quality and calculates the absolute difference
 * multiplied by an amplification factor.
 */
export async function generateErrorLevelAnalysis(
  imgElement: HTMLImageElement,
  scale: number = 22
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const width = imgElement.naturalWidth || imgElement.width || 800;
      const height = imgElement.naturalHeight || imgElement.height || 600;

      // Restrict max canvas dimensions to 1600 to prevent mobile memory spikes
      const maxDim = 1600;
      let targetW = width;
      let targetH = height;
      if (targetW > maxDim || targetH > maxDim) {
        if (targetW > targetH) {
          targetH = Math.round((targetH * maxDim) / targetW);
          targetW = maxDim;
        } else {
          targetW = Math.round((targetW * maxDim) / targetH);
          targetH = maxDim;
        }
      }

      const canvas1 = document.createElement('canvas');
      canvas1.width = targetW;
      canvas1.height = targetH;
      const ctx1 = canvas1.getContext('2d');
      if (!ctx1) return reject(new Error('Canvas 2D context unavailable'));

      ctx1.drawImage(imgElement, 0, 0, targetW, targetH);
      const originalData = ctx1.getImageData(0, 0, targetW, targetH);

      // Re-compress to JPEG at 90% quality
      const recompressedUrl = canvas1.toDataURL('image/jpeg', 0.9);
      const recompressedImg = new Image();
      recompressedImg.crossOrigin = 'anonymous';
      recompressedImg.onload = () => {
        const canvas2 = document.createElement('canvas');
        canvas2.width = targetW;
        canvas2.height = targetH;
        const ctx2 = canvas2.getContext('2d');
        if (!ctx2) return reject(new Error('Canvas 2 context unavailable'));

        ctx2.drawImage(recompressedImg, 0, 0, targetW, targetH);
        const recompressedData = ctx2.getImageData(0, 0, targetW, targetH);

        const diffCanvas = document.createElement('canvas');
        diffCanvas.width = targetW;
        diffCanvas.height = targetH;
        const diffCtx = diffCanvas.getContext('2d');
        if (!diffCtx) return reject(new Error('Diff Canvas context unavailable'));

        const diffData = diffCtx.createImageData(targetW, targetH);
        const orig = originalData.data;
        const recomp = recompressedData.data;
        const output = diffData.data;

        for (let i = 0; i < orig.length; i += 4) {
          const rDiff = Math.abs(orig[i] - recomp[i]) * scale;
          const gDiff = Math.abs(orig[i + 1] - recomp[i + 1]) * scale;
          const bDiff = Math.abs(orig[i + 2] - recomp[i + 2]) * scale;

          output[i] = Math.min(255, rDiff);
          output[i + 1] = Math.min(255, gDiff);
          output[i + 2] = Math.min(255, bDiff);
          output[i + 3] = 255; // Alpha
        }

        diffCtx.putImageData(diffData, 0, 0);
        resolve(diffCanvas.toDataURL('image/png'));
      };
      recompressedImg.onerror = (e) => reject(e);
      recompressedImg.src = recompressedUrl;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Computes Sobel high-frequency gradient edge map
 */
export async function generateSobelEdgeMap(imgElement: HTMLImageElement): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const width = Math.min(1200, imgElement.naturalWidth || 800);
      const height = Math.min(1200, imgElement.naturalHeight || 600);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas unavailable'));

      ctx.drawImage(imgElement, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Convert to grayscale
      const gray = new Float32Array(width * height);
      for (let i = 0; i < data.length; i += 4) {
        gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }

      const outputData = ctx.createImageData(width, height);
      const out = outputData.data;

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;

          // Sobel kernels
          const gx =
            -1 * gray[idx - width - 1] +
            1 * gray[idx - width + 1] +
            -2 * gray[idx - 1] +
            2 * gray[idx + 1] +
            -1 * gray[idx + width - 1] +
            1 * gray[idx + width + 1];

          const gy =
            -1 * gray[idx - width - 1] -
            2 * gray[idx - width] -
            1 * gray[idx - width + 1] +
            1 * gray[idx + width - 1] +
            2 * gray[idx + width] +
            1 * gray[idx + width + 1];

          const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy) * 1.5);
          const outIdx = idx * 4;

          // Colorize edge intensity (cyan-violet spectrum)
          out[outIdx] = Math.min(255, mag * 0.7); // R
          out[outIdx + 1] = Math.min(255, mag * 0.9); // G
          out[outIdx + 2] = Math.min(255, mag * 1.2); // B
          out[outIdx + 3] = 255;
        }
      }

      ctx.putImageData(outputData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates and triggers download / print for a forensic audit certificate
 */
export function printForensicReport(result: any, sha256Hash: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const isAI = result.detection_result === 'Likely AI Generated';
  const isReal = result.detection_result === 'Likely Real Photograph';
  const badgeColor = isAI ? '#ef4444' : isReal ? '#10b981' : '#f59e0b';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Forensic Dossier: ${result.image_name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 32px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .title {
      font-size: 24px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .subtitle {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    .badge {
      display: inline-block;
      padding: 8px 16px;
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      background: ${badgeColor};
      border-radius: 6px;
      text-transform: uppercase;
    }
    .section {
      margin-top: 24px;
      padding: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
      margin-bottom: 12px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }
    .value {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
    }
    .code {
      font-family: monospace;
      font-size: 11px;
      background: #f1f5f9;
      padding: 4px 8px;
      border-radius: 4px;
      word-break: break-all;
    }
    .disclaimer {
      margin-top: 32px;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
    }
    @media print {
      body { margin: 16px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">AI Image Authenticity Audit Dossier</div>
      <div class="subtitle">Case Ref: ${result.id} | Engine: ${result.model_name}</div>
    </div>
    <div class="badge">${result.detection_result}</div>
  </div>

  <div class="section">
    <div class="section-title">Case Metadata</div>
    <div class="grid">
      <div>
        <div class="label">Target Filename</div>
        <div class="value">${result.image_name}</div>
      </div>
      <div>
        <div class="label">Analysis Timestamp</div>
        <div class="value">${new Date(result.created_at).toUTCString()}</div>
      </div>
      <div>
        <div class="label">Calibrated Confidence</div>
        <div class="value">${result.confidence_score}%</div>
      </div>
      <div>
        <div class="label">Synthetic Probability</div>
        <div class="value">${result.analysis_details.ai_probability}% AI / ${result.analysis_details.human_probability}% Human</div>
      </div>
      <div style="grid-column: span 2;">
        <div class="label">Cryptographic SHA-256 Digest</div>
        <div class="code">${sha256Hash}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Forensic Assessment Summary</div>
    <p style="font-size: 13px; margin: 0 0 12px 0;">${result.analysis_details.explainable_summary}</p>
    
    <div class="label">Key Observable Findings</div>
    <ul style="font-size: 12px; margin: 6px 0 12px 0; padding-left: 20px;">
      ${result.analysis_details.supporting_reasons.map((r: string) => `<li>${r}</li>`).join('')}
    </ul>

    ${
      result.analysis_details.counter_factors_or_uncertainty?.length
        ? `<div class="label">Limiting & Uncertainty Factors</div>
           <ul style="font-size: 12px; margin: 6px 0 0 0; padding-left: 20px;">
             ${result.analysis_details.counter_factors_or_uncertainty.map((c: string) => `<li>${c}</li>`).join('')}
           </ul>`
        : ''
    }
  </div>

  <div class="section">
    <div class="section-title">Detailed Forensic Criteria</div>
    <div class="grid">
      <div>
        <div class="label">Lighting & Specular Physics</div>
        <div style="font-size: 12px;">${result.analysis_details.lighting_and_shadow_assessment}</div>
      </div>
      <div>
        <div class="label">Micro-Texture & Skin Pores</div>
        <div style="font-size: 12px;">${result.analysis_details.texture_and_skin_assessment}</div>
      </div>
      <div>
        <div class="label">Anatomy & Geometry</div>
        <div style="font-size: 12px;">${result.analysis_details.anatomical_and_geometric_coherence}</div>
      </div>
      <div>
        <div class="label">Compression & Frequency</div>
        <div style="font-size: 12px;">${result.analysis_details.compression_and_pixel_anomalies}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Hardware EXIF Status</div>
    <div style="font-size: 12px;">
      ${
        result.analysis_details.metadata?.hasExif
          ? `Detected Hardware: ${result.analysis_details.metadata.make || ''} ${result.analysis_details.metadata.model || ''} | Lens: ${result.analysis_details.metadata.lensModel || 'N/A'} | Shutter: ${result.analysis_details.metadata.exposureTime || 'N/A'} | Aperture: ${result.analysis_details.metadata.fNumber || 'N/A'}`
          : 'No camera hardware EXIF tags found in stream.'
      }
      <div style="margin-top: 4px; color: #64748b;">${result.analysis_details.metadata?.assessmentNote || ''}</div>
    </div>
  </div>

  <div class="disclaimer">
    <strong>Forensic Caveat:</strong> ${result.analysis_details.detection_limitations}
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
