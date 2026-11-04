const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, '..', 'server.ts');
let content = fs.readFileSync(serverFile, 'utf8');

const oldAudioStart = "const aiClient = getAiClient();";
const audioHandlerTarget = `// 2c. Perform Audio / Voice Forensics Analysis
app.post('/api/analyze/audio', uploadAudio.single('file'), async (req: Request, res: Response) => {
  const reqStart = Date.now();
  const reqId = 'req_aud_' + Math.random().toString(36).substring(2, 8);
  let currentStage = 'STAGE_1_REQUEST_RECEIVED';
  let tempFilePath: string | null = null;

  try {
    let cleanBase64 = '';
    let fileName = req.body?.fileName || 'audio.mp3';
    let mimeType = req.body?.mimeType || 'audio/mp3';
    let fileSize = Number(req.body?.fileSize) || 0;
    let userId = req.body?.userId || 'guest-user';
    let fileBuffer: Buffer;

    if (req.file) {
      tempFilePath = req.file.path;
      fileName = req.file.originalname || fileName;
      mimeType = req.file.mimetype || mimeType;
      fileSize = req.file.size || fileSize;
      fileBuffer = fs.readFileSync(tempFilePath);
      cleanBase64 = fileBuffer.toString('base64');
    } else {
      const { audioBase64, base64 } = req.body;
      const rawBase64 = audioBase64 || base64;
      if (!rawBase64) {
        res.status(400).json({ error: 'Audio file or audioBase64 data is required', failedStage: currentStage });
        return;
      }
      cleanBase64 = String(rawBase64);
      if (cleanBase64.includes('base64,')) {
        cleanBase64 = cleanBase64.split('base64,')[1];
      }
      cleanBase64 = cleanBase64.replace(/\\s/g, '');
      fileBuffer = Buffer.from(cleanBase64, 'base64');

      // Persist temporary audio file for DSP/ffprobe analysis
      tempFilePath = path.join(UPLOAD_DIR, 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7) + '.mp3');
      fs.writeFileSync(tempFilePath, fileBuffer);
    }

    // Validate magic bytes
    const magic = validateAudioMagicBytes(fileBuffer);
    if (!magic.isValid && !mimeType.includes('audio')) {
      return res.status(400).json({
        error: 'Unsupported or corrupted audio container format. Supported: WAV, MP3, M4A, AAC, OGG, FLAC.',
        failedStage: 'STAGE_1_FORMAT_VALIDATION',
      });
    }

    // Execute Dedicated Voice Forensic Engine (VAD, Waveform, Spectral STFT, Vocoder Phase Ringing)
    const voiceForensic = await runVoiceForensicPipeline(tempFilePath, fileBuffer);

    // Insufficient Usable Speech Duration Guard (speech < 1.5s or SNR < 6dB)
    if (!voiceForensic.quality.isDurationSufficient || voiceForensic.quality.snrDb < 6) {
      const finalRecord: DetectionResult = {
        id: 'scan_aud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
        user_id: userId,
        media_type: 'audio',
        image_name: fileName || 'Analyzed_Audio.mp3',
        image_url: \`data:\${mimeType};base64,\${cleanBase64.substring(0, 500)}...\`,
        media_url: \`data:\${mimeType};base64,\${cleanBase64.substring(0, 200000)}\`,
        detection_result: 'Inconclusive',
        confidence_score: voiceForensic.calibratedConfidence,
        model_name: 'KRYPTX Acoustic DSP & Voice Activity Engine',
        analysis_details: {
          ai_probability: voiceForensic.aiProbability,
          human_probability: voiceForensic.humanProbability,
          visual_artifacts: [],
          lighting_and_shadow_assessment: 'Acoustic room impulse response evaluated.',
          texture_and_skin_assessment: 'Acoustic background noise evaluated.',
          anatomical_and_geometric_coherence: 'Vocal tract mechanics and prosodic rhythm evaluated.',
          compression_and_pixel_anomalies: 'Audio container codec stream inspected.',
          explainable_summary: voiceForensic.quality.sufficiencyReason || 'Audio clip contains insufficient active vocal speech for reliable deepfake detection.',
          supporting_reasons: voiceForensic.evidenceSummary,
          counter_factors_or_uncertainty: [
            \`Usable active speech duration is \${voiceForensic.quality.usableSpeechSec}s (minimum 1.5s required).\`,
            \`Signal-to-Noise Ratio (SNR): \${voiceForensic.quality.snrDb} dB.\`,
          ],
          spectral_and_prosody_notes: \`Acoustic speech duration: \${voiceForensic.quality.usableSpeechSec}s. Silence/noise: \${voiceForensic.quality.silenceOrNoiseSec}s.\`,
          voice_cloning_assessment: 'Phonetic sample size insufficient for neural vocoder phase harmonic tracking.',
          audio_segments: voiceForensic.segments.map((s) => ({
            startTime: s.startTime,
            endTime: s.endTime,
            finding: s.finding,
            syntheticLikelihood: s.syntheticScore,
          })),
          metadata: {
            hasExif: false,
            duration: voiceForensic.quality.totalDurationSec,
            sampleRate: voiceForensic.metadata.sampleRate,
            channels: voiceForensic.metadata.channels,
            audioCodec: voiceForensic.metadata.codec.toUpperCase(),
            bitrate: voiceForensic.metadata.bitrate,
            rawTagsFound: 0,
            assessmentNote: \`Container format \${voiceForensic.metadata.formatName} parsed via ffprobe.\`,
          },
          detection_limitations: 'Notice: Audio deepfake and voice cloning detection mathematically requires minimum active speech formants to discern neural vocoder phase artifacts from natural human speech variation.',
          knowledge_version: getActiveVersion('voice'),
          voice_forensics: {
            totalDurationSec: voiceForensic.quality.totalDurationSec,
            usableSpeechSec: voiceForensic.quality.usableSpeechSec,
            silenceOrNoiseSec: voiceForensic.quality.silenceOrNoiseSec,
            speechRatioPct: voiceForensic.quality.speechRatioPct,
            snrDb: voiceForensic.quality.snrDb,
            isDurationSufficient: voiceForensic.quality.isDurationSufficient,
            sufficiencyReason: voiceForensic.quality.sufficiencyReason,
            spectralCentroidHz: voiceForensic.spectralMetrics.spectralCentroidHz,
            spectralRolloffHz: voiceForensic.spectralMetrics.spectralRolloffHz,
            zeroCrossingRate: voiceForensic.spectralMetrics.zeroCrossingRate,
            pitchF0Variance: voiceForensic.spectralMetrics.pitchF0Variance,
            vocoderPhaseMetallicScore: voiceForensic.spectralMetrics.vocoderPhaseMetallicScore,
            formantContinuityScore: voiceForensic.spectralMetrics.formantContinuityScore,
            segments: voiceForensic.segments,
          },
        },
        file_size: fileSize || fileBuffer.length,
        mime_type: mimeType,
        created_at: new Date().toISOString(),
      };

      const db = initDb();
      db.records.unshift(finalRecord);
      saveDb(db);
      return res.json(finalRecord);
    }`;

// Find start of audio endpoint
const audioStartIdx = content.indexOf("// 2c. Perform Audio / Voice Forensics Analysis");
const audioAiClientIdx = content.indexOf("const aiClient = getAiClient();", audioStartIdx);

if (audioStartIdx !== -1 && audioAiClientIdx !== -1) {
  const currentChunk = content.substring(audioStartIdx, audioAiClientIdx);
  content = content.replace(currentChunk, audioHandlerTarget + "\n\n    ");
  console.log('Audio endpoint validation and pipeline guard patched');
}

// Attach voice_forensics to regular audio finalRecord
const audioDetailsAnchor = 'knowledge_version: getActiveVersion(\'voice\'),';
const newAudioDetails = `knowledge_version: getActiveVersion('voice'),
        voice_forensics: {
          totalDurationSec: voiceForensic.quality.totalDurationSec,
          usableSpeechSec: voiceForensic.quality.usableSpeechSec,
          silenceOrNoiseSec: voiceForensic.quality.silenceOrNoiseSec,
          speechRatioPct: voiceForensic.quality.speechRatioPct,
          snrDb: voiceForensic.quality.snrDb,
          isDurationSufficient: voiceForensic.quality.isDurationSufficient,
          sufficiencyReason: voiceForensic.quality.sufficiencyReason,
          spectralCentroidHz: voiceForensic.spectralMetrics.spectralCentroidHz,
          spectralRolloffHz: voiceForensic.spectralMetrics.spectralRolloffHz,
          zeroCrossingRate: voiceForensic.spectralMetrics.zeroCrossingRate,
          pitchF0Variance: voiceForensic.spectralMetrics.pitchF0Variance,
          vocoderPhaseMetallicScore: voiceForensic.spectralMetrics.vocoderPhaseMetallicScore,
          formantContinuityScore: voiceForensic.spectralMetrics.formantContinuityScore,
          segments: voiceForensic.segments,
        },`;

if (content.includes(audioDetailsAnchor) && !content.includes('voice_forensics: {')) {
  content = content.replace(audioDetailsAnchor, newAudioDetails);
  console.log('Audio finalRecord voice_forensics details updated');
}

fs.writeFileSync(serverFile, content, 'utf8');
console.log('Server audio pipeline patched successfully');

