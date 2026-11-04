const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, '..', 'server.ts');
let content = fs.readFileSync(serverFile, 'utf8');

// 1. UPDATE /api/analyze (IMAGE)
const oldImageStart = "markStage('STAGE_3_EXIF_EXTRACTION_COMPLETE');";
const newImageLogic = `markStage('STAGE_3_EXIF_EXTRACTION_COMPLETE');

    // Run Dedicated Image Forensic Pipeline (Dimensions, Blur, Patches, Noise)
    markStage('STAGE_3B_DEDICATED_IMAGE_FORENSICS_START');
    const imageForensic = await runImageForensicPipeline(imageBuffer);
    markStage('STAGE_3B_DEDICATED_IMAGE_FORENSICS_COMPLETE');

    // Insufficient Evidence Gate: Tiny crops, extreme aspect ratios, or severe blur
    if (imageForensic.dimensions.sufficiency === 'insufficient') {
      const finalRecord: DetectionResult = {
        id: 'scan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
        user_id: userId,
        media_type: 'image',
        image_name: fileName || 'Analyzed_Image.jpg',
        image_url: \`data:\${normalizedMime};base64,\${cleanBase64}\`,
        detection_result: 'Inconclusive',
        confidence_score: imageForensic.calibratedConfidence,
        model_name: 'KRYPTX Multi-Resolution Forensic Vision Engine',
        analysis_details: {
          ai_probability: imageForensic.aiProbability,
          human_probability: imageForensic.humanProbability,
          visual_artifacts: [],
          lighting_and_shadow_assessment: 'Insufficient spatial resolution to compute optical vector gradients.',
          texture_and_skin_assessment: 'Micro-texture and skin pore analysis unavailable due to low pixel density.',
          anatomical_and_geometric_coherence: 'Macro-geometry presents insufficient resolution for structural coherence verification.',
          compression_and_pixel_anomalies: 'Image dimension criteria not met for mathematical artifact analysis.',
          explainable_summary: imageForensic.limitations[0] || 'Image resolution is insufficient for definitive forensic classification.',
          supporting_reasons: imageForensic.evidenceSummary,
          counter_factors_or_uncertainty: ['Image resolution < 140x140 or total pixels < 25,000.'],
          detection_limitations: 'Notice: Forensic evaluation requires sufficient spatial resolution to distinguish optical sensor noise from diffusion synthesis. Extreme downscaling or small crops prevent conclusive determination.',
          metadata,
          image_quality: {
            width: imageForensic.dimensions.width,
            height: imageForensic.dimensions.height,
            megapixels: imageForensic.dimensions.megapixels,
            aspectRatio: imageForensic.dimensions.aspectRatio,
            isPartialOrCrop: imageForensic.dimensions.isPartialOrCrop,
            cropRiskFactor: imageForensic.dimensions.cropRiskFactor,
            blurIndex: imageForensic.quality.blurIndex,
            isBlurry: imageForensic.quality.isBlurry,
            estimatedQualityFactor: imageForensic.quality.estimatedQualityFactor,
            noiseVariance: imageForensic.quality.noiseVariance,
            hasUniformSmoothing: imageForensic.quality.hasUniformSmoothing,
            sufficiency: imageForensic.dimensions.sufficiency,
            reason: imageForensic.dimensions.reason,
          },
          patch_analysis: {
            patchesExtracted: imageForensic.patches.length,
            suspiciousPatchesCount: imageForensic.suspiciousPatchesCount,
            patchAggregationScore: imageForensic.patchAggregationScore,
            patchGrid: imageForensic.patches.map((p) => ({
              patchIndex: p.patchIndex,
              x: p.x,
              y: p.y,
              width: p.width,
              height: p.height,
              gradientEnergy: p.gradientEnergy,
              noiseResidual: p.noiseResidual,
              microSmoothness: p.microSmoothness,
              syntheticScore: p.syntheticScore,
              anomalyType: p.anomalyType,
              isSuspicious: p.isSuspicious,
            })),
          },
          knowledge_version: getActiveVersion('image'),
          frequency_analysis_notes: 'Resolution gate activated: insufficient pixel density detected.',
        },
        file_size: fileSize || imageBuffer.length,
        mime_type: normalizedMime,
        created_at: new Date().toISOString(),
      };

      const db = initDb();
      db.records.unshift(finalRecord);
      saveDb(db);
      return res.json(finalRecord);
    }`;

if (content.includes(oldImageStart) && !content.includes('STAGE_3B_DEDICATED_IMAGE_FORENSICS_START')) {
  content = content.replace(oldImageStart, newImageLogic);
  console.log('Image pipeline pre-check updated');
}

// Attach image_quality and patch_analysis to regular image finalRecord
const imageDetailsAnchor = 'knowledge_version: getActiveVersion(\'image\'),';
const newImageDetails = `knowledge_version: getActiveVersion('image'),
        image_quality: {
          width: imageForensic.dimensions.width,
          height: imageForensic.dimensions.height,
          megapixels: imageForensic.dimensions.megapixels,
          aspectRatio: imageForensic.dimensions.aspectRatio,
          isPartialOrCrop: imageForensic.dimensions.isPartialOrCrop,
          cropRiskFactor: imageForensic.dimensions.cropRiskFactor,
          blurIndex: imageForensic.quality.blurIndex,
          isBlurry: imageForensic.quality.isBlurry,
          estimatedQualityFactor: imageForensic.quality.estimatedQualityFactor,
          noiseVariance: imageForensic.quality.noiseVariance,
          hasUniformSmoothing: imageForensic.quality.hasUniformSmoothing,
          sufficiency: imageForensic.dimensions.sufficiency,
          reason: imageForensic.dimensions.reason,
        },
        patch_analysis: {
          patchesExtracted: imageForensic.patches.length,
          suspiciousPatchesCount: imageForensic.suspiciousPatchesCount,
          patchAggregationScore: imageForensic.patchAggregationScore,
          patchGrid: imageForensic.patches.map((p) => ({
            patchIndex: p.patchIndex,
            x: p.x,
            y: p.y,
            width: p.width,
            height: p.height,
            gradientEnergy: p.gradientEnergy,
            noiseResidual: p.noiseResidual,
            microSmoothness: p.microSmoothness,
            syntheticScore: p.syntheticScore,
            anomalyType: p.anomalyType,
            isSuspicious: p.isSuspicious,
          })),
        },`;

if (content.includes(imageDetailsAnchor) && !content.includes('image_quality: {')) {
  content = content.replace(imageDetailsAnchor, newImageDetails);
  console.log('Image finalRecord details updated');
}

fs.writeFileSync(serverFile, content, 'utf8');
console.log('Server image pipeline patched successfully');

