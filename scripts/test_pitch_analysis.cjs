const fs = require('fs');

function readWavSamples(wavPath) {
  const buf = fs.readFileSync(wavPath);
  const dataIndex = buf.indexOf('data');
  if (dataIndex === -1) throw new Error('data chunk not found');
  const dataSize = buf.readUInt32LE(dataIndex + 4);
  const pcmBytes = buf.subarray(dataIndex + 8, dataIndex + 8 + dataSize);
  const numSamples = Math.floor(pcmBytes.length / 2);
  const floatSamples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    floatSamples[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
  }
  return floatSamples;
}

// Autocorrelation Pitch (F0) Detector
function estimatePitch(frame, sampleRate) {
  // Autocorrelation for pitch lags between 50Hz (lag 320) and 500Hz (lag 32)
  const minLag = Math.floor(sampleRate / 500); // ~32 samples (500 Hz)
  const maxLag = Math.floor(sampleRate / 60);  // ~266 samples (60 Hz)
  
  let maxCorr = 0;
  let bestLag = -1;
  
  // Normalization factor (energy at lag 0)
  let energy0 = 0;
  for (let i = 0; i < frame.length; i++) energy0 += frame[i] * frame[i];
  if (energy0 < 0.001) return { f0: 0, voiced: false };

  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    let energyLag = 0;
    for (let i = 0; i < frame.length - lag; i++) {
      corr += frame[i] * frame[i + lag];
      energyLag += frame[i + lag] * frame[i + lag];
    }
    const normCorr = corr / Math.sqrt(energy0 * energyLag + 1e-9);
    if (normCorr > maxCorr) {
      maxCorr = normCorr;
      bestLag = lag;
    }
  }

  // Voice threshold: normalized autocorrelation peak > 0.45
  if (maxCorr > 0.45 && bestLag > 0) {
    return { f0: sampleRate / bestLag, voiced: true, periodicity: maxCorr };
  }
  return { f0: 0, voiced: false, periodicity: maxCorr };
}

function analyzePitchAndFormants(samples, sampleRate = 16000) {
  const frameLength = Math.floor(sampleRate * 0.030); // 30ms window
  const hopSize = Math.floor(sampleRate * 0.015); // 15ms hop
  const numFrames = Math.floor((samples.length - frameLength) / hopSize);

  const pitches = [];
  const periodicities = [];

  for (let f = 0; f < numFrames; f++) {
    const start = f * hopSize;
    const frame = samples.subarray(start, start + frameLength);
    const { f0, voiced, periodicity } = estimatePitch(frame, sampleRate);
    if (voiced && f0 >= 65 && f0 <= 450) {
      pitches.push(f0);
      periodicities.push(periodicity);
    }
  }

  if (pitches.length === 0) {
    console.log('No voiced frames detected.');
    return;
  }

  const meanF0 = pitches.reduce((a, b) => a + b, 0) / pitches.length;
  const varianceF0 = pitches.reduce((a, b) => a + Math.pow(b - meanF0, 2), 0) / pitches.length;
  const stdF0 = Math.sqrt(varianceF0);
  const meanPeriodicity = periodicities.reduce((a, b) => a + b, 0) / periodicities.length;

  console.log('--- PITCH & PROSODY BIO-METRICS ---');
  console.log('Voiced Frames Found:', pitches.length, '/', numFrames);
  console.log('Mean F0 (Fundamental Pitch):', meanF0.toFixed(1), 'Hz');
  console.log('Pitch Standard Deviation (σ_F0):', stdF0.toFixed(1), 'Hz');
  console.log('Mean Harmonic Periodicity:', (meanPeriodicity * 100).toFixed(1), '%');
  
  // Interpretation
  if (stdF0 > 15) {
    console.log('Prosody Evaluation: Rich natural human intonation variance (σ = ' + stdF0.toFixed(1) + ' Hz > 15 Hz threshold).');
  } else {
    console.log('Prosody Evaluation: Flat monotone.');
  }

  // Age estimation heuristic from F0 & acoustics
  console.log('\n--- PERCEIVED AGE ESTIMATION ---');
  let estimatedAgeRange = '';
  if (meanF0 > 250) {
    estimatedAgeRange = 'Child (Under 13)';
  } else if (meanF0 > 190) {
    estimatedAgeRange = 'Young Adult / Adult Female (20-39)';
  } else if (meanF0 > 140) {
    estimatedAgeRange = 'Adult (30-49)';
  } else if (meanF0 > 95) {
    estimatedAgeRange = 'Adult Male (25-45)';
  } else {
    estimatedAgeRange = 'Older Adult (50+)';
  }
  console.log('Perceived Vocal Age Category:', estimatedAgeRange);
}

const wavPath = 'C:/Users/Fet Event Tech/Downloads/test_real_voice_16k.wav';
const samples = readWavSamples(wavPath);
analyzePitchAndFormants(samples, 16000);

