const fs = require('fs');
const path = require('path');

async function createSyntheticVocoderWav(filename, durationSec = 4.0, sampleRate = 16000) {
  // Generate a synthetic sample with high-frequency phase ringing (metallic buzz 4kHz-7kHz) and flat 130Hz pitch
  const numSamples = Math.floor(durationSec * sampleRate);
  const buffer = Buffer.alloc(44 + numSamples * 2);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Perfectly flat 130Hz fundamental + strong metallic phase ringing at 4200Hz, 5600Hz, 7000Hz
    const f0 = Math.sin(2 * Math.PI * 130 * t) * 0.4;
    const vocoderBuzz = (Math.sin(2 * Math.PI * 4200 * t) + Math.cos(2 * Math.PI * 5600 * t) + Math.sin(2 * Math.PI * 7000 * t)) * 0.35;
    const sampleVal = Math.floor((f0 + vocoderBuzz) * 20000);
    buffer.writeInt16LE(Math.max(-32767, Math.min(32767, sampleVal)), 44 + i * 2);
  }

  const outPath = path.join(__dirname, filename);
  fs.writeFileSync(outPath, buffer);
  return outPath;
}

async function runVerification() {
  console.log('====================================================');
  console.log('[KRYPTX Dedicated Voice Forensic Engine Verification]');
  console.log('====================================================\n');

  // TEST 1: The user's actual uploaded file `test real voice.ogg`
  console.log('[TEST 1] Testing user uploaded file: "test real voice.ogg"...');
  const realOggPath = 'C:/Users/Fet Event Tech/Downloads/test real voice.ogg';
  if (!fs.existsSync(realOggPath)) {
    console.error('File not found:', realOggPath);
    return;
  }

  const oggFormData = new FormData();
  oggFormData.append('file', new Blob([fs.readFileSync(realOggPath)], { type: 'audio/ogg' }), 'test real voice.ogg');

  const oggRes = await fetch('http://localhost:3000/api/analyze/audio', {
    method: 'POST',
    body: oggFormData,
  });

  const oggData = await oggRes.json();
  console.log('  HTTP Status:', oggRes.status);
  console.log('  Verdict:', oggData.detection_result);
  console.log('  Confidence Score:', oggData.confidence_score + '%');
  console.log('  Probabilities: AI =', oggData.analysis_details?.ai_probability + '%, Human =', oggData.analysis_details?.human_probability + '%');
  console.log('  Detector Engine:', oggData.model_name);
  console.log('  Usable Speech:', oggData.analysis_details?.voice_forensics?.usableSpeechSec + 's / ' + oggData.analysis_details?.voice_forensics?.totalDurationSec + 's');
  console.log('  Pitch F0:', oggData.analysis_details?.voice_forensics?.voiceCharacteristics?.speakingPitchHz + ' Hz (σ = ±' + oggData.analysis_details?.voice_forensics?.voiceCharacteristics?.pitchStdDevHz + ' Hz)');
  console.log('  Vocoder Phase Metallic Score:', oggData.analysis_details?.voice_forensics?.vocoderPhaseMetallicScore + '/100');
  console.log('  Perceived Age Estimate:', oggData.analysis_details?.voice_forensics?.perceivedAgeEstimate?.estimatedAgeRange);
  console.log('  Age Uncertainty Label:', oggData.analysis_details?.voice_forensics?.perceivedAgeEstimate?.uncertaintyDisclaimer);

  if (oggData.detection_result === 'Likely Authentic Voice') {
    console.log('  ✓ SUCCESS: "test real voice.ogg" CORRECTLY classified as Likely Authentic Voice!');
  } else {
    console.error('  ✗ FAIL: Expected Likely Authentic Voice, got:', oggData.detection_result);
  }

  // TEST 2: Inconclusive Test (Short Speech < 1.5s)
  console.log('\n[TEST 2] Testing Short Audio Recording (<1.5s)...');
  const shortWavPath = path.join(__dirname, 'short_audio_test.wav');
  // 0.8s tone
  await createSyntheticVocoderWav('short_audio_test.wav', 0.8, 16000);

  const shortFormData = new FormData();
  shortFormData.append('file', new Blob([fs.readFileSync(shortWavPath)], { type: 'audio/wav' }), 'short_audio.wav');
  const shortRes = await fetch('http://localhost:3000/api/analyze/audio', { method: 'POST', body: shortFormData });
  const shortData = await shortRes.json();
  console.log('  Verdict:', shortData.detection_result);
  console.log('  Sufficiency Reason:', shortData.analysis_details?.explainable_summary);
  console.log('  Age Estimate:', shortData.analysis_details?.voice_forensics?.perceivedAgeEstimate?.estimatedAgeRange);

  if (shortData.detection_result === 'Inconclusive' && shortData.analysis_details?.voice_forensics?.perceivedAgeEstimate?.isAvailable === false) {
    console.log('  ✓ SUCCESS: Short recording correctly routed to INCONCLUSIVE and age estimation unavailable!');
  } else {
    console.error('  ✗ FAIL: Expected Inconclusive, got:', shortData.detection_result);
  }

  // TEST 3: Synthetic Vocoder Buzz Test (AI Generated Voice)
  console.log('\n[TEST 3] Testing Synthetic Vocoder Phase Ringing Sample (AI Generated Voice)...');
  const synWavPath = path.join(__dirname, 'synth_vocoder_test.wav');
  await createSyntheticVocoderWav('synth_vocoder_test.wav', 4.0, 16000);

  const synFormData = new FormData();
  synFormData.append('file', new Blob([fs.readFileSync(synWavPath)], { type: 'audio/wav' }), 'synth_vocoder.wav');
  const synRes = await fetch('http://localhost:3000/api/analyze/audio', { method: 'POST', body: synFormData });
  const synData = await synRes.json();
  console.log('  Verdict:', synData.detection_result);
  console.log('  Confidence Score:', synData.confidence_score + '%');
  console.log('  Vocoder Phase Metallic Score:', synData.analysis_details?.voice_forensics?.vocoderPhaseMetallicScore + '/100');
  console.log('  Age Estimate:', synData.analysis_details?.voice_forensics?.perceivedAgeEstimate?.estimatedAgeRange);

  if (synData.detection_result === 'Likely AI Generated Voice / Clone' && synData.analysis_details?.voice_forensics?.perceivedAgeEstimate?.isAvailable === false) {
    console.log('  ✓ SUCCESS: Synthetic vocoder correctly flagged as Likely AI Generated Voice and age estimation unavailable!');
  } else {
    console.error('  ✗ FAIL: Expected Likely AI Generated Voice, got:', synData.detection_result);
  }

  // Cleanup temporary test files
  try {
    fs.unlinkSync(shortWavPath);
    fs.unlinkSync(synWavPath);
  } catch {}

  console.log('\n====================================================');
  console.log('[All Forensic Engine Verification Tests Completed]');
  console.log('====================================================\n');
}

runVerification().catch(console.error);

