const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function createTestWav(filename, durationSec, sampleRate = 16000, hasTone = true) {
  const numSamples = Math.floor(durationSec * sampleRate);
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1size
  buffer.writeUInt16LE(1, 20);  // PCM format
  buffer.writeUInt16LE(1, 22);  // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32);  // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  // Generate sine tone or silence
  for (let i = 0; i < numSamples; i++) {
    let val = 0;
    if (hasTone) {
      // 440Hz tone with slight amplitude variation
      const t = i / sampleRate;
      val = Math.floor(Math.sin(2 * Math.PI * 440 * t) * 16000);
    }
    buffer.writeInt16LE(val, 44 + i * 2);
  }

  const outPath = path.join(__dirname, filename);
  fs.writeFileSync(outPath, buffer);
  return outPath;
}

async function runTests() {
  console.log('====================================================');
  console.log('[KRYPTX End-to-End Verification Suite Starting]');
  console.log('====================================================\n');

  // 1. Create a tiny crop image (<140x140, e.g. 80x80)
  const tinyImgPath = path.join(__dirname, 'tiny_test_crop.png');
  await sharp({
    create: {
      width: 80,
      height: 80,
      channels: 3,
      background: { r: 120, g: 150, b: 200 }
    }
  }).png().toFile(tinyImgPath);

  // 2. Create a standard resolution image (512x512)
  const normalImgPath = path.join(__dirname, 'normal_test_image.png');
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 3,
      background: { r: 50, g: 100, b: 180 }
    }
  }).png().toFile(normalImgPath);

  // 3. Create a short audio clip (0.8s speech < 1.5s threshold)
  const shortAudioPath = await createTestWav('short_test_audio.wav', 0.8, 16000, true);

  // 4. Create an adequate audio clip (3.0s speech)
  const normalAudioPath = await createTestWav('normal_test_audio.wav', 3.0, 16000, true);

  // Admin login to get token
  let adminToken = '';
  try {
    const loginRes = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@kryptx-forensics.io',
        password: process.env.KRYPTX_ADMIN_INITIAL_PASSWORD || 'KryptxForensicsAdmin2026!#Secure'
      })
    });
    if (loginRes.ok) {
      const loginData = await loginRes.json();
      adminToken = loginData.token || '';
      console.log('✓ Admin login successful. Token acquired:', adminToken.slice(0, 16) + '...');
    } else {
      console.log('Admin login response:', loginRes.status, await loginRes.text());
    }
  } catch (e) {
    console.warn('Admin login exception:', e.message);
  }

  // TEST 1: Tiny Image Crop (<140x140) Gating
  console.log('\n[TEST 1] Testing Low-Resolution / Crop Guard (<140px)...');
  const tinyFormData = new FormData();
  tinyFormData.append('file', new Blob([fs.readFileSync(tinyImgPath)], { type: 'image/png' }), 'tiny_crop.png');

  const tinyRes = await fetch('http://localhost:3000/api/analyze', {
    method: 'POST',
    body: tinyFormData
  });
  const tinyData = await tinyRes.json();

  if (tinyData.detection_result === 'Inconclusive' && tinyData.analysis_details?.image_quality?.sufficiency === 'insufficient') {
    console.log('✓ PASS: Low-res image accurately yielded INCONCLUSIVE verdict with insufficient sufficiency!');
    console.log(`  Dimensions: ${tinyData.analysis_details.image_quality.width}x${tinyData.analysis_details.image_quality.height}, Verdict: ${tinyData.detection_result}`);
  } else {
    console.error('✗ FAIL: Expected Inconclusive for tiny image, got:', tinyData.detection_result, tinyData);
  }

  // TEST 2: Short Audio (<1.5s) Gating
  console.log('\n[TEST 2] Testing Short Audio Usable Speech Guard (<1.5s)...');
  const shortAudioFormData = new FormData();
  shortAudioFormData.append('file', new Blob([fs.readFileSync(shortAudioPath)], { type: 'audio/wav' }), 'short.wav');

  const shortAudioRes = await fetch('http://localhost:3000/api/analyze/audio', {
    method: 'POST',
    body: shortAudioFormData
  });
  const shortAudioData = await shortAudioRes.json();

  if (shortAudioData.detection_result === 'Inconclusive' && shortAudioData.analysis_details?.voice_forensics?.isDurationSufficient === false) {
    console.log('✓ PASS: Short audio clip (<1.5s) accurately yielded INCONCLUSIVE verdict with VAD sufficiency guard!');
    console.log(`  Usable Speech: ${shortAudioData.analysis_details.voice_forensics.usableSpeechSec.toFixed(2)}s, Verdict: ${shortAudioData.detection_result}`);
  } else {
    console.error('✗ FAIL: Expected Inconclusive for short audio, got:', shortAudioData.detection_result, shortAudioData);
  }

  // TEST 3: Admin Datasets Endpoint
  if (adminToken) {
    console.log('\n[TEST 3] Testing Admin Dataset Registry Endpoint...');
    const dsRes = await fetch('http://localhost:3000/api/admin/intelligence/datasets', {
      headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-token': adminToken }
    });
    if (dsRes.ok) {
      const dsData = await dsRes.json();
      const imgCount = (dsData.image_datasets || dsData.imageDatasets || []).length;
      const voxCount = (dsData.voice_datasets || dsData.voiceDatasets || []).length;
      console.log(`✓ PASS: Loaded ${imgCount} image datasets and ${voxCount} voice datasets from registry.`);
    } else {
      console.error('✗ FAIL: Dataset registry endpoint returned status:', dsRes.status);
    }

    // TEST 4: Admin Benchmarks Endpoint
    console.log('\n[TEST 4] Testing Admin Benchmark Report Endpoint...');
    const bmRes = await fetch('http://localhost:3000/api/admin/intelligence/benchmarks', {
      headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-token': adminToken }
    });
    if (bmRes.ok) {
      const bmData = await bmRes.json();
      console.log(`✓ PASS: Loaded benchmark report. Image Accuracy: ${bmData.metricsSummary?.imageEngine?.accuracy}, Voice Accuracy: ${bmData.metricsSummary?.voiceEngine?.accuracy}`);
    } else {
      console.error('✗ FAIL: Benchmark report endpoint returned status:', bmRes.status);
    }
  }

  // Cleanup test files
  try {
    fs.unlinkSync(tinyImgPath);
    fs.unlinkSync(normalImgPath);
    fs.unlinkSync(shortAudioPath);
    fs.unlinkSync(normalAudioPath);
  } catch {}

  console.log('\n====================================================');
  console.log('[KRYPTX End-to-End Verification Suite Finished]');
  console.log('====================================================\n');
}

runTests().catch(console.error);
