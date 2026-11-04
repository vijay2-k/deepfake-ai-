const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '../server.ts');
let content = fs.readFileSync(serverPath, 'utf-8');
content = content.replace(/\r\n/g, '\n');

// Target the start of /api/analyze/audio down to history endpoint
const targetStartIndex = content.indexOf("app.post('/api/analyze/audio', uploadAudio.single('file')");
const targetEndIndex = content.indexOf("// 3. Get Analysis History");

if (targetStartIndex === -1 || targetEndIndex === -1) {
  console.error('Could not locate /api/analyze/audio in server.ts');
  process.exit(1);
}

const replacementEndpoint = `app.post('/api/analyze/audio', uploadAudio.single('file'), async (req: Request, res: Response) => {
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

    // PRIMARY DETECTOR: Execute Dedicated Voice Forensic Engine (VAD, F0 Autocorrelation, Spectral STFT, Vocoder Phase Ringing)
    currentStage = 'STAGE_2_ACOUSTIC_DSP_ANALYSIS';
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
        model_name: voiceForensic.detectorEngine,
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
            voiceCharacteristics: voiceForensic.voiceCharacteristics,
            perceivedAgeEstimate: voiceForensic.perceivedAgeEstimate,
            detectorEngine: voiceForensic.detectorEngine,
            detectorVersion: voiceForensic.detectorVersion,
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
    }

    // PRIMARY DETECTOR DECIDES THE VERDICT AND CONFIDENCE:
    const primaryVerdict = voiceForensic.verdict;
    const primaryConfidence = voiceForensic.calibratedConfidence;
    const primaryAiProb = voiceForensic.aiProbability;
    const primaryHumanProb = voiceForensic.humanProbability;
    const detectorName = voiceForensic.detectorEngine;

    let explainableSummary = voiceForensic.evidenceSummary.join(' ');
    let supportingReasons = [...voiceForensic.evidenceSummary];
    let counterFactors: string[] = [];

    // Optional Gemini call for natural-language forensic explanation
    const aiClient = getAiClient();
    if (aiClient) {
      try {
        currentStage = 'STAGE_3_GEMINI_EXPLANATION';
        const activeDirective = getActiveDirective('voice');
        const systemInstruction = \`You are an Assistant Forensic Audio Examiner providing technical docket notes.
IMPORTANT SCIENTIFIC MANDATE:
The primary forensic signal classifier (\${detectorName}) has ALREADY evaluated the physical audio waveform and decided the verdict:
VERDICT: "\${primaryVerdict}"
CALIBRATED CONFIDENCE: \${primaryConfidence}%
AI PROBABILITY: \${primaryAiProb}% | HUMAN PROBABILITY: \${primaryHumanProb}%
ACOUSTIC MEASUREMENTS:
- Voiced Speech Duration: \${voiceForensic.quality.usableSpeechSec}s / \${voiceForensic.quality.totalDurationSec}s (\${voiceForensic.quality.speechRatioPct}% active speech)
- Signal-to-Noise Ratio: \${voiceForensic.quality.snrDb} dB
- Fundamental Pitch F0: Mean \${voiceForensic.spectralMetrics.meanF0Hz} Hz, Prosody Variation ±\${voiceForensic.spectralMetrics.stdF0Hz} Hz
- Vocoder Phase Metallic Ringing Score: \${voiceForensic.spectralMetrics.vocoderPhaseMetallicScore}/100
- Formant Continuity Score: \${voiceForensic.spectralMetrics.formantContinuityScore}/100
- Perceived Vocal Age Range: \${voiceForensic.perceivedAgeEstimate.estimatedAgeRange}

RULES:
1. You MUST NOT change or contradict the primary detector's verdict.
2. If verdict is "Likely Authentic Voice", describe the natural vocal tract resonance, prosodic micro-inflections, and absence of vocoder metallic ringing. DO NOT claim that breath pauses are absent or that pitch is flat.
3. If verdict is "Likely AI Generated Voice / Clone", explain the neural vocoder phase ringing and prosodic rigidity detected.
4. If verdict is "Inconclusive", cite acoustic ambiguity.\${activeDirective}\`;

        const promptText = \`Provide a forensic summary explaining the acoustic evidence for case submission:
File: \${fileName} (Format: \${voiceForensic.metadata.formatName}, Codec: \${voiceForensic.metadata.codec})
Verified Verdict: \${primaryVerdict} (\${primaryConfidence}% confidence)\`;

        const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
        for (const candidate of candidateModels) {
          try {
            const resp = await aiClient.models.generateContent({
              model: candidate,
              contents: {
                parts: [
                  { inlineData: { mimeType: mimeType || 'audio/mp3', data: cleanBase64 } },
                  { text: promptText },
                ],
              },
              config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    explainable_summary: { type: Type.STRING },
                    supporting_reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
                    counter_factors_or_uncertainty: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['explainable_summary', 'supporting_reasons'],
                },
              },
            });

            if (resp?.text) {
              const parsed = JSON.parse(resp.text);
              if (parsed.explainable_summary) {
                explainableSummary = parsed.explainable_summary;
              }
              if (Array.isArray(parsed.supporting_reasons) && parsed.supporting_reasons.length > 0) {
                supportingReasons = parsed.supporting_reasons;
              }
              if (Array.isArray(parsed.counter_factors_or_uncertainty)) {
                counterFactors = parsed.counter_factors_or_uncertainty;
              }
              break;
            }
          } catch {}
        }
      } catch (err) {
        console.warn('Gemini explanation synthesis skipped, using native acoustic summary.');
      }
    }

    const finalRecord: DetectionResult = {
      id: 'scan_aud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      user_id: userId,
      media_type: 'audio',
      image_name: fileName || 'Analyzed_Audio.mp3',
      image_url: \`data:\${mimeType};base64,\${cleanBase64.substring(0, 500)}...\`,
      media_url: \`data:\${mimeType};base64,\${cleanBase64.substring(0, 200000)}\`,
      detection_result: primaryVerdict,
      confidence_score: primaryConfidence,
      model_name: detectorName,
      analysis_details: {
        ai_probability: primaryAiProb,
        human_probability: primaryHumanProb,
        visual_artifacts: [],
        lighting_and_shadow_assessment: 'Acoustic impulse response and ambient room reverberation evaluated.',
        texture_and_skin_assessment: 'Acoustic background noise floor evaluated.',
        anatomical_and_geometric_coherence: \`Vocal tract mechanics and prosodic pitch trajectory evaluated (F0 variation: ±\${voiceForensic.spectralMetrics.stdF0Hz} Hz).\`,
        compression_and_pixel_anomalies: \`Audio codec: \${voiceForensic.metadata.codec.toUpperCase()} at \${Math.round(voiceForensic.metadata.bitrate / 1000)} kbps.\`,
        explainable_summary: explainableSummary,
        supporting_reasons: supportingReasons,
        counter_factors_or_uncertainty: counterFactors,
        spectral_and_prosody_notes: \`Pitch F0: \${voiceForensic.spectralMetrics.meanF0Hz} Hz (σ = \${voiceForensic.spectralMetrics.stdF0Hz} Hz). Spectral Centroid: \${voiceForensic.spectralMetrics.spectralCentroidHz} Hz. Harmonic Periodicity: \${voiceForensic.spectralMetrics.harmonicPeriodicityPct}%.\`,
        voice_cloning_assessment: \`Neural vocoder phase metallic index: \${voiceForensic.spectralMetrics.vocoderPhaseMetallicScore}/100 in the 3.5kHz-8.0kHz band.\`,
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
          assessmentNote: \`Audio stream \${voiceForensic.metadata.formatName.toUpperCase()} parsed via ffprobe.\`,
        },
        detection_limitations: 'Notice: Voice authenticity analysis evaluates neural vocoder signatures and prosodic intonation. Lossy compression codecs (e.g. low-bitrate Opus) are compensated for to prevent false positives.',
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
          voiceCharacteristics: voiceForensic.voiceCharacteristics,
          perceivedAgeEstimate: voiceForensic.perceivedAgeEstimate,
          detectorEngine: voiceForensic.detectorEngine,
          detectorVersion: voiceForensic.detectorVersion,
          segments: voiceForensic.segments,
        },
      },
      file_size: fileSize || fileBuffer.length,
      mime_type: mimeType,
      created_at: new Date().toISOString(),
    };

    const db = initDb();
    db.records.unshift(finalRecord);
    if (db.records.length > 150) db.records = db.records.slice(0, 150);
    const today = new Date().toISOString().split('T')[0];
    const userQuota = db.userQuotas[userId] || { scansToday: 0, lastReset: today, tier: 'free' };
    userQuota.scansToday = (userQuota.scansToday || 0) + 1;
    userQuota.lastReset = today;
    db.userQuotas[userId] = userQuota;
    saveDb(db);

    res.json(finalRecord);
  } catch (error: any) {
    console.error(\`[\${reqId}] Audio analysis error:\`, error);
    res.status(500).json({ error: error.message || 'Audio analysis failed', failedStage: currentStage });
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.warn('Failed to clean temp audio upload file:', tempFilePath, e);
      }
    }
  }
});

`;

const newContent = content.substring(0, targetStartIndex) + replacementEndpoint + content.substring(targetEndIndex);
fs.writeFileSync(serverPath, newContent, 'utf-8');
console.log('Successfully replaced /api/analyze/audio in server.ts with primary detector architecture.');

